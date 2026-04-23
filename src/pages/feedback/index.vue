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
      <text class="nav-title">意见反馈</text>
      <view style="width: 64rpx" />
    </view>

    <view class="content" :style="{ paddingTop: (capsuleBottomToTop + 88) + 'px' }">
      <!-- 简介 -->
      <view class="intro-card">
        <text class="intro-icon">💬</text>
        <view class="intro-text">
          <text class="intro-title">我们很重视你的反馈</text>
          <text class="intro-desc">遇到问题或有好的建议，欢迎告诉我们</text>
        </view>
      </view>

      <!-- 反馈类型 -->
      <view class="section-card">
        <view class="section-head"><text class="section-title">反馈类型</text></view>
        <view class="type-grid">
          <view v-for="t in typeOptions" :key="t.value"
            class="type-item" :class="{ active: selectedType === t.value }"
            @click="selectedType = t.value">
            <text class="type-icon">{{ t.icon }}</text>
            <text class="type-label">{{ t.label }}</text>
          </view>
        </view>
      </view>

      <!-- 反馈内容 -->
      <view class="section-card">
        <view class="section-head">
          <text class="section-title">反馈内容</text>
          <text class="char-count">{{ content.length }}/500</text>
        </view>
        <textarea v-model="content" class="content-input"
          placeholder="请详细描述你的问题或建议..." :maxlength="500" />
      </view>

      <!-- 联系方式 -->
      <view class="section-card">
        <view class="section-head"><text class="section-title">联系方式（选填）</text></view>
        <input class="contact-input" v-model="contact"
          placeholder="手机号或邮箱，方便我们联系你" />
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" :disabled="submitting || !content.trim()" @click="doSubmit">
        <text v-if="!submitting">提交反馈</text>
        <text v-else>提交中...</text>
      </button>

      <!-- 历史反馈 -->
      <view v-if="myFeedback.length > 0" class="section-card history-card">
        <view class="section-head"><text class="section-title">我的反馈</text></view>
        <view v-for="f in myFeedback" :key="f.id" class="history-item">
          <view class="history-header">
            <text class="history-type" :class="f.type">{{ typeLabel(f.type) }}</text>
            <text class="history-status" :class="f.status">{{ f.status === 'done' ? '已处理' : '处理中' }}</text>
          </view>
          <text class="history-content">{{ f.content }}</text>
          <text class="history-time">{{ formatTime(f.createTime) }}</text>
        </view>
      </view>

      <view style="height: 60rpx" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
import { getLocalUser } from '@/utils/auth'
import { submitFeedback, getMyFeedbackList } from '@/apis/dietApi'
import type { FeedbackItem } from '@/apis/dietApi'

const { capsuleBottomToTop } = useSystemInfo()
const user = getLocalUser()
const userId = user?.id ? (user.id as any) : 1

const selectedType = ref('bug')
const content = ref('')
const contact = ref('')
const submitting = ref(false)
const myFeedback = ref<FeedbackItem[]>([])

const typeOptions = [
  { value: 'bug', label: 'Bug反馈', icon: '🪳' },
  { value: 'feature', label: '功能建议', icon: '💡' },
  { value: 'complaint', label: '投诉', icon: '😡' },
  { value: 'praise', label: '好评', icon: '🥰' }
]

onMounted(async () => {
  try {
    myFeedback.value = await getMyFeedbackList(userId as any)
  } catch {}
})

async function doSubmit() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入反馈内容', icon: 'none' })
    return
  }
  if (submitting.value) return
  submitting.value = true
  uni.showLoading({ title: '提交中...', mask: true })
  try {
    await submitFeedback({
      userId: userId as any,
      type: selectedType.value,
      content: content.value.trim(),
      contact: contact.value.trim() || undefined
    } as any)
    uni.showToast({ title: '反馈已提交，感谢！', icon: 'success' })
    content.value = ''
    myFeedback.value = await getMyFeedbackList(userId as any)
  } catch (e: any) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
    uni.hideLoading()
  }
}

function typeLabel(type: string) {
  return typeOptions.find(t => t.value === type)?.label || type
}
function formatTime(time: string) {
  if (!time) return ''
  return new Date(time).toLocaleDateString('zh-CN')
}
function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page { min-height: 100vh; background: #FFFAF6; }
.header-bg {
  position: fixed; top: 0; left: 0; right: 0; height: 500rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  border-radius: 0 0 60rpx 60rpx; z-index: 0;
}
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 30rpx 20rpx; z-index: 10;
}
.back-btn {
  width: 64rpx; height: 64rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.nav-title { font-size: 34rpx; font-weight: bold; color: #fff; }
.content { padding: 0 24rpx; position: relative; z-index: 1; }

.intro-card {
  display: flex; align-items: center; gap: 20rpx;
  background: #fff; border-radius: 24rpx;
  padding: 28rpx; margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(255,107,53,0.1);
}
.intro-icon { font-size: 52rpx; }
.intro-text { display: flex; flex-direction: column; gap: 6rpx; }
.intro-title { font-size: 28rpx; font-weight: bold; color: #333; }
.intro-desc { font-size: 22rpx; color: #999; }

.section-card {
  background: #fff; border-radius: 24rpx;
  padding: 28rpx; margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}
.section-head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx;
}
.section-title { font-size: 30rpx; font-weight: bold; color: #333; }
.char-count { font-size: 22rpx; color: #CCC; }

.type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16rpx; }
.type-item {
  display: flex; flex-direction: column; align-items: center; gap: 8rpx;
  padding: 20rpx 8rpx; border-radius: 20rpx;
  background: #F8F8F8; border: 2rpx solid transparent; transition: all 0.2s;
}
.type-item.active {
  background: rgba(255,107,53,0.1); border-color: #FF6B35;
}
.type-icon { font-size: 40rpx; }
.type-label { font-size: 22rpx; color: #666; }
.type-item.active .type-label { color: #FF6B35; font-weight: 500; }

.content-input {
  width: 100%; min-height: 200rpx;
  background: #F8F8F8; border-radius: 16rpx;
  padding: 20rpx; font-size: 28rpx; color: #333; box-sizing: border-box;
}
.contact-input {
  width: 100%; padding: 20rpx; border-radius: 16rpx;
  background: #F8F8F8; font-size: 28rpx; color: #333; box-sizing: border-box;
}

.submit-btn {
  width: 100%; padding: 28rpx 0;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff; font-size: 32rpx; font-weight: bold;
  border-radius: 100rpx; border: none;
  box-shadow: 0 8rpx 24rpx rgba(255,107,53,0.35);
}
.submit-btn[disabled] { opacity: 0.5; }

.history-card { margin-top: 10rpx; }
.history-item {
  border-top: 1rpx solid #F0F0F0; padding: 20rpx 0;
}
.history-item:first-child { border-top: none; }
.history-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx;
}
.history-type {
  font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 100rpx;
}
.history-type.bug { background: rgba(255,107,53,0.1); color: #FF6B35; }
.history-type.feature { background: rgba(82,196,26,0.1); color: #52C41A; }
.history-type.complaint { background: rgba(250,173,20,0.1); color: #FA8C16; }
.history-type.praise { background: rgba(24,144,255,0.1); color: #1890FF; }
.history-status { font-size: 22rpx; }
.history-status.pending { color: #FA8C16; }
.history-status.done { color: #52C41A; }
.history-content { display: block; font-size: 26rpx; color: #333; line-height: 1.5; }
.history-time { display: block; font-size: 22rpx; color: #CCC; margin-top: 6rpx; }
</style>
