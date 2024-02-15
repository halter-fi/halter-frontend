import axios from 'axios';
import { subgraphRequest } from '@/lib/utils/subgraph';
import { configService } from '../config/config.service';

export type LoginDto = {
  signed: string;
  message: string;
  address: string;
};

class RewardsService {
  private axiosClient = axios.create({
    baseURL: configService.network.rewards.apiURL
  });

  private setToken(token: string) {
    this.axiosClient.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  async getMe() {
    return this.axiosClient.get('/users/me');
  }

  async getAuthMessage(signature: string) {
    return this.axiosClient.post('/auth/message', { signature });
  }

  async login(body: LoginDto) {
    const response = await this.axiosClient.post('/auth/login', {
      signature: btoa(JSON.stringify(body))
    });

    if (response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getRewardsByPhase(phase?: number) {
    return subgraphRequest(`${configService.network.rewards.apiURL}/graphql`, {
      tradingRewards: {
        ...(phase !== undefined
          ? {
              __args: {
                phase: phase
              }
            }
          : {}),
        phase: true,
        percentage: true,
        address: true,
        tradeVolumeUSD: true,
        paidOut: true
      }
    });
  }

  async reset() {
    return this.axiosClient.post('/app/reset');
  }

  async payOutTrading(phase: number) {
    return this.axiosClient.post('/trading/payout', { phase });
  }
}

export const rewardsService = new RewardsService();
