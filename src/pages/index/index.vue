<!-- 使用 type="home" 属性设置首页 -->
<route type="home" lang="json">
{
"layout": "tabbar",
"style": { "navigationBarTitleText": "首页" },
"name": "home"
}
</route>

<template>
  <wd-tabs v-model="tab" swipeable>
    <wd-tab title="吃个啥" name="recipes">
      <view style="padding: 10px;">
        <wd-swiper :list="swiperList" autoplay v-model:current="current" @click="handleClick"
                   @change="onChange"></wd-swiper>
      </view>
      <view class="recommend">
        <view
          class="recommend-card"
          v-for="item in recommendCards"
          :key="item.title"
          @click="handleRecommendCardClick(item.action)"
        >
          <text class="icon">{{ item.icon }}</text>
          <text class="label">{{ item.title }}</text>
        </view>
      </view>
    </wd-tab>
    <wd-tab title="记个啥" name="rank">
      <view class="node-list">
        <wd-swipe-action v-for="(item, index) in nodeList" :key="item.createTime">
          <view class="node-card" :style="{ background: getGradient(index) }">
            <view class="node-card-header">
              <text class="title">{{ item.name }}</text>
              <text class="score">{{ item.score }} 分</text>
            </view>
<!--            <view class="desc">推荐平台：{{ item.recommendation }}</view>-->
            <view class="desc">{{ item.remark }}</view>
            <view class="timestamp">{{ item.createTime }}</view>
          </view>
          <template #right>
            <view class="action">
              <view class="button" style="background: #C8C7CD;" @click="handleAction('编辑', item)">编辑</view>
              <view class="button" style="background: #FFB300;" @click="handleAction('删除', item)">删除</view>
            </view>
          </template>
        </wd-swipe-action>
      </view>
      <wd-fab @click="handleAddNode" :expandable="false">

      </wd-fab>
    </wd-tab>
  </wd-tabs>
</template>

<script setup lang="ts">
import allRecipesData from '@/mockData/all_recipes.json'

const tab = ref<number>(0)
const current = ref<number>(0)
const recommendCards = [
  { icon: '📅', title: '每周菜谱', action: 'week' },
  { icon: '🍛', title: '下饭菜', action: 'rice' }
]
const swiperList = ref([])
const nodeList = ref([])
function handleRecommendCardClick(action: string) {
  if (action === 'week') {
    uni.navigateTo({ url: '/pages/weekRecipes/index' })
  } else if (action === 'rice') {
    uni.navigateTo({ url: '/pages/riceDishes/index' })
  }
  // 其他类型扩展...
}

const gradients = [
  'linear-gradient(135deg, #f9f9f9 0%, #eef2f3 100%)', // 浅灰白
  'linear-gradient(135deg, #e6f0ec 0%, #f2fbf7 100%)', // 淡绿白
  'linear-gradient(135deg, #fff6f0 0%, #fefefe 100%)', // 奶白粉
  'linear-gradient(135deg, #f4f9ff 0%, #fefefe 100%)', // 淡蓝白
  'linear-gradient(135deg, #fcf9f4 0%, #f3f8f2 100%)'  // 浅黄米
]
function getGradient(index: number) {
  return gradients[index % gradients.length]
}



function handleAction(action: string) {
  console.log(action)
}

onLoad(() => {
  nodeList.value = uni.getStorageSync('food_records') || []
  console.log(nodeList.value,'nodeList')
  swiperList.value = getDailyRecipes(allRecipesData, 5).map(item => item['cover_image'])
})

function getDailyRecipes(allData, count = 5) {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, ''); // 如：20250619
  let seed = parseInt(dateStr, 10);

  function seededRandom() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  const picked = new Set();
  while (picked.size < count && picked.size < allData.length) {
    const index = Math.floor(seededRandom() * allData.length);
    picked.add(allData[index]);
  }

  return Array.from(picked);
}

function handleClick(e) {
  console.log(e)
}

function onChange(e) {

}



function handleAddNode() {
  uni.navigateTo({url: '/pages/node/index'});
}

</script>

<style>
.recommend {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  gap: 10px;
}

.recommend-card {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff5ec 0%, #ffe7dc 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  color: #333;
  font-size: 15px;
  font-weight: 500;
  transition: transform 0.2s ease;
  width: 100%;
}


.icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.label {
  font-size: 14px;
  color: #333;
}

.node-list {
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}

.node-card {
  padding: 10px;
  border-radius: 12px;
  margin: 10px 12px;
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
}

.timestamp {
  font-size: 12px;
  color: #aaa;
  margin-top: 4px;
}

.action {
  height: 100%;
}
.button {
  display: inline-block;
  min-height: 60px;
  padding: 0 20px;
  text-align: center;
  height: 100%;
  color: white;
}
</style>
