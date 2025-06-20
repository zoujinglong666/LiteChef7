<template>
  <view class="recipe-page">
<!--    &lt;!&ndash; 自定义导航栏 &ndash;&gt;-->
<!--    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">-->
<!--      <view class="navbar-content">-->
<!--        <view class="navbar-left">-->
<!--          <view class="back-btn" @tap="handleBack">-->
<!--            <text class="icon-back">‹</text>-->
<!--          </view>-->
<!--        </view>-->
<!--        <view class="navbar-title">今日菜谱</view>-->
<!--        <view class="navbar-right">-->
<!--          <view class="more-btn" @tap="handleMore">-->
<!--            <text class="icon-more">⋯</text>-->
<!--          </view>-->
<!--        </view>-->
<!--      </view>-->
<!--    </view>-->

    <!-- 主要内容 -->
    <scroll-view class="main-content" scroll-y>
      <!-- 日期信息 -->
      <view class="date-section">
        <view class="date-header">
          <view class="chef-icon">👨‍🍳</view>
          <text class="date-title">为你推荐</text>
        </view>
        <text class="date-text">{{ formattedDate }} · {{ dayOfWeek }}</text>
        <text class="date-subtitle">精选美味搭配</text>
      </view>

      <!-- 菜谱卡片列表 -->
      <view class="recipe-list">
        <view
          v-for="(recipe, index) in recipes"
          :key="recipe.id"
          class="recipe-card"
          :class="{ 'loading': isLoading }"
          @tap="handleRecipeClick(recipe.id)"
        >
          <!-- 图片容器 -->
          <view class="recipe-image-container">
            <image
              :src="recipe.image"
              :alt="recipe.name"
              class="recipe-image"
              mode="aspectFill"
              :class="{ 'opacity-70': isLoading }"
            />
            <!-- 时间标签 -->
            <view class="time-badge">
              <text class="time-icon">🕐</text>
              <text class="time-text">{{ recipe.cookTime }}</text>
            </view>
            <!-- 渐变遮罩 -->
            <view class="image-overlay"></view>
          </view>

          <!-- 内容区域 -->
          <view class="recipe-content">
            <text class="recipe-name">{{ recipe.name }}</text>

            <!-- 标签 -->
            <view class="recipe-tags">
              <text
                v-for="(tag, tagIndex) in recipe.tags"
                :key="tagIndex"
                class="recipe-tag"
              >
                {{ tag }}
              </text>
            </view>

            <!-- 难度和描述 -->
            <view class="recipe-meta">
              <view class="difficulty-stars">
                <text
                  v-for="i in 5"
                  :key="i"
                  class="star"
                  :class="{ 'star-filled': i <= recipe.difficulty }"
                >
                  ★
                </text>
                <text class="difficulty-text">难度</text>
              </view>
              <text class="recipe-description">{{ recipe.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 换一换按钮 -->
      <view class="shuffle-section">
        <button
          class="shuffle-button"
          :class="{ 'loading': isLoading }"
          :disabled="isLoading"
          @tap="handleShuffle"
        >
          <text class="shuffle-icon" :class="{ 'rotating': isLoading }">🔄</text>
          <text class="shuffle-text">{{ isLoading ? '正在换菜...' : '换一换' }}</text>
        </button>
        <text class="shuffle-tip">每次为你推荐不同的美味组合</text>
      </view>

      <!-- 底部安全区域 -->
      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getTodayRecipes, getRandomRecipes, type Recipe } from '../../utils/recipes'
import { getDayOfWeek, getFormattedDate } from '../../utils/dateUtils'

const recipes = ref<Recipe[]>([])
const isLoading = ref(false)
const statusBarHeight = ref(0)

const dayOfWeek = computed(() => getDayOfWeek())
const formattedDate = computed(() => getFormattedDate())

const handleRecipeClick = (id: string) => {
  const recipe = recipes.value.find(r => r.id === id)
  console.log(`跳转到菜谱详情页: ${recipe?.name}`)

  // UniApp 路由跳转
  uni.navigateTo({
    url: `/pages/recipe-detail/index?id=${id}`
  })
}

const handleShuffle = () => {
  if (isLoading.value) return

  isLoading.value = true

  // 添加触觉反馈
  uni.vibrateShort()

  setTimeout(() => {
    recipes.value = getRandomRecipes(2)
    isLoading.value = false
  }, 800)
}

const handleBack = () => {
  console.log('返回上一页')
  uni.navigateBack()
}

const handleMore = () => {
  console.log('更多选项')
  uni.showActionSheet({
    itemList: ['分享给朋友', '收藏菜谱', '设置提醒'],
    success: (res) => {
      console.log('选中了第' + (res.tapIndex + 1) + '个按钮')
    }
  })
}

onMounted(() => {
  // 获取系统信息
  uni.getSystemInfo({
    success: (res) => {
      statusBarHeight.value = res.statusBarHeight || 0
    }
  })

  // 初始化菜谱数据
  recipes.value = getTodayRecipes()
})
</script>

<style scoped>
.recipe-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7f0 0%, #fdf2f8 100%);
}

/* 导航栏样式 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f1f5f9;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
}

.navbar-left,
.navbar-right {
  width: 40px;
  display: flex;
  justify-content: center;
}

.back-btn,
.more-btn {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.back-btn:active,
.more-btn:active {
  background: #e2e8f0;
  transform: scale(0.95);
}

.icon-back {
  font-size: 24px;
  font-weight: bold;
  color: #475569;
}

.icon-more {
  font-size: 20px;
  color: #475569;
}

.navbar-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

/* 主要内容 */
/*padding-top: 88px; /* 状态栏 + 导航栏高度 */
.main-content {
  height: 100vh;
}

/* 日期信息 */
.date-section {
  text-align: center;
  padding: 24px 16px;
}

.date-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.chef-icon {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 16px;
}

.date-title {
  font-size: 20px;
  font-weight: bold;
  color: #1e293b;
}

.date-text {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 4px;
}

.date-subtitle {
  font-size: 14px;
  color: #94a3b8;
}

/* 菜谱列表 */
.recipe-list {
  padding: 0 16px;
  margin-bottom: 32px;
}

.recipe-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.recipe-card:active {
  transform: scale(0.98);
}

.recipe-card.loading {
  opacity: 0.7;
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

/* 内容区域 */
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

/* 换一换按钮 */
.shuffle-section {
  padding: 0 16px;
  text-align: center;
}

.shuffle-button {
  width: 100%;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  font-size: 18px;
  font-weight: 600;
  padding: 16px;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  margin-bottom: 12px;
}

.shuffle-button:active {
  transform: scale(0.98);
}

.shuffle-button.loading {
  opacity: 0.7;
}

.shuffle-icon {
  font-size: 20px;
  margin-right: 8px;
  transition: transform 0.3s;
}

.shuffle-icon.rotating {
  animation: rotate 1s linear infinite;
}

.shuffle-text {
  font-size: 18px;
  font-weight: 600;
}

.shuffle-tip {
  font-size: 14px;
  color: #94a3b8;
}

.safe-area-bottom {
  height: 32px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
