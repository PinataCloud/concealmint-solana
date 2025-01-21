"use client";

import { NFTForm } from "./create-nft-form";
import { FindNFTForm } from "./find-nft-form";

export function NFTGrid() {
  return (
    <div className="flex flex-col max-w-[500px] gap-4 items-center justify-start">
      <NFTForm />
      <FindNFTForm />
    </div>
  );
};
