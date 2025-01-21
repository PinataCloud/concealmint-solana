import { ThemeProviderWrapper } from "@/providers/themeProvider";
import { WalletAdapterProvider } from "@/providers/walletAdapterProvider";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { UmiProvider } from "@/providers/umiProvider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/authProvider";
import { Analytics } from "@vercel/analytics/react"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CONCEALMINT",
  description: "Create and share NFTs with private files on Solana",
  icons: {
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "CONCEALMINT",
    description: "Create and share NFTs with private files on Solana",
    url: "https://solana.concealmint.com",
    siteName: "CONCEALMINT",
    images: ["https://www.concealmint.com/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CONCEALMINT",
    description: "Create and share NFTs with private files on Solana",
    images: ["https://www.concealmint.com/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WalletAdapterProvider>
      <UmiProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} font-mono antialiased`}
          >
            <ThemeProviderWrapper>
              <AuthProvider>
                {children}
                <Toaster />
                <Analytics />
              </AuthProvider>
            </ThemeProviderWrapper>
          </body>
        </html>
      </UmiProvider>
    </WalletAdapterProvider>
  );
}
