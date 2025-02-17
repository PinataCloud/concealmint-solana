"use client";

import { LoginButton } from "@/components/login-button";
import { NFTGrid } from "@/components/nft-grid";
import { Footer } from "@/components/footer";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/providers/authProvider";

export default function Home() {
  const { authenticated, authenticate, logout } = useAuth();
  const { connected } = useWallet();

  const showNFTs = authenticated;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 max-w-sm mx-auto mt-12 sm:px-0 px-2">
      <h1 className="text-4xl font-mono font-extrabold">CONCEALMINT</h1>
      <p className="font-mono text-center">
        Create and share NFTs with private files on Solana
      </p>
      <LoginButton />
      {showNFTs && <NFTGrid />}
      <Footer />
    </main>
  );
}
