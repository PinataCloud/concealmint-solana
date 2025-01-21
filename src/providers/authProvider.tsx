"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { verifySignIn } from "@solana/wallet-standard-util";
import type {
  SolanaSignInInput,
  SolanaSignInOutput
} from "@solana/wallet-standard-features";

interface AuthContextType {
  authenticated: boolean;
  accessToken: string | null;
  authenticate: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  accessToken: null,
  authenticate: async () => { },
  logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { connected, wallet, publicKey, signMessage } = useWallet();
  const [authenticated, setAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Handle wallet disconnection
  useEffect(() => {
    if (!connected) {
      setAuthenticated(false);
      setAccessToken(null);
    }
  }, [connected]);

  const authenticate = async () => {
    // @ts-ignore
    if (!connected || !publicKey || !wallet?.adapter.signIn) {
      throw new Error("Wallet not connected or doesn't support signIn");
    }

    try {
      // Get sign-in input data from backend
      const response = await fetch("/api/auth/signin");
      const signInInput: SolanaSignInInput = await response.json();

      // Request sign-in from wallet
      // @ts-ignore
      const output = await wallet.adapter.signIn(signInInput);

      // Verify sign-in with backend
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: signInInput,
          output: {
            ...output,
            account: {
              ...output.account,
              // Convert Uint8Array to regular array for JSON serialization
              publicKey: Array.from(output.account.publicKey),
            },
            // Convert Uint8Arrays to regular arrays
            signature: Array.from(output.signature),
            signedMessage: Array.from(output.signedMessage),
          },
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Failed to verify signature");
      }

      const { token } = await verifyResponse.json();
      setAccessToken(token);
      setAuthenticated(true);

    } catch (error) {
      console.error("Authentication failed:", error);
      throw error;
    }
  };
  const logout = () => {
    setAuthenticated(false);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        accessToken,
        authenticate,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
