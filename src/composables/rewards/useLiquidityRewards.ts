import useLiquidityMiningRewardsQuery from '@/composables/queries/useLiquidityMiningRewardsQuery';
import { configService } from '@/services/config/config.service';
import { BigNumber } from '@ethersproject/bignumber';
import { computed } from 'vue-demi';

export default function useLiquidityRewards(poolIds: string[] = []) {
  const finalPoolIds = computed(() =>
    poolIds.length
      ? poolIds
      : Object.keys(configService.network.liquidityRewards)
  );
  const liquidityMiningRewardsQuery = useLiquidityMiningRewardsQuery(
    finalPoolIds.value
  );

  const total = computed(
    () =>
      liquidityMiningRewardsQuery.data.value?.reduce(
        (acc, value) => acc.add(value.totalRewards),
        BigNumber.from(0)
      ) ?? BigNumber.from(0)
  );

  const claimable = computed(
    () =>
      liquidityMiningRewardsQuery.data.value?.reduce(
        (acc, value) => acc.add(value.vestedRewards),
        BigNumber.from(0)
      ) ?? BigNumber.from(0)
  );

  return {
    total,
    claimable,
    byPool: liquidityMiningRewardsQuery.data
  };
}
