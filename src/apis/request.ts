/**
 * 优化后的 API 请求工具
 * 功能：拦截器、错误处理、自动重试、加载状态管理
 */

import type { ApiResponse, RequestConfig } from '@/types'

// 从环境变量获取 BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// 请求状态管理
const pendingRequests = new Map<string, Promise<unknown>>()

/**
 * 生成请求唯一键
 */
function generateRequestKey(url: string, config: RequestConfig): string {
  return `${config.method || 'GET'}_${url}_${JSON.stringify(config.data || {})}`
}

/**
 * 显示加载提示
 */
function showLoading(title = '加载中...') {
  uni.showLoading({ title, mask: true })
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  uni.hideLoading()
}

/**
 * 显示错误提示
 */
function showError(message: string) {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 处理 HTTP 错误
 */
function handleHttpError(statusCode: number): string {
  const errorMap: Record<number, string> = {
    400: '请求参数错误',
    401: '登录已过期，请重新登录',
    403: '没有权限访问',
    404: '请求的资源不存在',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务暂时不可用',
    504: '网关超时'
  }
  return errorMap[statusCode] || `请求失败 (${statusCode})`
}

/**
 * 检查网络状态
 */
async function checkNetwork(): Promise<boolean> {
  const networkType = await uni.getNetworkType()
  return networkType.networkType !== 'none'
}

/**
 * 统一请求方法（优化版）
 */
export async function request<T = unknown>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    method = 'GET',
    data,
    params,
    header = {},
    timeout = 30000,
    retry = 1,
    loading = true
  } = config

  // 检查网络
  const hasNetwork = await checkNetwork()
  if (!hasNetwork) {
    showError('网络连接不可用')
    return Promise.reject(new Error('网络连接不可用'))
  }

  // 构建完整 URL
  let fullUrl = `${BASE_URL}${url}`
  if (params) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    fullUrl += `?${queryString}`
  }

  // 防重复请求（GET 请求启用）
  const requestKey = generateRequestKey(fullUrl, config)
  if (method === 'GET' && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey) as Promise<T>
  }

  // 获取 Token
  const token = uni.getStorageSync('token')
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {}

  // 显示加载
  if (loading) {
    showLoading()
  }

  // 构建请求选项
  const requestOptions: UniApp.RequestOptions = {
    url: fullUrl,
    method: method as UniApp.RequestOptions['method'],
    data,
    header: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...header
    },
    timeout
  }

  // 执行请求
  const requestPromise = executeRequest<T>(requestOptions, retry)

  // 缓存 GET 请求
  if (method === 'GET') {
    pendingRequests.set(requestKey, requestPromise)
    requestPromise.finally(() => {
      pendingRequests.delete(requestKey)
      if (loading) {
        hideLoading()
      }
    })
  } else {
    requestPromise.finally(() => {
      if (loading) {
        hideLoading()
      }
    })
  }

  return requestPromise
}

/**
 * 执行请求（带重试）
 */
async function executeRequest<T>(
  options: UniApp.RequestOptions,
  maxRetries: number
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await uni.request(options)
      const { statusCode, data } = result

      // HTTP 错误处理
      if (statusCode !== 200) {
        const errorMessage = handleHttpError(statusCode)
        
        // Token 过期处理
        if (statusCode === 401) {
          uni.removeStorageSync('token')
          uni.removeStorageSync('user_info')
          // 可以在这里触发重新登录
        }
        
        throw new Error(errorMessage)
      }

      // 业务错误处理
      const response = data as ApiResponse<T>
      if (response.code !== 200) {
        throw new Error(response.message || '请求失败')
      }

      return response.data
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        await delay(1000 * (attempt + 1))
      }
    }
  }

  // 所有重试失败
  showError(lastError?.message || '请求失败')
  throw lastError
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * GET 请求快捷方法
 */
export function get<T = unknown>(url: string, config: Omit<RequestConfig, 'method' | 'data'> = {}) {
  return request<T>(url, { ...config, method: 'GET' })
}

/**
 * POST 请求快捷方法
 */
export function post<T = unknown>(url: string, data?: Record<string, unknown>, config: Omit<RequestConfig, 'method' | 'data'> = {}) {
  return request<T>(url, { ...config, method: 'POST', data })
}

/**
 * PUT 请求快捷方法
 */
export function put<T = unknown>(url: string, data?: Record<string, unknown>, config: Omit<RequestConfig, 'method' | 'data'> = {}) {
  return request<T>(url, { ...config, method: 'PUT', data })
}

/**
 * DELETE 请求快捷方法
 */
export function del<T = unknown>(url: string, config: Omit<RequestConfig, 'method'> = {}) {
  return request<T>(url, { ...config, method: 'DELETE' })
}

/**
 * 上传文件
 */
export function uploadFile<T = unknown>(
  url: string,
  filePath: string,
  name = 'file',
  formData?: Record<string, string>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    
    uni.uploadFile({
      url: `${BASE_URL}${url}`,
      filePath,
      name,
      formData,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data) as ApiResponse<T>
            if (data.code === 200) {
              resolve(data.data)
            } else {
              reject(new Error(data.message))
            }
          } catch {
            reject(new Error('解析响应失败'))
          }
        } else {
          reject(new Error(handleHttpError(res.statusCode)))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      }
    })
  })
}
