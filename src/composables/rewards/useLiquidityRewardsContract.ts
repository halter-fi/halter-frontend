import { LiquidityRewards__factory } from '@/lib/typechain';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { computed } from 'vue';

export default function useLiquidityRewardsContracts(...poolIds: string[]) {
  const { getProvider } = useWeb3();

  const liquidityRewardContracts = computed(() =>
    poolIds
      .map(poolId => configService.network.liquidityRewards[poolId])
      .map(contractAddress =>
        LiquidityRewards__factory.connect(
          contractAddress,
          getProvider().getSigner()
        )
      )
  );

  return liquidityRewardContracts;
}
