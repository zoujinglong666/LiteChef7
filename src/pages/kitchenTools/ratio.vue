<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "ratio"
}
</route>

<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack"><wd-icon name="chevron-left" size="20px" color="#fff" /></view>
        <text class="nav-title">调料比例表</text>
        <view class="nav-right" />
      </view>
      <view class="header-info">
        <text class="header-title">黄金比例</text>
        <text class="header-sub">新手也能调出好味道</text>
      </view>
    </view>

    <!-- 分类标签 -->
    <scroll-view scroll-x class="category-scroll">
      <view
        class="category-item"
        :class="{ active: activeCategory === cat.key }"
        v-for="cat in categories"
        :key="cat.key"
        @click="activeCategory = cat.key"
      >
        <text class="cat-icon">{{ cat.icon }}</text>
        <text class="cat-name">{{ cat.name }}</text>
      </view>
    </scroll-view>

    <!-- 比例列表 -->
    <view class="ratio-list">
      <view class="ratio-card" v-for="item in filteredRatios" :key="item.name">
        <view class="ratio-head">
          <text class="ratio-name">{{ item.name }}</text>
          <text class="ratio-desc">{{ item.desc }}</text>
        </view>
        <view class="ratio-content">
          <view class="ratio-item" v-for="(r, i) in item.ratio" :key="i">
            <text class="r-label">{{ r.label }}</text>
            <text class="r-value">{{ r.value }}</text>
          </view>
        </view>
        <view class="ratio-tip" v-if="item.tip">
          <wd-icon name="info-circle" size="14px" class="tip-icon" />
          <text class="tip-text">{{ item.tip }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-placeholder" />
  </view>
</template>

<script setup lang="ts">
const activeCategory = ref('sauce')

const categories = [
  { key: 'sauce', icon: 'chart-pie', name: '酱汁' },
  { key: 'marinade', icon: '🥩', name: '腌制' },
  { key: 'soup', icon: '🍲', name: '汤底' },
  { key: 'dip', icon: '🥗', name: '蘸料' },
]

const ratioData = {
  sauce: [
    {
      name: '糖醋汁',
      desc: '酸甜口的万能酱',
      ratio: [
        { label: '料酒', value: '1勺' },
        { label: '酱油', value: '2勺' },
        { label: '糖', value: '3勺' },
        { label: '醋', value: '4勺' },
        { label: '水', value: '5勺' },
      ],
      tip: '12345口诀，记住就对了'
    },
    {
      name: '鱼香汁',
      desc: '川菜经典调味',
      ratio: [
        { label: '糖', value: '1勺' },
        { label: '醋', value: '1勺' },
        { label: '酱油', value: '1勺' },
        { label: '淀粉', value: '1勺' },
        { label: '水', value: '2勺' },
      ],
      tip: '糖醋酱油1:1:1，加泡椒更正宗'
    },
    {
      name: '红烧汁',
      desc: '红烧菜必备',
      ratio: [
        { label: '生抽', value: '2勺' },
        { label: '老抽', value: '1勺' },
        { label: '糖', value: '1勺' },
        { label: '料酒', value: '1勺' },
      ],
      tip: '老抽上色，生抽调味'
    },
    {
      name: '宫保汁',
      desc: '宫保鸡丁专用',
      ratio: [
        { label: '酱油', value: '2勺' },
        { label: '醋', value: '2勺' },
        { label: '糖', value: '1勺' },
        { label: '淀粉', value: '1勺' },
        { label: '水', value: '2勺' },
      ],
      tip: '酸甜微辣，加花椒更香'
    },
  ],
  marinade: [
    {
      name: '腌肉基础',
      desc: '嫩滑不柴',
      ratio: [
        { label: '酱油', value: '1勺' },
        { label: '料酒', value: '1勺' },
        { label: '淀粉', value: '1勺' },
        { label: '油', value: '少许' },
      ],
      tip: '淀粉锁水，油封表面'
    },
    {
      name: '腌鱼去腥',
      desc: '鱼肉鲜嫩无腥味',
      ratio: [
        { label: '料酒', value: '2勺' },
        { label: '姜', value: '3片' },
        { label: '葱', value: '2段' },
        { label: '盐', value: '少许' },
      ],
      tip: '腌制15分钟，清水冲洗'
    },
  ],
  soup: [
    {
      name: '高汤底',
      desc: '提鲜增香',
      ratio: [
        { label: '鸡架', value: '1个' },
        { label: '猪骨', value: '500g' },
        { label: '水', value: '3L' },
        { label: '姜', value: '5片' },
      ],
      tip: '小火慢炖2小时，撇去浮沫'
    },
    {
      name: '清汤底',
      desc: '清淡鲜美',
      ratio: [
        { label: '水', value: '1L' },
        { label: '鸡精', value: '1勺' },
        { label: '盐', value: '适量' },
        { label: '香油', value: '几滴' },
      ],
      tip: '快手清汤，适合煮面'
    },
  ],
  dip: [
    {
      name: '蒜泥酱',
      desc: '蒜香浓郁',
      ratio: [
        { label: '蒜泥', value: '3勺' },
        { label: '酱油', value: '2勺' },
        { label: '醋', value: '1勺' },
        { label: '香油', value: '1勺' },
      ],
      tip: '蒜要多，才够味'
    },
    {
      name: '麻酱',
      desc: '涮火锅必备',
      ratio: [
        { label: '芝麻酱', value: '3勺' },
        { label: '韭菜花', value: '1勺' },
        { label: '腐乳', value: '1块' },
        { label: '香菜', value: '适量' },
      ],
      tip: '加一点腐乳汁更香'
    },
  ],
}

const filteredRatios = computed(() => ratioData[activeCategory.value] || [])

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

/* 分类 */
.category-scroll {
  white-space: nowrap;
  padding: 20rpx 30rpx;
}

.category-item {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  background: #fff;
  border-radius: 40rpx;
  margin-right: 16rpx;
  border: 3rpx solid transparent;
}

.category-item.active {
  background: #FFF0E8;
  border-color: #FF6B35;
}

.cat-icon { font-size: 28rpx; }
.cat-name { font-size: 26rpx; color: #666; }
.category-item.active .cat-name { color: #FF6B35; font-weight: bold; }

/* 比例列表 */
.ratio-list {
  padding: 0 30rpx;
}

.ratio-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.ratio-head { margin-bottom: 24rpx; }
.ratio-name { display: block; font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.ratio-desc { font-size: 24rpx; color: #888; }

.ratio-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.ratio-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #FFF9F5;
  border-radius: 20rpx;
  padding: 12rpx 20rpx;
}

.r-label { font-size: 24rpx; color: #666; }
.r-value { font-size: 24rpx; color: #FF6B35; font-weight: bold; }

.ratio-tip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #FFF9F5;
  border-radius: 16rpx;
  padding: 16rpx;
}

.tip-icon { font-size: 24rpx; }
.tip-text { font-size: 24rpx; color: #666; }

.bottom-placeholder { height: 60rpx; }
</style>
