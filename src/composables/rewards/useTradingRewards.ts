import { BigNumber } from '@ethersproject/bignumber';
import { useAsyncState } from '@vueuse/core';
import useTradingRewardsContracts from './useTradingRewardsContract';

export default function useTradingRewards() {
  const tradingRewardsContract = useTradingRewardsContracts();

  const { state: total } = useAsyncState(async () => {
    return await tradingRewardsContract.value.getTotalRewards();
  }, BigNumber.from(0));

  const { state: claimable } = useAsyncState(async () => {
    return await tradingRewardsContract.value.calculateAllClaims();
  }, BigNumber.from(0));

  const { state: unvested } = useAsyncState(async () => {
    return await tradingRewardsContract.value.getEmergencyClaimRewards();
  }, BigNumber.from(0));

  return {
    total,
    claimable,
    unvested
  };
}
