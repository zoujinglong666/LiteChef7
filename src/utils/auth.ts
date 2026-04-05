/**
 * 微信静默登录 + 云同步
 * v3.0 升级版
 */

// 是否启用云同步（开发模式可关闭）
const ENABLE_CLOUD = true

export interface UserInfo {
  openid: string
  nickname?: string
  avatar?: string
  createTime: string
  updateTime?: string
  moodHistory: MoodRecord[]
  favorites: FavoriteRecipe[]
  settings?: {
    defaultCuisine?: string
    notifications?: boolean
  }
  vipInfo?: {
    isVip: boolean
    expireTime?: string
    plan?: string
  }
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
const CLOUD_SYNC_KEY = 'cloud_synced'

/**
 * 初始化并登录
 * 优先从云端获取，失败则本地
 */
export async function initUser(): Promise<UserInfo> {
  try {
    // 1. 先尝试云登录
    if (ENABLE_CLOUD) {
      const cloudUser = await cloudLogin()
      if (cloudUser) {
        console.log('☁️ 云登录成功:', cloudUser.openid)
        saveLocalUser(cloudUser)
        return cloudUser
      }
    }
    
    // 2. 云登录失败，使用本地
    const localUser = getLocalUser()
    if (localUser) {
      console.log('📱 使用本地用户:', localUser.openid)
      return localUser
    }
    
    // 3. 都没有，创建新用户
    const newUser = await createLocalUser()
    console.log('🆕 创建新用户:', newUser.openid)
    return newUser
    
  } catch (error) {
    console.error('❌ 初始化用户失败:', error)
    // 降级到本地模式
    return getLocalUser() || await createLocalUser()
  }
}

/**
 * 云端登录
 */
async function cloudLogin(): Promise<UserInfo | null> {
  return new Promise((resolve) => {
    wx.login({
      success: async (loginRes) => {
        if (!loginRes.code) {
          resolve(null)
          return
        }
        
        try {
          // 调用云函数
          const result = await uniCloud.callFunction({
            name: 'user-login',
            data: { code: loginRes.code }
          }) as any
          
          if (result.result?.code === 200) {
            resolve(result.result.data.userInfo)
          } else {
            console.error('云登录失败:', result.result)
            resolve(null)
          }
        } catch (error) {
          console.error('云函数调用失败:', error)
          resolve(null)
        }
      },
      fail: () => resolve(null)
    })
  })
}

/**
 * 创建本地用户（开发模式）
 */
async function createLocalUser(): Promise<UserInfo> {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (loginRes) => {
        const openid = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
        const user: UserInfo = {
          openid,
          createTime: new Date().toLocaleString('zh-CN'),
          moodHistory: [],
          favorites: [],
          settings: {
            defaultCuisine: '中式',
            notifications: true
          },
          vipInfo: {
            isVip: false
          }
        }
        saveLocalUser(user)
        resolve(user)
      },
      fail: reject
    })
  })
}

/**
 * 同步数据到云端
 */
export async function syncToCloud(data: Partial<UserInfo>): Promise<boolean> {
  if (!ENABLE_CLOUD) return false
  
  const user = getLocalUser()
  if (!user) return false
  
  try {
    const result = await uniCloud.callFunction({
      name: 'user-sync',
      data: {
        action: 'sync',
        openid: user.openid,
        data
      }
    }) as any
    
    if (result.result?.code === 200) {
      console.log('☁️ 同步成功')
      return true
    }
    return false
  } catch (error) {
    console.error('同步失败:', error)
    return false
  }
}

/**
 * 从云端拉取数据
 */
export async function pullFromCloud(): Promise<UserInfo | null> {
  if (!ENABLE_CLOUD) return null
  
  const user = getLocalUser()
  if (!user) return null
  
  try {
    const result = await uniCloud.callFunction({
      name: 'user-sync',
      data: {
        action: 'getUserData',
        openid: user.openid
      }
    }) as any
    
    if (result.result?.code === 200) {
      const cloudUser = result.result.data
      saveLocalUser(cloudUser)
      console.log('☁️ 拉取成功')
      return cloudUser
    }
    return null
  } catch (error) {
    console.error('拉取失败:', error)
    return null
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
 * 更新用户信息（本地+云端）
 */
export async function updateUser(partial: Partial<UserInfo>): Promise<UserInfo> {
  const user = getLocalUser()
  if (!user) throw new Error('用户未登录')
  
  const updated = { ...user, ...partial, updateTime: new Date().toISOString() }
  saveLocalUser(updated)
  
  // 异步同步到云端
  syncToCloud(partial).catch(() => {})
  
  return updated
}

/**
 * 添加收藏（本地+云端）
 */
export async function addFavorite(recipe: FavoriteRecipe): Promise<void> {
  const user = getLocalUser()
  if (!user) return
  
  const exists = user.favorites.some(f => f.name === recipe.name)
  if (exists) return
  
  const newRecipe = { ...recipe, time: new Date().toLocaleString('zh-CN') }
  user.favorites.unshift(newRecipe)
  saveLocalUser(user)
  
  // 异步同步到云端
  if (ENABLE_CLOUD) {
    try {
      await uniCloud.callFunction({
        name: 'user-sync',
        data: {
          action: 'addFavorite',
          openid: user.openid,
          data: newRecipe
        }
      })
    } catch (error) {
      console.error('收藏同步失败:', error)
    }
  }
}

/**
 * 移除收藏（本地+云端）
 */
export async function removeFavorite(name: string): Promise<void> {
  const user = getLocalUser()
  if (!user) return
  
  user.favorites = user.favorites.filter(f => f.name !== name)
  saveLocalUser(user)
  
  // 异步同步到云端
  if (ENABLE_CLOUD) {
    try {
      await uniCloud.callFunction({
        name: 'user-sync',
        data: {
          action: 'removeFavorite',
          openid: user.openid,
          data: { name }
        }
      })
    } catch (error) {
      console.error('取消收藏同步失败:', error)
    }
  }
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
 * 添加心情记录（本地+云端）
 */
export async function addMoodRecord(record: MoodRecord): Promise<void> {
  const user = getLocalUser()
  if (!user) return
  
  user.moodHistory.unshift(record)
  if (user.moodHistory.length > 50) user.moodHistory.pop()
  saveLocalUser(user)
  
  // 异步同步到云端
  if (ENABLE_CLOUD) {
    try {
      await uniCloud.callFunction({
        name: 'user-sync',
        data: {
          action: 'addMoodRecord',
          openid: user.openid,
          data: record
        }
      })
    } catch (error) {
      console.error('心情记录同步失败:', error)
    }
  }
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

/**
 * 检查是否是会员
 */
export function isVip(): boolean {
  const user = getLocalUser()
  if (!user?.vipInfo) return false
  
  const { isVip, expireTime } = user.vipInfo
  if (!isVip || !expireTime) return false
  
  return new Date(expireTime) > new Date()
}

/**
 * 退出登录
 */
export function logout(): void {
  uni.removeStorageSync(USER_KEY)
}
