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
      <!-- 返回按钮 -->
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <view class="nav-actions">
          <text class="fav-icon" @click="toggleFav">{{ isFaved ? '<text class="sn-i-[icon-park-outline-like]" style="color:#FF6B35"></text>' : '<text class="sn-i-[icon-park-outline-like]"></text>' }}</text>
        </view>
      </view>
      <!-- 菜谱主图 -->
      <view class="hero-emoji-wrap">
        <text class="hero-emoji">{{ recipe.image }}</text>
      </view>
      <view class="hero-info">
        <text class="hero-name">{{ recipe.name }}</text>
        <text class="hero-desc">{{ recipe.description }}</text>
        <view class="hero-tags">
          <text class="hero-tag" v-for="t in recipe.tags" :key="t">{{ t }}</text>
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="content">

      <!-- 菜式 & 心情 -->
      <view class="meta-row" v-if="recipe.cuisine || recipe.mood">
        <view class="meta-item" v-if="recipe.cuisine">
          <text class="meta-icon">🍽️</text>
          <text class="meta-label">{{ recipe.cuisine }}</text>
        </view>
        <view class="meta-item" v-if="recipe.mood">
          <text class="meta-icon">💭</text>
          <text class="meta-label">适合{{ recipe.mood }}时</text>
        </view>
        <view class="meta-item" v-if="recipe.weather">
          <wd-icon name="cloud" size="14px" class="meta-icon" />
          <text class="meta-label">{{ recipe.weather }}天推荐</text>
        </view>
      </view>

      <!-- 食材清单 -->
      <view class="section" v-if="recipe.ingredients && recipe.ingredients.length">
        <view class="section-header">
          <text class="section-icon">🛒</text>
          <text class="section-title">食材清单</text>
          <text class="section-count">{{ recipe.ingredients.length }} 种</text>
        </view>
        <view class="ingredients-grid">
          <view class="ingredient-item" v-for="(ing, i) in recipe.ingredients" :key="i">
            <text class="ing-dot">·</text>
            <text class="ing-text">{{ ing }}</text>
          </view>
        </view>
      </view>

      <!-- 烹饪步骤 -->
      <view class="section" v-if="recipe.steps && recipe.steps.length">
        <view class="section-header">
          <text class="section-icon">👨‍🍳</text>
          <text class="section-title">烹饪步骤</text>
          <text class="section-count">{{ recipe.steps.length }} 步</text>
        </view>
        <view class="steps-list">
          <view class="step-item" v-for="(step, i) in recipe.steps" :key="i">
            <view class="step-num-wrap">
              <text class="step-num">{{ i + 1 }}</text>
            </view>
            <view class="step-content">
              <text class="step-text">{{ step }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 小贴士 -->
      <view class="tips-box" v-if="recipe.tips">
        <view class="tips-header">
          <wd-icon name="info-circle" size="14px" class="tips-icon" />
          <text class="tips-title">厨师小贴士</text>
        </view>
        <text class="tips-text">{{ recipe.tips }}</text>
      </view>

      <!-- 适合场景 -->
      <view class="scene-box" v-if="recipe.suitableScene">
        <view class="scene-header">
          <wd-icon name="star" size="14px" class="scene-icon" />
          <text class="scene-title">为什么适合你</text>
        </view>
        <text class="scene-text">{{ recipe.suitableScene }}</text>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-actions">
        <button class="btn-fav" :class="{ faved: isFaved }" @click="toggleFav">
          {{ isFaved ? '<text class="sn-i-[icon-park-outline-like]" style="color:#FF6B35"></text> 已收藏' : '<text class="sn-i-[icon-park-outline-like]"></text> 收藏菜谱' }}
        </button>
        <button class="btn-share" @click="shareRecipe">
          <text class="sn-i-[icon-park-outline-share]"></text> 分享
        </button>
      </view>

      <view class="bottom-placeholder" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { addFavorite, removeFavorite, getFavorites } from '@/utils/auth'

const recipe = ref<any>({})
const isFaved = ref(false)

onLoad((query: any) => {
  if (query.data) {
    try {
      recipe.value = JSON.parse(decodeURIComponent(query.data))
    } catch {
      recipe.value = {}
    }
  }
  checkFav()
})

function checkFav() {
  const favs = getFavorites()
  isFaved.value = favs.some((f: any) => f.name === recipe.value.name)
}

function toggleFav() {
  if (isFaved.value) {
    removeFavorite(recipe.value.name)
    isFaved.value = false
    uni.showToast({ title: '已取消收藏', icon: 'none' })
  } else {
    addFavorite({
      name: recipe.value.name,
      image: recipe.value.image,
      ingredients: recipe.value.ingredients,
      steps: recipe.value.steps,
      tips: recipe.value.tips,
      suitableScene: recipe.value.suitableScene,
      mood: recipe.value.mood
    })
    isFaved.value = true
    uni.showToast({ title: '已收藏 <text class="sn-i-[icon-park-outline-like]" style="color:#FF6B35"></text>', icon: 'none' })
  }
}

function shareRecipe() {
  const steps = (recipe.value.steps || []).map((s: string, i: number) => `${i+1}. ${s}`).join('\n')
  const text = `【${recipe.value.name}】\n${recipe.value.description}\n\n食材：${(recipe.value.ingredients || []).join('、')}\n\n步骤：\n${steps}`
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: '已复制到剪贴板', icon: 'none' })
  })
}

