<template>
  <view class="weekly-page">
    <view class="weekly-header">
      <text class="weekly-title">七天食谱</text>
      <text class="weekly-subtitle">每日为你推荐两道家常菜</text>
    </view>

    <swiper
      class="weekly-swiper"
      :current="currentIndex"
      @change="handleSwipe"
      circular
    >
      <swiper-item v-for="(day, index) in weeklyData" :key="index">
        <scroll-view scroll-y class="daily-scroll">
          <view class="day-info">
            <text class="day-title">{{ day.dateStr }}</text>
            <text class="day-subtitle">{{ day.weekday }}</text>
          </view>

          <view class="recipe-list">
            <view
              v-for="recipe in day.recipes"
              :key="recipe.id"
              class="recipe-card"
              @tap="handleRecipeClick(recipe.id)"
            >
              <view class="recipe-image-container">
                <image
                  :src="recipe.image"
                  mode="aspectFill"
                  class="recipe-image"
                />
                <view class="time-badge">
                  <text class="time-icon">🕐</text>
                  <text class="time-text">{{ recipe.cookTime }}</text>
                </view>
                <view class="image-overlay"></view>
              </view>

              <view class="recipe-content">
                <text class="recipe-name">{{ recipe.name }}</text>

                <view class="recipe-tags">
                  <text
                    v-for="(tag, i) in recipe.tags"
                    :key="i"
                    class="recipe-tag"
                  >{{ tag }}
                  </text>
                </view>

                <view class="recipe-meta">
                  <view class="difficulty-stars">
                    <text
                      v-for="i in 5"
                      :key="i"
                      class="star"
                      :class="{ 'star-filled': i <= recipe.difficulty }"
                    >★
                    </text>
                    <text class="difficulty-text">难度</text>
                  </view>
                  <text class="recipe-description">{{ recipe.description }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">

import {getFormattedDateOffset} from "@/utils/dateUtils";
import {getRandomRecipes, type Recipe} from '@/utils/recipes'

const currentIndex = ref(0)

function getDayOfWeekByOffset(offset = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return days[date.getDay()]
}

// 每天 2 道菜，共 7 天
const weeklyData = ref(
  Array.from({length: 7}).map((_, i) => {
    return {
      dateStr: getFormattedDateOffset(i),       // 偏移 i 天的日期
      weekday: getDayOfWeekByOffset(i),                 // 星期几
      recipes: getRandomRecipes(),               // 获取当天推荐的菜
    }
  })
)

const handleSwipe = (e: any) => {
  currentIndex.value = e.detail.current
}

const handleRecipeClick = (id: string) => {
  uni.navigateTo({url: `/pages/recipe-detail/index?id=${id}`})
}
</script>

<style scoped>
.weekly-page {
  height: 100vh;
  background: linear-gradient(135deg, #fef7f0 0%, #fdf2f8 100%);
}

.weekly-header {
  text-align: center;
  padding: 24px 16px 12px;
}

.weekly-title {
  font-size: 22px;
  font-weight: bold;
  color: #1e293b;
}

.weekly-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 6px;
}

.weekly-swiper {
  height: calc(100vh - 120px);
}

.daily-scroll {
  height: 100%;
  padding-bottom: 32px;
}

.day-info {
  text-align: center;
  padding: 16px 0;
}

.day-title {
  font-size: 20px;
  font-weight: bold;
  color: #1e293b;
}

.day-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 4px;
}

/* 以下为你已有的 recipe-card 样式 */
.recipe-list {
  padding: 0 16px;
}

.recipe-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.recipe-card:active {
  transform: scale(0.98);
}

.recipe-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.time-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
}

.time-icon {
  font-size: 14px;
  margin-right: 4px;
}

.time-text {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
}

.recipe-content {
  padding: 20px;
}

.recipe-name {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 12px;
  line-height: 1.3;
}

.recipe-tags {
  margin-bottom: 16px;
}

.recipe-tag {
  display: inline-block;
  background: linear-gradient(135deg, #fed7aa 0%, #fecaca 100%);
  color: #ea580c;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  margin-right: 8px;
  margin-bottom: 8px;
  border: 1px solid #fdba74;
}

.recipe-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.difficulty-stars {
  display: flex;
  align-items: center;
}

.star {
  font-size: 16px;
  color: #d1d5db;
  margin-right: 2px;
}

.star-filled {
  color: #fbbf24;
}

.difficulty-text {
  font-size: 14px;
  color: #64748b;
  margin-left: 4px;
}

.recipe-description {
  font-size: 14px;
  color: #94a3b8;
}

</style>
