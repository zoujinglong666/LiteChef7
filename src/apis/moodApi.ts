/**
 * 心情菜谱 API
 * 使用 Spring Boot 后端服务
 */

import { request } from './serverApi'

export interface Recipe {
  name: string
  image: string
  description: string
  tags: string[]
  ingredients: string[]
  steps: string[]
  tips?: string
  suitableScene?: string
  cookTime?: string
}

export interface MoodRecommendResponse {
  reason: string
  recipes: Recipe[]
}

/**
 * 根据心情推荐菜谱（调用后端服务）
 */
export async function getRecommendByMood(
  moodName: string,
  cuisine?: string,
  weather?: string
): Promise<MoodRecommendResponse> {
  try {
    const result: any = await request('/mood/recommend', {
      method: 'POST',
      data: {
        mood: moodName,
        weather: weather || '晴',
        cuisine: cuisine || '中式'
      }
    })

    // 兼容后端返回 {code, data, message} 或直接 {reason, recipes}
    const payload = result.data || result

    // 添加 emoji
    const foodEmojis = ['🍳','🥘','🍲','🥗','🍜','🍛','🥟','🍝','🍱','🥩','🍖','🦐','🥚','🥬','🍰']
    const recipes: Recipe[] = (payload.recipes || []).map((r: any, i: number) => ({
      name: r.name || '美味菜谱',
      image: r.image || foodEmojis[i % foodEmojis.length],
      description: r.description || '一道温暖的美食',
      tags: [moodName, 'AI推荐'],
      ingredients: r.ingredients || [],
      steps: r.steps || [],
      tips: r.tips || '',
      suitableScene: r.suitableScene || '',
      cookTime: r.cookTime || ''
    }))

    return {
      reason: payload.reason || `根据你的心情，推荐这几道菜~`,
      recipes
    }
    
  } catch (error: any) {
    console.error('❌ AI推荐失败:', error)
    return getFallbackRecipes(moodName)
  }
}

/**
 * 降级方案：本地推荐
 */
function getFallbackRecipes(moodName: string): MoodRecommendResponse {
  const fallbackData: Record<string, { recipes: Recipe[], reason: string }> = {
    '开心': {
      reason: '心情这么好，来点好吃的庆祝一下吧！🎉',
      recipes: [
        { name: '可乐鸡翅', image: '🍗', description: '甜香四溢，好吃到停不下来', tags: ['开心', '分享'], ingredients: ['鸡翅', '可乐'], steps: ['焯水', '煎金黄', '加可乐炖20分钟', '收汁'] },
        { name: '芝士焗饭', image: '🍛', description: '拉丝的瞬间超治愈', tags: ['开心', '治愈'], ingredients: ['米饭', '芝士', '蔬菜'], steps: ['铺饭', '撒芝士', '烤箱200度15分钟'] },
        { name: '水果拼盘', image: '🍇', description: '新鲜水果，清爽每一天', tags: ['开心', '健康'], ingredients: ['时令水果'], steps: ['切好摆盘'] }
      ]
    },
    '难过': {
      reason: '吃点暖心的食物，让自己开心一点 💛',
      recipes: [
        { name: '番茄鸡蛋面', image: '🍜', description: '酸酸甜甜，暖胃又暖心', tags: ['难过', '治愈'], ingredients: ['面条', '番茄', '鸡蛋'], steps: ['番茄炒出汁', '加水煮开', '下面条', '淋蛋液'] },
        { name: '红枣桂圆汤', image: '🥣', description: '甜蜜温暖，照顾好自己', tags: ['难过', '补气血'], ingredients: ['红枣', '桂圆', '红糖'], steps: ['加水煮20分钟'] }
      ]
    },
    '焦虑': {
      reason: '简单的家常菜，让心情平静下来 🍵',
      recipes: [
        { name: '小米粥', image: '🥣', description: '温润细腻，让焦虑慢慢散去', tags: ['焦虑', '养胃'], ingredients: ['小米', '水'], steps: ['小米加水煮40分钟'] },
        { name: '清炒时蔬', image: '🥬', description: '清脆爽口，简单就是美好', tags: ['焦虑', '清淡'], ingredients: ['当季蔬菜'], steps: ['热油快炒', '调味出锅'] }
      ]
    }
  }

  const data = fallbackData[moodName] || fallbackData['开心']
  return data
}
