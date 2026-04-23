<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "searchResults"
}
</route>

<template>
  <view class="search-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar" :style="{ paddingTop: capsuleBottomToTop + 'px' }">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">搜索</text>
        <view class="nav-right" />
      </view>

      <!-- 搜索栏 -->
      <view class="search-bar">
        <wd-icon name="search" size="16px" color="#999" />
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索菜谱、食材..."
          class="search-input"
          @confirm="handleSearch"
        />
        <view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
          <wd-icon name="close" size="14px" color="#999" />
        </view>
      </view>
    </view>

    <!-- 搜索状态 -->
    <view class="status-bar" v-if="searchKeyword">
      <text class="status-text">搜索"{{ searchKeyword }}"</text>
      <text class="result-count" v-if="!loading">找到 {{ recipes.length }} 个结果</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <wd-icon name="refresh" size="24px" color="#FF6B35" class="loading-icon" />
      <text class="loading-text">搜索中...</text>
    </view>

    <!-- 搜索结果 -->
    <view v-else-if="recipes.length > 0" class="recipe-list">
      <view
        class="recipe-item"
        v-for="r in recipes"
        :key="r.id"
        @click="goDetail(r)"
      >
        <view class="recipe-emoji">
          <text class="emoji-icon">{{ r.image }}</text>
        </view>
        <view class="recipe-content">
          <text class="recipe-name">{{ r.name }}</text>
          <text class="recipe-desc">{{ r.description }}</text>
          <view class="recipe-tags">
            <text class="recipe-tag" v-for="(t, i) in (r.tags || []).slice(0, 2)" :key="i">{{ t }}</text>
          </view>
        </view>
        <wd-icon name="chevron-right" size="16px" color="#CCC" />
      </view>
    </view>

    <!-- 无结果 -->
    <view v-else-if="searchKeyword && !loading" class="empty-state">
      <wd-icon name="search" size="48px" color="#CCC" />
      <text class="empty-title">未找到相关结果</text>
      <text class="empty-desc">试试其他关键词</text>
    </view>

    <!-- 默认状态 -->
    <view v-else class="default-state">
      <text class="default-icon">🍳</text>
      <text class="default-title">发现美味食谱</text>
      <text class="default-subtitle">搜索你想要的美食或食材</text>

      <!-- 热门搜索 -->
      <view class="hot-searches">
        <text class="hot-title">热门搜索</text>
        <view class="hot-tags">
          <text
            class="hot-tag"
            v-for="tag in hotKeywords"
            :key="tag"
            @click="searchHot(tag)"
          >{{ tag }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
const { capsuleBottomToTop } = useSystemInfo()

import { request } from '@/apis/serverApi'

const searchKeyword = ref('')
const recipes = ref<any[]>([])
const loading = ref(false)

const hotKeywords = ['红烧肉', '宫保鸡丁', '麻婆豆腐', '糖醋排骨', '鱼香肉丝', '西红柿鸡蛋']

onLoad((options: any) => {
  if (options.keyword) {
    searchKeyword.value = decodeURIComponent(options.keyword)
    handleSearch()
  }
})

async function handleSearch() {
  if (!searchKeyword.value.trim()) return

  loading.value = true
  try {
    const res = await request<any>(`/recipe/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
    if (res?.code === 200 && Array.isArray(res.data)) {
      recipes.value = res.data
    }
  } catch {
    // 静默降级
  } finally {
    loading.value = false
  }
}

function clearSearch() {
  searchKeyword.value = ''
  recipes.value = []
}

function searchHot(tag: string) {
  searchKeyword.value = tag
  handleSearch()
}

function goDetail(recipe: any) {
  if (recipe.id) {
    uni.navigateTo({ url: `/pages/recipeDetail/index?id=${recipe.id}` })
  } else {
    const data = encodeURIComponent(JSON.stringify(recipe))
    uni.navigateTo({ url: `/pages/recipeDetail/index?data=${data}` })
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #F8F9FA;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  overflow: visible;
  background: #F8F9FA;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 320rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  z-index: -1;
}

.nav-bar {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 40rpx 20rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.nav-right {
  width: 64rpx;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 40rpx;
  padding: 20rpx 30rpx;
  margin: 20rpx 30rpx;
}

.search-input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
}

.clear-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  margin-top: 340rpx;
}

.status-text {
  font-size: 28rpx;
  color: #333;
}

.result-count {
  font-size: 24rpx;
  color: #999;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 26rpx;
  color: #999;
  margin-top: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-title {
  font-size: 32rpx;
  color: #666;
  margin: 30rpx 0 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
}

.recipe-list {
  padding: 20rpx 30rpx;
}

.recipe-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.recipe-emoji {
  width: 100rpx;
  height: 100rpx;
  background: #FFF5E6;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.emoji-icon {
  font-size: 50rpx;
}

.recipe-content {
  flex: 1;
  min-width: 0;
}

.recipe-name {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-tags {
  display: flex;
  gap: 8rpx;
}

.recipe-tag {
  font-size: 20rpx;
  color: #FF6B35;
  background: #FFF0E8;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
}

.default-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  margin-top: 340rpx;
}

.default-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.default-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.default-subtitle {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.hot-searches {
  width: 100%;
}

.hot-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.hot-tag {
  padding: 16rpx 32rpx;
  background: #fff;
  color: #666;
  font-size: 26rpx;
  border-radius: 30rpx;
  border: 1rpx solid #e0e0e0;
}

.hot-tag:active {
  background: #FF6B35;
  color: #fff;
  border-color: #FF6B35;
}
</style>
