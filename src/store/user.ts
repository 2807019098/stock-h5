import { defineStore } from 'pinia';
import axios from 'axios';
import storage from 'good-storage';
import { FastRegisterLogin, GetRefreshToken } from '@/api/user';
import router from '@/router';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: storage.get('token'),
    tokenExpiry: storage.get('tokenExpiry')
  }),
  getters: {
    getToken: (state): string => state.token,
    isTokenValid: (state): boolean => {
      // 检查 token 是否有效
      return state.token && state.tokenExpiry && Date.now() < state.tokenExpiry;
    }
  },
  actions: {
    async login(payload: Recordable = {}) {
      // 如果 token 有效，直接使用已有的 token，不需要重新登录
      if (this.isTokenValid) {
        this.token = storage.get('token');
        this.tokenExpiry = storage.get('tokenExpiry');
        return;
      }

      const response = await FastRegisterLogin(payload);
      const { message, result } = response.data;
      if (message.messagE_CODE === '1') {
        const expiryTime = Date.now() + result.expires_in * 1000;
        storage.set('tokenExpiry', expiryTime);
        storage.set('token', result.access_token);
        storage.set('refreshToken', result.refresh_token);
        this.token = result.access_token;
        this.tokenExpiry = expiryTime;
      }
    },
    logout() {
      this.clearToken();
      router.push('/login');
    },
    async clearToken() {
      this.token = '';
      this.tokenExpiry = null;
      storage.remove('token');
      storage.remove('tokenExpiry');
      storage.remove('refreshToken');
    },
    async refreshToken() {
      try {
        const refreshToken = storage.get('refreshToken');
        if (!refreshToken) {
          console.warn('No refresh token available');
          return null;
        }

        const payload = {
          businesS_PARAMETERS: {
            refreshToken: refreshToken
          },
          systeM_PARAMETERS: {
            appid: '',
            accesS_TOKEN: '',
            timestamp: '',
            sign: 'zhikaisoft'
          }
        };

        const response = await GetRefreshToken(payload);
        const { message, result } = response.data;

        if (message.messagE_CODE === '1') {
          const expiryTime = Date.now() + result.expires_in * 1000;
          storage.set('tokenExpiry', expiryTime);
          storage.set('token', result.access_token);
          storage.set('refreshToken', result.refresh_token); // 更新refresh token
          this.token = result.access_token;
          this.tokenExpiry = expiryTime;
          console.log('Token refreshed successfully');
          return result.access_token;
        } else {
          console.warn('Token refresh failed:', message.messagE_TEXT);
          this.clearToken();
          return null;
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        this.clearToken();
        return null;
      }
    }
  }
});
