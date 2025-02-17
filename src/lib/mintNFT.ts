import umiWithCurrentWalletAdapter from "./umi/umiWithCurrentWalletAdapter";
import { createNft, createV1, fetchMetadataFromSeeds, findMetadataPda, Metadata, mintV1, mplTokenMetadata, TokenStandard, updateV1, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount, publicKey, sol } from "@metaplex-foundation/umi";

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export async function mintNFT(name: string, uri: string) {
  try {
    const umi = umiWithCurrentWalletAdapter();

    umi.use(mplTokenMetadata())

    const nftMint = generateSigner(umi);

    const tx = await createNft(umi, {
      mint: nftMint,
      name: name,
      uri: `https://dweb.mypinata.cloud/ipfs/${uri}`,
      symbol: 'CONCEAL',
      updateAuthority: umi.identity.publicKey,
      sellerFeeBasisPoints: percentAmount(0),
    }).sendAndConfirm(umi);
    const address = nftMint.publicKey.toString()
    return address
  } catch (error) {
    console.log(error)
    return error
  }
};


export async function updateNft(nftAddress: string, uri: string) {
  try {
    await delay(4000)
    const umi = umiWithCurrentWalletAdapter();
    umi.use(mplTokenMetadata())

    const mint = publicKey(nftAddress);
    const nft = await fetchMetadataFromSeeds(umi, { mint });

    const updateTx = await updateV1(umi, {
      mint,
      authority: umi.identity,
      data: {
        ...nft,
        uri: `https://dweb.mypinata.cloud/ipfs/${uri}`,
        name: nft.name,
        symbol: nft.symbol
      },
      primarySaleHappened: true,
      isMutable: true,
    }).sendAndConfirm(umi);
    return updateTx;
  } catch (error) {
    console.log(error)
    return error
  }
}
