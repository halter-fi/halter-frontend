<template>
  <BalModal show @close="onClose" :title="$t('previewTransactions')">
    <div>
      <div
        class="-mx-4 mb-4 p-4 flex items-center border-b border-t dark:border-gray-800"
        v-if="$slots.default"
      >
        <slot />
      </div>

      <div>
        <div class="mb-3 text-sm">
          Requires {{ transactionList.length }} transactions
        </div>
        <div>
          <div
            v-for="(transaction, transactionIndex) in transactionList"
            :key="transaction.title"
            class="mb-3 card-container"
          >
            <div class="card-step text-green-500">
              <BalIcon
                v-if="transactionIndex < currentTransaction"
                name="check"
                class="text-green-500"
              />
              <span v-else class="text-gray-500 dark:text-gray-400">{{
                transactionIndex + 1
              }}</span>
            </div>
            <div class="ml-3">
              <span>{{ transaction.title }}</span>
            </div>
          </div>
        </div>
      </div>
      <BalBtn
        class="mt-5"
        :label="$t('confirm')"
        :loading="isExecuting"
        :loading-label="$t('confirming')"
        color="gradient"
        block
        @click.prevent="confirm"
      />
    </div>
  </BalModal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

export type Transaction = {
  title: string;
  handler: () => void;
};

export default defineComponent({
  emits: ['close', 'success'],
  props: {
    open: {
      type: Boolean,
      default: false
    },
    transactions: {
      type: Array as PropType<Transaction[]>,
      required: true
    }
  },
  setup(props, { emit }) {
    console.log(props.transactions);
    const currentTransaction = ref(0);
    const isExecuting = ref(false);

    function onClose() {
      emit('close');
    }

    async function confirm() {
      currentTransaction.value = 0;
      isExecuting.value = true;
      console.log('Got into "confirm"');
      try {
        console.log('Got into "confirm"');
        for (const transaction of props.transactions) {
          await transaction.handler();
          currentTransaction.value += 1;
        }
        emit('success');
      } catch (error) {
        console.error('Error during sequence execution', error);
      } finally {
        isExecuting.value = false;
      }
    }

    return {
      onClose,
      transactionList: props.transactions,
      currentTransaction,
      isExecuting,
      confirm
    };
  }
});
</script>
<style scoped>
.card-container {
  @apply p-3 flex items-center border rounded-lg dark:border-gray-800;
}
.card-step {
  @apply w-9 h-9 flex items-center justify-center border rounded-full dark:border-gray-700;
}
</style>
