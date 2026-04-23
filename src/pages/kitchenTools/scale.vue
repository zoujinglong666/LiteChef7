<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "scale"
}
</route>

<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="nav-bar" :style="{ paddingTop: capsuleBottomToTop + 'px' }">
        <view class="back-btn" @click="goBack"><wd-icon name="chevron-left" size="20px" color="#fff" /></view>
        <text class="nav-title">分量计算器</text>
        <view class="nav-right" />
      </view>
      <view class="header-info">
        <text class="header-title">智能换算</text>
        <text class="header-sub">自动计算不同人数的食材用量</text>
      </view>
    </view>

    <!-- 人数设置 -->
    <view class="section">
      <view class="section-head">
        <wd-icon name="user" size="16px" class="section-icon" />
        <text class="section-title">设置人数</text>
      </view>
      <view class="people-row">
        <view class="people-item">
          <text class="people-label">原菜谱</text>
          <view class="people-control">
            <text class="ctrl-btn" @click="fromPeople = Math.max(1, fromPeople - 1)">-</text>
            <text class="ctrl-num">{{ fromPeople }}</text>
            <text class="ctrl-btn" @click="fromPeople++">+</text>
          </view>
          <text class="people-unit">人份</text>
        </view>
        <text class="people-arrow">→</text>
        <view class="people-item">
          <text class="people-label">需要做</text>
          <view class="people-control">
            <text class="ctrl-btn" @click="toPeople = Math.max(1, toPeople - 1)">-</text>
            <text class="ctrl-num">{{ toPeople }}</text>
            <text class="ctrl-btn" @click="toPeople++">+</text>
          </view>
          <text class="people-unit">人份</text>
        </view>
      </view>
      <view class="scale-tip" v-if="scaleRatio !== 1">
        <wd-icon name="info-circle" size="14px" class="tip-icon" />
        <text class="tip-text">所有食材将 ×{{ scaleRatio.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 食材输入 -->
    <view class="section">
      <view class="section-head">
        <wd-icon name="goods" size="16px" class="section-icon" />
        <text class="section-title">食材清单</text>
        <text class="section-add" @click="addIngredient">+ 添加</text>
      </view>
      <view class="ingredients-list">
        <view class="ingredient-item" v-for="(ing, i) in ingredients" :key="i">
          <input class="ing-name" v-model="ing.name" placeholder="食材名称" />
          <input class="ing-amount" type="digit" v-model="ing.amount" placeholder="用量" />
          <input class="ing-unit" v-model="ing.unit" placeholder="单位" />
          <text class="ing-delete" @click="ingredients.splice(i, 1)">✕</text>
        </view>
      </view>
      <view class="quick-add" v-if="ingredients.length === 0">
        <text class="quick-tip">快速添加常用食材：</text>
        <view class="quick-btns">
          <text class="quick-btn" v-for="q in quickIngredients" :key="q.name" @click="addQuick(q)">{{ q.name }}</text>
        </view>
      </view>
    </view>

    <!-- 计算结果 -->
    <view class="section result-section" v-if="ingredients.length > 0">
      <view class="section-head">
        <wd-icon name="check-circle" size="16px" class="section-icon" />
        <text class="section-title">换算结果</text>
        <text class="section-copy" @click="copyResult">复制</text>
      </view>
      <view class="result-list">
        <view class="result-item" v-for="(ing, i) in ingredients" :key="i">
          <text class="result-name">{{ ing.name }}</text>
          <text class="result-amount">{{ scaledAmount(ing.amount) }}</text>
          <text class="result-unit">{{ ing.unit }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-placeholder" />
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
const { capsuleBottomToTop } = useSystemInfo()

const fromPeople = ref(2)
const toPeople = ref(4)

interface Ingredient {
  name: string
  amount: string
  unit: string
}

const ingredients = ref<Ingredient[]>([])

const quickIngredients = [
  { name: '猪肉', amount: '300', unit: 'g' },
  { name: '鸡蛋', amount: '2', unit: '个' },
  { name: '土豆', amount: '2', unit: '个' },
  { name: '番茄', amount: '2', unit: '个' },
  { name: '盐', amount: '1', unit: '勺' },
  { name: '酱油', amount: '2', unit: '勺' },
]

const scaleRatio = computed(() => toPeople.value / fromPeople.value)

function addIngredient() {
  ingredients.value.push({ name: '', amount: '', unit: '' })
}

function addQuick(q: typeof quickIngredients[0]) {
  ingredients.value.push({ ...q })
}

function scaledAmount(amount: string): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  const scaled = num * scaleRatio.value
  // 智能显示：整数显示整数，小数保留1位
  if (scaled === Math.floor(scaled)) return scaled.toString()
  return scaled.toFixed(1)
}

function copyResult() {
  const text = ingredients.value.map(ing => 
    `${ing.name} ${scaledAmount(ing.amount)} ${ing.unit}`
  ).join('\n')
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: '已复制', icon: 'success' })
  })
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page { min-height: 100vh; background: #F8F9FA; }

/* 顶部 */
.header {
  background: linear-gradient(135deg, #FF9E4D 0%, #FF6B35 100%);
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
  margin-bottom: 24rpx;
}

.section-icon { font-size: 32rpx; margin-right: 12rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; flex: 1; }
.section-add, .section-copy { font-size: 26rpx; color: #FF6B35; }

/* 人数设置 */
.people-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20rpx 0;
}

.people-item { text-align: center; }
.people-label { display: block; font-size: 24rpx; color: #888; margin-bottom: 16rpx; }

.people-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 12rpx;
}

.ctrl-btn {
  width: 64rpx; height: 64rpx;
  background: #FFF0E8;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 36rpx; color: #FF6B35; font-weight: bold;
}
.ctrl-num { font-size: 48rpx; font-weight: bold; color: #333; min-width: 80rpx; text-align: center; }
.people-unit { font-size: 24rpx; color: #888; }
.people-arrow { font-size: 40rpx; color: #FF6B35; }

.scale-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 20rpx;
  padding: 16rpx;
  background: #FFF9F5;
  border-radius: 16rpx;
}
.tip-icon { font-size: 28rpx; }
.tip-text { font-size: 26rpx; color: #FF6B35; font-weight: 500; }

/* 食材列表 */
.ingredients-list { display: flex; flex-direction: column; gap: 16rpx; }

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #F8F9FA;
  border-radius: 16rpx;
  padding: 16rpx;
}

.ing-name { flex: 2; font-size: 28rpx; background: transparent; }
.ing-amount { flex: 1; font-size: 28rpx; background: transparent; text-align: center; }
.ing-unit { flex: 1; font-size: 28rpx; background: transparent; text-align: center; }
.ing-delete { font-size: 28rpx; color: #CCC; padding: 8rpx; }

/* 快速添加 */
.quick-add { padding: 20rpx 0; }
.quick-tip { display: block; font-size: 24rpx; color: #888; margin-bottom: 16rpx; }
.quick-btns { display: flex; flex-wrap: wrap; gap: 16rpx; }
.quick-btn {
  font-size: 26rpx;
  color: #FF6B35;
  background: #FFF0E8;
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
}

/* 结果 */
.result-section { background: linear-gradient(135deg, #FFF9F5, #FFF5EE); }
.result-list { display: flex; flex-direction: column; gap: 12rpx; }

.result-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
}

.result-name { flex: 1; font-size: 28rpx; color: #333; font-weight: 500; }
.result-amount { font-size: 32rpx; color: #FF6B35; font-weight: bold; margin-right: 8rpx; }
.result-unit { font-size: 24rpx; color: #888; }

.bottom-placeholder { height: 60rpx; }
</style>
