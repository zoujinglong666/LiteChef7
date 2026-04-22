<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "weekRecipes"
}
</route>

<template>
  <view class="week-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">每周食谱</text>
        <view class="nav-right" />
      </view>
    </view>

    <!-- 筛选区 -->
    <view class="filter-section">
      <view class="filter-row">
        <text class="filter-label">菜品数量</text>
        <view class="number-selector">
          <view class="number-btn" @click="decreaseCount">-</view>
          <text class="number-value">{{ recipeCount }}</text>
          <view class="number-btn" @click="increaseCount">+</view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-state">
      <wd-icon name="refresh" size="24px" color="#FF6B35" class="loading-icon" />
      <text class="loading-text">正在精心挑选美味食谱...</text>
    </view>

    <!-- 菜谱列表 -->
    <view v-else class="recipe-list">
      <view
        class="recipe-item"
        v-for="(item, index) in recommendList"
        :key="item.name + index"
        @click="goDetail(item)"
      >
        <view class="recipe-cover">
          <text class="cover-emoji">{{ item.image }}</text>
          <view class="weekday-badge">{{ item.weekday }}</view>
        </view>
        <view class="recipe-info">
          <text class="recipe-name">{{ item.name }}</text>
          <text class="recipe-ingredients">{{ (item.ingredients || []).join('、') }}</text>
        </view>
        <wd-icon name="chevron-right" size="16px" color="#CCC" />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer">
      <button class="generate-btn" :disabled="isLoading" @click="handleShuffle">
        <wd-icon name="refresh" size="18px" :class="{ rotating: isLoading }" />
        <text>{{ isLoading ? '加载中...' : '重新生成' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getTodayRecipes } from '@/utils/recipes'

const recommendList = ref<any[]>([])
const recipeCount = ref(7)
const isLoading = ref(false)

const weekMap = [
  { label: '周一', icon: '🌞' },
  { label: '周二', icon: '🍚' },
  { label: '周三', icon: '🍜' },
  { label: '周四', icon: '🥗' },
  { label: '周五', icon: '🍖' },
  { label: '周六', icon: '🍢' },
  { label: '周日', icon: '🥣' }
]

function getDailyRecipes(count: number) {
  const recipes = getTodayRecipes(count)
  return recipes.map((item, index) => ({
    ...item,
    weekday: index < weekMap.length
      ? `${weekMap[index].icon} ${weekMap[index].label}`
      : `${weekMap[index % 7].icon} 额外`
  }))
}

onMounted(() => {
  recommendList.value = getDailyRecipes(recipeCount.value)
})

function increaseCount() {
  if (recipeCount.value < 14) {
    recipeCount.value++
    handleShuffle()
  }
}

function decreaseCount() {
  if (recipeCount.value > 3) {
    recipeCount.value--
    handleShuffle()
  }
}

function handleShuffle() {
  if (isLoading.value) return
  isLoading.value = true
  setTimeout(() => {
    recommendList.value = getDailyRecipes(recipeCount.value)
    isLoading.value = false
  }, 800)
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
.week-page {
  min-height: 100vh;
  background: #F8F9FA;
  padding-bottom: 120rpx;
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

.filter-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin: 30rpx;
  margin-top: 230rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.number-selector {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.number-btn {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.number-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6B35;
  min-width: 40rpx;
  text-align: center;
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
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}

.recipe-list {
  padding: 0 30rpx;
}

.recipe-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.recipe-cover {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  background: #FFF5E6;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.cover-emoji {
  font-size: 60rpx;
}

.weekday-badge {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 18rpx;
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
}

.recipe-info {
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

.recipe-ingredients {
  display: block;
  font-size: 24rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 30rpx;
  background: #F8F9FA;
}

.generate-btn {
  width: 100%;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  padding: 28rpx;
  border-radius: 50rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.generate-btn[disabled] {
  opacity: 0.6;
}

.rotating {
  animation: spin 1s linear infinite;
}
</style>
