<template>
  <div class="grid grid-cols-1 gap-y-12">
    <div class="info-wrapper gap-y-8">
      <div class="grid md:col-start-1 md:col-end-3 gap-y-8">
        <BalCard growContent>
          <div class="grid grid-cols-1 gap-y-4">
            <h3>{{ $t('availableToClaim') }}</h3>
            <div class="flex justify-between items-end">
              <span class="text-xl font-semibold text-purple-500"
                >{{ formatToken(claimableRewards, 6) }} USDC</span
              >
              <span>$ 15.67</span>
            </div>
            <BalBtn color="purple" outline @click.prevent="claim">{{
              $t('claim')
            }}</BalBtn>
            <div class="text-gray-500 text-xs">
              {{ $t('availableToClaimWarning') }}
            </div>
          </div>
        </BalCard>
        <BalCard growContent>
          <div class="grid grid-cols-1 gap-y-4">
            <h3>{{ $t('lockedRewards') }}</h3>
            <div class="flex justify-between items-end">
              <span class="text-xl font-semibold text-purple-500"
                >{{ formatToken(lockedRewards, 6) }} USDC</span
              >
              <span>$ 15.67</span>
            </div>
            <div class="text-gray-500 text-xs"></div>
          </div>
        </BalCard>
      </div>
      <BalCard growContent class="md:col-start-4 md:col-end-9">
        <div
          class="grid gap-y-8 py-8 md:py-0 md:grid-cols-2 h-full items-center justify-items-center"
        >
          <ve-progress
            line="butt"
            :color="completedSteps ? gradient : 'transparent'"
            :thickness="32"
            :emptyThickness="30"
            :progress="completedSteps"
            :size="350"
          >
            <div class="text-center">
              <h3>{{ $t('totalRewards') }}</h3>
              <div class="text-4xl font-semibold text-purple-500">
                {{ formatToken(totalRewards, 6) }} USDC
              </div>
              <div>$ 151.67</div>
            </div>
          </ve-progress>
          <div class="legend-grid">
            <div class="w-8 h-8 gradient-purple-diagonal rounded-full"></div>
            <div>{{ $t('availableToClaim') }}</div>
            <div class="w-8 h-8 bg-purple-100 rounded-full"></div>
            <div>{{ $t('lockedRewards') }}</div>
          </div>
        </div>
      </BalCard>
    </div>
  </div>
  <teleport to="#modal">
    <transactions-preview-modal
      v-if="modalTransactionsPreviewIsOpen"
      :transactions="transactions"
      @close="modalTransactionsPreviewIsOpen = false"
      @success="modalTransactionsPreviewIsOpen = false"
    >
      {{ $t('withdrawTokensWarning') }}
    </transactions-preview-modal>
  </teleport>
</template>

