import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { das } from '@metaplex-foundation/mpl-core-das';
import { fetchAllDigitalAssetByOwner, fetchDigitalAssetWithTokenByMint } from '@metaplex-foundation/mpl-token-metadata'



const endpoint = 'https://api.devnet.solana.com';

export async function fetchNFTs() {
  const umi = createUmi('https://api.devnet.solana.com').use(dasApi());
  const collection = publicKey('2AQCkfmrftMrK4hTLXBKBwGAZYMrKh5CFJrksmQBGy7t')
  //const assets = await das.getAssetsByCollection(umi, { collection })
  //@ts-ignore
  const assets = await umi.rpc.getAssetsByGroup({
    groupKey: 'collection',
    groupValue: collection,
  });

  const asset = await fetchDigitalAssetWithTokenByMint(umi, publicKey("XuDm6ij5Kqu1gedcoVBaARxJ1UNiuKkhAvP3YeJSXUm"))
  console.log(asset)


  // const response = await fetch(endpoint, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     jsonrpc: '2.0',
  //     id: 'my-id',
  //     method: 'getAssetsByGroup',
  //     params: {
  //       groupKey: 'collection',
  //       groupValue: '2AQCkfmrftMrK4hTLXBKBwGAZYMrKh5CFJrksmQBGy7t',
  //       page: 1,
  //       limit: 1000,
  //     },
  //   }),
  // });

  // const data = await response.json()

  // console.log(data.result.items);
}

fetchNFTs()
