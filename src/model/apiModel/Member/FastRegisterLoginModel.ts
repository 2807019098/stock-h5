/**
 * 用户快速登录注册
 */

import type { LoginType } from '@/enum';
import type { GetRefreshTokenResponseModel } from './GetRefreshTokenModel'


interface WeChatLogin {
  loginType: LoginType.微信登录;
  wechatOpenId: string;
  mobile?: never;
  smsCode?: never;
  userName?: never;
  passWord?: never;
}

interface UserNameLogin {
  loginType: LoginType.用户名登录;
  userName: string;
  passWord: string;
  mobile?: never;
  smsCode?: never;
  wechatOpenId?: never;
}

interface MobileLogin {
  loginType: LoginType.手机号登录;
  mobile: string;
  smsCode: string;
  userName?: never;
  passWord?: never;
  wechatOpenId?: never;
}

type FastRegisterLoginRequestModel = WeChatLogin | UserNameLogin | MobileLogin;

interface FastRegisterLoginResponseModel extends GetRefreshTokenResponseModel {
  userId: string;
}

export type { FastRegisterLoginRequestModel, FastRegisterLoginResponseModel }
