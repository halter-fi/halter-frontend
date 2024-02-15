<template>
  <BalCard noPad>
    <div class="relative overflow-hidden">
      <div
        class="flex justify-between items-end border-b dark:border-gray-900 px-4"
      >
        <BalTabs v-model="activeTab" :tabs="tabs" class="pt-4 -mb-px" no-pad />
        <TradeSettingsPopover :context="TradeSettingsContext.invest" />
      </div>

      <template v-if="activeTab === 'invest'">
        <InvestForm
          :pool="pool"
          :missing-prices="missingPrices"
          @success="handleInvestment($event)"
        />
        <SuccessOverlay
          v-if="investmentSuccess"
          :title="$t('investmentSettled')"
          :description="$t('investmentSuccess')"
          :closeLabel="$t('close')"
          :explorerLink="explorer.txLink(txHash)"
          @close="investmentSuccess = false"
        />
      </template>
      <template v-if="activeTab === 'withdraw'">
        <WithdrawForm
          :pool="pool"
          :missing-prices="missingPrices"
          @success="handleWithdrawal($event)"
        />
        <SuccessOverlay
          v-if="withdrawalSuccess"
          :title="$t('withdrawalSettled')"
          :description="$t('withdrawalSuccess')"
          :closeLabel="$t('close')"
          :explorerLink="explorer.txLink(txHash)"
          @close="withdrawalSuccess = false"
        />
      </template>
    </div>
  </BalCard>
  <template v-if="shouldShowRewardsBlock">
    <PoolRewardsCard :pool="pool" class="mt-8" />
  </template>
</template>

<script lang="ts">
import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';
import InvestForm from '@/components/forms/pool_actions/InvestForm.vue';
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
import useFathom from '@/composables/useFathom';
import useTokens from '@/composables/useTokens';
import { FullPool } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { computed, defineComponent, PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PoolRewardsCard from '../PoolRewardsCard.vue';

export default defineComponent({
  name: 'PoolActionsCard',

  emits: ['onTx'],

  components: {
    InvestForm,
    WithdrawForm,
    SuccessOverlay,
    TradeSettingsPopover,
    PoolRewardsCard
  },

  props: {
    pool: { type: Object as PropType<FullPool>, required: true },
    missingPrices: { type: Boolean, default: false }
  },

  setup(props, { emit }) {
    /**
     * COMPOSABLES
     */
    const { t } = useI18n();
    const { trackGoal, Goals } = useFathom();
    const { explorerLinks: explorer } = useWeb3();
    const { balanceFor } = useTokens();

    /**
     * STATE
     */
    const tabs = [
      { value: 'invest', label: t('invest') },
      { value: 'withdraw', label: t('withdraw') }
    ];
    const activeTab = ref(tabs[0].value);
    const investmentSuccess = ref(false);
    const withdrawalSuccess = ref(false);
    const txHash = ref('');
    const shouldShowRewardsBlock = computed(
      () =>
        Number(balanceFor(props.pool.address)) !== 0 &&
        Boolean(configService.network.liquidityRewards[props.pool.id])
    );

    /**
     * METHODS
     */
    function handleInvestment(txReceipt): void {
      investmentSuccess.value = true;
      txHash.value = txReceipt.hash;
      trackGoal(Goals.Invested);
      emit('onTx', txReceipt);
    }

    function handleWithdrawal(txReceipt): void {
      withdrawalSuccess.value = true;
      txHash.value = txReceipt.hash;
      trackGoal(Goals.Withdrawal);
      emit('onTx', txReceipt);
    }

    return {
      // data
      activeTab,
      tabs,
      investmentSuccess,
      withdrawalSuccess,
      txHash,
      TradeSettingsContext,
      shouldShowRewardsBlock,
      // methods
      handleInvestment,
      handleWithdrawal,
      explorer
    };
  }
});
</script>
