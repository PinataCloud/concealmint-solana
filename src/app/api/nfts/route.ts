import { NextResponse, type NextRequest } from "next/server";
import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
  process.env.PRIVY_SECRET as string,
);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get("Authorization") as string;
  const auth = await privy.verifyAuthToken(accessToken.replace("Bearer ", ""));

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await privy.getUserById(auth.userId);

    if (!user.wallet?.address) {
      return NextResponse.json({ error: "No wallet connected" }, { status: 401 });
    }

    const umi = createUmi(process.env.NEXT_PUBLIC_ALCHEMY_URL as string).use(dasApi());
    const collection = publicKey('2AQCkfmrftMrK4hTLXBKBwGAZYMrKh5CFJrksmQBGy7t')
    //@ts-ignore
    const data = await umi.rpc.getAssetsByGroup({
      groupKey: 'collection',
      groupValue: collection,
    });

    let nfts = []
    for (const item of data.items) {
      if (item.ownership.owner === user.wallet.address) {
        const nftReq = await fetch(item.content.json_uri)
        const nftData = await nftReq.json()
        nfts.push({
          ...nftData,
          owner: item.ownership.owner,
          id: item.id
        })
      }
    }
    return NextResponse.json(nfts, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
