/**
 * 用户快速登录注册
 */

import type { GetRefreshTokenResponseModel } from './GetRefreshTokenModel'

interface FastRegisterLoginRequestModel {
  OPENID: string // 微信OPENID
  LoginType: string // 登录类型(小程序登录 = 1,微信登录 = 2,手机号登录 = 3)
  Mobile: string // 手机号
  HeaderUrl: string // 用户头像
  UserName: string // 用户名称
}

interface FastRegisterLoginResponseModel extends GetRefreshTokenResponseModel {
  userId: string // 用户ID
}

export type { FastRegisterLoginRequestModel, FastRegisterLoginResponseModel }
