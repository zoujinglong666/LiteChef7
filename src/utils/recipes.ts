/**
 * 菜谱工具函数
 * 完全 AI 生成，无爬取数据
 */

export interface Recipe {
  id: string
  name: string
  image: string  // emoji
  tags: string[]
  cookTime: string
  difficulty: number  // 1-5
  description: string
  ingredients: string[]
  steps: string[]
}

// 根据日期生成稳定随机数
function dateSeed(): number {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

// AI 生成的菜谱知识库（内置，无需网络请求）
const builtinRecipes: Omit<Recipe, 'id'>[] = [
  { name: '番茄炒蛋', image: '🍳', tags: ['家常', '快手', '下饭'], cookTime: '10分钟', difficulty: 1, description: '酸甜可口，家家户户都会做的经典菜', ingredients: ['番茄', '鸡蛋', '葱花', '盐'], steps: ['番茄切块', '鸡蛋打散炒熟盛出', '番茄炒出汁', '加鸡蛋翻炒', '调味出锅'] },
  { name: '红烧肉', image: '🥩', tags: ['硬菜', '下饭', '下酒'], cookTime: '60分钟', difficulty: 3, description: '肥而不腻，入口即化，回忆里的味道', ingredients: ['五花肉', '冰糖', '生抽', '老抽', '八角'], steps: ['五花肉切块焯水', '炒糖色', '下肉翻炒上色', '加水炖煮', '大火收汁'] },
  { name: '可乐鸡翅', image: '🍗', tags: ['小朋友最爱', '宴客', '香甜'], cookTime: '30分钟', difficulty: 2, description: '甜香浓郁，好吃到舔手指', ingredients: ['鸡翅', '可乐', '生抽', '姜片'], steps: ['鸡翅焯水', '煎至金黄', '加可乐和调料', '中小火炖20分钟', '大火收汁'] },
  { name: '酸辣土豆丝', image: '🥔', tags: ['开胃', '下饭', '爽口'], cookTime: '10分钟', difficulty: 1, description: '酸辣脆爽，一学就会的开胃菜', ingredients: ['土豆', '干辣椒', '白醋', '蒜片'], steps: ['土豆切丝泡水', '热油爆香蒜片干辣椒', '下土豆丝大火快炒', '沿锅边淋醋', '调味出锅'] },
  { name: '蒜蓉西兰花', image: '🥦', tags: ['健康', '减脂', '简单'], cookTime: '8分钟', difficulty: 1, description: '翠绿爽口，营养丰富的快手菜', ingredients: ['西兰花', '蒜蓉', '盐', '蚝油'], steps: ['西兰花切小朵焯水', '蒜切末', '热油爆香蒜蓉', '下西兰花翻炒', '调味出锅'] },
  { name: '宫保鸡丁', image: '🍗', tags: ['川菜', '下饭', '经典'], cookTime: '20分钟', difficulty: 2, description: '麻辣酸甜，超级下饭的川菜代表', ingredients: ['鸡胸肉', '花生米', '干辣椒', '黄瓜丁'], steps: ['鸡肉切丁腌制', '调碗汁', '滑炒鸡丁盛出', '炒香调料', '下鸡丁花生翻炒'] },
  { name: '糖醋里脊', image: '🍖', tags: ['酸甜', '宴客', '小朋友'], cookTime: '30分钟', difficulty: 3, description: '外酥里嫩，酸甜可口，大人小孩都爱', ingredients: ['猪里脊', '番茄酱', '白醋', '白糖', '淀粉'], steps: ['里脊切条腌制', '裹淀粉炸至金黄', '调糖醋汁', '快速翻炒裹汁', '出锅撒芝麻'] },
  { name: '鱼香肉丝', image: '🥢', tags: ['川菜', '下饭', '家常'], cookTime: '20分钟', difficulty: 2, description: '咸甜酸辣，香气扑鼻，下饭神器', ingredients: ['猪里脊', '木耳', '笋丝', '鱼香汁'], steps: ['肉丝腌制上浆', '配菜切丝', '滑炒肉丝', '下调料汁', '快速翻炒出锅'] },
  { name: '清蒸鲈鱼', image: '🐟', tags: ['清淡', '营养', '宴客'], cookTime: '20分钟', difficulty: 2, description: '鱼肉鲜嫩，原汁原味，清淡养生', ingredients: ['鲈鱼', '葱姜', '蒸鱼豉油', '料酒'], steps: ['鲈鱼处理干净', '划几刀抹料酒', '铺葱姜上锅蒸', '倒掉蒸汁', '淋热油豉油'] },
  { name: '麻婆豆腐', image: '🧈', tags: ['川菜', '下饭', '麻辣'], cookTime: '15分钟', difficulty: 2, description: '麻辣鲜香，豆腐嫩滑，超级下饭', ingredients: ['嫩豆腐', '肉末', '郫县豆瓣酱', '花椒粉'], steps: ['豆腐切块焯水', '炒肉末豆瓣酱', '加高汤或水', '下豆腐轻轻推', '勾芡撒花椒粉'] },
  { name: '土豆炖牛腩', image: '🥘', tags: ['硬菜', '滋补', '冬季必备'], cookTime: '90分钟', difficulty: 3, description: '牛肉软烂，土豆绵密，一锅满足', ingredients: ['牛腩', '土豆', '胡萝卜', '番茄', '八角'], steps: ['牛腩切块焯水', '炒香调料', '加番茄牛腩翻炒', '加水炖1小时', '加土豆胡萝卜炖熟'] },
  { name: '蛋炒饭', image: '🍳', tags: ['快手', '主食', '解决剩饭'], cookTime: '5分钟', difficulty: 1, description: '粒粒分明，蛋香四溢，五分钟搞定一餐', ingredients: ['隔夜米饭', '鸡蛋', '葱花', '盐'], steps: ['鸡蛋打散', '热油炒蛋盛出', '下米饭大火翻炒', '加蛋块翻炒', '撒葱花调味'] },
  { name: '手撕包菜', image: '🥬', tags: ['快手', '清淡', '素食'], cookTime: '5分钟', difficulty: 1, description: '爽脆可口，比肉还好吃的素菜', ingredients: ['圆白菜', '干辣椒', '蒜片', '生抽', '醋'], steps: ['包菜撕成大片', '热油爆香蒜片干辣椒', '下包菜大火快炒', '淋少许醋', '调味出锅'] },
  { name: '蒜蓉粉丝虾', image: '🦐', tags: ['宴客', '鲜香', '高端'], cookTime: '20分钟', difficulty: 2, description: '虾肉鲜甜，粉丝吸满汤汁，宴客必备', ingredients: ['大虾', '粉丝', '蒜蓉', '生抽', '葱花'], steps: ['粉丝泡软铺底', '虾开背去虾线', '铺在粉丝上', '淋蒜蓉酱汁', '上锅蒸8分钟'] },
  { name: '玉米排骨汤', image: '🥣', tags: ['滋补', '清淡', '老少皆宜'], cookTime: '90分钟', difficulty: 2, description: '汤鲜肉嫩，玉米清甜，暖胃暖心', ingredients: ['排骨', '玉米', '胡萝卜', '姜片', '盐'], steps: ['排骨焯水', '玉米胡萝卜切段', '所有食材入锅', '加足水大火烧开', '小火炖1小时'] },
  { name: '凉拌黄瓜', image: '🥒', tags: ['凉菜', '开胃', '夏季必备'], cookTime: '5分钟', difficulty: 1, description: '清脆爽口，酸辣开胃，夏天必备', ingredients: ['黄瓜', '蒜末', '生抽', '醋', '香油'], steps: ['黄瓜拍碎切段', '加蒜末生抽醋', '淋热油激发香味', '滴香油', '拌匀冷藏更好吃'] },
  { name: '红烧狮子头', image: '🥩', tags: ['淮扬', '宴客', '软嫩'], cookTime: '40分钟', difficulty: 3, description: '个大肉嫩，入口即化，淮扬名菜', ingredients: ['猪肉糜', '荸荠', '生抽', '老抽', '冰糖'], steps: ['肉糜加荸荠末调味', '摔打上劲', '做成大肉丸', '煎至定型', '红烧汁炖40分钟'] },
  { name: '回锅肉', image: '🥓', tags: ['川菜', '下饭', '经典'], cookTime: '20分钟', difficulty: 2, description: '肥而不腻，咸香微辣，超下饭', ingredients: ['五花肉', '蒜苗', '郫县豆瓣酱', '甜面酱'], steps: ['五花肉整块煮熟', '切片', '煸炒出油', '加豆瓣酱甜面酱', '下蒜苗翻炒'] },
  { name: '紫菜蛋花汤', image: '🥣', tags: ['快手', '清淡', '家常'], cookTime: '5分钟', difficulty: 1, description: '简单鲜美的家常汤，5分钟搞定', ingredients: ['紫菜', '鸡蛋', '虾皮', '香油'], steps: ['水烧开', '下紫菜虾皮', '淋入蛋液', '出锅前滴香油', '调味即可'] },
  { name: '剁椒鱼头', image: '🐟', tags: ['湘菜', '麻辣', '霸气'], cookTime: '25分钟', difficulty: 2, description: '鱼肉鲜嫩，剁椒香辣，过瘾', ingredients: ['鱼头', '剁椒', '豆豉', '葱姜'], steps: ['鱼头处理干净', '铺上剁椒豆豉', '上锅蒸15分钟', '淋热油', '撒葱花'] },
  { name: '糯米丸子', image: '🍡', tags: ['寓意好', '宴客', '软糯'], cookTime: '30分钟', difficulty: 2, description: '软糯香甜，寓意团圆，逢年过节必备', ingredients: ['糯米', '猪肉糜', '荸荠', '生抽'], steps: ['糯米提前泡发', '肉糜调味加荸荠', '肉丸裹满糯米', '上锅蒸25分钟', '点缀枸杞'] },
  { name: '苦瓜酿肉', image: '🥒', tags: ['清热', '养生', '独特'], cookTime: '30分钟', difficulty: 2, description: '苦瓜清苦，肉馅鲜香，清热解暑', ingredients: ['苦瓜', '猪肉糜', '虾仁', '生抽'], steps: ['苦瓜切段去瓟', '肉糜调味', '苦瓜圈填满肉馅', '煎至两面金黄', '加少量水焖熟'] },
  { name: '西葫芦烙饼', image: '🫓', tags: ['创意', '早餐', '健康'], cookTime: '15分钟', difficulty: 1, description: '外酥里嫩，早餐新选择，营养丰富', ingredients: ['西葫芦', '面粉', '鸡蛋', '葱花'], steps: ['西葫芦擦丝', '加面粉鸡蛋葱花', '加盐胡椒调味', '平底锅烙至两面金黄', '切块享用'] },
  { name: '糯米藕', image: '🟤', tags: ['甜品', '养生', '软糯'], cookTime: '60分钟', difficulty: 2, description: '软糯香甜，桂花飘香，甜品佳品', ingredients: ['莲藕', '糯米', '红糖', '桂花'], steps: ['糯米提前泡', '藕孔塞满糯米', '红糖水炖煮1小时', '切片', '淋桂花蜜'] },
  { name: '啤酒鸭', image: '🦆', tags: ['下酒', '硬菜', '香辣'], cookTime: '60分钟', difficulty: 3, description: '鸭肉香辣，啤酒提鲜，下酒神器', ingredients: ['鸭子', '啤酒', '干辣椒', '八角', '桂皮'], steps: ['鸭子切块焯水', '炒香调料', '下鸭子翻炒', '加啤酒和水炖1小时', '大火收汁'] },
]

/**
 * 根据日期生成稳定的随机推荐
 */
export function getTodayRecipes(count: number = 3): Recipe[] {
  const seed = dateSeed()
  const rand = seededRandom(seed)
  const result: Recipe[] = []

  while (result.length < count) {
    const idx = Math.floor(rand() * builtinRecipes.length)
    const recipe = builtinRecipes[idx]
    if (!result.find(r => r.name === recipe.name)) {
      result.push({ ...recipe, id: `${idx}-${seed}` })
    }
  }
  return result
}

/**
 * 随机获取菜谱
 */
export function getRandomRecipes(count: number = 3): Recipe[] {
  const rand = seededRandom(Date.now() % 100000)
  const shuffled = [...builtinRecipes].sort(() => rand() - 0.5)
  return shuffled.slice(0, count).map((r, i) => ({ ...r, id: `random-${i}` }))
}

/**
 * 按标签筛选
 */
export function getRecipesByTag(tag: string): Recipe[] {
  const seed = dateSeed()
  const rand = seededRandom(seed)
  return builtinRecipes
    .filter(r => r.tags.some(t => t.includes(tag)))
    .map((r, i) => ({ ...r, id: `${tag}-${i}` }))
}

/**
 * 搜索菜谱（按名称）
 */
export function searchRecipes(keyword: string): Recipe[] {
  if (!keyword.trim()) return []
  const lower = keyword.toLowerCase()
  return builtinRecipes
    .filter(r => r.name.includes(keyword) || r.ingredients.some(i => i.includes(keyword)))
    .map((r, i) => ({ ...r, id: `search-${i}` }))
}

/**
 * 按心情获取推荐
 */
export function getRecipesByMood(mood: string): Recipe[] {
  const moodMap: Record<string, string[]> = {
    '开心': ['家常', '快手', '小朋友最爱'],
    '难过': ['下饭', '清淡', '滋补'],
    '愤怒': ['川菜', '麻辣', '下饭'],
    '焦虑': ['清淡', '快手', '健康'],
    '疲惫': ['快手', '主食', '滋补'],
    '嘴馋': ['川菜', '宴客', '酸甜'],
    '浪漫': ['清淡', '养生', '宴客'],
    '无聊': ['创意', '川菜', '素食'],
  }
  const tags = moodMap[mood] || ['家常']
  const result: Recipe[] = []
  tags.forEach(tag => {
    getRecipesByTag(tag).forEach(r => {
      if (!result.find(x => x.name === r.name)) result.push(r)
    })
  })
  return result.slice(0, 3)
}
