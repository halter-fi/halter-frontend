import docker from './docker.json';
import blastTestnet from './testnet.json';

export interface Config {
  key: string;
  chainId: number;
  chainName: string;
  name: string;
  shortName: string;
  network: string;
  unknown: boolean;
  rpc: string;
  publicRpc?: string;
  ws: string;
  loggingRpc: string;
  explorer: string;
  subgraph: string;
  poolsUrlV1: string;
  poolsUrlV2: string;
  supportsEIP1559: boolean;
  supportsElementPools: boolean;
  nativeAsset: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    deeplinkId: string;
    logoURI: string;
  };
  addresses: {
    exchangeProxy: string;
    merkleRedeem: string;
    multicall: string;
    vault: string;
    weightedPoolFactory: string;
    stablePoolFactory: string;
    halt: string;
    weth: string;
    stETH: string;
    wstETH: string;
    lidoRelayer: string;
    balancerHelpers: string;

    rewardToken: string;
    tradeRewards: string;
    stakeToken: string;
    halterStakingLocked: string;
    halterStakingUnlocked: string;
  };
  liquidityRewards: Record<string, string>;
  strategies: Record<
    string,
    {
      type: string;
      name: string;
    }
  >;
  rewards: {
    apiURL: string;
    trading: number[];
  };
}

const config: Record<string, Config> = {
  // '1': homestead,
  // '42': kovan,
  // '4': rinkeby,
  // '137': polygon,
  // '42161': arbitrum,
  // '12345': test,
  // '4002': blastTestnet,
  '168587773': blastTestnet,
  // @ts-ignore
  '17': docker
};

export default config;
