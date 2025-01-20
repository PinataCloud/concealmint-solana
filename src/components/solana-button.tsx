"use client";

import dynamic from "next/dynamic";
import ThemeSwitcher from "./themeSwitcher";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const SolanaButton = () => {
  return (
    <WalletMultiButtonDynamic />
  );
};

export default SolanaButton;
