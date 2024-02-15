<template>
  <div class="grid grid-cols-1 gap-y-12">
    <div class="info-wrapper gap-y-8">
      <div class="grid md:col-start-1 md:col-end-3 gap-y-8">
        <BalCard growContent>
          <div class="grid grid-cols-1 gap-y-4">
            <h3>{{ $t('availableToClaim') }}</h3>
            <div class="flex justify-between items-end">
              <span class="text-xl font-semibold text-purple-500"
                >{{ formatToken(claimableRewards) }} HALT</span
              >
              <span>$ 15.67</span>
            </div>
            <BalBtn color="purple" outline>{{ $t('claim') }}</BalBtn>
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
                >{{ formatToken(lockedRewards) }} HALT</span
              >
              <span>$ 15.67</span>
            </div>
            <BalBtn color="purple" outline>{{ $t('claim') }}</BalBtn>
            <div class="text-gray-500 text-xs">
              {{ $t('lockedRewardsWarning') }}
            </div>
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
                {{ formatToken(totalRewards) }} HALT
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
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import useTradingRewards from '@/composables/rewards/useTradingRewards';
import BigNumber from 'bignumber.js';
import useNumbers from '@/composables/useNumbers';

export default defineComponent({
  name: 'TradingRewards',

  setup() {
    const { total, claimable } = useTradingRewards();
    const { fNumToken } = useNumbers();

    const lockedRewards = computed(() => total.value.sub(claimable.value));

    const completedSteps = computed(() => {
      if (total.value.isZero()) {
        return 0;
      }

      const claimableBn = new BigNumber(claimable.value.toString());
      const totalBn = new BigNumber(total.value.toString());
      const ratio = claimableBn.dividedBy(totalBn).times(100);

      return ratio.gt(1) ? ratio.toNumber() : 0;
    });

    const formatToken = (amount: string) => fNumToken(amount);

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
      claimableRewards: claimable,
      totalRewards: total,
      lockedRewards,
      completedSteps,
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
