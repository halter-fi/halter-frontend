import { TradeRewardsVesting__factory } from '@/lib/typechain';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { computed } from 'vue';

export default function useTradingRewardsContracts() {
  const { getProvider } = useWeb3();

  return computed(() =>
    TradeRewardsVesting__factory.connect(
      configService.network.addresses.tradeRewards,
      getProvider().getSigner()
    )
  );
}
