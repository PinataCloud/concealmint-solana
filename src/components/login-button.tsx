"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "./ui/button";
import { normalize } from "viem/ens";
import { useCallback, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function LoginButton() {
  const { ready, authenticated, login, user, logout } = usePrivy();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  function truncateAddress(address: string | undefined): string {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  return (
    <>
      {!authenticated && (
        <Button disabled={disableLogin} onClick={login}>
          Log in
        </Button>
      )}
      {ready && authenticated && user && (
        <Popover>
          <PopoverTrigger>
            <Button>
              <p className="font-bold font-mono">
                {truncateAddress(user.wallet?.address)}
              </p>

            </Button>
          </PopoverTrigger>
          <PopoverContent className="font-sans flex flex-col gap-4 items-center max-w-[130px]">
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut />
              Log out
            </Button>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
