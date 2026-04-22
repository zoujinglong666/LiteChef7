/**
 * 菜谱相关类型定义
 */

/** 菜谱基础信息 */
export interface Recipe {
  id: number
  name: string
  description?: string
  cuisine?: string
  difficulty?: string
  cookTime?: string
  coverImage?: string
  emoji?: string
  image?: string
  likes: number
  favorites: number
  authorName?: string
  authorAvatar?: string
  authorId?: number | string
  createTime?: string
  ingredients?: Ingredient[] | string[]
  steps?: Step[] | string[]
  tips?: string
  suitableScene?: string
  mood?: string
  tags?: string[]
  weather?: string
}

/** 食材 */
export interface Ingredient {
  name: string
  amount: string
}

/** 烹饪步骤 */
export interface Step {
  order: number
  content: string
}

/** 菜谱列表响应 */
export interface RecipeListResponse {
  total: number
  size: number
  page: number
  list: Recipe[]
  hasMore: boolean
}

/** 精选推荐菜谱 */
export interface FeaturedRecipe extends Recipe {
  isFeatured: boolean
  featuredAt?: string
}

/** 筛选条件 */
export type FilterType = 'all' | '中式' | '日式' | '西式' | '韩式'

/** 菜谱卡片展示数据 */
export interface RecipeCardData {
  id: number
  name: string
  cover: string
  cuisine?: string
  likes: number
  favorites: number
  authorName: string
  authorAvatar: string
}
