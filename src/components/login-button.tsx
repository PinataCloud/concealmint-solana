"use client";

import { useAuth } from "@/providers/authProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useToast } from "@/hooks/use-toast";

export function LoginButton() {
  const { authenticated, authenticate, logout } = useAuth();
  const { connected, disconnect } = useWallet();
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (connected && !authenticated) {
      handleLogin();
    }
  }, [connected]);

  const handleLogin = async () => {
    try {
      await authenticate();
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };


  return (
    <WalletMultiButton />
  );
}
