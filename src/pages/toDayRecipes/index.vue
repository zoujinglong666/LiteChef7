<route lang="json">
{
"style": { "navigationBarTitleText": "今日推荐" },
"name": "toDayRecipes"
}
</route>
<template>
  <view class="recipe-page">
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
          <text class="shuffle-icon  sn-icon-park-outline:refresh" :class="{ 'rotating': isLoading }" >
          </text>
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
import { getTodayRecipes, getRandomRecipes, type Recipe } from '@/utils/recipes'
import { getDayOfWeek, getFormattedDate } from '@/utils/dateUtils'
const recipes = ref<Recipe[]>([])
const isLoading = ref(false)
const statusBarHeight = ref(0)

const dayOfWeek = computed(() => getDayOfWeek())
const formattedDate = computed(() => getFormattedDate())

const handleRecipeClick = (id: string) => {
  const recipe = recipes.value.find(r => r.id === id)
  console.log(`跳转到菜谱详情页: ${recipe?.name}`)

  // 使用recipe.url跳转到下厨房页面
  if (recipe) {
    const recipeUrl = allRecipesData.find(item => item.url.includes(id))?.url
    if (recipeUrl) {
      uni.navigateTo({
        url: `/pages/recipeDetail/index?url=${encodeURIComponent(recipeUrl)}`
      })
    } else {
      uni.showToast({
        title: '菜谱链接不存在',
        icon: 'none'
      })
    }
  }
}

const handleShuffle = () => {
  if (isLoading.value) return

  isLoading.value = true

  // 添加触觉反馈
  uni.vibrateShort()

  setTimeout(() => {
    recipes.value = getRandomRecipes(2)
    isLoading.value = false

    // 添加提示
    uni.showToast({
      title: '已为您更新菜谱',
      icon: 'none'
    })
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
/* 菜谱列表 */
.recipe-list {
  padding: 0 12px;
  margin-bottom: 24px;
}

.recipe-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 12px;
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
  aspect-ratio: 16 / 10; /* 稍微调整比例 */
  overflow: hidden;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.time-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
}

.time-icon {
  font-size: 12px;
  margin-right: 3px;
}

.time-text {
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.25));
}

/* 内容区域 */
.recipe-content {
  padding: 14px;
}

.recipe-name {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 8px;
  line-height: 1.3;
}

.recipe-tags {
  margin-bottom: 10px;
}

.recipe-tag {
  display: inline-block;
  background: linear-gradient(135deg, #fed7aa 0%, #fecaca 100%);
  color: #ea580c;
  font-size: 10px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  margin-right: 6px;
  margin-bottom: 6px;
  border: 1px solid rgba(253, 186, 116, 0.5);
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
  font-size: 14px;
  color: #d1d5db;
  margin-right: 1px;
}

.star-filled {
  color: #fbbf24;
}

.difficulty-text {
  font-size: 12px;
  color: #64748b;
  margin-left: 3px;
}

.recipe-description {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
  margin-top: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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
  font-size: 16px;
  font-weight: 600;
  padding: 8px;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.shuffle-button:active {
  transform: scale(0.98);
}

.shuffle-button.loading {
  opacity: 0.7;
}

.shuffle-icon {
  margin-right: 8px;
  color: white;
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
