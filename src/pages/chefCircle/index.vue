<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "chefCircle"
}
</route>

<template>
  <view class="circle-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar" :style="{ paddingTop: capsuleBottomToTop + 'px' }">
        <text class="nav-title">厨友圈</text>
        <view class="nav-actions">
          <view class="action-btn" @click="showPostModal = true">
            <wd-icon name="add" size="20px" color="#fff" />
          </view>
        </view>
      </view>

      <view class="tab-bar">
        <view class="tab-item" :class="{ active: activeTab === 'feed' }" @click="switchTab('feed')">关注</view>
        <view class="tab-item" :class="{ active: activeTab === 'discover' }" @click="switchTab('discover')">发现</view>
      </view>
    </view>

    <view class="post-list">
      <view v-if="loading" class="loading-state">
        <wd-icon name="refresh" size="24px" color="#FF6B35" class="loading-icon" />
      </view>

      <view v-else-if="posts.length === 0" class="empty-state">
        <wd-icon name="users" size="48px" color="#CCC" />
        <text class="empty-title">还没有动态</text>
        <text class="empty-desc">分享你今天做了什么菜吧~</text>
      </view>

      <view v-else class="post-item" v-for="p in posts" :key="p.id">
        <!-- 作者 -->
        <view class="post-header">
          <text class="author-avatar">{{ p.authorAvatar || '👤' }}</text>
          <view class="author-info">
            <text class="author-name">{{ p.authorName || '厨友' }}</text>
            <text class="post-time">{{ formatTime(p.createTime) }}</text>
          </view>
          <view v-if="p.isWish" class="wish-tag">许愿</view>
        </view>

        <!-- 内容 -->
        <view class="post-content">
          <text class="post-text">{{ p.content }}</text>
        </view>

        <!-- 操作 -->
        <view class="post-actions">
          <view class="action-item" @click="likePost(p.id)">
            <wd-icon name="heart" size="18px" color="#999" />
            <text>{{ p.likes || 0 }}</text>
          </view>
          <view class="action-item">
            <wd-icon name="chat" size="18px" color="#999" />
            <text>{{ p.comments || 0 }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 发布弹窗 -->
    <view v-if="showPostModal" class="modal-overlay" @click="showPostModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">分享动态</text>
        <textarea v-model="newPost.content" placeholder="今天做了什么菜？" class="modal-input" />
        <view class="modal-type">
          <view class="type-item" :class="{ active: newPost.type === 'cook' }" @click="newPost.type = 'cook'">做菜</view>
          <view class="type-item" :class="{ active: newPost.type === 'wish' }" @click="newPost.type = 'wish'">许愿</view>
        </view>
        <button class="modal-btn" @click="createPost">发布</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { request } from '@/apis/serverApi'
import { getLocalUser } from '@/utils/auth'
import { useSystemInfo } from '@/composables'

const { capsuleBottomToTop } = useSystemInfo()

const activeTab = ref('feed')
const posts = ref<any[]>([])
const loading = ref(false)
const showPostModal = ref(false)

const newPost = ref({
  content: '',
  type: 'cook'
})

onMounted(() => {
  loadPosts()
})

async function loadPosts() {
  loading.value = true
  try {
    const endpoint = activeTab.value === 'feed' ? '/circle/feed' : '/circle/discover'
    const res = await request<any>(endpoint)
    if (res?.code === 200 && Array.isArray(res.data)) {
      posts.value = res.data
    }
  } catch {
    // 静默降级
  } finally {
    loading.value = false
  }
}

function switchTab(tab: string) {
  activeTab.value = tab
  loadPosts()
}

async function createPost() {
  if (!newPost.value.content.trim()) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  const user = getLocalUser()
  if (!user?.openid) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  try {
    // 使用 userId (优先) 或 openid
    const userIdParam = user.id || user.openid
    const res = await request<any>('/circle/post?userId=' + userIdParam, {
      method: 'POST',
      data: {
        content: newPost.value.content,
        type: newPost.value.type
      }
    })

    if (res?.code === 200) {
      showPostModal.value = false
      newPost.value.content = ''
      uni.showToast({ title: '发布成功', icon: 'success' })
      loadPosts()
    }
  } catch {
    uni.showToast({ title: '发布失败', icon: 'none' })
  }
}

async function likePost(postId: number) {
  try {
    await request<any>(`/circle/like/${postId}`, { method: 'POST' })
    loadPosts()
  } catch {
    // ignore
  }
}

function formatTime(time: string) {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}
</script>

<style scoped>
.circle-page { min-height: 100vh; background: #F8F9FA; }

.header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; overflow: hidden; }
.header-bg { position: absolute; top: 0; left: 0; right: 0; height: 200rpx; background: linear-gradient(135deg, #FF9E4D, #FF6B35); }
.nav-bar { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 0 40rpx 20rpx; }
.nav-title { font-size: 36rpx; font-weight: bold; color: #fff; }
.nav-actions { display: flex; gap: 16rpx; }
.action-btn { width: 64rpx; height: 64rpx; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

.tab-bar { position: relative; display: flex; padding: 20rpx 40rpx; gap: 24rpx; }
.tab-item { font-size: 28rpx; color: #fff; background: rgba(255,255,255,0.25); padding: 12rpx 28rpx; border-radius: 30rpx; transition: all 0.2s; }
.tab-item.active { color: #FF6B35; background: #fff; font-weight: bold; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1); }

.post-list { padding: 20rpx; padding-top: 300rpx; }
.loading-state { display: flex; justify-content: center; padding: 100rpx; }
.loading-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 100rpx; }
.empty-title { font-size: 32rpx; color: #666; margin: 30rpx 0 16rpx; }
.empty-desc { font-size: 26rpx; color: #999; }

.post-item { background: #fff; border-radius: 20rpx; padding: 30rpx; margin-bottom: 20rpx; }
.post-header { display: flex; align-items: center; margin-bottom: 20rpx; }
.author-avatar { font-size: 48rpx; margin-right: 16rpx; }
.author-info { flex: 1; }
.author-name { display: block; font-size: 28rpx; font-weight: bold; color: #333; }
.post-time { font-size: 22rpx; color: #999; }
.wish-tag { background: #FFD700; color: #fff; font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 10rpx; }

.post-content { margin-bottom: 20rpx; }
.post-text { font-size: 28rpx; color: #333; line-height: 1.6; display: block; }

.post-actions { display: flex; gap: 40rpx; padding-top: 20rpx; border-top: 1rpx solid #F0F0F0; }
.action-item { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; color: #999; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-content { width: 80%; background: #fff; border-radius: 20rpx; padding: 40rpx; }
.modal-title { display: block; font-size: 32rpx; font-weight: bold; text-align: center; margin-bottom: 30rpx; }
.modal-input { width: 100%; height: 200rpx; font-size: 28rpx; padding: 20rpx; background: #F5F5F5; border-radius: 12rpx; }
.modal-type { display: flex; gap: 20rpx; margin: 20rpx 0; }
.type-item { flex: 1; text-align: center; padding: 20rpx; background: #F5F5F5; border-radius: 12rpx; font-size: 26rpx; }
.type-item.active { background: #FF6B35; color: #fff; }
.modal-btn { width: 100%; background: linear-gradient(135deg, #FF9E4D, #FF6B35); color: #fff; font-size: 28rpx; padding: 24rpx; border-radius: 40rpx; margin-top: 20rpx; }
</style>
