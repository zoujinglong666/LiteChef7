<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "weeklyChallenge"
}
</route>

<template>
  <view class="challenge-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">本周挑战</text>
        <view class="nav-right" />
      </view>
    </view>
    
    <!-- 挑战信息 -->
    <view class="challenge-card" v-if="challenge">
      <view class="challenge-theme">
        <text class="theme-emoji">🏆</text>
        <text class="theme-text">{{ challenge.theme }}</text>
      </view>
      <text class="challenge-desc">{{ challenge.description }}</text>
      <view class="challenge-meta">
        <view class="meta-item">
          <wd-icon name="calendar" size="16px" color="#FF6B35" />
          <text>{{ challenge.startDate }} ~ {{ challenge.endDate }}</text>
        </view>
        <view class="meta-item">
          <wd-icon name="user" size="16px" color="#FF6B35" />
          <text>{{ challenge.participants?.length || 0 }} 人参与</text>
        </view>
      </view>
      
      <!-- 参与按钮 -->
      <button v-if="!hasJoined" class="join-btn" @click="joinChallenge">参与挑战</button>
      <view v-else class="joined-tip">
        <wd-icon name="check-circle" size="16px" color="#52c41a" />
        <text>已参与，快分享拉票吧~</text>
      </view>
    </view>
    
    <!-- 排行榜 -->
    <view class="ranking-section">
      <view class="section-header">
        <text class="section-title">🏆 排行榜</text>
      </view>
      
      <view v-if="!challenge?.participants?.length" class="empty-ranking">
        <text>暂无参与者，快来第一个参与吧！</text>
      </view>
      
      <view v-else class="ranking-list">
        <view 
          class="ranking-item" 
          :class="{ top: i < 3 }" 
          v-for="(p, i) in sortedParticipants" 
          :key="p.openid"
        >
          <view class="rank-num">{{ i + 1 }}</view>
          <text class="rank-avatar">{{ p.avatar }}</text>
          <view class="rank-info">
            <text class="rank-name">{{ p.nickname }}</text>
            <text class="rank-recipe">{{ p.recipeName }}</text>
          </view>
          <view class="rank-votes">
            <text class="vote-count">{{ p.likes || 0 }}</text>
            <text class="vote-label">票</text>
          </view>
          <button class="vote-btn" @click="vote(p.openid)">投票</button>
        </view>
      </view>
    </view>
    
    <!-- 历史挑战 -->
    <view class="history-section">
      <view class="section-header">
        <text class="section-title">📜 历史挑战</text>
      </view>
      <view class="history-list">
        <view class="history-item" v-for="h in history" :key="h._id">
          <text class="history-theme">{{ h.theme }}</text>
          <text class="history-winner">🏆 {{ h.participants?.find(p => p.openid === h.winnerId)?.nickname || '暂无' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getLocalUser } from '@/utils/auth'

const challenge = ref<any>(null)
const history = ref<any[]>([])
const hasJoined = ref(false)

const sortedParticipants = computed(() => {
  if (!challenge.value?.participants) return []
  return [...challenge.value.participants].sort((a, b) => (b.likes || 0) - (a.likes || 0))
})

onMounted(() => {
  loadChallenge()
  loadHistory()
})

async function loadChallenge() {
  try {
    const result = await uniCloud.callFunction({
      name: 'weekly-challenge',
      data: { action: 'getCurrent' }
    }) as any
    
    if (result.result?.code === 200) {
      challenge.value = result.result.data
      
      // 检查是否已参与
      const user = getLocalUser()
      hasJoined.value = challenge.value.participants?.some((p: any) => p.openid === user?.openid)
    }
  } catch (error) {
    console.error('加载失败:', error)
  }
}

async function loadHistory() {
  try {
    const result = await uniCloud.callFunction({
      name: 'weekly-challenge',
      data: { action: 'getHistory' }
    }) as any
    
    if (result.result?.code === 200) {
      history.value = result.result.data
    }
  } catch (error) {
    console.error('加载历史失败:', error)
  }
}

async function joinChallenge() {
  const user = getLocalUser()
  if (!user) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  // 先让用户选择一个菜谱参与
  uni.showActionSheet({
    itemList: ['从我的收藏选择', '发布新菜谱参与'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 从收藏选择
        uni.showToast({ title: '请先在菜谱广场发布作品', icon: 'none' })
      } else {
        // 发布新菜谱
        uni.navigateTo({ url: '/pages/uploadRecipe/index' })
      }
    }
  })
}

