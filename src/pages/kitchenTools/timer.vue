<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "timer"
}
</route>

<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack"><wd-icon name="chevron-left" size="20px" color="#fff" /></view>
        <text class="nav-title">烹饪计时器</text>
        <view class="nav-right" />
      </view>
    </view>

    <!-- 计时器显示 -->
    <view class="timer-section">
      <view class="timer-circle">
        <text class="timer-time">{{ formatTime(remaining) }}</text>
        <text class="timer-status">{{ statusText }}</text>
      </view>
    </view>

    <!-- 控制按钮 -->
    <view class="control-row" v-if="remaining > 0">
      <button class="ctrl-btn primary" @click="toggleTimer">
        {{ isRunning ? '⏸ 暂停' : '▶ 继续' }}
      </button>
      <button class="ctrl-btn" @click="resetTimer">重置</button>
    </view>

    <!-- 快捷时间 -->
    <view class="section">
      <view class="section-head">
        <wd-icon name="clock" size="16px" class="section-icon" />
        <text class="section-title">快捷时间</text>
      </view>
      <view class="quick-grid">
        <view
          class="quick-item"
          v-for="q in quickTimes"
          :key="q.minutes"
          @click="setTime(q.minutes)"
        >
          <text class="quick-name">{{ q.name }}</text>
          <text class="quick-time">{{ q.minutes }}分钟</text>
        </view>
      </view>
    </view>

    <!-- 自定义时间 -->
    <view class="section">
      <view class="section-head">
        <wd-icon name="setting" size="16px" class="section-icon" />
        <text class="section-title">自定义时间</text>
      </view>
      <view class="custom-row">
        <picker mode="selector" :range="minuteOptions" @change="onMinuteChange">
          <view class="picker-btn">{{ customMinutes }} 分钟</view>
        </picker>
        <button class="set-btn" @click="setTime(customMinutes)">设置</button>
      </view>
    </view>

    <view class="bottom-placeholder" />
  </view>
</template>

<script setup lang="ts">
const remaining = ref(0)
const isRunning = ref(false)
const customMinutes = ref(10)
let timer: any = null

const quickTimes = [
  { name: '煮蛋', minutes: 8 },
  { name: '蒸蛋', minutes: 12 },
  { name: '炖肉', minutes: 60 },
  { name: '焖饭', minutes: 25 },
  { name: '蒸鱼', minutes: 15 },
  { name: '煮面', minutes: 5 },
]

const minuteOptions = Array.from({ length: 120 }, (_, i) => `${i + 1}`)

const statusText = computed(() => {
  if (remaining.value === 0) return '选择时间开始'
  if (isRunning.value) return '计时中...'
  return '已暂停'
})

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function setTime(minutes: number) {
  remaining.value = minutes * 60
  isRunning.value = false
  if (timer) clearInterval(timer)
  startTimer()
}

function startTimer() {
  if (remaining.value <= 0) return
  isRunning.value = true
  timer = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value--
    } else {
      clearInterval(timer)
      isRunning.value = false
      uni.showToast({ title: '时间到！🔔', icon: 'none', duration: 3000 })
      // 震动提醒
      uni.vibrateShort({ type: 'heavy' })
    }
  }, 1000)
}

function toggleTimer() {
  if (isRunning.value) {
    clearInterval(timer)
    isRunning.value = false
  } else {
    startTimer()
  }
}

function resetTimer() {
  clearInterval(timer)
  remaining.value = 0
  isRunning.value = false
}

function onMinuteChange(e: any) {
  customMinutes.value = parseInt(minuteOptions[e.detail.value])
}

function goBack() { uni.navigateBack() }

onUnload(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.page { min-height: 100vh; background: #F8F9FA; }

/* 顶部 */
.header {
  background: linear-gradient(135deg, #FF9E4D 0%, #FF6B35 100%);
  padding-bottom: 20rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 40rpx 20rpx;
}

.back-btn {
  width: 72rpx; height: 72rpx;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.back-icon { font-size: 52rpx; color: #fff; font-weight: bold; }
.nav-title { font-size: 34rpx; font-weight: bold; color: #fff; }
.nav-right { width: 72rpx; }

/* 计时器 */
.timer-section {
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
}

.timer-circle {
  width: 400rpx; height: 400rpx;
  background: linear-gradient(135deg, #FFF9F5, #FFF0E8);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 40rpx rgba(255,107,53,0.2);
}

.timer-time { font-size: 80rpx; font-weight: bold; color: #FF6B35; }
.timer-status { font-size: 28rpx; color: #888; margin-top: 16rpx; }

/* 控制按钮 */
.control-row {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  padding: 0 30rpx 40rpx;
}

.ctrl-btn {
  padding: 24rpx 60rpx;
  border-radius: 50rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
  background: #F5F5F5;
  color: #666;
}

.ctrl-btn.primary {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
}

/* section */
.section {
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.section-head {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-icon { font-size: 32rpx; margin-right: 12rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; }

/* 快捷时间 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.quick-item {
  background: #FFF9F5;
  border-radius: 20rpx;
  padding: 24rpx;
  text-align: center;
}

.quick-name { display: block; font-size: 28rpx; color: #333; font-weight: 500; margin-bottom: 8rpx; }
.quick-time { font-size: 22rpx; color: #FF6B35; }

/* 自定义 */
.custom-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.picker-btn {
  flex: 1;
  background: #F5F5F5;
  border-radius: 24rpx;
  padding: 24rpx;
  font-size: 28rpx;
  text-align: center;
}

.set-btn {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
  border: none;
  border-radius: 24rpx;
  padding: 24rpx 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.bottom-placeholder { height: 60rpx; }
</style>
