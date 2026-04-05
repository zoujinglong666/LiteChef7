<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "thaw"
}
</route>

<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack"><wd-icon name="chevron-left" size="20px" color="#fff" /></view>
        <text class="nav-title">解冻计算</text>
        <view class="nav-right" />
      </view>
      <view class="header-info">
        <text class="header-title">科学解冻</text>
        <text class="header-sub">计算最佳解冻时间，保证肉质鲜嫩</text>
      </view>
    </view>

    <!-- 肉类选择 -->
    <view class="section">
      <view class="section-head">
        <wd-icon name="goods" size="16px" class="section-icon" />
        <text class="section-title">选择肉类</text>
      </view>
      <view class="meat-grid">
        <view
          class="meat-item"
          :class="{ active: selectedMeat === meat.key }"
          v-for="meat in meatList"
          :key="meat.key"
          @click="selectedMeat = meat.key"
        >
          <text class="meat-icon">{{ meat.icon }}</text>
          <text class="meat-name">{{ meat.name }}</text>
        </view>
      </view>
    </view>

    <!-- 重量输入 -->
    <view class="section">
      <view class="section-head">
        <wd-icon name="chart-pie" size="16px" class="section-icon" />
        <text class="section-title">输入重量</text>
      </view>
      <view class="weight-row">
        <input
          class="weight-input"
          type="digit"
          v-model="weight"
          placeholder="输入重量"
        />
        <text class="weight-unit">克</text>
      </view>
      <view class="quick-weights">
        <text
          class="qw-btn"
          v-for="q in [250, 500, 750, 1000]"
          :key="q"
          @click="weight = q.toString()"
        >{{ q }}g</text>
      </view>
    </view>

    <!-- 解冻方式 -->
    <view class="section">
      <view class="section-head">
        <wd-icon name="setting" size="16px" class="section-icon" />
        <text class="section-title">解冻方式</text>
      </view>
      <view class="method-list">
        <view
          class="method-item"
          :class="{ active: selectedMethod === method.key }"
          v-for="method in methodList"
          :key="method.key"
          @click="selectedMethod = method.key"
        >
          <text class="method-icon">{{ method.icon }}</text>
          <view class="method-info">
            <text class="method-name">{{ method.name }}</text>
            <text class="method-desc">{{ method.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 计算结果 -->
    <view class="result-card" v-if="result">
      <view class="result-header">
        <wd-icon name="clock" size="18px" class="result-icon" />
        <text class="result-title">建议解冻时间</text>
      </view>
      <view class="result-time">
        <text class="time-num">{{ result.hours }}</text>
        <text class="time-unit">小时</text>
        <text class="time-num" v-if="result.minutes">{{ result.minutes }}</text>
        <text class="time-unit" v-if="result.minutes">分钟</text>
      </view>
      <view class="result-tips">
        <view class="tip-item" v-for="(tip, i) in result.tips" :key="i">
          <text class="tip-dot">•</text>
          <text class="tip-text">{{ tip }}</text>
        </view>
      </view>
      <button class="start-btn" @click="startTimer">
        开始计时
      </button>
    </view>

    <view class="bottom-placeholder" />
  </view>
</template>

<script setup lang="ts">
const selectedMeat = ref('pork')
const weight = ref('500')
const selectedMethod = ref('fridge')

const meatList = [
  { key: 'pork', icon: '🥩', name: '猪肉' },
  { key: 'beef', icon: '🥩', name: '牛肉' },
  { key: 'chicken', icon: '🍗', name: '鸡肉' },
  { key: 'fish', icon: '🐟', name: '鱼肉' },
  { key: 'shrimp', icon: '🦐', name: '虾' },
]

const methodList = [
  { key: 'fridge', icon: 'time', name: '冷藏室解冻', desc: '最安全，需提前规划' },
  { key: 'water', icon: '💧', name: '冷水浸泡', desc: '较快，需密封袋' },
  { key: 'room', icon: '🌡️', name: '室温解冻', desc: '最快，但需注意卫生' },
]

interface ThawResult {
  hours: number
  minutes?: number
  tips: string[]
}

const result = computed<ThawResult | null>(() => {
  const w = parseFloat(weight.value)
  if (!w || w <= 0) return null

  // 基础时间系数（每500g需要的小时数）
  const baseTime: Record<string, Record<string, number>> = {
    pork: { fridge: 8, water: 1.5, room: 2 },
    beef: { fridge: 10, water: 2, room: 3 },
    chicken: { fridge: 6, water: 1, room: 1.5 },
    fish: { fridge: 4, water: 0.5, room: 1 },
    shrimp: { fridge: 2, water: 0.25, room: 0.5 },
  }

  const hours = (w / 500) * baseTime[selectedMeat.value][selectedMethod.value]

  const tips: string[] = []

  if (selectedMethod.value === 'fridge') {
    tips.push('冷藏室温度保持在 0-4°C')
    tips.push('放在盘子或容器中，防止滴水污染')
    tips.push('解冻后可在冷藏室保存 1-2 天')
  } else if (selectedMethod.value === 'water') {
    tips.push('必须用密封袋包裹，防止水渗入')
    tips.push('每 30 分钟换一次冷水')
    tips.push('解冻后立即烹饪，不宜久放')
  } else {
    tips.push('仅适合当天立即烹饪')
    tips.push('避免阳光直射，放在阴凉处')
    tips.push('表面解冻即可，中心可微冻')
  }

  if (w > 1000) {
    tips.push('大块肉类建议分割后再解冻')
  }

  return {
    hours: Math.floor(hours),
    minutes: Math.round((hours % 1) * 60) || undefined,
    tips
  }
})

function startTimer() {
  if (!result.value) return
  const totalMinutes = result.value.hours * 60 + (result.value.minutes || 0)
  uni.navigateTo({
    url: `/pages/kitchenTools/timer?minutes=${totalMinutes}`
  })
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page { min-height: 100vh; background: #F8F9FA; }

/* 顶部 */
.header {
  background: linear-gradient(135deg, #FF6B35 0%, #FF9E4D 100%);
  padding-bottom: 40rpx;
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

.header-info { padding: 10rpx 50rpx; }
.header-title { display: block; font-size: 44rpx; font-weight: bold; color: #fff; margin-bottom: 8rpx; }
.header-sub { font-size: 26rpx; color: rgba(255,255,255,0.85); }

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
  margin-bottom: 20rpx;
}

.section-icon { font-size: 32rpx; margin-right: 12rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; }

/* 肉类网格 */
.meat-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx;
}

.meat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 8rpx;
  background: #F5F5F5;
  border-radius: 20rpx;
  border: 3rpx solid transparent;
}

.meat-item.active {
  background: #FFF5EE;
  border-color: #FF6B35;
}

.meat-icon { font-size: 40rpx; margin-bottom: 8rpx; }
.meat-name { font-size: 22rpx; color: #666; }
.meat-item.active .meat-name { color: #FF6B35; font-weight: bold; }

/* 重量 */
.weight-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.weight-input {
  flex: 1;
  background: #F5F5F5;
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  font-size: 32rpx;
  text-align: center;
}

.weight-unit { font-size: 28rpx; color: #888; }

.quick-weights {
  display: flex;
  justify-content: center;
  gap: 16rpx;
}

.qw-btn {
  font-size: 24rpx;
  color: #FF6B35;
  background: #FFF5EE;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
}

/* 解冻方式 */
.method-list { display: flex; flex-direction: column; gap: 16rpx; }

.method-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: #F5F5F5;
  border-radius: 20rpx;
  border: 3rpx solid transparent;
}

.method-item.active {
  background: #FFF5EE;
  border-color: #FF6B35;
}

.method-icon { font-size: 40rpx; }
.method-info { flex: 1; }
.method-name { display: block; font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 4rpx; }
.method-desc { font-size: 22rpx; color: #888; }

/* 结果 */
.result-card {
  background: linear-gradient(135deg, #FFF5EE, #FFF0E8);
  margin: 20rpx 30rpx;
  border-radius: 28rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(102,126,234,0.2);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.result-icon { font-size: 36rpx; }
.result-title { font-size: 28rpx; color: #FF6B35; font-weight: bold; }

.result-time {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 28rpx;
}

.time-num { font-size: 72rpx; font-weight: bold; color: #FF6B35; }
.time-unit { font-size: 28rpx; color: #888; }

.result-tips {
  background: rgba(255,255,255,0.6);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.tip-dot { color: #FF6B35; font-size: 24rpx; }
.tip-text { font-size: 24rpx; color: #555; line-height: 1.6; }

.start-btn {
  background: linear-gradient(135deg, #FF6B35, #FF9E4D);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 24rpx 0;
  font-size: 30rpx;
  font-weight: bold;
}

.bottom-placeholder { height: 60rpx; }
</style>