<script lang="ts">
import useStackingRewardsQuery from '@/composables/queries/useStakingRewardsQuery';
import useUserRewardPoolsQuery from '@/composables/queries/useUserRewardPoolsQuery';
import useStakingRewardsContracts from '@/composables/rewards/useStakingRewardsContract';
import useEthers from '@/composables/useEthers';
import useNumbers from '@/composables/useNumbers';
import useRewardsWeek from '@/composables/useRewardsWeek';
import useTransactions from '@/composables/useTransactions';
import { BigNumber } from '@ethersproject/bignumber';
import { computed, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TransactionsPreviewModal, {
  Transaction
} from '@/components/modals/TransactionsPreviewModal.vue';
import useNotifications from '@/composables/useNotifications';

export default defineComponent({
  name: 'StakingRewards',
  components: { TransactionsPreviewModal },

  setup() {
    const { isLoading: isLoadingUserRewardPools } = useUserRewardPoolsQuery();
    const {
      data: stakingRewardsData,
      refetch: refetchStakingRewards
    } = useStackingRewardsQuery();
    const [unlockedContract, lockedContract] = useStakingRewardsContracts();
    const { currentWeek } = useRewardsWeek();
    const { addTransaction } = useTransactions();
    const { txListener } = useEthers();
    const { fNumToken } = useNumbers();
    const { addErrorNotification } = useNotifications();

    const formatToken = (amount: string, decimals: number) =>
      fNumToken(amount, decimals);

    const totalRewards = computed(() => BigNumber.from(0));

    const claimableRewards = computed(() => BigNumber.from(0));

    const lockedRewards = computed(() =>
      totalRewards.value.sub(claimableRewards.value)
    );

    const { t } = useI18n();
    const transactions = ref<Transaction[]>([]);
    const modalTransactionsPreviewIsOpen = ref(false);

    async function claim() {
      // if (
      //   stakingRewardsData.value?.unlocked.vestedRewards.gt(0) &&
      //   stakingRewardsData.value?.locked.vestedRewards.gt(0)
      // ) {
      //   transactions.value = [
      //     {
      //       title: t('claim'),
      //       handler: async () => {
      //         try {
      //           const tx = await lockedContract.value.claimRewards(
      //             currentWeek.value
      //           );

      //           addTransaction({
      //             id: tx.hash,
      //             type: 'tx',
      //             action: 'claim',
      //             summary: t('transactionSummary.claimRewards'),
      //             details: {
      //               contractAddress: lockedContract.value.address
      //             }
      //           });
      //         } catch (error) {
      //           addErrorNotification((error as any)?.data?.message);
      //           console.error(error);
      //         }
      //       }
      //     },
      //     {
      //       title: t('claim'),
      //       handler: async () => {
      //         try {
      //           const tx = await unlockedContract.value.claimRewards(
      //             currentWeek.value.toString()
      //           );

      //           addTransaction({
      //             id: tx.hash,
      //             type: 'tx',
      //             action: 'claim',
      //             summary: t('transactionSummary.claimingRewards'),
      //             details: {
      //               contractAddress: unlockedContract.value.address
      //             }
      //           });
      //         } catch (error) {
      //           addErrorNotification((error as any)?.data?.message);
      //           console.error(error);
      //         }
      //       }
      //     }
      //   ];
      // } else if (
      //   stakingRewardsData.value?.unlocked.vestedRewards.gt(BigNumber.from('0'))
      // ) {
      //   const tx = await unlockedContract.value.claimRewards(currentWeek.value);

      //   addTransaction({
      //     id: tx.hash,
      //     type: 'tx',
      //     action: 'claim',
      //     summary: t('transactionSummary.claimRewards'),
      //     details: {
      //       contractAddress: unlockedContract.value.address
      //     }
      //   });

      //   txListener(tx, {
      //     onTxConfirmed: async () => {
      //       refetchStakingRewards.value();
      //     }
      //   });
      // } else if (
      //   stakingRewardsData.value?.locked.vestedRewards.gt(BigNumber.from('0'))
      // ) {
      //   const tx = await lockedContract.value.claimRewards(currentWeek.value);

      //   addTransaction({
      //     id: tx.hash,
      //     type: 'tx',
      //     action: 'claim',
      //     summary: t('transactionSummary.claimingRewards'),
      //     details: {
      //       contractAddress: lockedContract.value.address
      //     }
      //   });

      //   txListener(tx, {
      //     onTxConfirmed: async () => {
      //       refetchStakingRewards.value();
      //     }
      //   });
      // }
      modalTransactionsPreviewIsOpen.value = true;
    }
    const completedSteps = computed(() => {
      if (totalRewards.value.isZero()) {
        return 0;
      }

      const ratio = claimableRewards.value.div(totalRewards.value).mul(100);

      return ratio.gt(0) && ratio.gt(1) ? ratio.toNumber() : 0;
    });

    const gradient = {
      radial: false,
      colors: [
        {
          color: '#D742FF',
          offset: '0',
          opacity: '1'
        },

        {
          color: '#1B52EB',
          offset: '70',
          opacity: '1'
        },
        {
          color: '#D742FF',
          offset: '100',
          opacity: '1'
        }
      ]
    };

    return {
      formatToken,
      isLoadingUserRewardPools,
      claimableRewards,
      totalRewards,
      lockedRewards,
      completedSteps,
      claim,
      modalTransactionsPreviewIsOpen,
      transactions,
      gradient
    };
  }
});
</script>

<style scoped>
.info-wrapper {
  @apply grid md:grid-cols-8 grid-cols-1;
}

.legend-grid {
  @apply grid gap-8 items-center;
  grid-template-columns: max-content 1fr;
}
</style>
