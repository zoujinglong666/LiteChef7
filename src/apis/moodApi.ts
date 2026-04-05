/**
 * 心情菜谱 API - 智谱 AI 推荐
 * 支持：心情 + 天气 + 菜式风格
 */

export interface Recipe {
  name: string
  image: string
  description: string
  tags: string[]
  url?: string
  ingredients?: string[]
  steps?: string[]
  tips?: string
  suitableScene?: string
  cuisine?: string
  mood?: string
  weather?: string
}

export interface MoodRecommendResponse {
  reason: string
  recipes: Recipe[]
}

export type CuisineType = '中式' | '日式' | '西式' | '韩式'

export interface RecommendParams {
  moodName: string
  moodKeyword: string
  weather?: string       // 如 "晴天" "下雨" "寒冷" "炎热"
  temperature?: number   // 气温（摄氏度）
  cuisine?: CuisineType  // 菜式风格，默认中式
}

/**
 * 根据心情+天气+菜式调用智谱AI推荐菜谱
 */
export async function getRecommendByMood(
  moodName: string,
  moodKeyword: string,
  weather?: string,
  temperature?: number,
  cuisine: CuisineType = '中式'
): Promise<MoodRecommendResponse> {
  const apiKey = (import.meta.env.VITE_ZHIPU_API_KEY as string) || ''

  if (!apiKey) {
    throw new Error('AI 服务未配置')
  }

  // 构建天气描述
  let weatherDesc = ''
  if (weather) {
    weatherDesc = `当前天气：${weather}`
    if (temperature !== undefined) weatherDesc += `，气温约 ${temperature}°C`
    weatherDesc += '。'
  }

  // 菜式风格说明
  const cuisineGuide: Record<CuisineType, string> = {
    '中式': '中式家常菜（炒菜、炖菜、汤品等，使用酱油、醋、花椒等中式调料）',
    '日式': '日式料理（寿司、拉面、定食、煮物等，使用味噌、酱油、味醂等日式调料）',
    '西式': '西式料理（意面、沙拉、牛排、烤箱菜等，使用橄榄油、黑胡椒、芝士等西式调料）',
    '韩式': '韩式料理（石锅拌饭、泡菜锅、烤肉、炒年糕等，使用辣酱、芝麻油、大酱等韩式调料）'
  }

  const prompt = `你是一位精通多国料理的米其林级厨师，同时也是一位温暖的心理疗愈师。

用户当前状态：
- 心情：${moodName}（${moodKeyword}）
- ${weatherDesc || '天气未知。'}
- 希望的菜式风格：${cuisineGuide[cuisine]}

请根据以上信息，为用户精心设计3道专属菜谱。要求：
1. 菜式风格必须严格符合"${cuisine}"风格
2. 天气寒冷/下雨时推荐暖身热食；天气炎热时推荐清爽凉菜或冷饮
3. 每道菜的步骤要详细具体（如"中火热锅，倒入2勺橄榄油，油温六成热时下入蒜末爆香30秒"）
4. 食材要列出具体用量

返回严格合法的JSON（不要任何其他文字，不要markdown代码块）：
{
  "reason": "结合心情和天气的温暖推荐理由，像朋友说话，40字以内",
  "recipes": [
    {
      "name": "菜名（有创意，符合${cuisine}风格）",
      "description": "一句打动人的描述，15字以内",
      "ingredients": ["食材1 用量", "食材2 用量", "食材3 用量"],
      "steps": ["步骤1：具体操作细节", "步骤2：具体操作细节", "步骤3：具体操作细节", "步骤4：具体操作细节"],
      "tips": "关键烹饪技巧或注意事项",
      "suitableScene": "结合心情和天气说明为什么推荐这道菜"
    }
  ]
}`

  console.log('🚀 调用智谱AI | 心情:', moodName, '| 天气:', weather || '未知', '| 菜式:', cuisine)

  try {
    const response: any = await new Promise((resolve, reject) => {
      uni.request({
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: 'glm-4-flash',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.85
        },
        timeout: 30000,
        success: (res: any) => resolve(res),
        fail: (err: any) => reject(new Error(err.errMsg || '网络请求失败'))
      })
    })

    const data = response.data
    if (!data || data.error) throw new Error(data?.error?.message || 'AI 服务异常')
    if (!data.choices?.[0]?.message?.content) throw new Error('AI 返回格式异常')

    let content = data.choices[0].message.content.trim()
    console.log('💬 AI 回复:', content.substring(0, 200))

    // 去除 markdown 代码块
    content = content.replace(/^```json?\s*/m, '').replace(/```\s*$/m, '').trim()

    const result = JSON.parse(content)

    const foodEmojis: Record<CuisineType, string[]> = {
      '中式': ['🍳','🥘','🍲','🥗','🍜','🍛','🥟','🍝','🍱','🥩','🍖','🦐','🥚','🥬','🍚'],
      '日式': ['🍣','🍱','🍜','🍙','🍘','🥢','🍤','🥗','🍛','🍚','🫕','🥩','🍡','🍢','🥮'],
      '西式': ['🍝','🥗','🥩','🍕','🥐','🧀','🍳','🥘','🫕','🥦','🍷','🥖','🫙','🧁','🍰'],
      '韩式': ['🥘','🍲','🥩','🌶️','🥗','🍜','🥚','🧅','🫕','🍱','🥬','🍖','🥢','🍚','🌿']
    }
    const emojis = foodEmojis[cuisine]

    const recipes: Recipe[] = result.recipes.map((r: any) => {
      const seed = hashCode(r.name || '')
      return {
        name: r.name || '美味菜谱',
        image: emojis[seed % emojis.length],
        description: r.description || '一道专属于你的美味',
        tags: [moodName, cuisine, 'AI推荐'],
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
        steps: Array.isArray(r.steps) ? r.steps : [],
        tips: r.tips || '',
        suitableScene: r.suitableScene || '',
        cuisine,
        mood: moodName,
        weather: weather || ''
      }
    })

    console.log('✅ AI 推荐成功，共', recipes.length, '道菜')
    return { reason: result.reason || `根据你的心情，我推荐这几道菜~`, recipes }

  } catch (error: any) {
    console.error('❌ 智谱AI调用失败:', error.message)
    return getLocalFallback(moodName, cuisine, weather)
  }
}

