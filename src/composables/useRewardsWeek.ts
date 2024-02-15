import { computed } from 'vue-demi';

export default function useRewardsWeek() {
  const currentWeek = computed(() => 2);

  return { currentWeek };
}
