import { NextResponse, type NextRequest } from "next/server";
import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { PrivyClient } from "@privy-io/server-auth";
import { fetchDigitalAssetWithTokenByMint } from "@metaplex-foundation/mpl-token-metadata";

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

    const searchParams = request.nextUrl.searchParams;
    const tokenAddress = searchParams.get('tokenAddress');

    if (!tokenAddress) {
      return NextResponse.json({ error: "Token address is required" }, { status: 400 });
    }

    const umi = createUmi(process.env.NEXT_PUBLIC_ALCHEMY_URL as string).use(dasApi());
    const asset = await fetchDigitalAssetWithTokenByMint(umi, publicKey(tokenAddress));

    if (!asset) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    }

    const nftReq = await fetch(asset.metadata.uri);
    const nftData = await nftReq.json();

    const nft = {
      ...nftData,
      owner: asset.token.owner,
      id: asset.mint.publicKey
    };

    return NextResponse.json(nft, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
