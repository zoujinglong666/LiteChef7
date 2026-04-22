<route lang="json">
{
  "layout": "tabbar",
  "style": { "navigationStyle": "custom" },
  "name": "my"
}
</route>

<template>
  <view class="my-page">
    <!-- 顶部用户信息 -->
    <view class="hero-header" :style="{ paddingTop: headerPaddingTop }">
      <view class="user-section">
        <view class="avatar-ring" @click="handleLogin">
          <text class="avatar-emoji">{{ userInfo?.avatar || '👤' }}</text>
          <view v-if="userInfo?.isVip" class="vip-badge">VIP</view>
        </view>
        <view class="user-info">
          <text class="user-greeting">{{ greeting }}，{{ userInfo?.nickname || '厨友' }}</text>
          <text class="user-sub">{{ isLoggedIn ? '开始你的心情美食之旅' : '点击登录，体验专属推荐' }}</text>
        </view>
      </view>
      
      <view class="user-stats" v-if="isLoggedIn">
        <view class="stat-item" @click="showMoodHistory">
          <text class="stat-n">{{ moodCount }}</text>
          <text class="stat-l">心情</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item" @click="showFavorites">
          <text class="stat-n">{{ favCount }}</text>
          <text class="stat-l">收藏</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-n">{{ streak }}</text>
          <text class="stat-l">打卡</text>
        </view>
      </view>
    </view>

    <!-- VIP 会员卡片 -->
    <view class="vip-section">
      <view class="vip-card" @click="openVip" :class="{ 'vip-active': userInfo?.isVip }">
        <view class="vip-left">
          <text class="vip-crown">👑</text>
          <view class="vip-text">
            <text class="vip-title">{{ userInfo?.isVip ? '心情会员' : '开通会员' }}</text>
            <text class="vip-desc">
              {{ userInfo?.isVip ? '已解锁专属心情分析和高级菜谱' : '解锁专属心情分析 · 高级菜谱套餐' }}
            </text>
          </view>
        </view>
        <view class="vip-btn" :class="{ 'vip-active': userInfo?.isVip }">
          {{ userInfo?.isVip ? '已开通' : '开通' }}
        </view>
      </view>
    </view>

    <!-- 我的心情 -->
    <view class="section-card">
      <view class="section-head">
        <view class="section-title-wrapper">
          <text class="section-icon">💭</text>
          <text class="section-title">我的心情</text>
        </view>
        <text class="section-more" v-if="moodHistory.length > 3" @click="showAllHistory">
          全部 <wd-icon name="chevron-right" size="12px" color="#FF6B35" />
        </text>
      </view>
      
      <view v-if="moodHistory.length === 0" class="empty-state">
        <view class="empty-icon-wrapper">
          <wd-icon name="edit" size="40px" color="#DDD" />
        </view>
        <text class="empty-t">还没有心情记录</text>
        <text class="empty-s">去「心情」选个心情开始吧~</text>
      </view>
      
      <view v-else class="mood-list">
        <view 
          class="mood-item" 
          v-for="(item) in displayedMoodHistory" 
          :key="item.id"
          @click="showHistoryDetail(item)"
          hover-class="item-hover"
        >
          <view class="mood-icon-wrapper" :style="{ background: getMoodColor(item.mood) }">
            <text class="mood-icon">{{ item.moodIcon }}</text>
          </view>
          <view class="mood-body">
            <text class="mood-name">{{ item.mood }}</text>
            <text class="mood-reason" v-if="item.reason" :lines="1">{{ item.reason }}</text>
            <text class="mood-time">{{ formatTime(item.time) }}</text>
          </view>
          <wd-icon name="chevron-right" size="16px" color="#DDD" />
        </view>
      </view>
    </view>

    <!-- 我的收藏 -->
    <view class="section-card">
      <view class="section-head">
        <view class="section-title-wrapper">
          <text class="section-icon">⭐</text>
          <text class="section-title">我的收藏</text>
        </view>
        <text class="section-more" v-if="favorites.length > 4" @click="showAllFav">
          全部 <wd-icon name="chevron-right" size="12px" color="#FF6B35" />
        </text>
      </view>
      
      <view v-if="favorites.length === 0" class="empty-state">
        <view class="empty-icon-wrapper">
          <wd-icon name="folder" size="40px" color="#DDD" />
        </view>
        <text class="empty-t">还没有收藏</text>
        <text class="empty-s">推荐的菜谱可以一键收藏~</text>
      </view>
      
      <scroll-view scroll-x v-else class="fav-scroll">
        <view class="fav-list">
          <view 
            class="fav-card" 
            v-for="f in displayedFavorites" 
            :key="f.name"
            hover-class="card-hover"
          >
            <text class="fav-emoji">{{ f.image }}</text>
            <text class="fav-name">{{ f.name }}</text>
            <view class="fav-del" @click.stop="removeFav(f.name)">
              <wd-icon name="close" size="12px" color="#CCC" />
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 厨房工具 -->
    <view class="section-card">
      <view class="section-head">
        <view class="section-title-wrapper">
          <text class="section-icon">🔧</text>
          <text class="section-title">厨房工具</text>
        </view>
      </view>
      <view class="tool-grid">
        <view 
          class="tool-item" 
          v-for="tool in toolItems" 
          :key="tool.name"
          @click="tool.action"
          hover-class="tool-hover"
        >
          <view class="tool-icon-wrapper" :style="{ background: tool.bgColor }">
            <wd-icon :name="tool.icon" size="24px" :color="tool.iconColor" />
          </view>
          <text class="tool-name">{{ tool.name }}</text>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view style="height: 40rpx" />
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
import { 
  getLocalUser, 
  getFavorites, 
  getMoodHistory, 
  removeFavorite,
  isLoggedIn as checkLogin,
  type MoodRecord, 
  type FavoriteRecipe,
  type UserInfo
} from '@/utils/auth'

