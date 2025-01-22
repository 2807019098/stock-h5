/**
 * 通过刷新令牌换取访问令牌
 */

interface GetRefreshTokenRequestModel {
  RefreshToken: string // 刷新令牌
}

interface GetRefreshTokenResponseModel {
  access_token: string // 访问令牌
  refresh_token: string // 刷新令牌
  expires_in: number // 过期时间(单位秒)
  token_type: string // 令牌类型
}

export type { GetRefreshTokenRequestModel, GetRefreshTokenResponseModel }
