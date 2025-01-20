import { NextResponse, type NextRequest } from "next/server";
import { ipfsClient } from "@/lib/pinata";
import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
  process.env.PRIVY_SECRET as string,
);

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url: string;
  properties: {
    files: {
      uri: string;
      type: string;
    }[];
    category: string;
  }
}

export async function POST(request: NextRequest) {
  const accessToken = request.headers.get("Authorization") as string;
  const auth = await privy.verifyAuthToken(accessToken.replace("Bearer ", ""));

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    const { IpfsHash } = await ipfsClient.upload.json({
      name: data.name,
      description: data.description,
      external_url: data.external_url,
      image: `https://dweb.mypinata.cloud/ipfs/${data.image}`,
      properties: {
        files: [
          {
            uri: `https://dweb.mypinata.cloud/ipfs/${data.image}`,
            type: "image/png"
          },
          {
            uri: `${data.file}`,
            type: "cid"
          }
        ],
        category: "files"
      }
    });
    return NextResponse.json({ tokenURI: IpfsHash }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
