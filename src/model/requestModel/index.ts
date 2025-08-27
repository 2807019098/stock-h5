// 公共请求头
interface RequestHeaderType<T> {
  url: string
  param: T
  type?: boolean
}

// 请求参数
type RequestType = Recordable<any>

// 响应参数
interface ResponseType<T> {
  code: number
  msg: string | null
  data?: T
  success: string
}

export type {
  RequestHeaderType,
  RequestType,
  ResponseType
}
