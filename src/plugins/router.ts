import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import HomePage from '@/pages/index.vue';
import PoolPage from '@/pages/pool/_id.vue';
import AdminRewardsPage from '@/pages/admin/admin-rewards.vue';

import LiquidityMiningPage from '@/pages/liquidity-mining.vue';
import ManageRewards from '@/pages/manage-rewards.vue';
import TradePage from '@/pages/trade.vue';
import StakePage from '@/pages/stake.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/trade/:assetIn?/:assetOut?',
    name: 'trade',
    component: TradePage
  },
  {
    path: '/swap/:assetIn?/:assetOut?',
    redirect: to => {
      return `/trade${to.path.split('/swap')[1]}`;
    }
  },
  {
    path: '/pool/:id',
    name: 'pool',
    component: PoolPage
  },
  {
    path: '/liquidity-mining',
    name: 'liquidity-mining',
    component: LiquidityMiningPage
  },
  {
    path: '/stake',
    name: 'stake',
    component: StakePage
  },
  {
    path: '/manage-rewards',
    name: 'manage-rewards',
    component: ManageRewards
  },
  {
    path: '/admin/rewards',
    name: 'admin-rewards',
    component: AdminRewardsPage
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
