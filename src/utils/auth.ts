/**
 * 微信云开发用户体系
 * v3.0 微信云开发版
 */

// 是否启用云同步
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

/**
 * 初始化并登录
 */
export async function initUser(): Promise<UserInfo> {
  try {
    // 1. 初始化云开发
    if (ENABLE_CLOUD) {
      initCloud()
    }
    
    // 2. 获取用户 openid
    const openid = await getOpenId()
    
    // 3. 查询或创建用户
    let user = await getUserFromCloud(openid)
    
    if (!user) {
      // 本地创建
      user = createLocalUser(openid)
      saveLocalUser(user)
    } else {
      saveLocalUser(user)
    }
    
    console.log('✅ 用户初始化成功:', user.openid)
    return user
    
  } catch (error) {
    console.error('❌ 初始化用户失败:', error)
    return getLocalUser() || createLocalUser('local_' + Date.now())
  }
}

/**
 * 获取 OpenId
 */
function getOpenId(): Promise<string> {
  return new Promise((resolve, reject) => {
    // 先检查本地缓存
    const cached = uni.getStorageSync('openid')
    if (cached) {
      resolve(cached)
      return
    }
    
    // 调用云函数获取（云函数自动获取 openid）
    uni.cloud.callFunction({
      name: 'user-login',
      data: { code: 'get-openid' },
      success: (res: any) => {
        if (res.result?.data?.openid) {
          const openid = res.result.data.openid
          uni.setStorageSync('openid', openid)
          resolve(openid)
        } else {
          // 开发模式生成临时 id
          const tempId = 'dev_' + Date.now()
          resolve(tempId)
        }
      },
      fail: () => {
        // 降级方案
        const tempId = 'dev_' + Date.now()
        resolve(tempId)
      }
    })
  })
}

/**
 * 获取云端用户数据
 */
async function getUserFromCloud(openid: string): Promise<UserInfo | null> {
  if (!ENABLE_CLOUD) return null
  
  try {
    const res = await uni.cloud.callFunction({
      name: 'user-sync',
      data: {
        action: 'getUserData',
        openid
      }
    }) as any
    
    if (res.result?.code === 200 && res.result.data) {
      return res.result.data
    }
    return null
  } catch (error) {
    console.error('获取云端用户失败:', error)
    return null
  }
}

/**
 * 初始化云开发
 */
function initCloud() {
  if (typeof wx === 'undefined') return
  
  try {
    wx.cloud?.init?.({
      env: 'LiteChef7-xxxx', // TODO: 替换为实际环境ID
      traceUser: true
    })
  } catch (e) {
    console.warn('云初始化跳过')
  }
}

/**
 * 创建本地用户
 */
function createLocalUser(openid: string): UserInfo {
  return {
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
}

/**
 * 同步数据到云端
 */
export async function syncToCloud(data: Partial<UserInfo>): Promise<boolean> {
  if (!ENABLE_CLOUD) return false
  
  const user = getLocalUser()
  if (!user) return false
  
  try {
    const result = await uni.cloud.callFunction({
      name: 'user-sync',
      data: {
        action: 'sync',
        openid: user.openid,
        data
      }
    }) as any
    
    return result.result?.code === 200
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
    const result = await uni.cloud.callFunction({
      name: 'user-sync',
      data: {
        action: 'getUserData',
        openid: user.openid
      }
    }) as any
    
    if (result.result?.code === 200 && result.result.data) {
      saveLocalUser(result.result.data)
      console.log('☁️ 拉取成功')
      return result.result.data
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
 * 更新用户信息
 */
export async function updateUser(partial: Partial<UserInfo>): Promise<UserInfo> {
  const user = getLocalUser()
  if (!user) throw new Error('用户未登录')
  
  const updated = { ...user, ...partial, updateTime: new Date().toISOString() }
  saveLocalUser(updated)
  syncToCloud(partial).catch(() => {})
  
  return updated
}

/**
 * 添加收藏
 */
export async function addFavorite(recipe: FavoriteRecipe): Promise<void> {
  const user = getLocalUser()
  if (!user) return
  
  const exists = user.favorites.some(f => f.name === recipe.name)
  if (exists) return
  
  const newRecipe = { ...recipe, time: new Date().toLocaleString('zh-CN') }
  user.favorites.unshift(newRecipe)
  saveLocalUser(user)
  
  // 同步到云端
  if (ENABLE_CLOUD) {
    uni.cloud.callFunction({
      name: 'user-sync',
      data: {
        action: 'addFavorite',
        openid: user.openid,
        data: newRecipe
      }
    }).catch(console.error)
  }
}

/**
 * 移除收藏
 */
export async function removeFavorite(name: string): Promise<void> {
  const user = getLocalUser()
  if (!user) return
  
  user.favorites = user.favorites.filter(f => f.name !== name)
  saveLocalUser(user)
  
  // 同步到云端
  if (ENABLE_CLOUD) {
    uni.cloud.callFunction({
      name: 'user-sync',
      data: {
        action: 'removeFavorite',
        openid: user.openid,
        data: { name }
      }
    }).catch(console.error)
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
 * 添加心情记录
 */
export async function addMoodRecord(record: MoodRecord): Promise<void> {
  const user = getLocalUser()
  if (!user) return
  
  user.moodHistory.unshift(record)
  if (user.moodHistory.length > 50) user.moodHistory.pop()
  saveLocalUser(user)
  
  // 同步到云端
  if (ENABLE_CLOUD) {
    uni.cloud.callFunction({
      name: 'user-sync',
      data: {
        action: 'addMoodRecord',
        openid: user.openid,
        data: record
      }
    }).catch(console.error)
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
  uni.removeStorageSync('openid')
}
