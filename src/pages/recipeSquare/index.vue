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
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar">
        <text class="nav-title">菜谱广场</text>
        <view class="nav-actions">
          <view class="action-btn" @click="goUpload">
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
          @confirm="handleSearch"
        />
      </view>
      
      <!-- 筛选标签 -->
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-list">
          <view 
            class="filter-item" 
            :class="{ active: activeFilter === 'all' }" 
            @click="setFilter('all')"
          >全部</view>
          <view 
            v-for="c in cuisines" 
            :key="c" 
            class="filter-item" 
            :class="{ active: activeFilter === c }" 
            @click="setFilter(c)"
          >{{ c }}</view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 精选推荐 -->
    <view class="featured-section" v-if="featured.length > 0 && !searchKeyword">
      <view class="section-header">
        <text class="section-title">🔥 精选推荐</text>
      </view>
      <scroll-view scroll-x class="featured-scroll">
        <view class="featured-list">
          <view 
            class="featured-card" 
            v-for="r in featured" 
            :key="r._id" 
            @click="goDetail(r._id)"
          >
            <image v-if="r.coverImage" :src="r.coverImage" class="featured-img" mode="aspectFill" />
            <view v-else class="featured-img-placeholder">
              <text class="featured-emoji">{{ r.coverImage || '🍳' }}</text>
            </view>
            <view class="featured-info">
              <text class="featured-name">{{ r.name }}</text>
              <view class="featured-stats">
                <wd-icon name="heart-filled" size="12px" color="#FF6B35" />
                <text class="featured-count">{{ r.stats?.likes || 0 }}</text>
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
        <text class="section-count">共 {{ recipes.length }} 个</text>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <wd-icon name="refresh" size="24px" color="#FF6B35" class="loading-icon" />
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="recipes.length === 0" class="empty-state">
        <wd-icon name="folder" size="48px" color="#CCC" />
        <text class="empty-title">还没有菜谱</text>
        <text class="empty-desc">成为第一个分享菜谱的人吧~</text>
        <button class="empty-btn" @click="goUpload">发布菜谱</button>
      </view>
      
      <!-- 列表 -->
      <view v-else class="recipe-list">
        <view 
          class="recipe-card" 
          v-for="r in recipes" 
          :key="r._id" 
          @click="goDetail(r._id)"
        >
          <!-- 封面 -->
          <view class="recipe-cover">
            <image v-if="r.coverImage?.startsWith('http')" :src="r.coverImage" class="cover-img" mode="aspectFill" />
            <text v-else class="cover-emoji">{{ r.coverImage || '🍳' }}</text>
            <view class="recipe-tag" v-if="r.cuisine">{{ r.cuisine }}</view>
          </view>
          
          <!-- 信息 -->
          <view class="recipe-content">
            <text class="recipe-name">{{ r.name }}</text>
            <text class="recipe-desc" v-if="r.description">{{ r.description }}</text>
            
            <!-- 作者 -->
            <view class="recipe-author">
              <text class="author-avatar">{{ r.authorInfo?.avatar || '👤' }}</text>
              <text class="author-name">{{ r.authorInfo?.nickname || '厨友' }}</text>
            </view>
            
            <!-- 统计 -->
            <view class="recipe-stats">
              <view class="stat-item">
                <wd-icon name="heart-filled" size="14px" color="#FF6B35" />
                <text>{{ r.stats?.likes || 0 }}</text>
              </view>
              <view class="stat-item">
                <wd-icon name="star-filled" size="14px" color="#FFD700" />
                <text>{{ r.stats?.favorites || 0 }}</text>
              </view>
              <view class="stat-item">
                <wd-icon name="chat" size="14px" color="#666" />
                <text>{{ r.stats?.comments || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
        <text class="load-more-text">加载更多</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getLocalUser } from '@/utils/auth'

const cuisines = ['中式', '日式', '西式', '韩式', '快手菜', '减脂餐']
const activeFilter = ref('all')
const searchKeyword = ref('')
const recipes = ref<any[]>([])
const featured = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

onMounted(() => {
  loadFeatured()
  loadRecipes()
})

async function loadFeatured() {
  try {
    const result = await uniCloud.callFunction({
      name: 'recipe-crud',
      data: { action: 'getFeatured' }
    }) as any
    
    if (result.result?.code === 200) {
      featured.value = result.result.data
    }
  } catch (error) {
    console.error('加载精选失败:', error)
  }
}

async function loadRecipes() {
  loading.value = true
  
  try {
    const filter: any = {}
    if (activeFilter.value !== 'all') {
      if (['中式', '日式', '西式', '韩式'].includes(activeFilter.value)) {
        filter.cuisine = activeFilter.value
      } else {
        filter.tags = activeFilter.value
      }
    }
    
    const result = await uniCloud.callFunction({
      name: 'recipe-crud',
      data: {
        action: 'getList',
        data: {
          page: page.value,
          pageSize: 10,
          filter
        }
      }
    }) as any
    
    if (result.result?.code === 200) {
      const list = result.result.data
      if (page.value === 1) {
        recipes.value = list
      } else {
        recipes.value.push(...list)
      }
      hasMore.value = list.length === 10
    }
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    loadRecipes()
    return
  }
  
  loading.value = true
  try {
    const result = await uniCloud.callFunction({
      name: 'recipe-crud',
      data: {
        action: 'search',
        data: { keyword: searchKeyword.value }
      }
    }) as any
    
    if (result.result?.code === 200) {
      recipes.value = result.result.data
      hasMore.value = false
    }
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

function setFilter(filter: string) {
  activeFilter.value = filter
  page.value = 1
  loadRecipes()
}

function loadMore() {
  page.value++
  loadRecipes()
}

function goUpload() {
  uni.navigateTo({ url: '/pages/uploadRecipe/index' })
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/recipeDetail/index?id=${id}` })
}
</script>

<style scoped>
.square-page { min-height: 100vh; background: #F8F9FA; }

.header { position: relative; overflow: hidden; }
.header-bg { position: absolute; top: 0; left: 0; right: 0; height: 320rpx; background: linear-gradient(135deg, #FF9E4D, #FF6B35); }
.nav-bar { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 100rpx 40rpx 20rpx; }
.nav-title { font-size: 36rpx; font-weight: bold; color: #fff; }
.nav-actions { display: flex; gap: 20rpx; }
.action-btn { width: 64rpx; height: 64rpx; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

.search-bar { position: relative; display: flex; align-items: center; background: #fff; border-radius: 40rpx; padding: 20rpx 30rpx; margin: 20rpx 30rpx; }
.search-input { flex: 1; margin-left: 16rpx; font-size: 28rpx; }

.filter-scroll { white-space: nowrap; padding: 0 30rpx; }
.filter-list { display: inline-flex; gap: 16rpx; }
.filter-item { display: inline-block; padding: 12rpx 28rpx; background: rgba(255,255,255,0.2); border-radius: 30rpx; font-size: 26rpx; color: #fff; }
.filter-item.active { background: #fff; color: #FF6B35; font-weight: bold; }

.featured-section { padding: 30rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.section-title { font-size: 32rpx; font-weight: bold; color: #333; }
.section-count { font-size: 24rpx; color: #999; }

.featured-scroll { white-space: nowrap; margin: 0 -30rpx; padding: 0 30rpx; }
.featured-list { display: inline-flex; gap: 20rpx; }
.featured-card { display: inline-block; width: 280rpx; background: #fff; border-radius: 20rpx; overflow: hidden; }
.featured-img { width: 280rpx; height: 180rpx; }
.featured-img-placeholder { width: 280rpx; height: 180rpx; background: #FFF5EE; display: flex; align-items: center; justify-content: center; }
.featured-emoji { font-size: 64rpx; }
.featured-info { padding: 16rpx; }
.featured-name { display: block; font-size: 26rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.featured-stats { display: flex; align-items: center; gap: 8rpx; }
.featured-count { font-size: 22rpx; color: #999; }

.recipe-section { padding: 0 30rpx 30rpx; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 100rpx 0; }
.loading-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.loading-text { font-size: 26rpx; color: #999; margin-top: 20rpx; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 100rpx 0; }
.empty-title { font-size: 32rpx; color: #666; margin: 30rpx 0 16rpx; }
.empty-desc { font-size: 26rpx; color: #999; margin-bottom: 40rpx; }
.empty-btn { background: linear-gradient(135deg, #FF9E4D, #FF6B35); color: #fff; font-size: 28rpx; padding: 20rpx 60rpx; border-radius: 40rpx; }

.recipe-list { display: flex; flex-direction: column; gap: 24rpx; }
.recipe-card { display: flex; background: #fff; border-radius: 20rpx; overflow: hidden; }
.recipe-cover { width: 200rpx; height: 200rpx; position: relative; flex-shrink: 0; }
.cover-img { width: 100%; height: 100%; }
.cover-emoji { width: 100%; height: 100%; background: #FFF5EE; display: flex; align-items: center; justify-content: center; font-size: 64rpx; }
.recipe-tag { position: absolute; top: 10rpx; left: 10rpx; background: rgba(255,107,53,0.9); color: #fff; font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 10rpx; }

.recipe-content { flex: 1; padding: 20rpx; display: flex; flex-direction: column; }
.recipe-name { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.recipe-desc { font-size: 24rpx; color: #999; margin-bottom: 12rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.recipe-author { display: flex; align-items: center; gap: 8rpx; margin-bottom: 12rpx; }
.author-avatar { font-size: 28rpx; }
.author-name { font-size: 22rpx; color: #666; }
.recipe-stats { display: flex; gap: 24rpx; }
.stat-item { display: flex; align-items: center; gap: 6rpx; font-size: 22rpx; color: #999; }

.load-more { text-align: center; padding: 40rpx; }
.load-more-text { font-size: 26rpx; color: #FF6B35; }
</style>