function goBack() {
  uni.navigateBack()
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
  padding-bottom: 50rpx;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  bottom: -60rpx;
  left: -60rpx;
  width: 300rpx;
  height: 300rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 40rpx 20rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 52rpx;
  color: #fff;
  font-weight: bold;
  line-height: 1;
  margin-top: -4rpx;
}

.nav-actions { display: flex; gap: 20rpx; }
.fav-icon { font-size: 48rpx; }

.hero-emoji-wrap {
  display: flex;
  justify-content: center;
  margin: 20rpx 0 30rpx;
}

.hero-emoji {
  font-size: 160rpx;
  filter: drop-shadow(0 8rpx 20rpx rgba(0,0,0,0.15));
}

.hero-info {
  padding: 0 50rpx;
  text-align: center;
}

.hero-name {
  display: block;
  font-size: 52rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.hero-desc {
  display: block;
  font-size: 28rpx;
  color: rgba(255,255,255,0.85);
  margin-bottom: 24rpx;
}

.hero-tags {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.hero-tag {
  font-size: 22rpx;
  color: #FF6B35;
  background: rgba(255,255,255,0.9);
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  font-weight: 500;
}

/* 内容区 */
.content {
  margin-top: -30rpx;
  background: #FFFAF6;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx 30rpx 0;
}

/* meta 行 */
.meta-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #fff;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}

.meta-icon { font-size: 28rpx; }
.meta-label { font-size: 24rpx; color: #666; }

/* 通用 section */
.section {
  background: #fff;
  border-radius: 28rpx;
  padding: 36rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.04);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 28rpx;
}

.section-icon { font-size: 36rpx; margin-right: 12rpx; }
.section-title { font-size: 32rpx; font-weight: bold; color: #333; flex: 1; }
.section-count { font-size: 24rpx; color: #FF6B35; background: #FFF0E8; padding: 4rpx 16rpx; border-radius: 20rpx; }

/* 食材网格 */
.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
  background: #FFFAF6;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
}

.ing-dot { font-size: 32rpx; color: #FF6B35; line-height: 1; }
.ing-text { font-size: 26rpx; color: #444; }

/* 步骤列表 */
.steps-list { display: flex; flex-direction: column; gap: 20rpx; }

.step-item {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
}

.step-num-wrap {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.step-num {
  font-size: 26rpx;
  font-weight: bold;
  color: #fff;
}

.step-content {
  flex: 1;
  background: #FFFAF6;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
}

.step-text {
  font-size: 28rpx;
  color: #444;
  line-height: 1.8;
}

/* 贴士 */
.tips-box {
  background: linear-gradient(135deg, #FFFDE7, #FFF9C4);
  border-radius: 28rpx;
  padding: 36rpx;
  margin-bottom: 24rpx;
  border-left: 8rpx solid #FFD600;
}

.tips-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.tips-icon { font-size: 36rpx; }
.tips-title { font-size: 30rpx; font-weight: bold; color: #555; }
.tips-text { font-size: 28rpx; color: #666; line-height: 1.8; }

/* 场景 */
.scene-box {
  background: linear-gradient(135deg, #F3E5F5, #EDE7F6);
  border-radius: 28rpx;
  padding: 36rpx;
  margin-bottom: 24rpx;
  border-left: 8rpx solid #AB47BC;
}

.scene-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.scene-icon { font-size: 36rpx; }
.scene-title { font-size: 30rpx; font-weight: bold; color: #555; }
.scene-text { font-size: 28rpx; color: #666; line-height: 1.8; }

/* 底部操作 */
.bottom-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
  margin-bottom: 20rpx;
}

.btn-fav, .btn-share {
  flex: 1;
  font-size: 30rpx;
  font-weight: bold;
  padding: 28rpx 0;
  border-radius: 50rpx;
  border: none;
  text-align: center;
}

.btn-fav {
  background: #F5F5F5;
  color: #666;
}

.btn-fav.faved {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
}

.btn-share {
  background: #fff;
  color: #FF6B35;
  border: 2rpx solid #FF6B35;
}

.bottom-placeholder { height: 60rpx; }
</style>
