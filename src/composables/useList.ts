/**
 * 列表数据管理 composable
 * 用于管理分页列表数据，支持下拉刷新、上拉加载
 */

import type { PaginationData } from '@/types'

export interface UseListOptions<T> {
  fetchFn: (page: number, size: number) => Promise<PaginationData<T>>
  pageSize?: number
  immediate?: boolean
}

export interface UseListReturn<T> {
  list: globalThis.Ref<T[]>
  loading: globalThis.Ref<boolean>
  refreshing: globalThis.Ref<boolean>
  loadingMore: globalThis.Ref<boolean>
  hasMore: globalThis.Ref<boolean>
  page: globalThis.Ref<number>
  error: globalThis.Ref<Error | null>
  loadData: () => Promise<void>
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
}

export function useList<T>(options: UseListOptions<T>): UseListReturn<T> {
  const { fetchFn, pageSize = 10, immediate = true } = options

  const list = ref<T[]>([]) as globalThis.Ref<T[]>
  const loading = ref(false)
  const refreshing = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const page = ref(1)
  const error = ref<Error | null>(null)

  /**
   * 加载数据
   */
  async function loadData() {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      page.value = 1
      const res = await fetchFn(page.value, pageSize)
      list.value = res.list
      hasMore.value = res.hasMore
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('加载数据失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新数据
   */
  async function refresh() {
    if (refreshing.value) return

    refreshing.value = true
    error.value = null

    try {
      page.value = 1
      const res = await fetchFn(page.value, pageSize)
      list.value = res.list
      hasMore.value = res.hasMore
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('刷新数据失败:', err)
    } finally {
      refreshing.value = false
    }
  }

  /**
   * 加载更多
   */
  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return

    loadingMore.value = true

    try {
      const nextPage = page.value + 1
      const res = await fetchFn(nextPage, pageSize)
      
      if (res.list.length > 0) {
        list.value = [...list.value, ...res.list]
        page.value = nextPage
      }
      
      hasMore.value = res.hasMore
    } catch (err) {
      console.error('加载更多失败:', err)
    } finally {
      loadingMore.value = false
    }
  }

  // 立即加载
  if (immediate) {
    onMounted(() => {
      loadData()
    })
  }

  return {
    list,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    page,
    error,
    loadData,
    refresh,
    loadMore
  }
}
