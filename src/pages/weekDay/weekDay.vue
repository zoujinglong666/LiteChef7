<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "weekDay"
}
</route>

<template>
  <view class="week-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar" :style="{ paddingTop: capsuleBottomToTop + 'px' }">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">七天食谱</text>
        <view class="nav-right" />
      </view>
      <text class="header-subtitle">每日为你推荐两道家常菜</text>
    </view>

    <!-- 日期选择 -->
    <view class="day-tabs">
      <view
        class="day-tab"
        :class="{ active: currentIndex === index }"
        v-for="(day, index) in weeklyData"
        :key="index"
        @click="currentIndex = index"
      >
        <text class="tab-weekday">{{ day.weekday }}</text>
        <text class="tab-date">{{ day.dateStr }}</text>
      </view>
    </view>

    <!-- 菜谱列表 -->
    <view class="recipe-section">
      <view class="section-title">{{ weeklyData[currentIndex]?.weekday }}推荐</view>

      <view
        class="recipe-card"
        v-for="recipe in weeklyData[currentIndex]?.recipes"
        :key="recipe.id"
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
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
const { capsuleBottomToTop } = useSystemInfo()

import { getRandomRecipes } from '@/utils/recipes'

const currentIndex = ref(0)

function getDayOfWeekByOffset(offset = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[date.getDay()]
}

function getDateStr(offset = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const weeklyData = ref(
  Array.from({ length: 7 }).map((_, i) => ({
    dateStr: getDateStr(i),
    weekday: getDayOfWeekByOffset(i),
    recipes: getRandomRecipes(2)
  }))
)

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
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  overflow: hidden;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
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

.header-subtitle {
  position: relative;
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: rgba(255,255,255,0.85);
  padding-bottom: 20rpx;
}

.day-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx 16rpx;
  gap: 8rpx;
  overflow-x: auto;
  margin: 20rpx 0;
  margin-top: 260rpx;
}

.day-tab {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #FFF0E8;
  border-radius: 16rpx;
  min-width: 80rpx;
}

.day-tab.active {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
}

.tab-weekday {
  font-size: 26rpx;
  font-weight: bold;
  color: #FF6B35;
  margin-bottom: 4rpx;
}

.day-tab.active .tab-weekday {
  color: #fff;
}

.tab-date {
  font-size: 20rpx;
  color: #FF9E4D;
}

.day-tab.active .tab-date {
  color: rgba(255,255,255,0.85);
}

.recipe-section {
  padding: 0 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
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
</style>
