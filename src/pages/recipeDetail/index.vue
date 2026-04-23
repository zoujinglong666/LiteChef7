<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "recipeDetail"
}
</route>

<template>
  <view class="detail-page">
    <!-- 顶部英雄区 -->
    <view class="hero">
      <view class="hero-bg" />
      <view class="hero-bg-2" />
      <!-- 返回按钮 -->
      <view class="nav-bar" :style="{ paddingTop: capsuleBottomToTop + 'px' }">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <view class="nav-actions">
          <view class="fav-icon" @click="toggleFav">
            <wd-icon :name="isFaved ? 'heart-filled' : 'heart'" size="24px" :color="isFaved ? '#FF6B35' : '#fff'" />
          </view>
        </view>
      </view>
      <!-- 菜谱主图 -->
      <view class="hero-emoji-wrap">
        <text class="hero-emoji">{{ recipe.emoji || recipe.coverImage || '🍳' }}</text>
      </view>
      <view class="hero-info">
        <text class="hero-name">{{ recipe.name }}</text>
        <text class="hero-desc">{{ recipe.description }}</text>
        <view class="hero-tags">
          <text class="hero-tag" v-for="t in recipe.tags" :key="t">{{ t }}</text>
          <text class="hero-tag tag-cuisine" v-if="recipe.cuisine">{{ recipe.cuisine }}</text>
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="content">

      <!-- 信息卡片：难度、时间、热度 -->
      <view class="info-cards" v-if="recipe.difficulty || recipe.cookTime || (recipe.likes != null) || (recipe.favorites != null)">
        <view class="info-card" v-if="recipe.difficulty">
          <text class="info-card-icon">📊</text>
          <text class="info-card-label">难度</text>
          <text class="info-card-value">{{ recipe.difficulty }}</text>
        </view>
        <view class="info-card" v-if="recipe.cookTime">
          <text class="info-card-icon">⏱️</text>
          <text class="info-card-label">用时</text>
          <text class="info-card-value">{{ recipe.cookTime }}</text>
        </view>
        <view class="info-card" v-if="(recipe.likes != null) || (recipe.favorites != null)">
          <text class="info-card-icon">👁️</text>
          <text class="info-card-label">热度</text>
          <text class="info-card-value">{{ formatCount((recipe.likes || 0) + (recipe.favorites || 0)) }}</text>
        </view>
      </view>

      <!-- 作者信息 -->
      <view class="author-card" v-if="recipe.authorName">
        <view class="author-left">
          <text class="author-card-avatar">{{ recipe.authorAvatar || '👤' }}</text>
          <view class="author-card-info">
            <text class="author-card-name">{{ recipe.authorName }}</text>
            <text class="author-card-date">{{ recipe.createTime }}</text>
          </view>
        </view>
        <view class="author-stats">
          <view class="author-stat">
            <wd-icon name="heart-filled" size="12px" color="#FF6B35" />
            <text>{{ formatCount(recipe.likes) }}</text>
          </view>
          <view class="author-stat">
            <wd-icon name="star-filled" size="12px" color="#FFB800" />
            <text>{{ formatCount(recipe.favorites) }}</text>
          </view>
        </view>
      </view>

      <!-- 食材清单 -->
      <view class="section" v-if="recipe.ingredients && recipe.ingredients.length">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-icon">🛒</text>
            <text class="section-title">食材清单</text>
          </view>
          <text class="section-count">{{ recipe.ingredients.length }} 种</text>
        </view>
        <view class="ingredients-grid">
          <view class="ingredient-item" v-for="(ing, i) in recipe.ingredients" :key="i">
            <view class="ing-check">
              <view class="ing-check-dot" />
            </view>
            <view class="ing-body">
              <text class="ing-name">{{ ing.name || ing }}</text>
              <text class="ing-amount" v-if="ing.amount">{{ ing.amount }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 烹饪步骤 -->
      <view class="section" v-if="recipe.steps && recipe.steps.length">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-icon">👨‍🍳</text>
            <text class="section-title">烹饪步骤</text>
          </view>
          <text class="section-count">{{ recipe.steps.length }} 步</text>
        </view>
        <view class="steps-list">
          <view class="step-item" v-for="(step, i) in recipe.steps" :key="i">
            <view class="step-left">
              <view class="step-num-wrap">
                <text class="step-num">{{ i + 1 }}</text>
              </view>
              <view class="step-line" v-if="i < recipe.steps.length - 1" />
            </view>
            <view class="step-content">
              <text class="step-text">{{ step.content || step }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 小贴士 -->
      <view class="tips-box" v-if="recipe.tips">
        <view class="tips-header">
          <view class="tips-icon-wrap">💡</view>
          <text class="tips-title">厨师小贴士</text>
        </view>
        <text class="tips-text">{{ recipe.tips }}</text>
      </view>

      <!-- 适合场景 -->
      <view class="scene-box" v-if="recipe.suitableScene">
        <view class="scene-header">
          <view class="scene-icon-wrap">✨</view>
          <text class="scene-title">为什么适合你</text>
        </view>
        <text class="scene-text">{{ recipe.suitableScene }}</text>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-actions">
        <view class="btn-fav" :class="{ faved: isFaved }" @click="toggleFav">
          <view class="btn-icon-wrap">
            <wd-icon :name="isFaved ? 'heart-filled' : 'heart'" size="18px" :color="isFaved ? '#fff' : '#FF6B35'" />
          </view>
          <text class="btn-text">{{ isFaved ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="btn-share" @click="shareRecipe">
          <view class="btn-icon-wrap share-icon-wrap">
            <wd-icon name="share" size="18px" color="#fff" />
          </view>
          <text class="btn-text">分享</text>
        </view>
      </view>

      <view class="bottom-placeholder" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
import { addFavorite, removeFavorite, getFavorites } from '@/utils/auth'
import { getRecipeDetail, favoriteRecipe } from '@/apis'
interface DetailRecipe {
  id?: number
  name: string
  description?: string
  cuisine?: string
  difficulty?: string
  cookTime?: string
  coverImage?: string
  emoji?: string
  image?: string
  likes?: number
  favorites?: number
  authorName?: string
  authorAvatar?: string
  createTime?: string
  ingredients?: any[]
  steps?: any[]
  tips?: string
  suitableScene?: string
  mood?: string
  tags?: string[]
  weather?: string
}

const recipe = ref<DetailRecipe>({ name: '' })
const isFaved = ref(false)
const loading = ref(true)
const error = ref(false)
const { capsuleBottomToTop } = useSystemInfo()

onLoad((query: any) => {
  const id = query.id ? Number(query.id) : 0
  if (id) {
    loadDetail(id)
  } else if (query.data) {
    try {
      recipe.value = JSON.parse(decodeURIComponent(query.data))
      loading.value = false
      checkFav()
    } catch {
      error.value = true
      loading.value = false
    }
  } else {
    error.value = true
    loading.value = false
  }
})

async function loadDetail(id: number) {
  loading.value = true
  error.value = false
  try {
    const res = await getRecipeDetail(id)
    recipe.value = res
    checkFav()
  } catch (err) {
    // #ifdef DEBUG
    console.error('加载详情失败:', err)
    // #endif
    error.value = true
  } finally {
    loading.value = false
  }
}

function checkFav() {
  const favs = getFavorites()
  isFaved.value = favs.some((f: any) => f.name === recipe.value.name)
}

async function toggleFav() {
  if (isFaved.value) {
    removeFavorite(recipe.value.name)
    isFaved.value = false
    uni.showToast({ title: '已取消收藏', icon: 'none' })
  } else {
    addFavorite({
      name: recipe.value.name,
      image: recipe.value.emoji || recipe.value.coverImage,
      ingredients: recipe.value.ingredients,
      steps: recipe.value.steps,
      tips: recipe.value.tips,
      suitableScene: recipe.value.suitableScene,
      mood: recipe.value.mood
    })
    isFaved.value = true
    uni.showToast({ title: '已收藏', icon: 'success' })
    if (recipe.value.id) {
      try { await favoriteRecipe(recipe.value.id) } catch {}
    }
  }
}

function shareRecipe() {
  const steps = (recipe.value.steps || []).map((s: any, i: number) => {
    const text = typeof s === 'string' ? s : s.content || ''
    return `${i+1}. ${text}`
  }).join('\n')
  const ingredients = (recipe.value.ingredients || []).map((ing: any) => {
    return typeof ing === 'string' ? ing : ing.name || ''
  }).join('、')
  const text = `【${recipe.value.name}】\n${recipe.value.description}\n\n食材：${ingredients}\n\n步骤：\n${steps}`
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: '已复制到剪贴板', icon: 'none' })
  })
}

