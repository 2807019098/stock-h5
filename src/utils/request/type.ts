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

export interface ApiResponse {
  message: {
    messagE_CODE: string;
    messagE_TEXT: string;
    exceptioN_TEXT: string;
    serveR_TIME: string;
  };
  result: any;
}
