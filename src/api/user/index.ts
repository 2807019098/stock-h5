import request from '@/utils/request'

//#region 用户快速登录注册
/**
 * 用户快速登录注册
 */
export function FastRegisterLogin(params: Recordable) {
  return request({
    url: '/api/Member/FastRegisterLogin',
    method: 'POST',
    data: params,
    auth: true
  })
}
//#endregion

//#region 通过刷新令牌换取访问令牌
/**
 * 通过刷新令牌换取访问令牌
 */
export function GetRefreshToken(params: Recordable) {
  return request({
    url: '/api/Member/GetRefreshToken',
    method: 'POST',
    data: params
  })
}
//#endregion

//#region 绑定手机号
/**
 * 绑定手机号
 */
export function BindMobile(params: Recordable) {
  return request({
    url: '/api/Member/BindMobile',
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
    url: '/api/Member/GetMeberInfo',
    method: 'POST',
    data: params
  })
}
//#endregion
