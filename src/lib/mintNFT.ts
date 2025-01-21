import umiWithCurrentWalletAdapter from "./umi/umiWithCurrentWalletAdapter";
import { createNft, createV1, fetchMetadataFromSeeds, findMetadataPda, Metadata, mintV1, mplTokenMetadata, TokenStandard, updateV1, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount, publicKey, sol } from "@metaplex-foundation/umi";

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


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
    const umi = umiWithCurrentWalletAdapter();
    umi.use(mplTokenMetadata())

    const mint = publicKey(nftAddress);
    let nft: Metadata | null = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        nft = await fetchMetadataFromSeeds(umi, { mint });

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

      } catch (e) {
        attempts++;
        if (attempts === maxAttempts) {
          throw new Error('Failed to fetch metadata after maximum attempts');
        }
        await delay(2000);
      }
    }

    throw new Error('Failed to update NFT metadata');

  } catch (error) {
    console.log(error)
    return error
  }
}
