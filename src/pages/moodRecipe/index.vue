<route type="home" lang="json">
{
  "layout": "tabbar",
  "style": { "navigationStyle": "custom" },
  "name": "mood"
}
</route>

<template>
  <view class="mood-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-top">
        <view class="weather-chip" @click="refreshWeather">
          <text class="weather-icon">{{ weatherIcon }}</text>
          <text class="weather-text">{{ weatherText }}</text>
        </view>
        <text class="header-date">{{ todayStr }}</text>
      </view>
      <text class="header-title">今天心情怎么样？</text>
      <text class="header-sub">🍳 选心情，AI 为你推荐专属菜谱</text>
    </view>

    <!-- 菜式选择器 -->
    <view class="cuisine-section">
      <view class="cuisine-scroll">
        <view
          class="cuisine-chip"
          :class="{ active: selectedCuisine === c.key }"
          v-for="c in cuisineList"
          :key="c.key"
          @click="selectedCuisine = c.key"
        >
          <text class="cuisine-icon">{{ c.icon }}</text>
          <text class="cuisine-name">{{ c.key }}</text>
        </view>
      </view>
    </view>

    <!-- 心情网格 -->
    <view class="mood-section">
      <view class="mood-grid">
        <view
          class="mood-card"
          :class="{ active: currentMood?.id === mood.id }"
          v-for="mood in moodList"
          :key="mood.id"
          @click="selectMood(mood)"
        >
          <text class="mood-icon">{{ mood.icon }}</text>
          <text class="mood-name">{{ mood.name }}</text>
          <text class="mood-desc">{{ mood.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 推荐结果 -->
    <view class="result-section" v-if="showResult">
      <!-- 加载中 -->
      <view v-if="loading" class="loading-box">
        <view class="loading-anim">
          <text class="loading-emoji">{{ loadingEmoji }}</text>
        </view>
        <text class="loading-text">{{ loadingText }}</text>
        <text class="loading-sub">正在结合天气和心情为你定制...</text>
      </view>

      <!-- 推荐卡片 -->
      <view v-else-if="recommendResult?.recipes?.length" class="recommend-body">
        <!-- 推荐理由 -->
        <view class="reason-box">
          <view class="reason-icon">💬</view>
          <text class="reason-text">{{ recommendResult.reason }}</text>
        </view>

        <!-- 菜谱列表 -->
        <view class="recipe-list">
          <view
            class="recipe-card"
            v-for="(recipe, i) in recommendResult.recipes"
            :key="i"
            @click="goDetail(recipe)"
          >
            <view class="recipe-image-wrap">
              <image v-if="recipe.image && recipe.image.startsWith('http')" class="recipe-img" :src="recipe.image" mode="aspectFill" />
              <text v-else class="recipe-emoji">{{ recipe.image || '🍳' }}</text>
              <view class="image-loading" v-if="!recipe.image || !recipe.image.startsWith('http')">
                <view class="loading-spinner" />
              </view>
              <view class="recipe-overlay">
                <view class="cuisine-badge">{{ recipe.cuisine || selectedCuisine }}</view>
                <view class="recipe-meta" v-if="(recipe.steps || []).length">
                  <text class="meta-text">{{ recipe.steps.length }} 步</text>
                </view>
              </view>
            </view>
            <view class="recipe-info">
              <view class="recipe-header">
                <text class="recipe-name">{{ recipe.name }}</text>
                <text class="fav-btn" @click.stop="toggleFav(recipe)">
                  <wd-icon :name="isFav(recipe.name) ? 'heart-filled' : 'heart'" size="18px" :color="isFav(recipe.name) ? '#FF6B35' : '#ccc'" />
                </text>
              </view>
              <text class="recipe-desc">{{ recipe.description }}</text>
              <view class="recipe-ingredients">
                <text class="ing-tag" v-for="(ing, idx) in (recipe.ingredients || []).slice(0,3)" :key="idx">{{ ing }}</text>
              </view>
              <view class="recipe-footer">
                <view class="recipe-tags">
                  <text class="tag" v-for="t in recipe.tags.slice(0,2)" :key="t">{{ t }}</text>
                </view>
                <view class="detail-link">
                  <text>查看步骤</text>
                  <text class="arrow">→</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 操作栏 -->
        <view class="action-bar">
          <button class="btn-refresh" @click="refresh">🔄 换一批</button>
          <button class="btn-save" @click="saveAll">❤️ 全部收藏</button>
        </view>
      </view>

      <!-- 错误 -->
      <view v-else-if="errorMsg" class="error-box">
        <text class="error-emoji">😅</text>
        <text class="error-text">{{ errorMsg }}</text>
        <button class="retry-btn" @click="refresh">重试一下</button>
      </view>

      <!-- 无数据 -->
      <view v-else class="empty-hint">
        <text class="hint-emoji">🍽️</text>
        <text class="hint-text">暂无推荐，换个心情试试</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-hint">
      <text class="hint-emoji">👆</text>
      <text class="hint-text">选择你的心情，开启今日美食之旅</text>
    </view>

    <view class="tabbar-placeholder" />
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
const { capsuleBottomToTop } = useSystemInfo()

import { onMounted } from 'vue'
import { getRecommendByMood, generateRecipeImage } from '@/apis/moodApi'
import { login, addMoodRecord, addFavorite, removeFavorite, getFavorites, type MoodRecord } from '@/utils/auth'

// 菜式列表
type CuisineType = '中式' | '日式' | '西式' | '韩式'
const cuisineList = [
  { key: '中式' as CuisineType, icon: '🥢' },
  { key: '日式' as CuisineType, icon: '🍣' },
  { key: '西式' as CuisineType, icon: '🍝' },
  { key: '韩式' as CuisineType, icon: '🌶️' },
]
const selectedCuisine = ref<CuisineType>('中式')

// 心情列表
const moodList = [
  { id: 1, icon: '😊', name: '开心', desc: '庆祝分享' },
  { id: 2, icon: '😢', name: '难过', desc: '治愈安慰' },
  { id: 3, icon: '😤', name: '愤怒', desc: '解压发泄' },
  { id: 4, icon: '😰', name: '焦虑', desc: '平静减压' },
  { id: 5, icon: '😴', name: '疲惫', desc: '快速充能' },
  { id: 6, icon: '🤤', name: '嘴馋', desc: '解馋满足' },
  { id: 7, icon: '😍', name: '浪漫', desc: '精致仪式' },
  { id: 8, icon: '🤔', name: '无聊', desc: '新奇创意' },
]

// 天气状态
const weatherIcon = ref('🌤️')
const weatherText = ref('获取天气...')
const weatherDesc = ref('')
const temperature = ref<number | undefined>(undefined)

// 日期
const todayStr = computed(() => {
  const d = new Date()
  const days = ['周日','周一','周二','周三','周四','周五','周六']
  return `${d.getMonth()+1}月${d.getDate()}日 ${days[d.getDay()]}`
})

// 推荐状态
const currentMood = ref<typeof moodList[0] | null>(null)
const showResult = ref(false)
const loading = ref(false)
const loadingText = ref('正在分析你的心情...')
const loadingEmoji = ref('🤔')
const recommendResult = ref<any>(null)
const errorMsg = ref('')
const favorites = ref<Set<string>>(new Set())

// 加载动画
const loadingEmojis = ['🤔','🍳','🥘','🍜','🥗','🍱']
let loadingTimer: any = null

function startLoadingAnim() {
  let i = 0
  loadingTimer = setInterval(() => {
    loadingEmoji.value = loadingEmojis[i % loadingEmojis.length]
    i++
  }, 600)
}

function stopLoadingAnim() {
  if (loadingTimer) { clearInterval(loadingTimer); loadingTimer = null }
}

onMounted(async () => {
  try { await login(); syncFavs() } catch {}
  fetchWeather()
})

// 获取天气（wttr.in 免费接口）
async function fetchWeather() {
  try {
    const res: any = await new Promise((resolve, reject) => {
      uni.request({
        url: 'https://wttr.in/?format=j1',
        method: 'GET',
        timeout: 8000,
        success: resolve,
        fail: reject
      })
    })
    const data = res.data
    if (data?.current_condition?.[0]) {
      const c = data.current_condition[0]
      const temp = parseInt(c.temp_C)
      const desc = c.lang_zh?.[0]?.value || c.weatherDesc?.[0]?.value || ''
      temperature.value = temp
      weatherDesc.value = desc

      // 映射天气图标
      const code = parseInt(c.weatherCode)
      if (code === 113) { weatherIcon.value = '☀️'; weatherText.value = `晴 ${temp}°` }
      else if ([116,119,122].includes(code)) { weatherIcon.value = '⛅'; weatherText.value = `多云 ${temp}°` }
      else if ([176,263,266,293,296,299,302,305,308,353,356,359].includes(code)) { weatherIcon.value = '🌧️'; weatherText.value = `下雨 ${temp}°` }
      else if ([179,182,185,227,230,323,326,329,332,335,338,368,371,374,377].includes(code)) { weatherIcon.value = '❄️'; weatherText.value = `下雪 ${temp}°` }
      else if ([200,386,389,392,395].includes(code)) { weatherIcon.value = '⛈️'; weatherText.value = `雷雨 ${temp}°` }
      else { weatherIcon.value = '🌤️'; weatherText.value = `${temp}°C` }
    }
  } catch {
    weatherIcon.value = '🌤️'
    weatherText.value = '点击获取天气'
  }
}

function refreshWeather() {
  weatherText.value = '获取中...'
  fetchWeather()
}

function selectMood(mood: typeof moodList[0]) {
  currentMood.value = mood
  showResult.value = true
  loading.value = true
  errorMsg.value = ''
  recommendResult.value = null
  startLoadingAnim()
  fetchRecommend(mood)
}

async function fetchRecommend(mood: typeof moodList[0]) {
  try {
    loadingText.value = `正在为你定制${selectedCuisine.value}菜谱...`
    await login()
    const result = await getRecommendByMood(
      mood.name,
      selectedCuisine.value
    )
    recommendResult.value = result
    loading.value = false
    stopLoadingAnim()
    syncFavs()
    // 逐个异步加载图片
    loadRecipeImages(result.recipes || [])
  } catch (e: any) {
    loading.value = false
    stopLoadingAnim()
    errorMsg.value = e.message || '推荐失败，请重试'
  }
}

/** 逐道菜异步加载AI图片 */
async function loadRecipeImages(recipes: any[]) {
  for (const recipe of recipes) {
    try {
      const imageUrl = await generateRecipeImage(recipe.name)
      if (imageUrl) {
        recipe.image = imageUrl
        // 触发响应式更新
        recommendResult.value = { ...recommendResult.value! }
      }
    } catch {}
  }
}

function refresh() {
  if (currentMood.value) {
    loading.value = true
    errorMsg.value = ''
    recommendResult.value = null
    startLoadingAnim()
    fetchRecommend(currentMood.value)
  }
}

function syncFavs() {
  favorites.value = new Set(getFavorites().map((f: any) => f.name))
}

function isFav(name: string) { return favorites.value.has(name) }

// 跳转详情页
function goDetail(recipe: any) {
  if (recipe.id) {
    uni.navigateTo({ url: `/pages/recipeDetail/index?id=${recipe.id}` })
  } else {
    const data = encodeURIComponent(JSON.stringify(recipe))
    uni.navigateTo({ url: `/pages/recipeDetail/index?data=${data}` })
  }
}

async function toggleFav(recipe: any) {
  try {
    await login()
    if (isFav(recipe.name)) {
      removeFavorite(recipe.name)
      favorites.value.delete(recipe.name)
      uni.showToast({ title: '已取消', icon: 'none' })
    } else {
      addFavorite({
        name: recipe.name,
        image: recipe.image,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        tips: recipe.tips,
        suitableScene: recipe.suitableScene,
        mood: recipe.mood
      })
      favorites.value.add(recipe.name)
      uni.showToast({ title: '已收藏', icon: 'none' })
    }
    favorites.value = new Set(favorites.value)
  } catch {}
}

function saveAll() {
  if (!recommendResult.value || !currentMood.value) return
  try {
    login()
    const record: MoodRecord = {
      id: Date.now().toString(),
      mood: currentMood.value.name,
      moodIcon: currentMood.value.icon,
      reason: recommendResult.value.reason,
      recipes: recommendResult.value.recipes.map((r: any) => ({
        name: r.name, image: r.image, ingredients: r.ingredients
      })),
      time: new Date().toLocaleString('zh-CN')
    }
    addMoodRecord(record)
    recommendResult.value.recipes.forEach((r: any) => {
      addFavorite({ name: r.name, image: r.image, ingredients: r.ingredients, steps: r.steps, tips: r.tips, mood: r.mood })
    })
    syncFavs()
    uni.showToast({ title: '已全部收藏 💾', icon: 'success' })
  } catch {}
}
</script>

<style scoped>
.mood-page {
  min-height: 100vh;
  background: #FFF8F3;
  padding-bottom: 140rpx;
}

/* 顶部 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #FF9E4D 0%, #FF6B35 100%);
  padding: 90rpx 40rpx 50rpx;
  border-radius: 0 0 50rpx 50rpx;
  box-shadow: 0 8rpx 32rpx rgba(255,107,53,0.25);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.weather-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255,255,255,0.25);
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  backdrop-filter: blur(4rpx);
}

.weather-icon { font-size: 30rpx; }
.weather-text { font-size: 24rpx; color: #fff; font-weight: 500; }
.header-date { font-size: 24rpx; color: rgba(255,255,255,0.85); font-weight: 500; }

.header-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.header-sub {
  font-size: 26rpx;
  color: rgba(255,255,255,0.9);
}

/* 菜式选择器 */
.cuisine-section {
  padding: 30rpx 30rpx 0;
  padding-top: 360rpx;
}

.cuisine-scroll {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
}

.cuisine-chip {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 32rpx;
  background: #FFF0E8;
  border-radius: 40rpx;
  border: 3rpx solid transparent;
  white-space: nowrap;
  box-shadow: 0 4rpx 16rpx rgba(255,107,53,0.08);
  flex-shrink: 0;
  transition: all 0.2s;
}

.cuisine-chip.active {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  border-color: transparent;
  box-shadow: 0 6rpx 20rpx rgba(255,107,53,0.3);
}

.cuisine-icon { font-size: 32rpx; }
.cuisine-name { font-size: 26rpx; color: #FF6B35; font-weight: 600; }
.cuisine-chip.active .cuisine-name { color: #fff; font-weight: bold; }

/* 心情网格 */
.mood-section {
  margin: 24rpx 30rpx 0;
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(255,107,53,0.08);
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.mood-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 8rpx;
  background: #FFF9F5;
  border-radius: 20rpx;
  border: 3rpx solid transparent;
  transition: all 0.2s;
}

.mood-card.active {
  background: linear-gradient(135deg, #FFF0E8, #FFE5D6);
  border-color: #FF6B35;
  transform: scale(1.05);
  box-shadow: 0 6rpx 20rpx rgba(255,107,53,0.2);
}

.mood-icon { font-size: 52rpx; margin-bottom: 10rpx; }
.mood-name { font-size: 26rpx; font-weight: bold; color: #333; margin-bottom: 4rpx; }
.mood-card.active .mood-name { color: #FF6B35; }
.mood-desc { font-size: 18rpx; color: #bbb; }

/* 结果区 */
.result-section { margin: 24rpx 30rpx 0; }

/* 加载 */
.loading-box {
  background: #fff;
  border-radius: 32rpx;
  padding: 80rpx 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
}

.loading-anim { margin-bottom: 24rpx; animation: bounce 1s infinite; }
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16rpx); }
}
.loading-emoji { font-size: 100rpx; }
.loading-text { display: block; font-size: 30rpx; color: #555; font-weight: bold; margin-bottom: 12rpx; }
.loading-sub { font-size: 24rpx; color: #bbb; }

/* 推荐理由 */
.reason-box {
  display: flex;
  align-items: flex-start;
  background: linear-gradient(135deg, #FFF9F5, #FFF0E8);
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 28rpx;
  border-left: 8rpx solid #FF9E4D;
  box-shadow: 0 4rpx 16rpx rgba(255,107,53,0.08);
}

.reason-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
  background: #fff;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.reason-text { font-size: 28rpx; color: #555; line-height: 1.7; flex: 1; font-weight: 500; }

/* 菜谱卡片列表 */
.recipe-list { display: flex; flex-direction: column; gap: 28rpx; }

.recipe-card {
  background: #fff;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.06);
  transition: transform 0.2s;
}
.recipe-card:active { transform: scale(0.98); }

.recipe-image-wrap {
  position: relative;
  height: 280rpx;
  background: linear-gradient(135deg, #FFE8D6, #FFD4BA);
  display: flex;
  align-items: center;
  justify-content: center;
}

.recipe-emoji {
  font-size: 120rpx;
  filter: drop-shadow(0 4rpx 12rpx rgba(0,0,0,0.1));
}

.recipe-img {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.image-loading {
  position: absolute;
  bottom: 16rpx;
  right: 16rpx;
  width: 36rpx;
  height: 36rpx;
}

.loading-spinner {
  width: 36rpx;
  height: 36rpx;
  border: 4rpx solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.recipe-overlay {
  position: absolute;
  bottom: 16rpx;
  left: 16rpx;
  right: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cuisine-badge {
  font-size: 20rpx;
  color: #fff;
  background: rgba(0,0,0,0.35);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  backdrop-filter: blur(4rpx);
  font-weight: 500;
}

.recipe-meta {
  font-size: 20rpx;
  color: #fff;
  background: rgba(0,0,0,0.35);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  backdrop-filter: blur(4rpx);
  font-weight: 500;
}

.recipe-info {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.recipe-name { font-size: 32rpx; font-weight: bold; color: #222; }
.fav-btn { padding: 8rpx; }

.recipe-desc {
  font-size: 26rpx;
  color: #FF6B35;
  margin-bottom: 14rpx;
  line-height: 1.4;
  font-weight: 500;
}

.recipe-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.ing-tag {
  font-size: 20rpx;
  color: #666;
  background: #F5F5F5;
  padding: 6rpx 14rpx;
  border-radius: 12rpx;
}

.recipe-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recipe-tags { display: flex; gap: 10rpx; }
.tag {
  font-size: 20rpx;
  color: #FF6B35;
  background: #FFF0E8;
  padding: 6rpx 14rpx;
  border-radius: 16rpx;
  font-weight: 500;
}

.detail-link {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 600;
}
.detail-link .arrow { font-size: 22rpx; }

/* 操作栏 */
.action-bar {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.btn-refresh, .btn-save {
  flex: 1;
  font-size: 28rpx;
  font-weight: bold;
  padding: 24rpx 0;
  border-radius: 50rpx;
  border: none;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
  transition: transform 0.1s;
}
.btn-refresh:active, .btn-save:active { transform: scale(0.96); }

.btn-refresh { background: #F5F5F5; color: #666; }
.btn-save {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
  box-shadow: 0 6rpx 20rpx rgba(255,107,53,0.3);
}

/* 错误 */
.error-box {
  background: #fff;
  border-radius: 32rpx;
  padding: 60rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
}

.error-emoji { font-size: 80rpx; display: block; margin-bottom: 20rpx; }
.error-text { font-size: 28rpx; color: #999; display: block; margin-bottom: 30rpx; }
.retry-btn {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(255,107,53,0.25);
}

/* 空状态 */
.empty-hint {
  margin: 60rpx 30rpx;
  text-align: center;
}

.hint-emoji { font-size: 80rpx; display: block; margin-bottom: 20rpx; }
.hint-text { font-size: 28rpx; color: #bbb; }

.tabbar-placeholder { height: 120rpx; }
</style>
