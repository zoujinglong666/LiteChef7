<route lang="json">
{
  "layout": "tabbar",
  "style": { "navigationStyle": "custom" },
  "name": "recipeSquare"
}
</route>

<template>
  <view class="square-page">
    <!-- 顶部 -->
    <view class="header" :style="{ paddingTop: navBarPaddingTop }">
      <view class="header-bg" />
      <view class="nav-bar">
        <text class="nav-title">菜谱广场</text>
        <view class="nav-actions">
          <view class="action-btn" @click="goUpload" hover-class="btn-hover">
            <wd-icon name="add" size="20px" color="#fff" />
          </view>
        </view>
      </view>

      <!-- 搜索栏 -->
      <view class="search-bar">
        <wd-icon name="search" size="16px" color="#999" />
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索菜谱、食材..."
          class="search-input"
          confirm-type="search"
          @confirm="handleSearch"
        />
        <view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
          <wd-icon name="close" size="14px" color="#ccc" />
        </view>
      </view>

      <!-- 筛选标签 -->
      <scroll-view scroll-x class="filter-scroll" :scroll-into-view="`filter-${activeFilter}`">
        <view class="filter-list">
          <view 
            v-for="c in filterOptions" 
            :key="c.value"
            :id="`filter-${c.value}`"
            class="filter-item" 
            :class="{ active: activeFilter === c.value }" 
            @click="setFilter(c.value)"
          >
            {{ c.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 内容区域 -->
    <scroll-view 
      scroll-y 
      class="content-scroll"
      :style="{ paddingTop: headerHeight }"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 精选推荐 -->
      <view class="featured-section" v-if="featured.length > 0 && !searchKeyword && !loading">
        <view class="section-header">
          <text class="section-title">🔥 精选推荐</text>
        </view>
        <scroll-view scroll-x class="featured-scroll">
          <view class="featured-list">
            <view 
              class="featured-card" 
              v-for="r in featured" 
              :key="r.id" 
              @click="goDetail(r.id)"
              hover-class="card-hover"
            >
              <view class="featured-img-placeholder">
                <text class="featured-emoji">{{ r.coverImage || r.emoji || '🍳' }}</text>
                <view class="featured-badge" v-if="r.isFeatured">精选</view>
              </view>
              <view class="featured-info">
                <text class="featured-name">{{ r.name }}</text>
                <view class="featured-stats">
                  <wd-icon name="heart-filled" size="12px" color="#FF6B35" />
                  <text class="featured-count">{{ formatCount(r.likes) }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 菜谱列表 -->
      <view class="recipe-section">
        <view class="section-header">
          <text class="section-title">{{ searchKeyword ? '搜索结果' : '最新菜谱' }}</text>
          <text class="section-count" v-if="!loading">共 {{ recipes.length }} 个</text>
        </view>

        <!-- 加载状态 -->
        <LoadingState v-if="loading && recipes.length === 0" text="正在加载菜谱..." />

        <!-- 骨架屏 -->
        <view v-if="loading && recipes.length === 0" class="skeleton-list">
          <SkeletonCard v-for="i in 3" :key="i" />
        </view>

        <!-- 错误状态 -->
        <ErrorState 
          v-else-if="error" 
          :description="error.message"
          @retry="loadData"
        />

        <!-- 空状态 -->
        <view v-else-if="recipes.length === 0" class="empty-state">
          <view class="empty-icon">
            <wd-icon name="folder" size="48px" color="#DDD" />
          </view>
          <text class="empty-title">{{ searchKeyword ? '没有找到相关菜谱' : '还没有菜谱' }}</text>
          <text class="empty-desc">
            {{ searchKeyword ? '换个关键词试试' : '成为第一个分享菜谱的人吧~' }}
          </text>
          <button class="empty-btn" @click="goUpload" v-if="!searchKeyword">发布菜谱</button>
        </view>

        <!-- 列表 -->
        <view v-else class="recipe-list">
          <view
            class="recipe-card"
            v-for="r in recipes"
            :key="r.id"
            @click="goDetail(r.id)"
            hover-class="card-hover"
          >
            <view class="recipe-cover">
              <text class="cover-emoji">{{ r.coverImage || r.emoji || '🍳' }}</text>
              <view class="recipe-tag" v-if="r.cuisine">
                <text class="tag-text">{{ r.cuisine }}</text>
              </view>
            </view>
            <view class="recipe-content">
              <view class="recipe-header">
                <text class="recipe-name">{{ r.name }}</text>
                <text class="recipe-desc" v-if="r.description">{{ r.description }}</text>
              </view>
              <view class="recipe-footer">
                <view class="recipe-author" v-if="r.authorName">
                  <text class="author-avatar">{{ r.authorAvatar || '👤' }}</text>
                  <text class="author-name">{{ r.authorName }}</text>
                </view>
                <view class="recipe-stats">
                  <view class="stat-item">
                    <wd-icon name="heart" size="13px" color="#FF6B6B" />
                    <text class="stat-num">{{ formatCount(r.likes) }}</text>
                  </view>
                  <view class="stat-item">
                    <wd-icon name="star" size="13px" color="#FFB800" />
                    <text class="stat-num">{{ formatCount(r.favorites) }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 加载更多 -->
          <view v-if="loadingMore" class="load-more">
            <view class="loading-dots">
              <view class="dot" />
              <view class="dot" />
              <view class="dot" />
            </view>
            <text class="load-text">加载中...</text>
          </view>

          <!-- 没有更多 -->
          <view v-if="!hasMore && recipes.length > 0" class="no-more">
            <text>已经到底啦~</text>
          </view>
        </view>
      </view>

      <!-- 底部安全区域 -->
      <view style="height: 40rpx" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
import { getRecipeList, searchRecipes, getFeaturedRecipes } from '@/apis'
import type { Recipe, FilterType } from '@/types'
import SkeletonCard from '@/components/SkeletonCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

// 系统信息
const { navBarPaddingTop } = useSystemInfo()

// 筛选选项
const filterOptions = [
  { label: '全部', value: 'all' as FilterType },
  { label: '中式', value: '中式' as FilterType },
  { label: '日式', value: '日式' as FilterType },
  { label: '西式', value: '西式' as FilterType },
  { label: '韩式', value: '韩式' as FilterType }
]

// 状态
const activeFilter = ref<FilterType>('all')
const searchKeyword = ref('')
const recipes = ref<Recipe[]>([])
const featured = ref<Array<Recipe & { isFeatured?: boolean }>>([])
const loading = ref(false)
const loadingMore = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const error = ref<Error | null>(null)
const page = ref(1)
const pageSize = 10

// Header 高度（用于内容偏移）
const headerHeight = computed(() => {
  // 基础高度 + 搜索栏 + 筛选标签（预留足够空间避免遮挡）
  return '420rpx'
})

/**
 * 格式化数字
 */
function formatCount(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return String(num || 0)
}

/**
 * 加载数据
 */
async function loadData() {
  if (loading.value) return

  loading.value = true
  error.value = null
  page.value = 1

  try {
    const res = await getRecipeList(activeFilter.value, page.value, pageSize)
    recipes.value = res.list
    hasMore.value = res.hasMore
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('加载失败')
    console.error('加载菜谱失败:', err)
  } finally {
    loading.value = false
  }
}

/**
 * 加载精选推荐
 */
async function loadFeatured() {
  try {
    const res = await getFeaturedRecipes()
    featured.value = res
  } catch (err) {
    console.error('加载精选失败:', err)
    // 静默失败，不展示错误
  }
}

/**
 * 下拉刷新
 */
async function onRefresh() {
  refreshing.value = true
  page.value = 1
  
  try {
    const [recipeRes] = await Promise.all([
      getRecipeList(activeFilter.value, page.value, pageSize),
      loadFeatured()
    ])
    recipes.value = recipeRes.list
    hasMore.value = recipeRes.hasMore
  } catch (err) {
    console.error('刷新失败:', err)
  } finally {
    refreshing.value = false
  }
}

/**
 * 加载更多
 */
async function loadMore() {
  if (loadingMore.value || !hasMore.value || searchKeyword.value) return

  loadingMore.value = true

  try {
    const nextPage = page.value + 1
    const res = await getRecipeList(activeFilter.value, nextPage, pageSize)
    
    if (res.list.length > 0) {
      recipes.value = [...recipes.value, ...res.list]
      page.value = nextPage
    }
    
    hasMore.value = res.hasMore
  } catch (err) {
    console.error('加载更多失败:', err)
  } finally {
    loadingMore.value = false
  }
}

/**
 * 搜索
 */
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    loadData()
    return
  }

  loading.value = true
  error.value = null

  try {
    const res = await searchRecipes(searchKeyword.value)
    recipes.value = res
    hasMore.value = false
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('搜索失败')
    console.error('搜索失败:', err)
  } finally {
    loading.value = false
  }
}

/**
 * 清除搜索
 */
function clearSearch() {
  searchKeyword.value = ''
  loadData()
}

/**
 * 设置筛选
 */
function setFilter(filter: FilterType) {
  if (activeFilter.value === filter) return
  activeFilter.value = filter
  loadData()
}

/**
 * 跳转上传
 */
function goUpload() {
  uni.navigateTo({ url: '/pages/uploadRecipe/index' })
}

/**
 * 跳转详情
 */
function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/recipeDetail/index?id=${id}` })
}

// 初始化
onMounted(() => {
  loadData()
  loadFeatured()
})
</script>

<style scoped>
.square-page {
  min-height: 100vh;
  background: #F8F9FA;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 420rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
}

.nav-bar {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40rpx 20rpx;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.nav-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(0.95);
}

/* 搜索栏 */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 40rpx;
  padding: 20rpx 30rpx;
  margin: 0 30rpx 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.search-input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #333;
}

.clear-btn {
  padding: 10rpx;
  margin: -10rpx;
}

/* 筛选标签 */
.filter-scroll {
  white-space: nowrap;
  padding: 0 30rpx 20rpx;
}

.filter-list {
  display: inline-flex;
  gap: 16rpx;
}

.filter-item {
  display: inline-block;
  padding: 14rpx 32rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #555;
  transition: all 0.2s;
}

.filter-item.active {
  background: #FF6B35;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);
}

/* 内容区域 */
.content-scroll {
  height: 100vh;
}

/* 精选推荐 */
.featured-section {
  padding: 30rpx;
  padding-top: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 24rpx;
  color: #999;
}

.featured-scroll {
  white-space: nowrap;
  margin: 0 -30rpx;
  padding: 0 30rpx;
}

.featured-list {
  display: inline-flex;
  gap: 20rpx;
}

.featured-card {
  display: inline-block;
  width: 280rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.card-hover {
  transform: scale(0.98);
}

.featured-img-placeholder {
  width: 280rpx;
  height: 180rpx;
  background: linear-gradient(135deg, #FFF5EE, #FFE4D4);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.featured-emoji {
  font-size: 72rpx;
}

.featured-badge {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  background: linear-gradient(135deg, #FF6B35, #FF9E4D);
  color: #fff;
  font-size: 20rpx;
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.featured-info {
  padding: 16rpx;
}

.featured-name {
  display: block;
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.featured-stats {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.featured-count {
  font-size: 22rpx;
  color: #999;
}

/* 菜谱列表 */
.recipe-section {
  padding: 0 30rpx 30rpx;
}

.skeleton-list {
  padding: 20rpx 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
  text-align: center;
}

.empty-icon {
  margin-bottom: 30rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
  font-size: 28rpx;
  padding: 24rpx 80rpx;
  border-radius: 40rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
  transition: all 0.2s;
}

.empty-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.2);
}

.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.recipe-card {
  display: flex;
  background: #fff;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow:
    0 8rpx 32rpx rgba(0, 0, 0, 0.06),
    0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
  position: relative;
}

.recipe-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6rpx;
  background: linear-gradient(180deg, #FF9E4D, #FF6B35);
  border-radius: 28rpx 0 0 28rpx;
  opacity: 0.8;
}

.recipe-cover {
  width: 220rpx;
  height: 220rpx;
  position: relative;
  flex-shrink: 0;
  background: linear-gradient(145deg, #FFF8F5, #FFEDE6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-emoji {
  font-size: 88rpx;
  filter: drop-shadow(0 4rpx 12rpx rgba(0, 0, 0, 0.08));
}

.recipe-tag {
  position: absolute;
  top: 14rpx;
  left: 14rpx;
  background: rgba(255, 107, 53, 0.92);
  backdrop-filter: blur(4rpx);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 53, 0.25);
}

.tag-text {
  color: #fff;
  font-size: 20rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.recipe-content {
  flex: 1;
  padding: 28rpx 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.recipe-header {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.recipe-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.recipe-desc {
  font-size: 24rpx;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.recipe-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.recipe-author {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-shrink: 0;
}

.author-avatar {
  font-size: 30rpx;
}

.author-name {
  font-size: 22rpx;
  color: #555;
  font-weight: 500;
}

.recipe-stats {
  display: flex;
  gap: 20rpx;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #F8F8F8;
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
}

.stat-num {
  font-size: 20rpx;
  color: #777;
  font-weight: 500;
  min-width: 24rpx;
}

/* 加载更多 */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  gap: 12rpx;
}

.loading-dots {
  display: flex;
  gap: 8rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background: #FF6B35;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.load-text {
  font-size: 24rpx;
  color: #999;
}

.no-more {
  text-align: center;
  padding: 40rpx 0;
  font-size: 24rpx;
  color: #ccc;
}
</style>