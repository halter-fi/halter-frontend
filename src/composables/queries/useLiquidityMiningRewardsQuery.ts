import { FETCH_ONCE_OPTIONS } from '@/constants/vue-query';
import { defaultIfCatch } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { BigNumber } from '@ethersproject/bignumber';
import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import useLiquidityRewardsContracts from '../rewards/useLiquidityRewardsContract';
import useRewardsWeek from '../useRewardsWeek';

export default function useLiquidityMiningRewardsQuery(
  poolIds: string[],
  options: UseQueryOptions = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();
  const { currentWeek } = useRewardsWeek();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value);

  const liquidityRewardContracts = useLiquidityRewardsContracts(...poolIds);

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive([
    'liquidityMiningRewards',
    account,
    poolIds.join(',')
  ]);

  const queryFn = async () => {
    const byPool = await Promise.all(
      liquidityRewardContracts.value.map(
        async (liquidityRewardContract, index) => {
          const [
            stakedAmount,
            totalRewards,
            vestedRewards
          ] = await Promise.all([
            defaultIfCatch(
              liquidityRewardContract.userStaked(account.value),
              BigNumber.from(0)
            ),
            defaultIfCatch(
              liquidityRewardContract.viewTotalRewards(currentWeek.value),
              BigNumber.from(0)
            ),
            defaultIfCatch(
              liquidityRewardContract.viewVestedRewards(currentWeek.value),
              BigNumber.from(0)
            )
          ]);

          return {
            poolId: poolIds[index],
            stakedAmount,
            totalRewards,
            vestedRewards
          };
        }
      )
    );
    return byPool;
  };

  const queryOptions = reactive({
    enabled,
    ...FETCH_ONCE_OPTIONS,
    ...options
  });

  return useQuery(queryKey, queryFn, queryOptions as any);
}
