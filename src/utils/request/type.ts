import type { AxiosRequestConfig } from 'axios';

export interface MyRequestConfig<T = any> extends AxiosRequestConfig {
  url: string;
  method: string;
  headers: Recordable;
  retries?: number;
  requestId?: number;
  authRequired?: boolean;
  data: T;
}

export interface ApiResponse<T> {
  code: number
  msg: string | null
  data?: T
  success: string
}
