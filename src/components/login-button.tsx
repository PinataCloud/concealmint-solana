"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function LoginButton() {
  const { ready, authenticated, login, user, logout } = usePrivy();
  const { connected, disconnect } = useWallet();
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);

  // Handle Privy authentication state changes
  useEffect(() => {
    if (authenticated && !connected) {
      setShowWalletPrompt(true);
    } else if (connected) {
      setShowWalletPrompt(false);
    }
  }, [authenticated, connected]);

  function truncateAddress(address: string | undefined): string {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  if (!authenticated) {
    return (
      <Button disabled={!ready} onClick={login}>
        Log in
      </Button>
    );
  }

  if (authenticated && showWalletPrompt && !connected) {
    return (
      <div className="flex flex-col gap-2 items-center">
        <p className="text-sm">Please connect your Solana wallet</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Button>
          <p className="font-bold font-mono">
            {truncateAddress(user?.wallet?.address)}
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="font-sans flex flex-col gap-4 items-center max-w-[130px]">
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await disconnect();
            await logout();
          }}
        >
          <LogOut />
          Log out
        </Button>
      </PopoverContent>
    </Popover>
  );
}
