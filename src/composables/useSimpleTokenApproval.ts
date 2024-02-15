import { ERC20__factory } from '@/lib/typechain';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';
import { BigNumber } from '@ethersproject/bignumber';
import { computed, reactive, Ref, isRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMutation, useQuery } from 'vue-query';
import useEthers from './useEthers';
import useTransactions from './useTransactions';

const refValue = <T>(possibleRef: Ref<T> | T) =>
  isRef(possibleRef) ? possibleRef.value : possibleRef;

export default function useSimpleTokenApproval(
  token: Ref<TokenInfo> | TokenInfo,
  owner: Ref<string> | string,
  amount: Ref<BigNumber> | BigNumber,
  spender: Ref<string> | string
) {
  const { getProvider } = useWeb3();
  const { t } = useI18n();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();

  isRef;

  const erc20contract = computed(() =>
    refValue(token)
      ? ERC20__factory.connect(
          refValue(token).address,
          getProvider().getSigner()
        )
      : undefined
  );

  const QUERY_KEY = reactive(['allowance', token, amount, spender]);

  const { data: allowanceData, refetch } = useQuery(QUERY_KEY, async () => {
    if (!erc20contract.value) {
      return;
    }
    const allowance = await erc20contract.value.allowance(
      refValue(owner),
      refValue(spender)
    );

    return allowance;
  });

  const approveMutation = useMutation(async () => {
    if (!erc20contract.value) {
      return;
    }
    const tx = await erc20contract.value?.approve(
      refValue(spender),
      refValue(amount)
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: t('transactionSummary.approveForInvesting', [
        refValue(token).symbol
      ]),
      details: {
        contractAddress: refValue(token).address,
        spender: refValue(spender)
      }
    });

    txListener(tx, {
      onTxConfirmed: async () => {
        refetch.value();
      }
    });
  });

  const requiresApproval = computed(() => {
    return allowanceData.value?.lt(refValue(amount));
  });

  async function approveAllowance() {
    await approveMutation.mutateAsync();
  }

  return { requiresApproval, approveAllowance };
}
