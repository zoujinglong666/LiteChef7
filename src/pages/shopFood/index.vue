<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "shopFood"
}
</route>

<template>
  <view class="shop-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">逛菜</text>
        <view class="nav-right" />
      </view>
    </view>

    <!-- 菜谱列表 -->
    <view class="recipe-section">
      <view v-if="loading" class="loading-state">
        <wd-icon name="refresh" size="24px" color="#FF6B35" class="loading-icon" />
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="recipes.length === 0" class="empty-state">
        <wd-icon name="folder" size="48px" color="#CCC" />
        <text class="empty-title">暂无菜谱</text>
        <text class="empty-desc">去菜谱广场看看吧~</text>
      </view>

      <view v-else class="recipe-grid">
        <view
          class="recipe-card"
          v-for="r in recipes"
          :key="r.id"
          @click="goDetail(r)"
        >
          <view class="card-cover">
            <text class="cover-emoji">{{ r.image }}</text>
          </view>
          <view class="card-content">
            <text class="card-name">{{ r.name }}</text>
            <text class="card-desc">{{ r.description }}</text>
            <view class="card-tags">
              <text class="card-tag" v-for="(t, i) in (r.tags || []).slice(0, 2)" :key="i">{{ t }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { request } from '@/apis/serverApi'

const recipes = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  loadRecipes()
})

async function loadRecipes() {
  loading.value = true
  try {
    const res = await request<any>('/recipe/list')
    if (res?.code === 200 && res.data?.list) {
      recipes.value = res.data.list
    }
  } catch {
    // 静默降级
  } finally {
    loading.value = false
  }
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
.shop-page {
  min-height: 100vh;
  background: #F8F9FA;
}

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
  height: 200rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
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

.recipe-section {
  padding: 30rpx;
  padding-top: 200rpx;
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

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.recipe-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06);
}

.card-cover {
  width: 100%;
  height: 200rpx;
  background: #FFF5E6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-emoji {
  font-size: 80rpx;
}

.card-content {
  padding: 20rpx;
}

.card-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-tags {
  display: flex;
  gap: 8rpx;
}

.card-tag {
  font-size: 18rpx;
  color: #FF6B35;
  background: #FFF0E8;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
}
</style>