async function vote(participantId: string) {
  try {
    const result = await uniCloud.callFunction({
      name: 'weekly-challenge',
      data: {
        action: 'vote',
        challengeId: challenge.value._id,
        data: { participantId }
      }
    }) as any
    
    if (result.result?.code === 200) {
      uni.showToast({ title: '投票成功', icon: 'success' })
      loadChallenge()
    }
  } catch (error) {
    uni.showToast({ title: '投票失败', icon: 'none' })
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.challenge-page { min-height: 100vh; background: #F8F9FA; }

.header { position: relative; overflow: hidden; }
.header-bg { position: absolute; top: 0; left: 0; right: 0; height: 200rpx; background: linear-gradient(135deg, #FF9E4D, #FF6B35); }
.nav-bar { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 100rpx 40rpx 20rpx; }
.back-btn { width: 64rpx; height: 64rpx; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.nav-title { font-size: 34rpx; font-weight: bold; color: #fff; }
.nav-right { width: 64rpx; }

.challenge-card { background: #fff; border-radius: 20rpx; padding: 40rpx; margin: 30rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05); }
.challenge-theme { display: flex; align-items: center; gap: 16rpx; margin-bottom: 20rpx; }
.theme-emoji { font-size: 48rpx; }
.theme-text { font-size: 36rpx; font-weight: bold; color: #333; }
.challenge-desc { font-size: 28rpx; color: #666; line-height: 1.6; margin-bottom: 20rpx; display: block; }
.challenge-meta { display: flex; gap: 30rpx; margin-bottom: 30rpx; }
.meta-item { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; color: #999; }
.join-btn { width: 100%; background: linear-gradient(135deg, #FF9E4D, #FF6B35); color: #fff; font-size: 32rpx; font-weight: bold; padding: 24rpx; border-radius: 40rpx; }
.joined-tip { display: flex; align-items: center; justify-content: center; gap: 8rpx; font-size: 26rpx; color: #52c41a; }

.ranking-section { padding: 0 30rpx; }
.section-header { margin-bottom: 20rpx; }
.section-title { font-size: 32rpx; font-weight: bold; color: #333; }

.empty-ranking { text-align: center; padding: 60rpx; font-size: 26rpx; color: #999; }

.ranking-list { display: flex; flex-direction: column; gap: 16rpx; }
.ranking-item { display: flex; align-items: center; background: #fff; border-radius: 16rpx; padding: 24rpx; }
.ranking-item.top { background: linear-gradient(135deg, #FFF9F5, #FFF5EE); border: 2rpx solid #FFE4D4; }
.rank-num { width: 48rpx; height: 48rpx; background: #F0F0F0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24rpx; font-weight: bold; color: #999; margin-right: 16rpx; }
.ranking-item.top .rank-num { background: #FFD700; color: #fff; }
.rank-avatar { font-size: 40rpx; margin-right: 16rpx; }
.rank-info { flex: 1; }
.rank-name { display: block; font-size: 28rpx; font-weight: bold; color: #333; }
.rank-recipe { display: block; font-size: 22rpx; color: #999; }
.rank-votes { display: flex; flex-direction: column; align-items: center; margin-right: 16rpx; }
.vote-count { font-size: 32rpx; font-weight: bold; color: #FF6B35; }
.vote-label { font-size: 20rpx; color: #999; }
.vote-btn { background: #FF6B35; color: #fff; font-size: 24rpx; padding: 12rpx 24rpx; border-radius: 20rpx; }

.history-section { padding: 30rpx; }
.history-list { display: flex; flex-direction: column; gap: 16rpx; }
.history-item { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 16rpx; padding: 24rpx; }
.history-theme { font-size: 26rpx; color: #333; }
.history-winner { font-size: 24rpx; color: #FFD700; }
</style>
