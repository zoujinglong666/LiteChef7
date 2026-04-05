<!-- 使用 type="home" 属性设置首页 -->
<route type="home" lang="json">
{
"layout": "tabbar",
"style": { "navigationBarTitleText": "7天轻厨" },
"name": "home"
}
</route>

<template>
  <view class="page-container">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <wd-search v-model="searchValue" placeholder="搜索美食、食材..." @search="onSearch" @cancel="onCancel"
                 cancel-txt="搜索"/>
    </view>

    <!-- 主内容区域 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 轮播图区域 - 更大更吸引人 -->
      <view class="banner-section">
        <wd-swiper
          :list="swiperList"
          autoplay
          v-model:current="current"
          @click="handleRecipeClick"
          indicator-color="#FF9E4D"
          indicator-active-color="#FF6B35"
          height="200px"
          radius="12px"
        />
        <view class="banner-title">
          <text class="title-text">今日推荐</text>
          <text class="subtitle-text">每日5:00更新</text>
        </view>
      </view>

      <!-- 功能导航区 -->
      <view class="feature-nav">
        <view class="feature-item" v-for="item in featureItems" :key="item.title" @click="navigateTo(item.url)">
          <view class="feature-icon" :style="{ background: item.bgColor }">
            <text class="icon">{{ item.icon }}</text>
          </view>
          <text class="feature-text">{{ item.title }}</text>
        </view>
      </view>

      <!-- 季节推荐 -->
      <view class="section-container">
        <view class="section-header">
          <text class="section-title">应季推荐</text>
          <text class="section-more" @click="navigateTo('/pages/season/index')">更多 ></text>
        </view>
        <scroll-view scroll-x class="seasonal-scroll">
          <view class="seasonal-list">
            <view class="seasonal-item" v-for="item in seasonalRecipes" :key="item.name"
                  @click="viewRecipeDetail(item)">
              <image :src="item.image" mode="aspectFill" class="seasonal-image"/>
              <view class="seasonal-info">
                <text class="seasonal-name">{{ item.name }}</text>
                <text class="seasonal-tag">{{ getSeasonTag() }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 今日食谱 -->
      <view class="section-container">
        <view class="section-header">
          <text class="section-title">今日食谱</text>
          <text class="section-more" @click="navigateTo('/pages/toDayRecipes/index')">更多 ></text>
        </view>
        <view class="recipe-cards">
          <view class="recipe-card" v-for="(item, index) in dailyRecipes" :key="item.name"
                @click="viewRecipeDetail(item)">
            <image :src="item.image" mode="aspectFill" class="recipe-image"/>
            <view class="recipe-info">
              <text class="recipe-name">{{ item.name }}</text>
              <view class="recipe-tags">
                <text class="recipe-tag" v-for="(tag, idx) in getRandomTags(index)" :key="idx">{{ tag }}</text>
              </view>
              <text class="recipe-ingredients">{{ (item.ingredients||[]).join('、') }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 美食记录 -->
      <view class="section-container">
        <view class="section-header">
          <text class="section-title">美食记录</text>
          <text class="section-more" @click="handleAddNode">添加 +</text>
        </view>
        <view class="node-list" v-if="nodeList.length > 0">
          <wd-swipe-action v-for="(item, index) in nodeList.slice(0, 3)" :key="item.createTime">
            <view class="node-card" :style="{ background: getGradient(index) }">
              <view class="node-card-header">
                <text class="title">{{ item.name }}</text>
                <text class="score">{{ item.score }} 分</text>
              </view>
              <view class="desc">{{ item.remark }}</view>
              <view class="timestamp">{{ item.createTime }}</view>
            </view>
            <template #right>
              <view class="action">
                <view class="button" style="background: #4d80f0;text-align: center;" @click="handleEditNode(item)">编辑
                </view>
                <view class="button" style="background: #fa4350;text-align: center;" @click="handleDeleteNode(item)">
                  删除
                </view>
              </view>
            </template>
          </wd-swipe-action>
        </view>
        <wd-status-tip image="content" tip="暂无记录" v-if="nodeList.length === 0"/>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import eventBus from "@/utils/eventBus";
import { getTodayRecipes } from "@/utils/recipes";

// 搜索相关
const searchValue = ref('')
const onSearch = (val: any) => {
  if (val.value.trim()) {
    searchValue.value = ``;
    uni.navigateTo({
      url: `/pages/searchResults/index?keyword=${encodeURIComponent(val.value.trim())}`
    })
  }
}

const onCancel = () => {


  if (searchValue.value.trim()) {
    return
  }
  uni.navigateTo({
    url: `/pages/searchResults/index?keyword=${encodeURIComponent(searchValue.value.trim())}`
  })
}

// 轮播图相关
const current = ref<number>(0)
const swiperList = ref([])

// 功能导航
const featureItems = [
  {
    icon: '😊',
    title: '心情菜谱',
    url: '/pages/moodRecipe/index',
    bgColor: 'linear-gradient(135deg, #FFE4E1 0%, #FFDAB9 100%)'
  },
  {
    icon: '📅',
    title: '每周菜谱',
    url: '/pages/weekRecipes/index',
    bgColor: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)'
  },
  {
    icon: '🍛',
    title: '下饭菜',
    url: '/pages/riceDishes/index',
    bgColor: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'
  },
  {
    icon: '🥗',
    title: '健康餐',
    url: '/pages/healthyFood/index',
    bgColor: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
  },
  {
    icon: 'clock',
    title: '快手菜',
    url: '/pages/quickRecipes/index',
    bgColor: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)'
  }
]

