/**
 * 用户认证模块
 * 支持微信静默登录 + 后端 JWT
 */

import { request } from '@/apis/serverApi'

export interface UserInfo {
  id?: number
  openid: string
  nickname?: string
  avatar?: string
  createTime?: string
  isVip?: boolean
  vipExpireTime?: string
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
  image?: string
  coverImage?: string
  emoji?: string
  ingredients?: string | string[] | { name: string; amount: string }[]
  time?: string
  steps?: string[] | { order: number; content: string }[]
  tips?: string
  suitableScene?: string
  mood?: string
}

const USER_KEY = 'user_info'
const TOKEN_KEY = 'token'

/**
 * 微信静默登录
 * 自动获取 code 并调用后端登录
 */
export async function silentLogin(): Promise<UserInfo> {
  try {
    // 1. 检查本地是否已登录
    const localUser = getLocalUser()
    const token = uni.getStorageSync(TOKEN_KEY)
    
    if (localUser && token) {
      console.log('✅ 本地已有登录信息，跳过登录')
      return localUser
    }

    // 2. 判断环境
    // #ifdef MP-WEIXIN
    console.log('🔹 微信小程序环境，执行静默登录...')
    
    // 获取微信 code
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        success: resolve,
        fail: reject
      })
    })
    
    if (!loginRes.code) {
      throw new Error('微信登录失败：无法获取code')
    }
    
    console.log('🔹 获取到微信 code:', loginRes.code)
    
    // 调用后端登录
    const result: any = await request('/auth/login', {
      method: 'POST',
      data: { code: loginRes.code }
    })
    
    if (result?.code === 200 && result.data) {
      const { token, openid, userId, nickname, avatar } = result.data
      
      // 保存 token
      uni.setStorageSync(TOKEN_KEY, token)
      
      // 构建用户信息
      const user: UserInfo = {
        id: userId,
        openid,
        nickname: nickname || '厨友',
        avatar: avatar || '👨‍🍳',
        moodHistory: localUser?.moodHistory || [],
        favorites: localUser?.favorites || []
      }
      
      saveLocalUser(user)
      console.log('✅ 微信静默登录成功:', user)
      
      return user
    }
    
    throw new Error(result?.message || '登录失败')
    
    // #endif
    
    // #ifndef MP-WEIXIN
    // 非微信环境，使用开发模式登录
    console.log('🔹 非微信环境，使用开发模式登录...')
    return await devLogin()
    // #endif
    
  } catch (error: any) {
    console.error('❌ 静默登录失败:', error)
    
    // 降级：创建本地用户
    const fallbackUser = createLocalUser('local_' + Date.now())
    saveLocalUser(fallbackUser)
    console.log('⚠️ 降级到本地用户模式')
    
    return fallbackUser
  }
}

export const login = silentLogin

/**
 * 开发模式登录
 */
export async function devLogin(): Promise<UserInfo> {
  try {
    const result: any = await request('/auth/dev-login', { method: 'POST' })
    
    if (result?.code === 200 && result.data) {
      const { token, openid, userId, nickname, avatar } = result.data
      
      uni.setStorageSync(TOKEN_KEY, token)
      
      const user: UserInfo = {
        id: userId,
        openid,
        nickname: nickname || '厨友',
        avatar: avatar || '👨‍🍳',
        moodHistory: [],
        favorites: []
      }
      
      saveLocalUser(user)
      console.log('✅ 开发模式登录成功:', user)
      
      return user
    }
    
    throw new Error(result?.message || '登录失败')
  } catch (error: any) {
    console.error('❌ 开发模式登录失败:', error)
    
    // 降级
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
 * 创建本地用户（降级用）
 */
function createLocalUser(openid: string): UserInfo {
  return {
    id: Date.now(), // 使用时间戳作为临时 ID
    openid,
    nickname: '厨友',
    avatar: '👨‍🍳',
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
  return getLocalUser()?.favorites.some(f => f.name === name) || false
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
