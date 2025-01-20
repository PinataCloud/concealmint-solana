import { NextResponse, type NextRequest } from "next/server";
import { ipfsClient } from "@/lib/pinata";

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
            uri: `https://ipfs.io/ipfs/${data.image}`,
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
