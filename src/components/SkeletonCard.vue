<template>
  <view class="skeleton-card">
    <view class="skeleton-cover">
      <view class="skeleton-icon shimmer"/>
    </view>
    <view class="skeleton-content">
      <view class="skeleton-title shimmer"/>
      <view class="skeleton-desc shimmer"/>
      <view class="skeleton-author shimmer"/>
      <view class="skeleton-stats">
        <view class="skeleton-stat shimmer"/>
        <view class="skeleton-stat shimmer"/>
      </view>
    </view>
  </view>
</template>

<style scoped>
.skeleton-card {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.skeleton-cover {
  width: 200rpx;
  height: 200rpx;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.skeleton-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.skeleton-content {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.skeleton-title {
  height: 36rpx;
  width: 60%;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.skeleton-desc {
  height: 28rpx;
  width: 80%;
  border-radius: 6rpx;
  margin-bottom: 16rpx;
}

.skeleton-author {
  height: 28rpx;
  width: 40%;
  border-radius: 6rpx;
  margin-bottom: 20rpx;
}

.skeleton-stats {
  display: flex;
  gap: 24rpx;
}

.skeleton-stat {
  height: 28rpx;
  width: 80rpx;
  border-radius: 6rpx;
}

.shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
