"use client"

import { useState, useEffect, useCallback } from "react";
import { Footer } from "@/components/footer"
import { LoginButton } from "@/components/login-button"
import { useToast } from "@/hooks/use-toast";
import { CheckIcon, CopyIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/authProvider";

interface NFT {
  id: string;
  owner: string;
  name: string;
  description: string;
  extrnal_url: string;
  image: string;
  file: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const tokenAddress = params.id

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nft, setNft] = useState<NFT>();
  const { toast } = useToast();
  const { accessToken, authenticated } = useAuth();

  const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));

  async function handleCopy() {
    setCopied(true);
    await wait();
    setCopied(false);
  }


  async function copyToClipboard() {
    navigator.clipboard
      .writeText(`https://solana.concealmint.com/nft/${tokenAddress}`)
      .then(async () => await handleCopy())
      .catch(() => alert("Failed to copy"));
  }

  async function accessNFTFile() {
    try {
      setVerifying(true)
      const accessReq = await fetch(`/api/access/${tokenAddress}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const accessData = await accessReq.json();
      if (!accessReq.ok) {
        toast({
          title: "Unauthorized",
          variant: "destructive",
        });
        setVerifying(false)
        return
      }
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        const link = document.createElement("a");
        link.href = accessData.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
      } else {
        window.open(accessData.url, "_blank", "noopener,noreferrer");
      }
      setVerifying(false)
    } catch (error) {
      console.log(error);
      setVerifying(false);
    }
  }

  const getNFTs = useCallback(async () => {
    try {
      const nftReq = await fetch(`/api/nfts?tokenAddress=${tokenAddress}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!nftReq.ok) {
        throw new Error('Failed to fetch NFT');
      }

      const nftData = await nftReq.json();
      setNft(nftData);
      setLoading(false);
    } catch (error) {
      console.log(error);
      // Retry after 2 seconds
      setTimeout(() => {
        getNFTs();
      }, 2000);
    }
  }, [tokenAddress, accessToken]);

  useEffect(() => {
    setLoading(true); // Ensure loading is true when starting
    getNFTs();

    // Cleanup function to handle component unmount
    return () => {
      setLoading(false);
    };
  }, [getNFTs]);


  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 max-w-sm mx-auto mt-12 sm:px-0 px-2">
      <Link href="/">
        <h1 className="text-4xl font-mono font-extrabold">CONCEALMINT</h1>
      </Link>
      <p className="font-mono text-center">
        {authenticated ? "Unlock your NFT" : "Connect your wallet to unlock this NFT"}
      </p>
      <LoginButton />
      {loading ? (
        <Card className="flex flex-col w-full gap-2 overflow-hidden">
          <Skeleton className="h-[300px] w-full" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ) : nft && (
        <Card
          className="flex flex-col w-full gap-2 overflow-hidden"
          key={nft.id}
        >
          <img
            className="max-w-sm"
            src={nft.image}
            alt={nft.name}
          />
          <div className="flex flex-col gap-2 p-4">
            <p className="text-xl font-bold">{nft.name}</p>
            <p>{nft.description}</p>
            {verifying ? (
              <Button disabled>
                <Loader2 className="animate-spin" />
                Verifying...
              </Button>
            ) : (
              <Button onClick={accessNFTFile}>Access File</Button>
            )}
            <Button variant="secondary" onClick={copyToClipboard} className="flex gap-2">
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
      <Footer />
    </main>
  )

}
