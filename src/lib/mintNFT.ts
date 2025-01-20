import umiWithCurrentWalletAdapter from "./umi/umiWithCurrentWalletAdapter";
import { createNft, createV1, findMetadataPda, mintV1, mplTokenMetadata, TokenStandard, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount, publicKey, sol } from "@metaplex-foundation/umi";

export async function mintNFT(name: string, uri: string) {
  try {
    const umi = umiWithCurrentWalletAdapter();

    // const collectionAddress = publicKey("2AQCkfmrftMrK4hTLXBKBwGAZYMrKh5CFJrksmQBGy7t");

    umi.use(mplTokenMetadata())

    const collectionMint = generateSigner(umi)
    await createNft(umi, {
      mint: collectionMint,
      name: 'CONCEALMINT',
      uri: uri,
      sellerFeeBasisPoints: percentAmount(0), // 5.5%
      isCollection: true,
    }).sendAndConfirm(umi)

    const nftMint = generateSigner(umi);

    const tx = await createNft(umi, {
      mint: nftMint,
      name: name,
      uri: `https://dweb.mypinata.cloud/ipfs/${uri}`,
      updateAuthority: umi.identity.publicKey,
      sellerFeeBasisPoints: percentAmount(0),
      collection: {
        key: collectionMint.publicKey, // Your collection's mint address
        verified: false, // Will be verified in a separate transaction
      },
    }).sendAndConfirm(umi);

    const metadata = findMetadataPda(umi, { mint: nftMint.publicKey });

    await verifyCollectionV1(umi, {
      metadata,
      collectionMint: collectionMint.publicKey,
      authority: umi.identity,
    }).sendAndConfirm(umi);

    return tx
  } catch (error) {
    console.log(error)
    return error
  }
};
