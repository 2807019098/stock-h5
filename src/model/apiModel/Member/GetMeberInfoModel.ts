/**
 * 获取个人中心信息
 */

interface GetMeberInfoRequestModel {}

interface GetMeberInfoResponseModel {
  UserName: string // 用户名
  Mobile: string // 手机号
  OpenId: string // OpenId
  HeaderUrl: string // 用户头像
  Login_Type: string // 登录类型(小程序登录 = 1,微信登录 = 2,手机号登录 = 3)
}

export type { GetMeberInfoRequestModel, GetMeberInfoResponseModel }
