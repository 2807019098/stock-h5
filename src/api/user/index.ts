import request from '@/utils/request'
import type { MyRequestConfig } from '@/utils/request/type'
import type { FastRegisterLoginRequestModel } from "@/model/apiModel/Member/FastRegisterLoginModel"

//#region 用户快速登录注册
/**
 * 用户快速登录注册
 */
export function FastRegisterLogin(params: FastRegisterLoginRequestModel) {
  return request({
    url: '/api/member/fastregisterlogin',
    method: 'POST',
    data: params,
    authRequired: true
  } as MyRequestConfig)
}
//#endregion

//#region 通过刷新令牌换取访问令牌
/**
 * 通过刷新令牌换取访问令牌
 */
export function GetRefreshToken(params: Recordable) {
  return request({
    url: '/api/member/refreshtoken',
    method: 'POST',
    data: params,
    authRequired: true
  } as MyRequestConfig)
}
//#endregion

//#region 绑定手机号
/**
 * 绑定手机号
 */
export function BindMobile(params: Recordable) {
  return request({
    url: '/api/member/bindmobile',
    method: 'POST',
    data: params
  })
}
//#endregion

//#region 获取个人中心信息
/**
 * 获取个人中心信息
 */
export function GetMeberInfo(params: Recordable) {
  return request({
    url: '/api/member/getmberinfo',
    method: 'POST',
    data: params
  })
}
//#endregion
