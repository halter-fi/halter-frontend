<template>
  <div :class="`app-nav-toggle-wrapper gradient-purple-diagonal`">
    <div :class="`app-nav-toggle bg-gray-50 dark:bg-gray-${darkModeBg}`">
      <router-link
        :to="{ name: 'home' }"
        :class="[
          'toggle-link',
          { [activeClasses]: !['trade', 'stake'].includes(currentPage) }
        ]"
        @click="trackGoal(Goals.ClickNavInvest)"
      >
        {{ $t('invest') }}
      </router-link>
      <router-link
        :to="{ name: 'trade' }"
        :class="['toggle-link', { [activeClasses]: currentPage === 'trade' }]"
        @click="trackGoal(Goals.ClickNavTrade)"
      >
        {{ $t('trade') }}
      </router-link>
      <router-link
        :to="{ name: 'stake' }"
        :class="['toggle-link', { [activeClasses]: currentPage === 'stake' }]"
        @click="trackGoal(Goals.ClickNavTrade)"
      >
        {{ $t('stake') }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import useFathom from '@/composables/useFathom';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'AppNavToggle',

  props: {
    darkModeBg: { type: String, default: '800' }
  },

  setup() {
    const route = useRoute();
    const activeClasses = 'gradient-purple-diagonal text-white';
    const currentPage = computed(() => route.name);
    const { trackGoal, Goals } = useFathom();

    return {
      currentPage,
      activeClasses,
      trackGoal,
      Goals
    };
  }
});
</script>

<style scoped>
.app-nav-toggle-wrapper {
  padding: 1px;
  border-radius: 1.5rem;
}

.app-nav-toggle {
  @apply h-10 flex items-center shadow;
  border-radius: 1.25rem;
  font-variation-settings: 'wght' 600;
}

.toggle-link {
  @apply h-full flex items-center  px-6;
  border-radius: 1.25rem;
}
</style>
