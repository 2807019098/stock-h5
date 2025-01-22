/**
 * 绑定手机号
 */

interface BindMobileRequestModel {
  userId: string // 用户ID
  mobile: string // 手机号
  openid: string // 微信OPENID
  loginType: number // 登录类型(小程序登录 = 1,微信登录 = 2,手机号 登录 = 3)
}

type BindMobileResponseModel = boolean

export type { BindMobileRequestModel, BindMobileResponseModel }
