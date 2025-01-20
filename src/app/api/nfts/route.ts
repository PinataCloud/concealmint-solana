import { NextResponse, type NextRequest } from "next/server";
import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // const accessToken = request.headers.get("Authorization") as string;
  // const auth = await privy.verifyAuthToken(accessToken.replace("Bearer ", ""));

  // if (!auth.userId) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const umi = createUmi('https://api.devnet.solana.com').use(dasApi());
    const collection = publicKey('2AQCkfmrftMrK4hTLXBKBwGAZYMrKh5CFJrksmQBGy7t')
    //@ts-ignore
    const data = await umi.rpc.getAssetsByGroup({
      groupKey: 'collection',
      groupValue: collection,
    });

    let nfts = []
    for (const item of data.items) {
      const nftReq = await fetch(item.content.json_uri)
      const nftData = await nftReq.json()
      nfts.push({
        ...nftData,
        owner: item.ownership.owner,
        id: item.id
      })
    }
    console.log(nfts)
    return NextResponse.json(nfts, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
