/**
 * API 通用类型定义
 */



/** 通用 API 响应结构 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

/** 分页请求参数 */
export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

/** 分页响应数据 */
export interface PaginationData<T> {
  total: number
  size: number
  page: number
  list: T[]
  hasMore: boolean
}

/** 后端分页响应结构 */
export interface PageResponse<T> {
  total: number
  size: number
  page: number
  list: T[]
}

/** API 错误类型 */
export interface ApiError {
  code: number
  message: string
  details?: Record<string, string[]>
}

/** 请求方法 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/** 请求配置 */
export interface RequestConfig {
  method?: HttpMethod
  data?: Record<string, unknown> | unknown[]
  params?: Record<string, string | number>
  header?: Record<string, string>
  timeout?: number
  retry?: number
  loading?: boolean
  cache?: boolean
}