// 应季推荐
const seasonalRecipes = ref([])
const getSeasonTag = () => {
  const date = new Date()
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return '春季'
  if (month >= 6 && month <= 8) return '夏季'
  if (month >= 9 && month <= 11) return '秋季'
  return '冬季'
}

// 今日食谱
const dailyRecipes = ref([])
const foodTags = ['家常', '快手', '下饭', '营养', '低脂', '高蛋白', '解馋', '开胃']
const getRandomTags = (index: number) => {
  // 使用索引确保同一个菜谱每次显示相同的标签
  const seed = index * 10
  const count = (seed % 2) + 1 // 1-2个标签
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(foodTags[(seed + i) % foodTags.length])
  }
  return result
}

// 美食记录相关
const nodeList = ref([])
const gradients = [
  'linear-gradient(135deg, #ffece6 0%, #fffaf7 100%)', // 桃子奶昔
  'linear-gradient(135deg, #fff3e0 0%, #fffefb 100%)', // 蜂蜜柚子
  'linear-gradient(135deg, #fef9f4 0%, #fdf1ea 100%)', // 杏仁豆腐
  'linear-gradient(135deg, #f7f5e6 0%, #fcf9f1 100%)', // 鸡蛋羹/蒸蛋
  'linear-gradient(135deg, #fdf6ed 0%, #fefefe 100%)'  // 烘焙香草色
]

function getGradient(index: number) {
  return gradients[index % gradients.length]
}

// 通用导航函数
function navigateTo(url: string) {
  uni.navigateTo({url})
}

function copyLink(url: string) {
  if (url === '') {
    return
  }
  // 复制到剪贴板
  uni.setClipboardData({
    data: url,
    success() {
      uni.showToast({title: '链接已复制', icon: 'none'});
    }
  });
}

// 查看菜谱详情
function viewRecipeDetail(item: any) {
  copyLink(item.url)

  uni.navigateTo({
    url: `/pages/recipeDetail/index?url=${encodeURIComponent(item.url)}`
  })
}

// 轮播图点击
function handleRecipeClick(e) {
  const index = e.current || current.value
  const recipe = getTodayRecipes(5)[index]
  if (recipe && recipe.url) {
    viewRecipeDetail(recipe)
  }
}

// 节点相关函数
function handleEditNode(item: any) {
  uni.navigateTo({
    url: `/pages/node/index?item=${JSON.stringify(item)}`
  })
}

function handleDeleteNode(item: any) {
  uni.showModal({
    title: '提示',
    content: '确定要删除该菜谱记录吗？',
    success: (res) => {
      if (res.confirm) {
        // 从数组中删除节点
        nodeList.value = nodeList.value.filter(node => node.createTime !== item.createTime)
        uni.setStorageSync('food_records', nodeList.value)
        uni.showToast({title: '删除成功', icon: 'none'})
      }
    }
  })
}

function handleAddNode() {
  uni.navigateTo({url: '/pages/node/index'});
}

// 随机菜谱生成函数
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailyRecipes(allData, count = 5) {
  const dateStr = new Date().toISOString().split('T')[0]; // '2025-06-21'
  const seedFn = xmur3(dateStr);
  const rand = mulberry32(seedFn());

  const picked = new Set();
  while (picked.size < count && picked.size < allData.length) {
    const index = Math.floor(rand() * allData.length);
    picked.add(allData[index]);
  }

  return Array.from(picked);
}

