"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSolanaWallets, getAccessToken } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const formSchema = z.object({
  address: z.string().min(2).max(50),
});

export function FindNFTForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { wallets } = useSolanaWallets()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function locate(values: z.infer<typeof formSchema>) {
    try {
      router.push(`/nft/${values.address}`)
      setLoading(true);
      setOpen(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        // Only allow closing via the close button
        if (!loading) {
          setOpen(open);
        }
      }}
    >
      <Button className="w-full font-bold" asChild>
        <DialogTrigger>Locate Existing NFT</DialogTrigger>
      </Button>
      <DialogContent
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        className="font-sans"
      >
        <DialogTitle>Locate Private NFT</DialogTitle>
        <DialogDescription>Find and access existing Private NFTs by pasting in the token address</DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(locate)} className="space-y-8">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="your-token-address" {...field} />
                  </FormControl>
                  <FormDescription>Address of your Private NFT</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {loading ? (
              <Button disabled>
                <Loader2 className="animate-spin" />
                Locating...
              </Button>
            ) : (
              <Button type="submit">Locate</Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
