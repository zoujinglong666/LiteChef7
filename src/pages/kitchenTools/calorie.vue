<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "calorie"
}
</route>

<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack"><wd-icon name="chevron-left" size="20px" color="#fff" /></view>
        <text class="nav-title">热量计算</text>
        <view class="nav-right" />
      </view>
      <view class="header-info">
        <text class="header-title">营养热量</text>
        <text class="header-sub">计算菜品总热量，健康饮食好帮手</text>
      </view>
    </view>

    <!-- 食材列表 -->
    <view class="section">
      <view class="section-head">
        <wd-icon name="goods" size="16px" class="section-icon" />
        <text class="section-title">添加食材</text>
        <text class="section-add" @click="showPicker = true">+ 选择</text>
      </view>

      <view class="ingredient-list" v-if="selectedIngredients.length">
        <view class="ingredient-item" v-for="(ing, i) in selectedIngredients" :key="i">
          <text class="ing-name">{{ ing.name }}</text>
          <view class="ing-control">
            <text class="ctrl-btn" @click="adjustAmount(i, -50)">-</text>
            <text class="ctrl-amount">{{ ing.amount }}g</text>
            <text class="ctrl-btn" @click="adjustAmount(i, 50)">+</text>
          </view>
          <text class="ing-cal">{{ ing.calorie }} kcal</text>
          <text class="ing-delete" @click="selectedIngredients.splice(i, 1)">✕</text>
        </view>
      </view>

      <view class="empty-list" v-else>
        <text class="empty-text">点击「选择」添加食材</text>
      </view>
    </view>

    <!-- 统计结果 -->
    <view class="result-card" v-if="totalCalorie > 0">
      <view class="result-row">
        <view class="result-item main">
          <text class="result-value">{{ totalCalorie }}</text>
          <text class="result-unit">千卡</text>
          <text class="result-label">总热量</text>
        </view>
      </view>
      <view class="result-row">
        <view class="result-item">
          <text class="result-value small">{{ Math.round(totalCalorie / 4) }}</text>
          <text class="result-unit small">g</text>
          <text class="result-label">碳水当量</text>
        </view>
        <view class="result-item">
          <text class="result-value small">{{ Math.round(totalCalorie / 9) }}</text>
          <text class="result-unit small">g</text>
          <text class="result-label">脂肪当量</text>
        </view>
        <view class="result-item">
          <text class="result-value small">{{ Math.round(totalCalorie / 4) }}</text>
          <text class="result-unit small">g</text>
          <text class="result-label">蛋白当量</text>
        </view>
      </view>
      <view class="compare-tip">
        <text class="compare-icon">📊</text>
        <text class="compare-text">相当于 {{ Math.round(totalCalorie / 100) }} 碗米饭的热量</text>
      </view>
    </view>

    <!-- 食材选择器 -->
    <view class="picker-mask" v-if="showPicker" @click="showPicker = false" />
    <view class="picker-panel" v-if="showPicker">
      <view class="picker-head">
        <text class="picker-title">选择食材</text>
        <text class="picker-close" @click="showPicker = false">完成</text>
      </view>
      <view class="picker-search">
        <input class="picker-input" v-model="searchKey" placeholder="搜索食材..." />
      </view>
      <scroll-view scroll-y class="picker-list">
        <view class="picker-category" v-for="cat in filteredCategories" :key="cat.name">
          <text class="category-name">{{ cat.name }}</text>
          <view class="category-items">
            <view
              class="picker-item"
              v-for="item in cat.items"
              :key="item.name"
              @click="addIngredient(item)"
            >
              <text class="item-name">{{ item.name }}</text>
              <text class="item-cal">{{ item.calorie }} kcal/100g</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="bottom-placeholder" />
  </view>
</template>

<script setup lang="ts">
const showPicker = ref(false)
const searchKey = ref('')

interface Ingredient {
  name: string
  amount: number
  caloriePer100g: number
  calorie: number
}

const selectedIngredients = ref<Ingredient[]>([])

// 常见食材热量数据（每100g）
const calorieData = [
  {
    name: '主食',
    items: [
      { name: '米饭', calorie: 116 },
      { name: '面条', calorie: 138 },
      { name: '馒头', calorie: 223 },
      { name: '面包', calorie: 266 },
      { name: '土豆', calorie: 81 },
      { name: '红薯', calorie: 102 },
    ]
  },
  {
    name: '肉类',
    items: [
      { name: '猪肉', calorie: 143 },
      { name: '牛肉', calorie: 106 },
      { name: '羊肉', calorie: 118 },
      { name: '鸡肉', calorie: 167 },
      { name: '鸭肉', calorie: 240 },
      { name: '鱼肉', calorie: 104 },
      { name: '虾', calorie: 87 },
    ]
  },
  {
    name: '蛋奶',
    items: [
      { name: '鸡蛋', calorie: 147 },
      { name: '鸭蛋', calorie: 180 },
      { name: '牛奶', calorie: 54 },
      { name: '酸奶', calorie: 72 },
      { name: '奶酪', calorie: 328 },
    ]
  },
  {
    name: '蔬菜',
    items: [
      { name: '番茄', calorie: 18 },
      { name: '黄瓜', calorie: 15 },
      { name: '白菜', calorie: 17 },
      { name: '菠菜', calorie: 23 },
      { name: '西兰花', calorie: 36 },
      { name: '茄子', calorie: 23 },
      { name: '青椒', calorie: 23 },
    ]
  },
  {
    name: '豆制品',
    items: [
      { name: '豆腐', calorie: 82 },
      { name: '豆浆', calorie: 31 },
      { name: '豆干', calorie: 140 },
      { name: '腐竹', calorie: 459 },
    ]
  },
  {
    name: '油脂调料',
    items: [
      { name: '食用油', calorie: 899 },
      { name: '猪油', calorie: 897 },
      { name: '黄油', calorie: 888 },
      { name: '白糖', calorie: 400 },
      { name: '蜂蜜', calorie: 321 },
    ]
  },
]

