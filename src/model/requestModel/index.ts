// 公共请求头
interface RequestHeaderType<T> {
  url: string
  param: T
  type?: boolean
}

// 请求参数
interface RequestBodyType<T> {
  businesS_PARAMETERS: T
  systeM_PARAMETERS: SystemParametersDtoType
}

// 系统参数
interface SystemParametersDtoType {
  appid: string
  timestamp: string
  sign: string
}

// 系统信息
interface ResponseRootType<T> {
  message: MessageDtoType
  result: T
}

// 响应参数
interface MessageDtoType {
  messagE_CODE: string
  messagE_TEXT: string | null
  exceptioN_TEXT?: string | null
  serveR_TIME: string
}

export type {
  RequestHeaderType,
  RequestBodyType,
  ResponseRootType,
  SystemParametersDtoType,
  MessageDtoType
}
