import { FETCH_ONCE_OPTIONS } from '@/constants/vue-query';
import { LockWithdrawStructOutput } from '@/lib/typechain/HalterStakingLocked';
import { defaultIfCatch } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { BigNumber } from '@ethersproject/bignumber';
import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import useStakingRewardsContracts from '../rewards/useStakingRewardsContract';
import useRewardsWeek from '../useRewardsWeek';

export default function useStackingRewardsQuery(options: UseQueryOptions = {}) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();
  const { currentWeek } = useRewardsWeek();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value);

  const [
    stakingUnlockedContract,
    stakingLockedContract
  ] = useStakingRewardsContracts();

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive(['stakingRewards', account]);

  const queryFn = async () => {
    const [unlocked, partialLocked] = await Promise.all(
      [stakingUnlockedContract.value, stakingLockedContract.value].map(
        async stakingContract => {
          const [
            stakedAmount,
            totalRewards,
            vestedRewards
          ] = await Promise.all([0, 0, 0]);

          return {
            stakedAmount,
            totalRewards,
            vestedRewards
          };
        }
      )
    );

    let withdrawPurgatory: LockWithdrawStructOutput = [];
    try {
      withdrawPurgatory = (await stakingLockedContract.value.viewWithdrawPurgatoryArray()) as any;
    } catch (error) {
      console.error(error);
    }

    const locked = {
      ...partialLocked,
      withdrawPurgatory
    };
    return { unlocked, locked };
  };

  const queryOptions = reactive({
    enabled,
    ...FETCH_ONCE_OPTIONS,
    ...options
  });

  return useQuery(queryKey, queryFn, queryOptions as any);
}
