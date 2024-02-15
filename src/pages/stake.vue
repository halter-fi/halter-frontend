<template>
  <div
    class="lg:container lg:mx-auto pt-10 md:pt-12 grid gap-y-8 pb-10 md:pb-0"
  >
    <h2 class="px-4 md:px-0">Stacking</h2>
    <div class="flex justify-between items-start flex-col md:flex-row gap-10">
      <div class="grid gap-y-6 px-4 md:px-0 pb-0 md:pb-36">
        <div>Stake your HALT tokens and start earn rewards.</div>
        <div>
          <h3>You have staked</h3>
          <h3 class="text-purple-500">{{ formatBn(staked) }} HALT</h3>
        </div>
        <div>
          <h3>Available to withdraw</h3>
          <h3 class="text-purple-500">{{ formatBn(available) }} HALT</h3>
        </div>
        <div>
          <h3>Locked tokens</h3>
          <h3 class="text-purple-500">{{ formatBn(locked) }} HALT</h3>
        </div>
        <div>
          <h3>Rewards</h3>
          <h3 class="text-purple-500">{{ formatBn(rewards) }} USDC</h3>
        </div>
      </div>
      <BalCard class="w-full max-w-md">
        <div class="action-container">
          <BalTabs :tabs="tabs" v-model="activeTab" />
          <template v-if="activeTab === 'deposit'">
            <TokenInput
              v-if="halter"
              v-model:amount="amountToStake"
              v-model:isValid="isDepositInputValid"
              :address="halter.address"
              :weight="0"
              :name="halter.address"
              fixedToken
              hideInCurrency
            />
            <BalRadio name="depositType" value="unlocked" v-model="depositType">
              <template v-slot:label>
                <div class="grid gap-y-2">
                  Stake your HALT tokens without locking
                  <div class="text-gray-500 text-xs">
                    Tokens wil not be able to participate in the distribution of
                    penalties from past reward programs and you can withdraw
                    them at anytime.
                  </div>
                </div>
              </template>
            </BalRadio>
            <BalRadio name="depositType" value="locked" v-model="depositType">
              <template v-slot:label>
                <div class="grid gap-y-2">
                  Stake your HALT tokens with locking
                  <div class="text-gray-500 text-xs">
                    You can earn more rewards if you lock your tokens and take
                    part in the event of distribution of the penalties that
                    users have paid during the reward programm. You can withdraw
                    your tokens in 120 days after stoping earning rewards.
                  </div>
                </div>
              </template>
            </BalRadio>
            <BalBtn
              :color="requiresApproval ? 'primary' : 'gradient'"
              :disabled="!isDepositInputValid"
              @click.prevent="deposit"
              >{{
                requiresApproval ? $t('approve') : $t('stakeTokens')
              }}</BalBtn
            >
          </template>

          <template v-if="activeTab === 'unlock'">
            <TokenInput
              v-if="halter"
              v-model:amount="amountToUnlock"
              v-model:isValid="isUnlockInputValid"
              :customBalance="formatBn(locked)"
              :address="halter.address"
              :weight="0"
              :name="halter.address"
              fixedToken
              hideInCurrency
            />
            <BalBtn
              color="gradient"
              :disabled="!isUnlockInputValid"
              @click.prevent="unlock"
              >Unlock</BalBtn
            >
          </template>

          <template v-if="activeTab === 'withdraw'">
            <BalRadio name="depositType" value="unlocked" v-model="depositType">
              <template v-slot:label>
                <div class="grid gap-y-2">
                  Withdraw your locked tokens
                </div>
              </template>
            </BalRadio>
            <BalRadio name="depositType" value="locked" v-model="depositType">
              <template v-slot:label>
                <div class="grid gap-y-2">
                  Withdraw your unlocked tokens ({{ formatBn(unlocked) }} HALT)
                </div>
              </template>
            </BalRadio>
            <template v-if="depositType === 'unlocked'">
              <TokenInput
                v-if="halter"
                v-model:amount="amountToWithdraw"
                v-model:isValid="isWithdrawInputValid"
                :customBalance="formatBn(availableForDepositType)"
                :address="halter.address"
                :isValid="true"
                :weight="0"
                :name="halter.address"
                fixedToken
                hideInCurrency
              />
            </template>
            <BalBtn
              color="gradient"
              :disabled="
                depositType === 'unlocked'
                  ? !isWithdrawInputValid
                  : unlocked.isZero()
              "
              @click.prevent="withdraw"
              >Withdraw</BalBtn
            >
          </template>
        </div>
      </BalCard>
    </div>
    <h3 class="px-4 md:px-0">Your unlocked staked tokens</h3>
    <BalCard>
      <BalTable :columns="unlockingColumns" :data="normalizedPurgatory"
    /></BalCard>
  </div>
</template>

