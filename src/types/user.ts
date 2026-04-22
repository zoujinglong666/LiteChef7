/**
 * 用户相关类型定义
 */

/** 用户信息 */
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

/** 心情记录 */
export interface MoodRecord {
  id: string
  mood: string
  moodIcon: string
  reason: string
  recipes: FavoriteRecipe[]
  time: string
}

/** 收藏菜谱 */
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

/** 登录响应 */
export interface LoginResponse {
  token: string
  openid: string
  userId?: number
  nickname?: string
  avatar?: string
}

/** 用户统计 */
export interface UserStats {
  moodCount: number
  favCount: number
  streak: number
}
