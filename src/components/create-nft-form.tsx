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
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { mintNFT, updateNft, delay } from "@/lib/mintNFT";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/authProvider"; // Add this import
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(2).max(250),
});

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url: string;
  properties: {
    files: {
      uri: string;
      type: string;
    }[];
    category: string;
  }
}


export function NFTForm() {
  const [file, setFile] = useState<File | undefined>();
  const [image, setImage] = useState<File | undefined>();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target?.files?.[0]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target?.files?.[0]);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function mint(values: z.infer<typeof formSchema>) {
    if (!file || !image) {
      console.log("Image or File missing");
      return;
    }
    if (!accessToken) {
      toast({
        title: "Authentication required",
        description: "Please connect your wallet and sign in first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const fileUploadReq = await fetch("/api/file", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: file,
      });
      const fileUpload = await fileUploadReq.json();

      const imageUploadReq = await fetch("/api/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: image,
      });
      const imageUpload = await imageUploadReq.json();

      const metadataUploadReq = await fetch("/api/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          external_url: "https://solana.concealmint.com",
          image: imageUpload.cid,
          file: fileUpload.cid,
        }),
      });
      const metadataUpload = await metadataUploadReq.json();

      const mint = await mintNFT(values.name, metadataUpload.tokenURI);
      console.log(mint)

      // const metadataUpdateReq = await fetch("/api/metadata", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      //   body: JSON.stringify({
      //     name: values.name,
      //     description: values.description,
      //     external_url: `https://solana.concealmint.com/nft/${mint}`,
      //     image: imageUpload.cid,
      //     file: fileUpload.cid,
      //   }),
      // });
      // const metadataUpdate = await metadataUpdateReq.json();
      // const update = await updateNft(mint as string, metadataUpdate.tokenURI)
      setOpen(false);
      setLoading(false);
      toast({
        title: "Mint Complete! 🎉",
        description: "Please wait while you are redirected",
      });
      await delay(4000)
      router.push(`${process.env.NEXT_PUBLIC_APP_URL}/nft/${mint}`)
    } catch (error) {
      setLoading(false);
      toast({
        title: "Problem minting NFT",
        description: `${error}`,
        variant: "destructive",
      });
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
        <DialogTrigger>Create NFT</DialogTrigger>
      </Button>
      <DialogContent
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        className="font-sans"
      >
        <DialogTitle>Create Your NFT</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(mint)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My NFT" {...field} />
                  </FormControl>
                  <FormDescription>Name of your NFT</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="This is a great NFT" {...field} />
                  </FormControl>
                  <FormDescription>Your NFT Description</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="image">Cover Image</Label>
              <Input id="image" type="file" onChange={handleImageChange} />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="file">Private File</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
            </div>

            {loading ? (
              <Button disabled>
                <Loader2 className="animate-spin" />
                Minting...
              </Button>
            ) : (
              <Button type="submit">Mint</Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
