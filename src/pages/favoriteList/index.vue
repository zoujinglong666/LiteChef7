<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" }
}
</route>

<template>
  <view class="page">
    <view class="header-bg" />
    <view class="nav-bar" :style="{ paddingTop: capsuleBottomToTop + 'px' }">
      <view class="back-btn" @click="goBack">
        <wd-icon name="arrow-left" size="20px" color="#fff" />
      </view>
      <text class="nav-title">我的收藏</text>
      <view style="width: 64rpx" />
    </view>

    <view class="content" :style="{ paddingTop: (capsuleBottomToTop + 88) + 'px' }">
      <!-- 空状态 -->
      <view v-if="!loading && list.length === 0" class="empty-state">
        <text class="empty-icon">⭐</text>
        <text class="empty-title">还没有收藏</text>
        <text class="empty-desc">去心情选菜，收藏喜欢的菜谱吧~</text>
        <view class="empty-btn" @click="goMood">去探索</view>
      </view>

      <!-- 列表 -->
      <view v-else class="card-list">
        <view
          v-for="item in list"
          :key="item.id"
          class="recipe-card"
          @click="viewRecipe(item)"
          hover-class="card-hover"
        >
          <view class="card-image">
            <text class="card-emoji">{{ item.coverImage || '⭐' }}</text>
          </view>
          <view class="card-body">
            <text class="card-name">{{ item.recipeName }}</text>
            <view class="card-meta">
              <view class="source-tag" :class="item.sourceType">
                {{ item.sourceType === 'ai_generated' ? 'AI推荐' : '我的发布' }}
              </view>
              <text class="card-time">{{ formatTime(item.createTime) }}</text>
            </view>
          </view>
          <view class="card-action" @click.stop="removeFav(item.id)">
            <wd-icon name="star-fill" size="18px" color="#FF6B35" />
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-state">
        <wd-icon name="loading2" size="32px" color="#FF6B35" />
        <text>加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
import { getLocalUser } from '@/utils/auth'
import { getFavoriteList, removeFavorite } from '@/apis/dietApi'
import type { FavoriteItem } from '@/apis/dietApi'

const { capsuleBottomToTop } = useSystemInfo()
const user = getLocalUser()
const userId = (user?.id as any) || 1

const list = ref<FavoriteItem[]>([])
const loading = ref(true)

onMounted(() => load())

async function load() {
  loading.value = true
  try {
    list.value = await getFavoriteList(userId)
  } catch (e) {
    console.error('加载收藏失败', e)
  } finally {
    loading.value = false
  }
}

function formatTime(time: string): string {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function viewRecipe(item: FavoriteItem) {
  if (item.recipeContent) {
    uni.navigateTo({
      url: `/pages/recipeDetail/index?from=favorite&data=${encodeURIComponent(JSON.stringify(item.recipeContent))}`
    })
  }
}

async function removeFav(id: number) {
  uni.showModal({
    title: '取消收藏',
    content: '确定要取消收藏吗？',
    confirmText: '确认',
    cancelText: '再想想',
    success: async (res) => {
      if (res.confirm) {
        try {
          await removeFavorite(userId, id)
          list.value = list.value.filter(i => i.id !== id)
          uni.showToast({ title: '已取消', icon: 'none' })
        } catch (e) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

function goBack() { uni.navigateBack() }
function goMood() { uni.switchTab({ url: '/pages/moodRecipe/index' }) }
</script>

<style scoped>
.page { min-height: 100vh; background: #FFFAF6; }
.header-bg {
  position: fixed; top: 0; left: 0; right: 0;
  height: 500rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  border-radius: 0 0 60rpx 60rpx;
  z-index: 0;
}
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 30rpx 20rpx;
  z-index: 10;
}
.back-btn {
  width: 64rpx; height: 64rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.nav-title { font-size: 34rpx; font-weight: bold; color: #fff; }

.content { padding: 0 24rpx; position: relative; z-index: 1; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding-top: 120rpx; gap: 16rpx;
}
.empty-icon { font-size: 120rpx; }
.empty-title { font-size: 36rpx; font-weight: bold; color: #333; }
.empty-desc { font-size: 26rpx; color: #999; }
.empty-btn {
  margin-top: 20rpx;
  padding: 20rpx 60rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff; border-radius: 100rpx;
  font-size: 28rpx;
}

.card-list { display: flex; flex-direction: column; gap: 20rpx; padding-bottom: 40rpx; }
.recipe-card {
  display: flex; align-items: center; gap: 24rpx;
  background: #fff; border-radius: 24rpx;
  padding: 24rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}
.card-hover { opacity: 0.85; }
.card-image {
  width: 100rpx; height: 100rpx;
  background: rgba(255,107,53,0.08);
  border-radius: 20rpx;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.card-emoji { font-size: 60rpx; }
.card-body { flex: 1; overflow: hidden; }
.card-name {
  font-size: 30rpx; font-weight: bold; color: #333;
  display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.card-meta { display: flex; align-items: center; gap: 12rpx; margin-top: 8rpx; }
.source-tag {
  padding: 4rpx 12rpx; border-radius: 100rpx;
  font-size: 20rpx;
}
.source-tag.ai_generated { background: rgba(255,107,53,0.1); color: #FF6B35; }
.source-tag.user_published { background: rgba(82,196,26,0.1); color: #52C41A; }
.card-time { font-size: 22rpx; color: #BBB; }
.card-action { padding: 12rpx; }

.loading-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 80rpx 0; gap: 16rpx; color: #999; font-size: 26rpx;
}
</style>
