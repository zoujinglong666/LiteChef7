/**
 * 认证相关 API（类型安全版）
 */

import { post, get } from './request'
import type { LoginResponse, UserInfo } from '@/types'

/**
 * 微信登录
 */
export function wxLogin(code: string) {
  return post<LoginResponse>('/auth/login', { code })
}

/**
 * 开发模式登录
 */
export function devLogin() {
  return post<LoginResponse>('/auth/dev-login')
}

/**
 * 刷新 Token
 */
export function refreshToken() {
  return post<LoginResponse>('/auth/refresh')
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return get<UserInfo>('/user/info')
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data: Partial<UserInfo>) {
  return post<UserInfo>('/user/update', data as Record<string, unknown>)
}