<script lang="ts">
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import useStackingRewardsQuery from '@/composables/queries/useStakingRewardsQuery';
import useStakingRewardsContracts from '@/composables/rewards/useStakingRewardsContract';
import useEthers from '@/composables/useEthers';
import useRewardsWeek from '@/composables/useRewardsWeek';
import useSimpleTokenApproval from '@/composables/useSimpleTokenApproval';
import useTokens from '@/composables/useTokens';
import useTransactions from '@/composables/useTransactions';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { formatUnits, parseEther } from '@ethersproject/units';
import { formatDistanceToNow } from 'date-fns';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    TokenInput
  },

  setup() {
    const formatBn = (bn: BigNumber) => formatUnits(bn);

    const { t } = useI18n();
    const { account } = useWeb3();
    const { getToken, balanceFor } = useTokens();

    const {
      data: stakingRewardsData,
      refetch: refetchStakingRewards
    } = useStackingRewardsQuery();
    const [unlockedContract, lockedContract] = useStakingRewardsContracts();
    const { currentWeek } = useRewardsWeek();
    const { addTransaction } = useTransactions();
    const { txListener } = useEthers();
    const halter = computed(() =>
      getToken(configService.network.addresses.stakeToken)
    );
    const tokenBalance = computed(() =>
      parseEther(balanceFor(configService.network.addresses.stakeToken))
    );
    const depositType = ref<'locked' | 'unlocked'>('unlocked');
    const selectedContract = computed(() =>
      depositType.value === 'locked'
        ? lockedContract.value.address
        : unlockedContract.value.address
    );
    const { requiresApproval, approveAllowance } = useSimpleTokenApproval(
      halter,
      account,
      tokenBalance,
      selectedContract
    );

    const staked = computed(() => BigNumber.from(0));

    const normalizedPurgatory = computed(
      () =>
        stakingRewardsData.value?.locked.withdrawPurgatory?.map(
          ([amount, unlockTime]) => {
            return {
              amount,
              unlockTime: new Date(unlockTime.toNumber() * 1000)
            };
          }
        ) ?? []
    );

    const unlocked = computed(() =>
      normalizedPurgatory.value
        .filter(item => item.unlockTime.getTime() < Date.now())
        .reduce(
          (acc: BigNumber, { amount }) => acc.add(amount),
          BigNumber.from(0)
        )
    );

    const available = computed(() => BigNumber.from(0));

    const availableForDepositType = computed(() =>
      depositType.value === 'unlocked'
        ? stakingRewardsData.value?.unlocked.stakedAmount
        : unlocked.value ?? BigNumber.from(0)
    );

    const locked = computed(
      () => stakingRewardsData.value?.locked.stakedAmount ?? BigNumber.from(0)
    );

    const rewards = computed(() => BigNumber.from(0));

    const tabs = [
      { value: 'deposit', label: t('deposit') },
      { value: 'unlock', label: t('unlock') },
      { value: 'withdraw', label: t('withdraw') }
    ];

    const unlockingColumns = computed(() => [
      {
        name: t('amount'),
        id: 'amount',
        accessor: item => `${formatBn(item.amount)} HALT`
      },
      {
        name: t('timeToUnlock'),
        id: 'timeToUnlock',
        accessor: item => formatDistanceToNow(item.unlockTime),
        align: 'right'
      }
    ]);

    const activeTab = ref(tabs[0].value);

    const isDepositInputValid = ref(true);
    const isUnlockInputValid = ref(true);
    const isWithdrawInputValid = ref(true);
    const amountToStake = ref('0');
    const amountToUnlock = ref('0');
    const amountToWithdraw = ref('0');

    watchEffect(() => {
      amountToStake.value = balanceFor(halter.value?.address);
      amountToUnlock.value = formatUnits(locked.value);
    }, {});

    async function deposit() {
      if (requiresApproval.value) {
        await approveAllowance();
        return;
      }

      const contract =
        depositType.value === 'locked' ? lockedContract : unlockedContract;

      const tx = await contract.value.stake(
        parseEther(amountToStake.value),
        currentWeek.value
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'deposit',
        summary: t('transactionSummary.depositStaking'),
        details: {
          contractAddress: contract.value.address
        }
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          refetchStakingRewards.value();
        }
      });
    }

    async function unlock() {
      const tx = await lockedContract.value.startWithdrawLock(
        parseEther(amountToUnlock.value),
        currentWeek.value
      );
      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'unlock',
        summary: t('transactionSummary.unlockingStaking'),
        details: {
          contractAddress: lockedContract.value.address
        }
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          refetchStakingRewards.value();
        }
      });
    }

    async function withdraw() {
      let tx: ContractTransaction;
      if (depositType.value === 'locked') {
        tx = await lockedContract.value.withdrawUnlockedTokens();
      } else {
        const parsedValue = parseEther(amountToWithdraw.value);
        if (parsedValue.isZero()) {
          return;
        }

        tx = await unlockedContract.value.withdraw(
          parsedValue,
          currentWeek.value
        );
      }

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'withdraw',
        summary: t('transactionSummary.withdraw'),
        details: {
          // contractAddress: contract.value.address
        }
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          refetchStakingRewards.value();
        }
      });
    }

    return {
      activeTab,
      tabs,
      unlockingColumns,
      normalizedPurgatory,
      formatBn,
      halter,
      staked,
      available,
      availableForDepositType,
      unlocked,
      locked,
      rewards,
      requiresApproval,
      isDepositInputValid,
      isUnlockInputValid,
      isWithdrawInputValid,
      amountToStake,
      amountToUnlock,
      amountToWithdraw,
      depositType,
      deposit,
      unlock,
      withdraw
    };
  }
});
</script>

<style scoped>
.action-container {
  @apply grid gap-y-4;
}
</style>

function parseEthers(arg0: string): any { throw new Error('Function not
implemented.'); }
