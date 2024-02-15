import { FETCH_ONCE_OPTIONS } from '@/constants/vue-query';
import { defaultIfCatch } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { BigNumber } from '@ethersproject/bignumber';
import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import useTradingRewardsContracts from '../rewards/useTradingRewardsContract';

export default function useTradingRewardsQuery(options: UseQueryOptions = {}) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value);

  const tradingRewardsContract = useTradingRewardsContracts();

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive(['tradingRewards', account]);

  const queryFn = async () => {
    const [totalRewards, claimableRewards] = await Promise.all([
      defaultIfCatch(
        tradingRewardsContract.value.getTotalRewards(),
        BigNumber.from(0)
      ),
      defaultIfCatch(
        tradingRewardsContract.value.calculateAllClaims(),
        BigNumber.from(0)
      )
    ]);

    return {
      totalRewards,
      claimableRewards
    };
  };

  const queryOptions = reactive({
    enabled,
    ...FETCH_ONCE_OPTIONS,
    ...options
  });

  return useQuery(queryKey, queryFn, queryOptions as any);
}
