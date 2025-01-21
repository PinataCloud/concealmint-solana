import { NextResponse } from "next/server";
import type { SolanaSignInInput } from "@solana/wallet-standard-features";

export async function GET() {
  try {
    const now = new Date();
    const uri = process.env.NEXT_PUBLIC_APP_URL;
    const currentUrl = new URL(uri!);

    const signInData: SolanaSignInInput = {
      domain: currentUrl.host,
      statement: "Sign in to access private NFTs",
      version: "1",
      nonce: Math.random().toString(36).slice(2, 10), // Make sure it's at least 8 chars
      chainId: "mainnet",
      issuedAt: now.toISOString(),
      resources: [uri!]
    };

    return NextResponse.json(signInData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
