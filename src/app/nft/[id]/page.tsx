"use client"

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Footer } from "@/components/footer"
import { LoginButton } from "@/components/login-button"
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { ready, authenticated, getAccessToken } = usePrivy();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [nft, setNft] = useState<NFT>();
  const { toast } = useToast();

  async function accessNFTFile() {
    try {
      setVerifying(true)
      const accessToken = await getAccessToken();
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
      setLoading(true);
      const accessToken = await getAccessToken();
      const nftReq = await fetch(`/api/nfts?tokenAddress=${tokenAddress}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const nftData = await nftReq.json();
      console.log(nftData)
      setNft(nftData);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (authenticated) {
      getNFTs();
    }
  }, [authenticated, getNFTs]);


  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 max-w-sm mx-auto mt-12 sm:px-0 px-2">
      <h1 className="text-4xl font-mono font-extrabold">CONCEALMINT</h1>
      <p className="font-mono text-center">
        {authenticated ? "Unlock your NFT" : "Connect your wallet to unlock this NFT"}
      </p>
      <div className="flex gap-2 items-center">
        <LoginButton />
        <Link href="/">
          <Button variant="secondary">Home</Button>
        </Link>
      </div>
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
            src={nft.image || "/pfp.png"}
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
          </div>
        </Card>
      )}
      <Footer />
    </main>
  )

}
