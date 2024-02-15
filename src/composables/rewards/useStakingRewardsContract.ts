import {
  HalterStakingLocked__factory,
  HalterStakingUnlocked__factory
} from '@/lib/typechain';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { computed } from 'vue';

export default function useStakingRewardsContracts() {
  const { getProvider } = useWeb3();

  return [
    computed(() =>
      HalterStakingUnlocked__factory.connect(
        configService.network.addresses.halterStakingUnlocked,
        getProvider().getSigner()
      )
    ),
    computed(() =>
      HalterStakingLocked__factory.connect(
        configService.network.addresses.halterStakingLocked,
        getProvider().getSigner()
      )
    )
  ] as const;
}
