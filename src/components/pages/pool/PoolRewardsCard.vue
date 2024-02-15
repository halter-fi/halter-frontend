<template>
  <div class="text-center">
    <div class="text-sm font-semibold">
      {{ $t('linearVestingDisclaimerTitle') }}
    </div>
    <div>{{ $t('linearVestingDisclaimerBody') }}</div>
    <BalBtn
      color="gradient"
      class="mt-2 w-full"
      @click.prevent="earnRewards"
      :loading="isLoading"
      >{{ $t('earnRewards') }}</BalBtn
    >
  </div>
</template>

<script lang="ts">
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useLiquidityRewardsContract from '@/composables/rewards/useLiquidityRewardsContract';
import useNotifications from '@/composables/useNotifications';
import useRewardsWeek from '@/composables/useRewardsWeek';
import useTokens from '@/composables/useTokens';
import useTransactions from '@/composables/useTransactions';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import { parseUnits } from '@ethersproject/units';
import { defineComponent, PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMutation } from 'vue-query';

export default defineComponent({
  components: {},

  props: {
    pool: { type: Object as PropType<DecoratedPool>, required: true },
    loading: { type: Boolean, default: true }
  },

  setup(props) {
    const { balanceFor } = useTokens();
    const lpTokenBalances = ref([balanceFor(props.pool.address)]);
    const {
      requiredAllowances,
      approveAllowances,
      approving,
      approvedAll
    } = useTokenApprovals([props.pool.address], lpTokenBalances);
    const liquidityRewardsContract = useLiquidityRewardsContract(props.pool.id);
    const { currentWeek } = useRewardsWeek();
    const { addTransaction } = useTransactions();
    const { addErrorNotification } = useNotifications();
    const { t } = useI18n();

    const depositLptMutation = useMutation(async () => {
      const parsedAmount = parseUnits(lpTokenBalances.value[0], 18);

      try {
        const tx = await liquidityRewardsContract.value[0].stake(
          parsedAmount,
          currentWeek.value
        );

        addTransaction({
          id: tx.hash,
          type: 'tx',
          action: 'deposit',
          summary: t('transactionSummary.deposit'),
          details: {
            contractAddress: liquidityRewardsContract.value[0].address
          }
        });
      } catch (error) {
        addErrorNotification((error as any)?.data.message);
        console.error(error);
      }
    });

    async function earnRewards() {
      if (requiredAllowances.value.length && !approvedAll.value) {
        await approveAllowances();
      }

      await depositLptMutation.mutateAsync();
    }

    return {
      earnRewards,
      isLoading: approving.value && depositLptMutation.isLoading
    };
  }
});
</script>
