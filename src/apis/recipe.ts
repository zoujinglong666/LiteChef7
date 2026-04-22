/**
 * 菜谱相关 API（类型安全版）
 */

import { get, post } from './request'
import type { 
  Recipe, 
  RecipeListResponse, 
  FeaturedRecipe,
  FilterType 
} from '@/types'

/**
 * 获取菜谱列表
 */
export function getRecipeList(filter: FilterType = 'all', page = 1, size = 10) {
  const params: Record<string, string | number> = { page, size }
  if (filter !== 'all') {
    params.filter = filter
  }
  return get<RecipeListResponse>('/recipe/list', { params })
}

/**
 * 搜索菜谱
 */
export function searchRecipes(keyword: string) {
  return get<Recipe[]>('/recipe/search', {
    params: { keyword: encodeURIComponent(keyword) }
  })
}

/**
 * 获取精选推荐
 */
export function getFeaturedRecipes() {
  return get<FeaturedRecipe[]>('/recipe/featured')
}

/**
 * 获取菜谱详情
 */
export function getRecipeDetail(id: number) {
  return get<Recipe>(`/recipe/detail/${id}`)
}

/**
 * 创建菜谱
 */
export function createRecipe(data: Omit<Recipe, 'id' | 'createTime'>) {
  return post<Recipe>('/recipe/create', data as Record<string, unknown>)
}

/**
 * 点赞菜谱
 */
export function likeRecipe(id: number) {
  return post<void>(`/recipe/like/${id}`)
}

/**
 * 收藏菜谱
 */
export function favoriteRecipe(id: number) {
  return post<void>(`/recipe/favorite/${id}`)
}
