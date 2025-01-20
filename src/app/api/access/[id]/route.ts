import { NextResponse, type NextRequest } from "next/server";
import { filesClient } from "@/lib/pinata";
import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { fetchDigitalAssetWithTokenByMint } from '@metaplex-foundation/mpl-token-metadata'

import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
  process.env.PRIVY_SECRET as string,
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const accessToken = request.headers.get("Authorization") as string;
  const auth = await privy.verifyAuthToken(accessToken.replace("Bearer ", ""));

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await privy.getUserById(auth.userId);

    const umi = createUmi('https://api.devnet.solana.com').use(dasApi());
    const asset = await fetchDigitalAssetWithTokenByMint(umi, publicKey(params.id));

    // Check if the user's wallet matches the token owner
    const authorized = asset.token.owner === user.wallet?.address;
    if (!authorized) {
      console.log("Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Replaced with Indexer
    // const tokenURI = await baseClient.readContract({
    // 	address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x`,
    // 	abi: contract.abi,
    // 	functionName: "tokenURI",
    // 	args: [params.id],
    // });

    // const { data: nftData } = await ipfsClient.gateways.get(tokenURI as string);

    // const nft = nftData as unknown as NFT;

    const nftReq = await fetch(`${asset.metadata.uri}`);
    const nftData = await nftReq.json();

    console.log(nftData.properties.files[1].uri)

    const url = await filesClient.gateways.createSignedURL({
      cid: nftData.properties.files[1].uri,
      expires: 180,
    });

    return NextResponse.json({ url: url }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