// 系统信息
const { navBarPaddingTop } = useSystemInfo()

// 计算 header padding
const headerPaddingTop = computed(() => {
  return navBarPaddingTop.value
})

// 用户数据
const userInfo = ref<UserInfo | null>(null)
const favorites = ref<FavoriteRecipe[]>([])
const moodHistory = ref<MoodRecord[]>([])
const streak = ref(0)
const syncing = ref(false)

// 计算属性
const isLoggedIn = computed(() => checkLogin())
const moodCount = computed(() => moodHistory.value.length)
const favCount = computed(() => favorites.value.length)
const displayedMoodHistory = computed(() => moodHistory.value.slice(0, 3))
const displayedFavorites = computed(() => favorites.value.slice(0, 6))

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 工具项配置
const toolItems = [
  {
    name: '厨友圈',
    icon: 'chat',
    iconColor: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.1)',
    action: () => uni.navigateTo({ url: '/pages/chefCircle/index' })
  },
  {
    name: '挑战赛',
    icon: 'star',
    iconColor: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.1)',
    action: () => uni.navigateTo({ url: '/pages/weeklyChallenge/index' })
  },
  {
    name: '云同步',
    icon: 'cloud',
    iconColor: '#4D80F0',
    bgColor: 'rgba(77, 128, 240, 0.1)',
    action: manualSync
  },
  {
    name: '工具箱',
    icon: 'setting',
    iconColor: '#52C41A',
    bgColor: 'rgba(82, 196, 26, 0.1)',
    action: () => uni.navigateTo({ url: '/pages/kitchenTools/index' })
  },
  {
    name: '关于',
    icon: 'info-circle',
    iconColor: '#999',
    bgColor: 'rgba(153, 153, 153, 0.1)',
    action: showAbout
  }
]

// 心情颜色映射
const moodColors: Record<string, string> = {
  '开心': 'linear-gradient(135deg, #FFD93D, #F6AD55)',
  '难过': 'linear-gradient(135deg, #A0AEC0, #718096)',
  '疲惫': 'linear-gradient(135deg, #68D391, #48BB78)',
  '焦虑': 'linear-gradient(135deg, #FC8181, #F56565)',
  '平静': 'linear-gradient(135deg, #63B3ED, #4299E1)',
  '兴奋': 'linear-gradient(135deg, #F687B3, #ED64A6)'
}

function getMoodColor(mood: string): string {
  return moodColors[mood] || 'linear-gradient(135deg, #CBD5E0, #A0AEC0)'
}

function formatTime(time: string): string {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return date.toLocaleDateString('zh-CN')
}

function refresh() {
  userInfo.value = getLocalUser()
  favorites.value = getFavorites()
  moodHistory.value = getMoodHistory()
  streak.value = Math.min(moodHistory.value.length, 7)
}

