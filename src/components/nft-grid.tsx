"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { NFTForm } from "./create-nft-form";
import { FindNFTForm } from "./find-nft-form";

interface NFT {
  id: string;
  owner: string;
  name: string;
  description: string;
  extrnal_url: string;
  image: string;
  file: string;
}

export function NFTGrid() {
  return (
    <div className="flex flex-col max-w-[500px] gap-4 items-center justify-start">
      <NFTForm />
      <FindNFTForm />
    </div>
  );
};