const filteredCategories = computed(() => {
  if (!searchKey.value) return calorieData
  const key = searchKey.value.toLowerCase()
  return calorieData
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.name.includes(key))
    }))
    .filter(cat => cat.items.length > 0)
})

const totalCalorie = computed(() => {
  return selectedIngredients.value.reduce((sum, ing) => sum + ing.calorie, 0)
})

function addIngredient(item: { name: string; calorie: number }) {
  const existing = selectedIngredients.value.find(i => i.name === item.name)
  if (existing) {
    existing.amount += 100
    existing.calorie = Math.round(existing.amount * existing.caloriePer100g / 100)
  } else {
    selectedIngredients.value.push({
      name: item.name,
      amount: 100,
      caloriePer100g: item.calorie,
      calorie: item.calorie
    })
  }
}

function adjustAmount(index: number, delta: number) {
  const ing = selectedIngredients.value[index]
  ing.amount = Math.max(10, ing.amount + delta)
  ing.calorie = Math.round(ing.amount * ing.caloriePer100g / 100)
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
.section-title { font-size: 30rpx; font-weight: bold; color: #333; flex: 1; }
.section-add { font-size: 26rpx; color: #FF6B35; }

/* 食材列表 */
.ingredient-list { display: flex; flex-direction: column; gap: 16rpx; }

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
}

.ing-name { flex: 1; font-size: 28rpx; color: #333; font-weight: 500; }

.ing-control {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.ctrl-btn {
  width: 48rpx; height: 48rpx;
  background: #E8E8E8;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; color: #666;
}
.ctrl-amount { font-size: 26rpx; color: #FF6B35; font-weight: bold; min-width: 80rpx; text-align: center; }

.ing-cal { font-size: 24rpx; color: #FF6B35; font-weight: bold; }
.ing-delete { font-size: 28rpx; color: #CCC; padding: 8rpx; }

.empty-list {
  padding: 40rpx;
  text-align: center;
}
.empty-text { font-size: 28rpx; color: #BBB; }

/* 结果 */
.result-card {
  background: linear-gradient(135deg, #FFF5EE, #FFF0E8);
  margin: 20rpx 30rpx;
  border-radius: 28rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(168,85,247,0.2);
}

.result-row {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-bottom: 24rpx;
}

.result-item { text-align: center; }
.result-item.main { margin-bottom: 16rpx; }

.result-value { font-size: 72rpx; font-weight: bold; color: #FF6B35; }
.result-value.small { font-size: 40rpx; }
.result-unit { font-size: 24rpx; color: #888; margin-left: 4rpx; }
.result-unit.small { font-size: 20rpx; }
.result-label { display: block; font-size: 22rpx; color: #666; margin-top: 8rpx; }

.compare-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 20rpx;
  padding: 16rpx;
  background: rgba(255,255,255,0.5);
  border-radius: 16rpx;
}
.compare-icon { font-size: 24rpx; }
.compare-text { font-size: 24rpx; color: #666; }

/* 选择器 */
.picker-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
}

.picker-panel {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  height: 70vh;
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  z-index: 101;
  display: flex;
  flex-direction: column;
}

.picker-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 40rpx;
  border-bottom: 2rpx solid #EEE;
}

.picker-title { font-size: 32rpx; font-weight: bold; color: #333; }
.picker-close { font-size: 28rpx; color: #FF6B35; }

.picker-search { padding: 20rpx 40rpx; }
.picker-input {
  width: 100%;
  background: #F5F5F5;
  border-radius: 24rpx;
  padding: 20rpx 32rpx;
  font-size: 28rpx;
}

.picker-list { flex: 1; padding: 0 40rpx 40rpx; }

.picker-category { margin-bottom: 24rpx; }
.category-name { font-size: 24rpx; color: #888; margin-bottom: 12rpx; display: block; }

.category-items { display: flex; flex-wrap: wrap; gap: 16rpx; }

.picker-item {
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
}

.item-name { font-size: 26rpx; color: #333; margin-right: 8rpx; }
.item-cal { font-size: 20rpx; color: #888; }

.bottom-placeholder { height: 60rpx; }
</style>