async function manualSync() {
  if (syncing.value) return
  syncing.value = true
  
  uni.showLoading({ title: '同步中...', mask: true })
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    refresh()
    uni.showToast({ title: '同步成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '同步失败', icon: 'none' })
  } finally {
    syncing.value = false
    uni.hideLoading()
  }
}

function handleLogin() {
  if (!isLoggedIn.value) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

function showMoodHistory() {
  uni.navigateTo({ url: '/pages/moodHistory/index' })
}

function showFavorites() {
  uni.navigateTo({ url: '/pages/favorites/index' })
}

function showHistoryDetail(item: MoodRecord) {
  const recipesText = item.recipes?.map((r, i) => `${i + 1}. ${r.name}`).join('\n') || '暂无推荐'
  uni.showModal({
    title: `${item.moodIcon} ${item.mood}`,
    content: `${item.reason || ''}\n\n推荐菜谱：\n${recipesText}`,
    confirmText: '知道了',
    showCancel: false
  })
}

function showAllHistory() {
  uni.navigateTo({ url: '/pages/moodHistory/index' })
}

function showAllFav() {
  uni.navigateTo({ url: '/pages/favorites/index' })
}

function removeFav(name: string) {
  uni.showModal({
    title: '取消收藏',
    content: `确定取消「${name}」的收藏？`,
    success: (res) => {
      if (res.confirm) {
        removeFavorite(name)
        refresh()
        uni.showToast({ title: '已取消收藏', icon: 'none' })
      }
    }
  })
}

function openVip() {
  if (userInfo.value?.isVip) {
    uni.showModal({
      title: '👑 会员权益',
      content: '您已开通心情会员，享受以下权益：\n• 每日心情深度分析\n• 专属疗愈菜谱套餐\n• 历史健康报告\n• 无广告体验\n• 云端数据同步',
      confirmText: '知道了',
      showCancel: false
    })
  } else {
    uni.showModal({
      title: '👑 开通会员',
      content: '会员专属权益：\n• 每日心情深度分析\n• 专属疗愈菜谱套餐\n• 历史健康报告\n• 无广告体验\n• 云端数据同步\n\n每月 ¥9.9，即将上线~',
      confirmText: '期待',
      showCancel: false
    })
  }
}

function showAbout() {
  uni.showModal({
    title: '🍳 7天轻厨 v3.0',
    content: '版本 3.0.0\n\n功能亮点：\n• 心情选菜，AI智能推荐\n• 菜谱广场，UGC社区\n• 厨友圈，社交分享\n• 每周挑战赛，游戏化运营\n• 云同步，跨设备数据\n\n© 2026 7天轻厨',
    confirmText: '知道了',
    showCancel: false
  })
}

onShow(() => {
  refresh()
})

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.my-page {
  min-height: 100vh;
  background: #FFFAF6;
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  padding: 40rpx 40rpx 50rpx;
  border-radius: 0 0 50rpx 50rpx;
  position: relative;
  overflow: hidden;
}

.hero-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
}

.user-section {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  position: relative;
  z-index: 1;
}

.avatar-ring {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
  position: relative;
}

.avatar-emoji {
  font-size: 56rpx;
}

.vip-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a2e;
  font-size: 18rpx;
  font-weight: bold;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  border: 2rpx solid #fff;
}

.user-greeting {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.user-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

.user-stats {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24rpx;
  padding: 30rpx 0;
  backdrop-filter: blur(10rpx);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.stat-item:active {
  transform: scale(0.95);
}

.stat-n {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 6rpx;
}

.stat-l {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 2rpx;
  height: 50rpx;
  background: rgba(255, 255, 255, 0.3);
}

/* VIP Section */
.vip-section {
  padding: 30rpx;
  margin-top: -20rpx;
  position: relative;
  z-index: 2;
}

.vip-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 28rpx;
  padding: 36rpx 40rpx;
  box-shadow: 0 12rpx 40rpx rgba(26, 26, 46, 0.25);
  transition: all 0.3s;
}

.vip-card.vip-active {
  background: linear-gradient(135deg, #2d2d44, #1f1f35);
}

.vip-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 24rpx rgba(26, 26, 46, 0.2);
}

.vip-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.vip-crown {
  font-size: 64rpx;
  margin-right: 24rpx;
}

.vip-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #FFD700;
  margin-bottom: 8rpx;
}

.vip-desc {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}

.vip-btn {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a2e;
  font-size: 26rpx;
  font-weight: bold;
  padding: 16rpx 40rpx;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 215, 0, 0.3);
}

.vip-btn.vip-active {
  background: rgba(255, 255, 255, 0.1);
  color: #FFD700;
  box-shadow: none;
}

/* Section Card */
.section-card {
  margin: 0 30rpx 30rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-icon {
  font-size: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50rpx 0;
  text-align: center;
}

.empty-icon-wrapper {
  margin-bottom: 20rpx;
}

.empty-t {
  font-size: 28rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.empty-s {
  font-size: 24rpx;
  color: #ccc;
  display: block;
}

/* Mood List */
.mood-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.mood-item {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 24rpx;
  transition: all 0.2s;
}

.item-hover {
  background: #f0f0f0;
  transform: scale(0.99);
}

.mood-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.mood-icon {
  font-size: 40rpx;
}

.mood-body {
  flex: 1;
  min-width: 0;
}

.mood-name {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 6rpx;
}

.mood-reason {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mood-time {
  font-size: 22rpx;
  color: #aaa;
}

/* Favorites */
.fav-scroll {
  white-space: nowrap;
  margin: 0 -10rpx;
}

.fav-list {
  display: inline-flex;
  gap: 20rpx;
  padding: 10rpx;
}

.fav-card {
  width: 160rpx;
  flex-shrink: 0;
  background: linear-gradient(135deg, #f8f9fa, #fff);
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.card-hover {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.fav-emoji {
  font-size: 56rpx;
  margin-bottom: 12rpx;
}

.fav-name {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 120rpx;
  line-height: 1.4;
}

.fav-del {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.fav-del:active {
  background: rgba(0, 0, 0, 0.1);
}

/* Tool Grid */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.tool-hover {
  background: #f8f9fa;
  transform: scale(0.95);
}

.tool-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.tool-name {
  font-size: 22rpx;
  color: #666;
}
</style>