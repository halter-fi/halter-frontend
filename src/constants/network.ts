export type NetworkId = 1 | 3 | 4 | 5 | 42 | 137 | 42161 | 250 | 168587773;

export enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  POLYGON = 137,
  ARBITRUM = 42161,
  FANTOM = 250,
  BLAST_TESTNET = 168587773
}

export const APP_NETWORK_ID = Number(process.env.VUE_APP_NETWORK) as NetworkId;
