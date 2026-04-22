<template>
  <view class="loading-state">
    <view class="loading-spinner">
      <view class="spinner-ring"/>
      <view class="spinner-ring"/>
      <view class="spinner-ring"/>
    </view>
    <text class="loading-text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: '加载中...'
})
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-spinner {
  position: relative;
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 20rpx;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4rpx solid transparent;
  border-top-color: #FF6B35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  animation-delay: 0.2s;
  border-top-color: #FF9E4D;
}

.spinner-ring:nth-child(3) {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  animation-delay: 0.4s;
  border-top-color: #FFD700;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}
</style>
