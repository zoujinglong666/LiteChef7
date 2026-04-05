<route lang="json">
{
  "layout": "tabbar",
  "style": { "navigationStyle": "custom" },
  "name": "my"
}
</route>

<template>
  <view class="my-page">
    <view class="hero-header">
      <view class="user-section">
        <view class="avatar-ring"><text class="avatar-emoji">👤</text></view>
        <view class="user-info">
          <text class="user-greeting">{{ greeting }}</text>
          <text class="user-sub">{{ userInfo ? '开始你的心情美食之旅' : '点击登录，体验专属推荐' }}</text>
        </view>
      </view>
      <view class="user-stats" v-if="userInfo">
        <view class="stat"><text class="stat-n">{{ moodCount }}</text><text class="stat-l">心情</text></view>
        <view class="stat-line"/>
        <view class="stat"><text class="stat-n">{{ favCount }}</text><text class="stat-l">收藏</text></view>
        <view class="stat-line"/>
        <view class="stat"><text class="stat-n">{{ streak }}</text><text class="stat-l">打卡</text></view>
      </view>
    </view>
    <view class="vip-section">
      <view class="vip-card" @click="openVip">
        <view class="vip-left">
          <text class="vip-crown">👑</text>
          <view class="vip-text">
            <text class="vip-title">心情会员</text>
            <text class="vip-desc">解锁专属心情分析 · 高级菜谱套餐</text>
          </view>
        </view>
        <view class="vip-btn">开通</view>
      </view>
    </view>
    <view class="section">
      <view class="section-head">
        <text class="section-title">💭 我的心情</text>
        <text class="section-more" v-if="moodHistory.length > 3" @click="showAllHistory">全部 ></text>
      </view>
      <view v-if="moodHistory.length === 0" class="empty">
        <text class="empty-e">📝</text><text class="empty-t">还没有心情记录</text>
        <text class="empty-s">去「心情」选个心情开始吧~</text>
      </view>
      <view v-else class="mood-list">
        <view class="mood-item" v-for="(item, i) in moodHistory.slice(0,3)" :key="i" @click="showHistoryDetail(item)">
          <text class="mood-icon">{{ item.moodIcon }}</text>
          <view class="mood-body">
            <text class="mood-name">{{ item.mood }}</text>
            <text class="mood-time">{{ item.time }}</text>
          </view>
          <wd-icon name="chevron-right" size="16px" color="#CCC" />
        </view>
      </view>
    </view>
    <view class="section">
      <view class="section-head">
        <text class="section-title">⭐ 我的收藏</text>
        <text class="section-more" v-if="favorites.length > 4" @click="showAllFav">全部 ></text>
      </view>
      <view v-if="favorites.length === 0" class="empty">
        <text class="empty-e">💾</text><text class="empty-t">还没有收藏</text>
        <text class="empty-s">推荐的菜谱可以一键收藏~</text>
      </view>
      <scroll-view scroll-x v-else class="fav-scroll">
        <view class="fav-list">
          <view class="fav-card" v-for="(f, i) in favorites.slice(0,6)" :key="i">
            <text class="fav-emoji">{{ f.image }}</text>
            <text class="fav-name">{{ f.name }}</text>
            <text class="fav-del" @click.stop="removeFav(f.name)">×</text>
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="section">
      <view class="section-head"><text class="section-title">厨房工具</text></view>
      <view class="tool-grid">
        <view class="tool-item" @click="go('/pages/kitchenTools/index')"><wd-icon name="setting" size="20px" /><text class="tool-name">工具箱</text></view>
        <view class="tool-item" @click="showAbout"><wd-icon name="info-circle" size="20px" /><text class="tool-name">关于</text></view>
      </view>
    </view>
    <view style="height: 40rpx"/>
    <view style="height: 120rpx"/>
  </view>
</template>

<script setup lang="ts">
import { getLocalUser, getFavorites, getMoodHistory, removeFavorite, type MoodRecord, type FavoriteRecipe } from '@/utils/auth'
const userInfo = ref(getLocalUser())
const favorites = ref<FavoriteRecipe[]>([])
const moodHistory = ref<MoodRecord[]>([])
const streak = ref(0)
const moodCount = computed(() => moodHistory.value.length)
const favCount = computed(() => favorites.value.length)
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好' })
function refresh() { userInfo.value = getLocalUser(); favorites.value = getFavorites(); moodHistory.value = getMoodHistory(); streak.value = Math.min(moodHistory.value.length, 7) }
function go(url: string) { uni.navigateTo({ url }) }
function showHistoryDetail(item: MoodRecord) { uni.showModal({ title: `${item.moodIcon} ${item.mood}`, content: `${item.reason}\n\n${item.recipes.map((r,i) => `${i+1}. ${r.name}`).join('\n')}`, confirmText: '知道了', showCancel: false }) }
function showAllHistory() { uni.showToast({ title: `共${moodHistory.value.length}条`, icon: 'none' }) }
function showAllFav() { uni.showToast({ title: `共${favorites.value.length}条`, icon: 'none' }) }
function removeFav(name: string) { uni.showModal({ title: '取消收藏', content: `确定取消「${name}」？`, success: (res) => { if (res.confirm) { removeFavorite(name); refresh(); uni.showToast({ title: '已取消', icon: 'none' }) } } }) }
function openVip() { uni.showModal({ title: '👑 心情会员', content: '会员专属：\n• 每日心情深度分析\n• 专属疗愈菜谱套餐\n• 历史健康报告\n• 无广告\n\n每月¥9.9，即将上线~', confirmText: '期待', showCancel: false }) }
function showAbout() { uni.showModal({ title: '🍳 7天轻厨', content: '版本1.0.0\n基于AI心情分析的智能菜谱小程序\n© 2026 7天轻厨', confirmText: '知道了', showCancel: false }) }
onShow(() => { refresh() })
</script>

