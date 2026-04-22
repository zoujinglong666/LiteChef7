<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "toDayRecipes"
}
</route>

<template>
  <view class="recipe-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">今日推荐</text>
        <view class="nav-right" />
      </view>
    </view>

    <!-- 日期信息 -->
    <view class="date-section">
      <view class="date-header">
        <text class="chef-icon">👨‍🍳</text>
        <text class="date-title">为你推荐</text>
      </view>
      <text class="date-text">{{ formattedDate }} · {{ dayOfWeek }}</text>
      <text class="date-subtitle">精选美味搭配</text>
    </view>

    <!-- 菜谱列表 -->
    <view class="recipe-list">
      <view
        v-for="recipe in recipes"
        :key="recipe.id"
        class="recipe-card"
        @click="goDetail(recipe)"
      >
        <view class="recipe-cover">
          <text class="cover-emoji">{{ recipe.image }}</text>
          <view class="time-badge">
            <text class="time-text">{{ recipe.cookTime || '30分钟' }}</text>
          </view>
        </view>
        <view class="recipe-content">
          <text class="recipe-name">{{ recipe.name }}</text>
          <text class="recipe-desc">{{ recipe.description }}</text>
          <view class="recipe-tags">
            <text class="recipe-tag" v-for="(tag, i) in (recipe.tags || []).slice(0, 2)" :key="i">{{ tag }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 换一换按钮 -->
    <view class="shuffle-section">
      <button class="shuffle-btn" :disabled="isLoading" @click="handleShuffle">
        <wd-icon name="refresh" size="18px" :class="{ rotating: isLoading }" />
        <text>{{ isLoading ? '正在换菜...' : '换一换' }}</text>
      </button>
      <text class="shuffle-tip">每次为你推荐不同的美味组合</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getTodayRecipes, getRandomRecipes } from '@/utils/recipes'

const recipes = ref<any[]>([])
const isLoading = ref(false)

const dayOfWeek = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date().getDay()]
})

const formattedDate = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

onMounted(() => {
  recipes.value = getTodayRecipes(5)
})

function handleShuffle() {
  if (isLoading.value) return
  isLoading.value = true
  uni.vibrateShort()

  setTimeout(() => {
    recipes.value = getRandomRecipes(5)
    isLoading.value = false
    uni.showToast({ title: '已更新', icon: 'none' })
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
.recipe-page {
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

.date-section {
  text-align: center;
  padding: 40rpx 30rpx;
  margin-top: 200rpx;
}

.date-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.chef-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.date-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.date-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.date-subtitle {
  font-size: 24rpx;
  color: #999;
}

.recipe-list {
  padding: 0 30rpx;
}

.recipe-card {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.recipe-cover {
  position: relative;
  width: 100%;
  height: 300rpx;
  background: #FFF5E6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-emoji {
  font-size: 120rpx;
}

.time-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background: rgba(0,0,0,0.5);
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
}

.time-text {
  font-size: 22rpx;
  color: #fff;
}

.recipe-content {
  padding: 24rpx;
}

.recipe-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.recipe-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
  line-height: 1.5;
}

.recipe-tags {
  display: flex;
  gap: 12rpx;
}

.recipe-tag {
  font-size: 22rpx;
  color: #FF6B35;
  background: #FFF0E8;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
}

.shuffle-section {
  padding: 30rpx;
  text-align: center;
}

.shuffle-btn {
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

.shuffle-btn[disabled] {
  opacity: 0.6;
}

.shuffle-tip {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
