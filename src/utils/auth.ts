/**
 * 微信静默登录 + 用户体系
 * 通过 wx.login 获取 code，换取 openid，存储用户信息
 */

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

/**
 * 静默登录，获取或创建用户
 */
export function login(): Promise<UserInfo> {
  return new Promise((resolve, reject) => {
    // 先检查本地是否有用户信息
    const cached = getLocalUser()
    if (cached) {
      console.log('✅ 使用缓存用户:', cached.openid)
      resolve(cached)
      return
    }

    // 调用微信静默登录
    wx.login({
      success: async (loginRes) => {
        if (!loginRes.code) {
          reject(new Error('微信登录失败，无 code'))
          return
        }

        console.log('📱 wx.login 成功, code:', loginRes.code.substring(0, 10) + '***')

        // 通过 code 获取 openid（生产环境应请求后端，这里直接存储code对应的本地用户）
        // 微信规定：openid 必须通过后端接口获取，这里用本地生成的方式作为开发模式
        const openid = `dev_${loginRes.code.substring(0, 16)}`
        const userInfo: UserInfo = {
          openid,
          createTime: new Date().toLocaleString('zh-CN'),
          moodHistory: [],
          favorites: []
        }

        saveLocalUser(userInfo)
        console.log('🆕 新用户创建:', openid)
        resolve(userInfo)
      },
      fail: (err) => {
        console.error('❌ wx.login 失败:', err)
        reject(new Error('微信登录失败'))
      }
    })
  })
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
  // 最多保留50条
  if (user.moodHistory.length > 50) user.moodHistory.pop()
  saveLocalUser(user)
}

/**
 * 添加收藏
 */
export function addFavorite(recipe: FavoriteRecipe): void {
  const user = getLocalUser()
  if (!user) return
  // 避免重复
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
  return !!getLocalUser()
}
