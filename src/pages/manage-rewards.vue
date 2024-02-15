<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12 pb-8 md:pb-0">
    <h2 class="px-4 md:px-0">{{ $t('manageYourRewards') }}</h2>

    <BalTabs
      v-model="activeTab"
      :tabs="tabs"
      class="pt-4 mb-6 px-4 md:px-0 text-center w-full"
      no-pad
    />
    <template v-if="activeTab === 'liquidity'">
      <liquidity-rewards />
    </template>
    <template v-if="activeTab === 'trading'">
      <trading-rewards />
    </template>
    <template v-if="activeTab === 'staking'">
      <staking-rewards />
    </template>
  </div>
</template>

<script lang="ts">
import LiquidityRewards from '@/components/pages/manage-rewards/LiquidityRewards.vue';
import StakingRewards from '@/components/pages/manage-rewards/StakingRewards.vue';
import TradingRewards from '@/components/pages/manage-rewards/TradingRewards.vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    LiquidityRewards,
    StakingRewards,
    TradingRewards
  },

  setup() {
    const { t } = useI18n();

    const tabs = [
      { value: 'liquidity', label: t('liquidityMining') },
      { value: 'trading', label: t('tradingRewards') },
      { value: 'staking', label: t('stakingRewards') }
    ];
    const activeTab = ref(tabs[0].value);

    return { tabs, activeTab };
  }
});
</script>