function updateNodeList() {
  nodeList.value = uni.getStorageSync('food_records') || []
}

function updateSwiperList() {
  swiperList.value = getTodayRecipes(5).map(item => item.image)
}

function updateSeasonalRecipes() {
  // 从所有菜谱中随机选择8个作为应季推荐
  seasonalRecipes.value = getTodayRecipes(8)
}

function updateDailyRecipes() {
  // 从所有菜谱中随机选择6个作为今日食谱
  dailyRecipes.value = getTodayRecipes(6)
}

// 🎯 保证事件只监听一次
const refreshHandler = () => updateNodeList()

onLoad(() => {
  // 初始化数据
  updateNodeList()
  updateSwiperList()
  updateSeasonalRecipes()
  updateDailyRecipes()

  // 监听事件（只绑定一次）
  eventBus.on('refreshNodeList', refreshHandler)
})

onShow(() => {
  updateNodeList() // 页面切回来时刷新
})

onUnmounted(() => {
  // 避免重复监听或内存泄漏
  eventBus.off('refreshNodeList', refreshHandler)
})
</script>

<style>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #FFFAF6;
}

.search-bar {
  padding: 10px 15px;
  background-color: #FFFAF6;
  position: sticky;
  top: 0;
  z-index: 10;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
}

/* 轮播图区域 */
.banner-section {
  padding: 0 15px 15px;
  position: relative;
}

.banner-title {
  position: absolute;
  top: 15px;
  left: 30px;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border-radius: 20px;
  z-index: 5;
}

.title-text {
  font-size: 14px;
  font-weight: bold;
  color: #FF6B35;
}

.subtitle-text {
  font-size: 12px;
  color: #888;
  margin-left: 5px;
}

/* 功能导航区 */
.feature-nav {
  display: flex;
  justify-content: space-between;
  padding: 5px 15px 20px;
  flex-wrap: wrap;
}

.feature-item {
  width: 18%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px; /* 从圆形改为圆角方形 */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 减轻阴影 */
  transition: transform 0.2s; /* 添加过渡效果 */
}

.feature-item:active .feature-icon {
  transform: scale(0.95); /* 点击时的缩小效果 */
}

.icon {
  font-size: 24px;
}

.feature-text {
  font-size: 12px;
  color: #333;
  margin-top: 2px;
}

/* 通用区块样式 */
.section-container {
  margin: 0 15px 20px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  position: relative;
  padding-left: 10px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  height: 16px;
  width: 4px;
  background: #FF6B35;
  border-radius: 2px;
}

.section-more {
  font-size: 12px;
  color: #999;
}

/* 应季推荐区域 */
.seasonal-scroll {
  white-space: nowrap;
}

.seasonal-list {
  display: inline-flex;
  padding: 5px 0;
}

.seasonal-item {
  width: 120px;
  margin-right: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.seasonal-image {
  width: 120px;
  height: 90px;
  object-fit: cover;
}

.seasonal-info {
  padding: 8px;
  background: #fff;
}

.seasonal-name {
  font-size: 12px;
  color: #333;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.seasonal-tag {
  font-size: 10px;
  color: #FF6B35;
  background: #FFF0E8;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 5px;
  display: inline-block;
}

/* 今日食谱区域 */
.recipe-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recipe-card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.recipe-image {
  width: 113px;
  height: 85px;
  border-radius: 4px;
  background-color: #f0f0f0;
  object-fit: cover;
  flex-shrink: 0;
}

.recipe-info {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.recipe-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.recipe-tags {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.recipe-tag {
  font-size: 10px;
  color: #666;
  background: #F5F5F5;
  padding: 2px 6px;
  border-radius: 10px;
}

.recipe-ingredients {
  font-size: 12px;
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 美食记录区域 */
.node-list {
  width: 100%;
}

.node-card {
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s ease;
  font-size: 14px;
  color: #333;
}

.node-card-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 6px;
}

.score {
  font-size: 14px;
  color: #5c9d8f;
}

.desc {
  margin-bottom: 4px;
  color: #666;
  font-size: 13px;
}

.timestamp {
  font-size: 12px;
  color: #aaa;
  margin-top: 4px;
}

.action {
  display: flex;
  height: 100%;
}

.button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding: 0 20px;
  color: white;
  font-size: 14px;
}
</style>
