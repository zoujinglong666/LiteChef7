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
      <view class="nav-bar">
        <text class="nav-title">厨友圈</text>
        <view class="nav-actions">
          <view class="action-btn" @click="goWish">
            <wd-icon name="star" size="18px" color="#fff" />
          </view>
          <view class="action-btn" @click="showPostModal = true">
            <wd-icon name="add" size="20px" color="#fff" />
          </view>
        </view>
      </view>
      
      <!-- Tab -->
      <view class="tab-bar">
        <view class="tab-item" :class="{ active: activeTab === 'feed' }" @click="activeTab = 'feed'; loadFeed()">关注</view>
        <view class="tab-item" :class="{ active: activeTab === 'discover' }" @click="activeTab = 'discover'; loadDiscover()">发现</view>
      </view>
    </view>
    
    <!-- 动态列表 -->
    <view class="post-list">
      <view v-if="loading" class="loading-state">
        <wd-icon name="refresh" size="24px" color="#FF6B35" class="loading-icon" />
      </view>
      
      <view v-else-if="posts.length === 0" class="empty-state">
        <wd-icon name="folder" size="48px" color="#CCC" />
        <text class="empty-title">还没有动态</text>
        <text class="empty-desc">分享你今天做了什么菜吧~</text>
      </view>
      
      <view v-else class="post-item" v-for="p in posts" :key="p._id">
        <!-- 作者 -->
        <view class="post-header">
          <text class="author-avatar">{{ p.authorInfo?.avatar || '👤' }}</text>
          <view class="author-info">
            <text class="author-name">{{ p.authorInfo?.nickname || '厨友' }}</text>
            <text class="post-time">{{ formatTime(p.createTime) }}</text>
          </view>
          <view v-if="p.isWish" class="wish-tag">许愿</view>
        </view>
        
        <!-- 内容 -->
        <view class="post-content">
          <text class="post-text">{{ p.content }}</text>
          
          <!-- 图片 -->
          <view v-if="p.images?.length" class="post-images">
            <image v-for="(img, i) in p.images.slice(0, 3)" :key="i" :src="img" class="post-img" mode="aspectFill" @click="previewImage(p.images, i)" />
          </view>
          
          <!-- 关联菜谱 -->
          <view v-if="p.recipeInfo" class="post-recipe" @click="goRecipe(p.recipeId)">
            <text class="recipe-emoji">{{ p.recipeInfo.coverImage || '🍳' }}</text>
            <text class="recipe-name">{{ p.recipeInfo.name }}</text>
          </view>
          
          <!-- 许愿被实现 -->
          <view v-if="p.wishFulfilled" class="wish-fulfilled">
            <wd-icon name="check-circle" size="14px" color="#52c41a" />
            <text>已推荐：{{ p.fulfilledRecipe?.name }}</text>
          </view>
        </view>
        
        <!-- 操作 -->
        <view class="post-actions">
          <view class="action-item" @click="likePost(p._id)">
            <wd-icon name="heart" size="18px" color="#999" />
            <text>{{ p.stats?.likes || 0 }}</text>
          </view>
          <view class="action-item" @click="goComments(p._id)">
            <wd-icon name="chat" size="18px" color="#999" />
            <text>{{ p.stats?.comments || 0 }}</text>
          </view>
          <view v-if="p.isWish && !p.wishFulfilled" class="action-item" @click="fulfillWish(p)">
            <wd-icon name="star" size="18px" color="#FFD700" />
            <text>帮TA推荐</text>
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
import { getLocalUser } from '@/utils/auth'

const activeTab = ref('feed')
const posts = ref<any[]>([])
const loading = ref(false)
const showPostModal = ref(false)

const newPost = ref({
  content: '',
  type: 'cook'
})

onMounted(() => {
  loadFeed()
})

async function loadFeed() {
  loading.value = true
  try {
    const user = getLocalUser()
    const result = await uni.cloud.callFunction({
      name: 'chef-circle',
      data: {
        action: 'getFeed',
        openid: user?.openid
      }
    }) as any
    
    if (result.result?.code === 200) {
      posts.value = result.result.data
    }
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

async function loadDiscover() {
  loading.value = true
  try {
    const result = await uni.cloud.callFunction({
      name: 'chef-circle',
      data: { action: 'getDiscover' }
    }) as any
    
    if (result.result?.code === 200) {
      posts.value = result.result.data
    }
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

async function createPost() {
  if (!newPost.value.content.trim()) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  
  const user = getLocalUser()
  if (!user) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  try {
    const result = await uni.cloud.callFunction({
      name: 'chef-circle',
      data: {
        action: 'createPost',
        openid: user.openid,
        data: {
          content: newPost.value.content,
          type: newPost.value.type,
          authorInfo: {
            nickname: user.nickname || '厨友',
            avatar: user.avatar || '👤'
          }
        }
      }
    }) as any
    
    if (result.result?.code === 200) {
      showPostModal.value = false
      newPost.value.content = ''
      uni.showToast({ title: '发布成功', icon: 'success' })
      loadFeed()
    }
  } catch (error) {
    uni.showToast({ title: '发布失败', icon: 'none' })
  }
}

async function likePost(postId: string) {
  try {
    await uni.cloud.callFunction({
      name: 'chef-circle',
      data: { action: 'likePost', postId }
    })
    loadFeed()
  } catch (error) {
    console.error(error)
  }
}

async function fulfillWish(post: any) {
  // 跳转到菜谱广场选择菜谱推荐
  uni.showToast({ title: '去广场选择菜谱推荐', icon: 'none' })
}

function formatTime(time: string) {
  const d = new Date(time)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

function previewImage(images: string[], index: number) {
  uni.previewImage({ urls: images, current: index })
}

function goWish() {
  uni.navigateTo({ url: '/pages/wishWall/index' })
}

function goRecipe(id: string) {
  uni.navigateTo({ url: `/pages/recipeDetail/index?id=${id}` })
}

function goComments(postId: string) {
  uni.showToast({ title: '评论功能开发中', icon: 'none' })
}
</script>

<style scoped>
.circle-page { min-height: 100vh; background: #F8F9FA; }

.header { position: relative; overflow: hidden; }
.header-bg { position: absolute; top: 0; left: 0; right: 0; height: 200rpx; background: linear-gradient(135deg, #FF9E4D, #FF6B35); }
.nav-bar { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 100rpx 40rpx 20rpx; }
.nav-title { font-size: 36rpx; font-weight: bold; color: #fff; }
.nav-actions { display: flex; gap: 16rpx; }
.action-btn { width: 64rpx; height: 64rpx; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

.tab-bar { position: relative; display: flex; padding: 20rpx 40rpx; gap: 40rpx; }
.tab-item { font-size: 28rpx; color: rgba(255,255,255,0.7); padding-bottom: 16rpx; }
.tab-item.active { color: #fff; font-weight: bold; border-bottom: 4rpx solid #fff; }

.post-list { padding: 20rpx; }
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
.post-text { font-size: 28rpx; color: #333; line-height: 1.6; display: block; margin-bottom: 16rpx; }
.post-images { display: flex; gap: 12rpx; }
.post-img { width: 200rpx; height: 200rpx; border-radius: 12rpx; }
.post-recipe { display: flex; align-items: center; background: #FFF5EE; border-radius: 12rpx; padding: 16rpx; margin-top: 16rpx; }
.recipe-emoji { font-size: 40rpx; margin-right: 16rpx; }
.recipe-name { font-size: 26rpx; color: #FF6B35; }
.wish-fulfilled { display: flex; align-items: center; gap: 8rpx; margin-top: 16rpx; font-size: 24rpx; color: #52c41a; }

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
