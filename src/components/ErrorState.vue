<template>
  <view class="error-state">
    <wd-icon name="warning" size="48px" :color="iconColor"/>
    <text class="error-title">{{ title }}</text>
    <text class="error-desc">{{ description }}</text>
    <button
      v-if="showRetry"
      class="retry-btn"
      :class="{ 'retry-loading': retrying }"
      @click="handleRetry"
      :loading="retrying"
    >
      {{ retryText }}
    </button>
  </view>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  showRetry?: boolean
  retryText?: string
  iconColor?: string
  retrying?: boolean
}

const emit = defineEmits<{
  retry: []
}>()

withDefaults(defineProps<Props>(), {
  title: '加载失败',
  description: '网络异常，请稍后重试',
  showRetry: true,
  retryText: '重新加载',
  iconColor: '#CCC',
  retrying: false
})

function handleRetry() {
  emit('retry')
}
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 60rpx;
  text-align: center;
}

.error-title {
  font-size: 32rpx;
  color: #666;
  margin-top: 30rpx;
  font-weight: 500;
}

.error-desc {
  font-size: 26rpx;
  color: #999;
  margin-top: 16rpx;
  line-height: 1.5;
}

.retry-btn {
  margin-top: 40rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
  font-size: 28rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  border: none;
  min-width: 200rpx;
}

.retry-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.retry-btn.retry-loading {
  opacity: 0.7;
}
</style>
