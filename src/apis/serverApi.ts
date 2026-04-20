/**
 * API 请求工具
 * 调用 Spring Boot 后端服务
 */

const BASE_URL = 'http://localhost:8080/api'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

/**
 * 统一请求方法
 */
export async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', data, header = {} } = options

  const token = uni.getStorageSync('token')
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err: any) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

/**
 * 心情推荐
 */
export async function getRecommendByMood(
  mood: string,
  weather: string,
  cuisine: string
) {
  return request('/mood/recommend', {
    method: 'POST',
    data: { mood, weather, cuisine }
  })
}

/**
 * 食材替换
 */
export async function getIngredientSubstitute(ingredient: string) {
  return request('/ingredient/substitute', {
    method: 'POST',
    data: { ingredient }
  })
}

/**
 * 分量计算
 */
export async function calculateScale(
  ingredients: string[],
  fromServings: number,
  toServings: number
) {
  return request('/scale', {
    method: 'POST',
    data: { ingredients, fromServings, toServings }
  })
}

/**
 * 微信登录
 */
export async function wxLogin(code: string) {
  return request('/auth/login', {
    method: 'POST',
    data: { code }
  })
}

/**
 * 开发模式登录
 */
export async function devLogin() {
  return request('/auth/dev-login', {
    method: 'POST'
  })
}

/**
 * 健康检查
 */
export async function healthCheck() {
  return request('/health')
}
