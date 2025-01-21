import { NextResponse } from "next/server";
import { verifySignIn } from "@solana/wallet-standard-util";
import { SignJWT } from "jose";
import { getEncodedKey } from "@/lib/auth";
import type { SolanaSignInInput, SolanaSignInOutput } from "@solana/wallet-standard-features";
import bs58 from 'bs58';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input: SolanaSignInInput = body.input;
    const output: SolanaSignInOutput = {
      ...body.output,
      account: {
        ...body.output.account,
        // Convert publicKey back to Uint8Array
        publicKey: new Uint8Array(Object.values(body.output.account.publicKey)),
      },
      // Convert signature back to Uint8Array
      signature: new Uint8Array(Object.values(body.output.signature)),
      // Convert signedMessage back to Uint8Array
      signedMessage: new Uint8Array(Object.values(body.output.signedMessage)),
    };

    // Verify the sign-in
    const isValid = verifySignIn(input, output);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const walletAddress = bs58.encode(output.account.publicKey as any);
    console.log(walletAddress)

    // Create JWT token using the verified wallet address
    const token = await new SignJWT({
      walletAddress: walletAddress, // Changed from wallet to walletAddress
      timestamp: Date.now()
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(await getEncodedKey());

    return NextResponse.json({ token });

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify signature" },
      { status: 500 }
    );
  }
}
