import type { AxiosRequestConfig } from 'axios'

export interface CustomRequestConfig extends AxiosRequestConfig {
  requestOptions?: RequestOptions
}

export type ErrorMessageMode = 'none' | 'message' | undefined

export interface RequestOptions {
  /** 是否需要对返回数据进行处理 */
  isTransformResponse?: boolean
  /** 是否直接返回原生响应 */
  isReturnNativeResponse?: boolean
  /** 消息提示类型 */
  errorMessageMode?: ErrorMessageMode
  /** 网络消息提示类型 */
  networkErrorMessageMode?: ErrorMessageMode
}

export enum ContentTypeEnum {
  // json
  JSON = 'application/json',
  // form-urlencoded qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded',
  // form-data  upload
  FORM_DATA = 'multipart/form-data'
}

export interface HttpResult<T = any> {
  status: number
  message?: string
  response?: T
}

export interface ServiceResult<T = any> {
  code: number
  msg: string
  data?: T
}
