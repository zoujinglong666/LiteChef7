/**
 * 用户认证模块
 * 使用 Spring Boot 后端
 */

import { wxLogin, devLogin } from '@/apis/serverApi'

export interface UserInfo {
  openid: string
  nickname?: string
  avatar?: string
  createTime: string
  moodHistory: MoodRecord[]
  favorites: FavoriteRecipe[]
}

export interface MoodRecord {
  id: string
  mood: string
  moodIcon: string
  reason: string
  recipes: FavoriteRecipe[]
  time: string
}

export interface FavoriteRecipe {
  name: string
  image: string
  ingredients?: string | string[]
  time?: string
  steps?: string[]
  tips?: string
  suitableScene?: string
  mood?: string
}

const USER_KEY = 'user_info'
const TOKEN_KEY = 'token'

/**
 * 用户登录
 */
export async function login(): Promise<UserInfo> {
  try {
    // 开发模式使用模拟登录
    if (import.meta.env.DE_MODE) {
      const result: any = await devLogin()
      if (result.success) {
        uni.setStorageSync(TOKEN_KEY, result.token)
        const user = createLocalUser(result.openid)
        saveLocalUser(user)
        return user
      }
    }

    // 生产模式使用微信登录
    const loginRes: any = await new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })

    if (!loginRes.code) {
      throw new Error('微信登录失败')
    }

    const result: any = await wxLogin(loginRes.code)
    
    if (result.success) {
      uni.setStorageSync(TOKEN_KEY, result.token)
      const user = createLocalUser(result.openid)
      saveLocalUser(user)
      return user
    }

    throw new Error(result.message || '登录失败')
    
  } catch (error: any) {
    console.error('❌ 登录失败:', error)
    // 降级到本地模式
    const user = createLocalUser('local_' + Date.now())
    saveLocalUser(user)
    return user
  }
}

/**
 * 获取本地用户
 */
export function getLocalUser(): UserInfo | null {
  try {
    const data = uni.getStorageSync(USER_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/**
 * 保存用户到本地
 */
export function saveLocalUser(user: UserInfo): void {
  uni.setStorageSync(USER_KEY, JSON.stringify(user))
}

/**
 * 创建本地用户
 */
function createLocalUser(openid: string): UserInfo {
  return {
    openid,
    createTime: new Date().toLocaleString('zh-CN'),
    moodHistory: [],
    favorites: []
  }
}

/**
 * 更新用户信息
 */
export function updateUser(partial: Partial<UserInfo>): UserInfo {
  const user = getLocalUser()
  if (!user) throw new Error('用户未登录')
  const updated = { ...user, ...partial }
  saveLocalUser(updated)
  return updated
}

/**
 * 保存心情记录
 */
export function addMoodRecord(record: MoodRecord): void {
  const user = getLocalUser()
  if (!user) return
  user.moodHistory.unshift(record)
  if (user.moodHistory.length > 50) user.moodHistory.pop()
  saveLocalUser(user)
}

/**
 * 添加收藏
 */
export function addFavorite(recipe: FavoriteRecipe): void {
  const user = getLocalUser()
  if (!user) return
  const exists = user.favorites.some(f => f.name === recipe.name)
  if (!exists) {
    user.favorites.unshift({ ...recipe, time: new Date().toLocaleString('zh-CN') })
  }
  saveLocalUser(user)
}

/**
 * 移除收藏
 */
export function removeFavorite(name: string): void {
  const user = getLocalUser()
  if (!user) return
  user.favorites = user.favorites.filter(f => f.name !== name)
  saveLocalUser(user)
}

/**
 * 是否已收藏
 */
export function isFavorited(name: string): boolean {
  const user = getLocalUser()
  return user?.favorites.some(f => f.name === name) || false
}

/**
 * 获取所有收藏
 */
export function getFavorites(): FavoriteRecipe[] {
  return getLocalUser()?.favorites || []
}

/**
 * 获取心情历史
 */
export function getMoodHistory(): MoodRecord[] {
  return getLocalUser()?.moodHistory || []
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getLocalUser() && !!uni.getStorageSync(TOKEN_KEY)
}

/**
 * 登出
 */
export function logout(): void {
  uni.removeStorageSync(USER_KEY)
  uni.removeStorageSync(TOKEN_KEY)
}
