/**
 * 心情菜谱 API
 * 使用 Spring Boot 后端服务
 */

import { request } from './serverApi'
import { getLocalUser } from '@/utils/auth'
import { getDietProfile } from './dietApi'

export interface Recipe {
  name: string
  description?: string
  ingredients?: string[]
  steps?: string[]
  tips?: string[]
  suitableScene?: string
  image?: string
  emoji?: string
}

export interface MoodRecommendResponse {
  reason: string
  recipes: Recipe[]
}

const FALLBACK_RECIPES: Record<string, MoodRecommendResponse> = {
  开心: { reason: '开心就要吃点好的！', recipes: [
    { name: '可乐鸡翅', description: '甜香诱人，外焦里嫩', ingredients: ['鸡翅10只', '可乐1罐', '生抽2勺'], steps: ['鸡翅焯水去腥', '热油煎至两面金黄', '加入可乐和生抽焖煮20分钟'], tips: '可乐要用普通可乐，无糖的也可以。' },
    { name: '糖醋里脊', description: '酸甜开胃，外酥里嫩', ingredients: ['里脊肉300g', '番茄酱3勺', '白醋1勺'], steps: ['里脊切条腌制', '裹淀粉炸至金黄', '调糖醋汁翻炒均匀'], tips: '复炸一次更酥脆。' },
    { name: '蒜蓉蒸虾', description: '鲜香浓郁，虾肉Q弹', ingredients: ['大虾500g', '蒜末30g', '粉丝1把'], steps: ['虾开背去线', '粉丝铺底摆虾', '淋蒜蓉酱蒸5分钟'], tips: '蒜末要炒香再蒸。' },
  ]},
  default: { reason: '好好吃饭，天天向上', recipes: [
    { name: '番茄炒蛋', description: '家常美味，老少皆宜', ingredients: ['鸡蛋3个', '番茄2个'], steps: ['鸡蛋打散炒熟盛出', '番茄炒出汁', '加鸡蛋翻炒'], tips: '番茄切小块更容易出汁。' },
    { name: '蒜蓉西兰花', description: '清爽健康，翠绿可口', ingredients: ['西兰花1颗', '蒜末10g'], steps: ['西兰花焯水1分钟', '热油爆香蒜末', '西兰花翻炒加盐'], tips: '焯水时加少许油和盐保持翠绿。' },
    { name: '紫菜蛋花汤', description: '简单快手，汤鲜味美', ingredients: ['紫菜5g', '鸡蛋1个'], steps: ['水烧开', '紫菜煮1分钟', '淋入蛋液'], tips: '蛋液淋入时搅散成蛋花。' },
  ]},
}

function getFallbackRecipes(moodName: string): MoodRecommendResponse {
  const mood = moodName.replace(/["'"]/g, '')
  return FALLBACK_RECIPES[mood] || FALLBACK_RECIPES[mood] || FALLBACK_RECIPES['default']
}

export async function getRecommendByMood(
  moodName: string,
  cuisine?: string,
  weather?: string,
  forceDietProfile?: any
): Promise<MoodRecommendResponse> {
  try {
    let dietProfile: any = null

    if (forceDietProfile) {
      dietProfile = forceDietProfile
    } else {
      const user = getLocalUser()
      if (user?.id) {
        try {
          dietProfile = await getDietProfile((user.id as any) || 1)
        } catch {}
      }
    }

    const result: any = await request('/mood/recommend', {
      method: 'POST',
      data: {
        mood: moodName,
        weather: weather || '晴',
        cuisine: cuisine || '中式',
        userId: (getLocalUser()?.id as any) || undefined,
        dietProfile: dietProfile || undefined
      }
    })

    if (result?.code === 200 && result.data) {
      return result.data
    }
    return getFallbackRecipes(moodName)
  } catch (error: any) {
    console.error('❌ AI推荐失败:', error)
    return getFallbackRecipes(moodName)
  }
}

/**
 * 为单道菜生成AI图片
 */
export async function generateRecipeImage(recipeName: string): Promise<string | null> {
  try {
    const result: any = await request('/mood/recipe-image', {
      method: 'POST',
      data: { name: recipeName }
    })
    const payload = result.data || result
    return payload?.image || null
  } catch (e) {
    console.error('❌ 图片生成失败:', recipeName, e)
    return null
  }
}
