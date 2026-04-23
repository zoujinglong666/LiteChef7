/**
 * 收藏、饮食偏好、反馈 API
 * 调用 Spring Boot 后端服务
 */

import { request } from './serverApi'

// ==================== 收藏 ====================

export interface FavoriteItem {
  id: number
  recipeName: string
  coverImage: string
  sourceType: string
  recipeContent?: any
  createTime: string
}

/** 获取收藏列表 */
export async function getFavoriteList(userId: number) {
  const res: any = await request(`/favorite/list?userId=${userId}`)
  return (res.data || []) as FavoriteItem[]
}

/** 添加收藏 */
export async function addFavorite(userId: number, data: {
  recipeName: string
  recipeContent?: any
  coverImage?: string
  sourceType?: string
}) {
  const res: any = await request('/favorite/add', {
    method: 'POST',
    data: { ...data },
    header: { 'Content-Type': 'application/json' }
  }, userId)
  return res.data || res
}

/** 取消收藏 */
export async function removeFavorite(userId: number, favoriteId: number) {
  return request(`/favorite/${favoriteId}?userId=${userId}`, { method: 'DELETE' })
}

/** 检查是否已收藏 */
export async function checkFavorite(userId: number, recipeName: string): Promise<boolean> {
  try {
    const res: any = await request(`/favorite/check?userId=${userId}&recipeName=${encodeURIComponent(recipeName)}`)
    return res.data?.favorited === true
  } catch {
    return false
  }
}

// ==================== 饮食偏好 ====================

export interface DietProfile {
  userId: number
  dislikeIngredients: string   // 忌口食材，逗号分隔
  diseaseRestrictions: string  // 疾病限制，逗号分隔
  flavorPreference: string      // 口味偏好
  cuisinePreference: string     // 菜系偏好
  cookingSkill: string          // 烹饪水平
}

/** 获取饮食偏好 */
export async function getDietProfile(userId: number): Promise<DietProfile> {
  const res: any = await request(`/user/profile?userId=${userId}`)
  return res.data || {
    userId,
    dislikeIngredients: '',
    diseaseRestrictions: '',
    flavorPreference: '',
    cuisinePreference: '',
    cookingSkill: ''
  }
}

/** 保存饮食偏好 */
export async function saveDietProfile(userId: number, data: Partial<DietProfile>) {
  const res: any = await request('/user/profile', {
    method: 'POST',
    data,
    header: { 'Content-Type': 'application/json' }
  }, userId)
  return res.data || res
}

// ==================== 反馈 ====================

export interface FeedbackItem {
  id: number
  type: 'bug' | 'feature' | 'complaint' | 'praise'
  content: string
  contact?: string
  status: 'pending' | 'done'
  createTime: string
}

/** 提交反馈（支持匿名） */
export async function submitFeedback(data: {
  userId?: number
  type: string
  content: string
  contact?: string
}) {
  const res: any = await request('/feedback/submit', {
    method: 'POST',
    data,
    header: { 'Content-Type': 'application/json' }
  })
  return res.data || res
}

/** 获取我的反馈列表 */
export async function getMyFeedbackList(userId: number) {
  const res: any = await request(`/feedback/list?userId=${userId}`)
  return (res.data || []) as FeedbackItem[]
}
