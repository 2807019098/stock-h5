import axios, {
  type AxiosInstance,
  type AxiosResponse,
  AxiosError,
  type InternalAxiosRequestConfig
} from 'axios';
import { showDialog } from 'vant';
import { useUserStore } from '@/store/user';
import type { MyRequestConfig, ApiResponse } from '@/utils/request/type';

let isRefreshing = false;
const requestQueue: Recordable[] = [];
let requestFailureCount = 0; // 请求失败次数，用于控制弹窗弹出次数
const MAX_REQUEST_RETRIES = 3; // 最大请求重试次数
const TIMEOUT_RETRY_DELAY = 3000; // 请求重试的延迟时间（毫秒）
const MAX_FAILURE_DIALOGS = 3; // 最大弹窗显示次数

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_HOST,
  timeout: 10000 * 6
});

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const userStore = useUserStore();
  const myConfig = config as MyRequestConfig;
  if (!myConfig.headers) myConfig.headers = {};
  if (!myConfig.authRequired) config.headers['Authorization'] = 'Bearer ' + userStore.getToken;
  myConfig.requestId = Date.now() + Math.random();
  requestQueue.push(config);
  return config;
});

axiosInstance.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    try {
      const { message } = response.data;
      const config = requestQueue.find(
        (item) => item.requestId === (response.config as MyRequestConfig).requestId
      );
      if (config) requestQueue.splice(requestQueue.indexOf(config), 1); // 移除已处理的请求
      if (message.messagE_CODE === '401') {
        const userStore = useUserStore();
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            await userStore.refreshToken();
            response.config.headers['Authorization'] = 'Bearer ' + userStore.getToken;
            return axiosInstance(response.config);
          } finally {
            isRefreshing = false;
          }
        } else {
          return new Promise((resolve) => {
            requestQueue.push(() => resolve(axiosInstance(response.config)));
          });
        }
      } else if (message.messagE_CODE === '100001') {
        const userStore = useUserStore();
        userStore.clearToken();
        if (requestFailureCount < MAX_FAILURE_DIALOGS) {
          requestFailureCount++;
          showDialog({
            title: '股市一筋',
            message: '登录已过期，请重新登录',
            width: '80%',
            confirmButtonText: '前往登录',
            confirmButtonColor: 'var(--color-primary)',
            className: 'dialogClass',
            overlayStyle: {
              height: 'calc(100%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 100000
            }
          }).then(() => {
            const userStore = useUserStore();
            userStore.logout(); // 清除登录状态
          });
        } else {
          // 超过弹窗次数，直接刷新页面
          window.location.reload();
        }
      } else if (message.messagE_CODE === '0') {
        // 处理常规错误，显示错误信息并提供重试按钮
        if (requestFailureCount < MAX_FAILURE_DIALOGS) {
          requestFailureCount++;
          showDialog({
            title: '股市一筋',
            message: message.messagE_TEXT || '系统异常，请稍后再试。',
            width: '80%',
            confirmButtonText: '重试',
            confirmButtonColor: 'var(--color-primary)',
            className: 'dialogClass',
            overlayStyle: {
              height: 'calc(100%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 100000
            }
          }).then(() => {
            // 重试逻辑，重新发起请求
            axiosInstance(response.config);
          });
        } else {
          // 超过重试次数，提示刷新页面
          showDialog({
            title: '股市一筋',
            message: '请求失败次数过多，请稍后再试。',
            width: '80%',
            confirmButtonText: '重试',
            confirmButtonColor: 'var(--color-primary)',
            className: 'dialogClass',
            overlayStyle: {
              height: 'calc(100%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 100000
            }
          }).then(() => {
            window.location.reload();
          });
        }
      }
    } catch (error) { }
    return Promise.resolve(response);
  },

  (error: AxiosError) => {
    const config = requestQueue.find(
      (item) => item.requestId === (error.config as MyRequestConfig).requestId
    );
    if (config) requestQueue.splice(requestQueue.indexOf(config), 1); // 移除已处理的请求
    if (error.response?.status === 401) {
      showDialog({
        title: '股市一筋',
        message: error.message || '未授权访问，请联系管理员。',
        width: '80%',
        confirmButtonText: '重试',
        confirmButtonColor: 'var(--color-primary)',
        className: 'dialogClass',
        overlayStyle: {
          height: 'calc(100%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100000
        }
      }).then(() => {
        window.location.reload();
      });
    } else {
      showErrorDialog(error.message);
    }
    return Promise.reject(error);
  }
);

function showErrorDialog(message?: string, config?: InternalAxiosRequestConfig) {
  if (navigator.onLine) {
    if (config && ((config as MyRequestConfig).retries || 0) < MAX_REQUEST_RETRIES) {
      // 延迟一定时间后，重新尝试请求
      setTimeout(() => {
        (config as MyRequestConfig).retries = ((config as MyRequestConfig).retries || 0) + 1;
        axiosInstance(config);
      }, TIMEOUT_RETRY_DELAY);
    } else {
      // 检查错误代码决定是否刷新或重新登录
      if (message?.includes('Invalid token')) {
        // 刷新令牌过期，提示重新登录
        showDialog({
          title: '股市一筋',
          message: '您的登录已过期，请重新登录。',
          width: '80%',
          confirmButtonText: '重新登录',
          confirmButtonColor: 'var(--color-primary)',
          className: 'dialogClass',
          overlayStyle: {
            height: 'calc(100%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100000
          }
        }).then(() => {
          const userStore = useUserStore();
          userStore.logout();
        });
      } else {
        // 网络超时或其他原因，提示刷新页面
        showDialog({
          title: '股市一筋',
          message: message || '请求超时，请检查网络连接。',
          width: '80%',
          confirmButtonText: '重试',
          confirmButtonColor: 'var(--color-primary)',
          className: 'dialogClass',
          overlayStyle: {
            height: 'calc(100%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100000
          }
        }).then(() => {
          window.location.reload();
        });
      }
    }
  } else {
    window.location.reload();
  }
}

export default axiosInstance;