<style scoped>
.my-page { min-height: 100vh; background: #FFFAF6; }
.hero-header { background: linear-gradient(135deg, #FF9E4D, #FF6B35); padding: 100rpx 50rpx 50rpx; border-radius: 0 0 60rpx 60rpx; }
.user-section { display: flex; align-items: center; margin-bottom: 40rpx; }
.avatar-ring { width: 110rpx; height: 110rpx; background: rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 30rpx; border: 4rpx solid rgba(255,255,255,0.5); }
.avatar-emoji { font-size: 52rpx; }
.user-greeting { display: block; font-size: 36rpx; font-weight: bold; color: #fff; margin-bottom: 10rpx; }
.user-sub { font-size: 24rpx; color: rgba(255,255,255,0.8); }
.user-stats { display: flex; align-items: center; background: rgba(255,255,255,0.15); border-radius: 20rpx; padding: 30rpx 0; }
.stat { flex: 1; display: flex; flex-direction: column; align-items: center; }
.stat-n { font-size: 48rpx; font-weight: bold; color: #fff; margin-bottom: 6rpx; }
.stat-l { font-size: 22rpx; color: rgba(255,255,255,0.8); }
.stat-line { width: 2rpx; height: 50rpx; background: rgba(255,255,255,0.3); }
.vip-section { padding: 30rpx 30rpx 0; }
.vip-card { display: flex; align-items: center; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 24rpx; padding: 36rpx 40rpx; box-shadow: 0 8rpx 30rpx rgba(26,26,46,0.3); }
.vip-left { display: flex; align-items: center; flex: 1; }
.vip-crown { font-size: 60rpx; margin-right: 24rpx; }
.vip-title { display: block; font-size: 30rpx; font-weight: bold; color: #FFD700; margin-bottom: 8rpx; }
.vip-desc { display: block; font-size: 22rpx; color: rgba(255,255,255,0.6); }
.vip-btn { background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a1a2e; font-size: 26rpx; font-weight: bold; padding: 12rpx 36rpx; border-radius: 30rpx; }
.section { margin: 30rpx; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.section-title { font-size: 32rpx; font-weight: bold; color: #333; }
.section-more { font-size: 24rpx; color: #FF6B35; }
.empty { background: #fff; border-radius: 20rpx; padding: 50rpx; text-align: center; }
.empty-e { font-size: 64rpx; display: block; margin-bottom: 16rpx; }
.empty-t { font-size: 28rpx; color: #999; display: block; margin-bottom: 8rpx; }
.empty-s { font-size: 24rpx; color: #ccc; display: block; }
.mood-list { display: flex; flex-direction: column; gap: 16rpx; }
.mood-item { display: flex; align-items: center; background: #fff; border-radius: 20rpx; padding: 28rpx 30rpx; }
.mood-icon { font-size: 52rpx; margin-right: 24rpx; flex-shrink: 0; }
.mood-body { flex: 1; }
.mood-name { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 6rpx; }
.mood-time { font-size: 22rpx; color: #aaa; }
.mood-arrow { font-size: 40rpx; color: #ddd; }
.fav-scroll { white-space: nowrap; }
.fav-list { display: inline-flex; gap: 16rpx; padding: 4rpx 0; }
.fav-card { width: 160rpx; flex-shrink: 0; background: #fff; border-radius: 16rpx; padding: 24rpx 12rpx; display: flex; flex-direction: column; align-items: center; position: relative; }
.fav-emoji { font-size: 56rpx; margin-bottom: 12rpx; }
.fav-name { font-size: 22rpx; color: #666; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; width: 130rpx; }
.fav-del { position: absolute; top: 8rpx; right: 12rpx; font-size: 32rpx; color: #ccc; font-weight: bold; line-height: 1; }
.tool-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16rpx; }
.tool-item { background: #fff; border-radius: 20rpx; padding: 30rpx 8rpx; display: flex; flex-direction: column; align-items: center; }
.tool-icon { font-size: 44rpx; margin-bottom: 12rpx; }
.tool-name { font-size: 22rpx; color: #666; }
</style>