/**
 * 本地降级推荐（AI 不可用时）
 */
function getLocalFallback(moodName: string, cuisine: CuisineType, weather?: string): MoodRecommendResponse {
  const isHot = weather?.includes('热') || weather?.includes('晴')
  const isCold = weather?.includes('冷') || weather?.includes('雨') || weather?.includes('雪')

  const fallbacks: Record<string, any> = {
    '开心': {
      reason: `心情这么好，来点${cuisine}美食庆祝一下！🎉`,
      recipes: [
        { name: cuisine === '日式' ? '亲子丼' : cuisine === '西式' ? '奶油意面' : cuisine === '韩式' ? '石锅拌饭' : '可乐鸡翅', image: '🍗', description: '甜香四溢，好吃到停不下来', tags: ['开心', cuisine], ingredients: ['主料', '调料'], steps: ['准备食材', '按步骤烹饪', '装盘享用'], tips: '用心做，用心吃', suitableScene: '开心时最适合犒劳自己', cuisine, mood: moodName },
        { name: cuisine === '日式' ? '味噌汤' : cuisine === '西式' ? '凯撒沙拉' : cuisine === '韩式' ? '泡菜炒饭' : '番茄炒蛋', image: '🍳', description: '经典家常，百吃不厌', tags: ['开心', cuisine], ingredients: ['主料', '调料'], steps: ['准备食材', '按步骤烹饪', '装盘享用'], tips: '火候是关键', suitableScene: '分享快乐的好选择', cuisine, mood: moodName },
        { name: cuisine === '日式' ? '抹茶蛋糕' : cuisine === '西式' ? '提拉米苏' : cuisine === '韩式' ? '红豆冰' : '糖醋里脊', image: '🍰', description: '甜蜜收尾，完美一餐', tags: ['开心', cuisine], ingredients: ['主料', '调料'], steps: ['准备食材', '按步骤烹饪', '装盘享用'], tips: '甜品要用心', suitableScene: '庆祝时的甜蜜选择', cuisine, mood: moodName }
      ]
    },
    '难过': {
      reason: `${isCold ? '天气冷，' : ''}吃点暖心的${cuisine}料理，让自己好受一点 💛`,
      recipes: [
        { name: cuisine === '日式' ? '豚骨拉面' : cuisine === '西式' ? '奶油南瓜汤' : cuisine === '韩式' ? '部队锅' : '番茄鸡蛋面', image: '🍜', description: '暖胃又暖心', tags: ['难过', cuisine], ingredients: ['主料', '调料'], steps: ['准备食材', '按步骤烹饪', '装盘享用'], tips: '慢慢吃，好好感受', suitableScene: '难过时最需要的治愈', cuisine, mood: moodName },
        { name: cuisine === '日式' ? '茶碗蒸' : cuisine === '西式' ? '法式洋葱汤' : cuisine === '韩式' ? '大酱汤' : '红枣桂圆汤', image: '🥣', description: '温润细腻，照顾好自己', tags: ['难过', cuisine], ingredients: ['主料', '调料'], steps: ['准备食材', '按步骤烹饪', '装盘享用'], tips: '用爱烹饪', suitableScene: '给自己一个温暖的拥抱', cuisine, mood: moodName },
        { name: cuisine === '日式' ? '布丁' : cuisine === '西式' ? '巧克力熔岩蛋糕' : cuisine === '韩式' ? '蜂蜜黄油薯片' : '糯米丸子', image: '🍮', description: '甜蜜治愈，让心情好起来', tags: ['难过', cuisine], ingredients: ['主料', '调料'], steps: ['准备食材', '按步骤烹饪', '装盘享用'], tips: '甜食能让人快乐', suitableScene: '难过时的甜蜜慰藉', cuisine, mood: moodName }
      ]
    }
  }

  const data = fallbacks[moodName] || fallbacks['开心']
  return data
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}
