<template>
  <div
    class="lg:container lg:mx-auto pt-10 md:pt-12 flex justify-center items-center px-6"
  >
    <bal-card class="py-6 px-4 w-full md:w-96" v-if="!state.user">
      <h2 class="mb-4">Restricted area</h2>
      <p class="mb-12">
        Only authorized users can access this area of the website. Please, use
        Metamask to authorize.
      </p>
      <BalBtn
        @click="authorize()"
        v-if="!state.user"
        :loading="state.loading"
        loadingLabel="Loading..."
        class="w-full"
        >Authorize</BalBtn
      >
    </bal-card>
    <div v-if="state.user" class="w-full">
      <h2 class="mb-2">Rewards distribution</h2>

      <BalBtn @click="reset()" class="mb-4 float-right"
        >Reset and calculate again</BalBtn
      >

      <bal-card class="w-full">
        <bal-select-input
          :options="phases"
          :modelValue="activePhase"
          v-model="activePhase"
          name="Phase"
        />

        <BalTabs v-model="activeTab" :tabs="tabs" class="pt-4 mb-6" no-pad />

        <template v-if="activeTab === 'trade'">
          <BalBtn
            @click="payOutTrading(activePhase)"
            :loading="state.loading"
            loadingLabel="Loading..."
            >Pay out Phase {{ parseInt(activePhase, 10) }}</BalBtn
          >

          <bal-table
            :columns="state.tradingRewardsColumns"
            :data="state.tradingRewards"
          >
          </bal-table>
        </template>
      </bal-card>
    </div>
  </div>
</template>

<script lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { rewardsService } from '@/services/rewards';
import { useI18n } from 'vue-i18n';
import useNumbers from '@/composables/useNumbers';
import { configService } from '@/services/config/config.service';
import BalSelectInput from '@/components/_global/BalSelectInput/BalSelectInput.vue';
import useNotifications from '@/composables/useNotifications';

export default defineComponent({
  components: { BalSelectInput },
  name: 'AdminRewards',
  setup() {
    const { account, getSigner } = useWeb3();
    const { t } = useI18n();
    const { fNum } = useNumbers();
    const { addNotification } = useNotifications();

    const state = reactive({
      loading: false,
      user: null,
      tradingRewards: [],
      tradingRewardsColumns: [
        {
          name: 'Phase',
          id: 'phase',
          accessor: v => v.phase,
          width: 100
        },
        {
          name: 'Address',
          id: 'address',
          accessor: 'address',
          width: 500
        },
        {
          name: 'Percentage',
          id: 'percentage',
          cellClassName: 'font-numeric',
          accessor: v => fNum(v.percentage, 'percent')
        },
        {
          name: 'Rewards',
          id: 'rewards',
          cellClassName: 'font-numeric',
          accessor: v =>
            fNum(
              v.percentage * configService.network.rewards.trading[v.phase],
              'token'
            ) + ' HALT'
        },
        {
          name: 'Paid out',
          id: 'paid-out',
          accessor: v => (v.paidOut ? 'Paid' : 'Not paid')
        }
      ]
    });

    const tabs = [
      { value: 'trade', label: t('trade') },
      { value: 'stake', label: t('stake') }
    ];

    const activeTab = ref(tabs[0].value);

    const phases = Object.keys(configService.network.rewards.trading).map(
      (_, index) => ({
        value: index.toString(),
        text: `Phase ${index}`
      })
    );

    const activePhase = ref(phases[0].value);

    watch(activePhase, () => {
      fetchRewards(parseInt(activePhase.value, 10));
    });

    const refreshUser = async () => {
      state.loading = true;
      try {
        const { data } = await rewardsService.getMe();
        state.user = data;
      } catch {
        console.log('Unauthorized');
      }

      state.loading = false;
    };

    const fetchRewards = async (phase: number) => {
      const { tradingRewards } = await rewardsService.getRewardsByPhase(phase);

      state.tradingRewards = tradingRewards;
    };

    const payOutTrading = async (phase: string) => {
      state.loading = true;
      try {
        await rewardsService.payOutTrading(parseInt(phase, 10));
        await fetchRewards(parseInt(phase, 10));
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Unable to pay out',
          message:
            (error as any)?.response?.data?.message || (error as any).message
        });
      }
      state.loading = false;
    };

    onMounted(() => {
      refreshUser();
      fetchRewards(parseInt(activePhase.value, 10));
    });

    const reset = async () => {
      await rewardsService.reset();
      return await fetchRewards(parseInt(activePhase.value, 10));
    };

    const authorize = async () => {
      state.loading = true;

      try {
        const signer = getSigner();

        const signature = await signer.signMessage(
          'Create authentication secret'
        );

        const {
          data: { message }
        } = await rewardsService.getAuthMessage(signature);

        const signedMessage = await signer.signMessage(message);

        await rewardsService.login({
          address: account.value,
          message,
          signed: signedMessage
        });

        refreshUser();
      } catch {
        state.user = null;
      }

      state.loading = false;
    };

    return {
      state,
      authorize,
      tabs,
      activeTab,
      phases,
      activePhase,
      payOutTrading,
      reset
    };
  }
});
</script>