function goBack() {
  uni.navigateBack()
}

function formatCount(num: number): string {
  if (!num) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return String(num)
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #FFFAF6;
}

/* 英雄区 */
.hero {
  position: relative;
  background: linear-gradient(160deg, #FF9E4D 0%, #FF6B35 100%);
  padding-bottom: 60rpx;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  bottom: -80rpx;
  left: -80rpx;
  width: 360rpx;
  height: 360rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
}

.hero-bg-2 {
  position: absolute;
  top: -40rpx;
  right: -40rpx;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255,255,255,0.06);
  border-radius: 50%;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 40rpx 20rpx;
  position: relative;
  z-index: 10;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4rpx);
}

.nav-actions { display: flex; gap: 20rpx; }
.fav-icon {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4rpx);
}

.hero-emoji-wrap {
  display: flex;
  justify-content: center;
  margin: 10rpx 0 30rpx;
  position: relative;
  z-index: 10;
}

.hero-emoji {
  font-size: 140rpx;
  filter: drop-shadow(0 12rpx 30rpx rgba(0,0,0,0.2));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

.hero-info {
  padding: 0 50rpx;
  text-align: center;
  position: relative;
  z-index: 10;
}

.hero-name {
  display: block;
  font-size: 48rpx;
  font-weight: 800;
  color: #fff;
  margin-bottom: 14rpx;
  text-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.hero-desc {
  display: block;
  font-size: 26rpx;
  color: rgba(255,255,255,0.9);
  margin-bottom: 24rpx;
  line-height: 1.5;
}

.hero-tags {
  display: flex;
  justify-content: center;
  gap: 14rpx;
  flex-wrap: wrap;
}

.hero-tag {
  font-size: 22rpx;
  color: #FF6B35;
  background: rgba(255,255,255,0.95);
  padding: 8rpx 22rpx;
  border-radius: 30rpx;
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
}

.hero-tag.tag-cuisine {
  background: linear-gradient(135deg, #fff, #FFF0E8);
}

/* 内容区 */
.content {
  margin-top: -40rpx;
  background: #FFFAF6;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx 30rpx 0;
  position: relative;
  z-index: 20;
}

/* 信息卡片 */
.info-cards {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.info-card {
  flex: 1;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.info-card-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.info-card-label {
  font-size: 22rpx;
  color: #999;
}

.info-card-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
}

/* 作者卡片 */
.author-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.author-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.author-card-avatar {
  font-size: 48rpx;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF5EE, #FFE4D4);
  border-radius: 50%;
}

.author-card-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.author-card-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.author-card-date {
  font-size: 22rpx;
  color: #aaa;
}

.author-stats {
  display: flex;
  gap: 16rpx;
}

.author-stat {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #F8F8F8;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
}

/* 通用 section */
.section {
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-icon { font-size: 36rpx; }
.section-title { font-size: 32rpx; font-weight: 700; color: #333; }
.section-count {
  font-size: 24rpx;
  color: #FF6B35;
  background: linear-gradient(135deg, #FFF5EE, #FFF0E8);
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  font-weight: 600;
}

/* 食材网格 */
.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  background: linear-gradient(135deg, #FFFAF6, #FFF5EE);
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 107, 53, 0.06);
}

.ing-check {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #FF6B35;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ing-check-dot {
  width: 16rpx;
  height: 16rpx;
  background: #FF6B35;
  border-radius: 50%;
}

.ing-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  min-width: 0;
}

.ing-name {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ing-amount {
  font-size: 22rpx;
  color: #FF6B35;
  font-weight: 500;
}

/* 步骤列表 */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.step-item {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
}

.step-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 56rpx;
  flex-shrink: 0;
}

.step-num-wrap {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.3);
}

.step-num {
  font-size: 26rpx;
  font-weight: 700;
  color: #fff;
}

.step-line {
  width: 2rpx;
  flex: 1;
  min-height: 40rpx;
  background: linear-gradient(180deg, #FFD4C2, transparent);
  margin: 8rpx 0;
}

.step-content {
  flex: 1;
  background: linear-gradient(135deg, #FFFAF6, #FFF8F5);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border: 1rpx solid rgba(255, 107, 53, 0.06);
}

.step-text {
  font-size: 28rpx;
  color: #444;
  line-height: 1.7;
}

/* 贴士 */
.tips-box {
  background: linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%);
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  position: relative;
  overflow: hidden;
}

.tips-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6rpx;
  height: 100%;
  background: linear-gradient(180deg, #FFD600, #FFB300);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.tips-icon-wrap {
  font-size: 32rpx;
  width: 52rpx;
  height: 52rpx;
  background: rgba(255, 214, 0, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tips-title { font-size: 30rpx; font-weight: 700; color: #555; }
.tips-text { font-size: 28rpx; color: #666; line-height: 1.7; }

/* 场景 */
.scene-box {
  background: linear-gradient(135deg, #F3E5F5 0%, #EDE7F6 100%);
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  position: relative;
  overflow: hidden;
}

.scene-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6rpx;
  height: 100%;
  background: linear-gradient(180deg, #AB47BC, #7B1FA2);
}

.scene-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.scene-icon-wrap {
  font-size: 32rpx;
  width: 52rpx;
  height: 52rpx;
  background: rgba(171, 71, 188, 0.12);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scene-title { font-size: 30rpx; font-weight: 700; color: #555; }
.scene-text { font-size: 28rpx; color: #666; line-height: 1.7; }

/* 底部操作 */
.bottom-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 10rpx;
  margin-bottom: 20rpx;
}

.btn-fav, .btn-share {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  font-size: 28rpx;
  font-weight: 600;
  padding: 22rpx 0;
  border-radius: 40rpx;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.btn-fav {
  background: #fff;
  color: #333;
}

.btn-fav.faved {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
  box-shadow: 0 6rpx 24rpx rgba(255, 107, 53, 0.35);
}

.btn-share {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
  box-shadow: 0 6rpx 24rpx rgba(255, 107, 53, 0.35);
}

.btn-icon-wrap {
  width: 44rpx;
  height: 44rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.faved .btn-icon-wrap {
  background: rgba(255, 255, 255, 0.2);
}

.share-icon-wrap {
  background: rgba(255, 255, 255, 0.2);
}

.btn-text {
  line-height: 1;
}

.bottom-placeholder { height: 60rpx; }
</style>
