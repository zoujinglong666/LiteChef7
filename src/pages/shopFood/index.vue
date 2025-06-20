<route lang="json">
{
"layout": "tabbar",
"style": { "navigationBarTitleText": "逛菜" },
"name": "shopFood"
}
</route>


<template>
  <view class="shop-page">
    <!-- 固定顶部搜索框 -->
    <view class="search-wrapper">
      <wd-search
        v-model="keyword"
        @enter="search"
        @search="search"
        @clear="clear"
        @cancel="clear"
        @change="change"
        placeholder="搜索菜名或食材"
      />
    </view>

    <!-- 内容区域 -->
    <view class="waterfall-wrapper">
      <CWaterfall
        :request="fetchPage"
        :item-key="'id'"
        :imageField="'cover_image'"
      >
        <template #item="{ item }">
          <view class="waterfall-card" @click="handleClickCard(item)">
            <view class="image-wrapper">
              <image :src="item['cover_image']" mode="widthFix" class="cover-image"/>
            </view>
            <view class="content" style="padding: 10px;">
              <view class="title">{{ item.name }}</view>
              <view class="recipe-tags">
                <text
                  v-for="(tag, i) in item.ingredients.split('、').slice(0, 3)"
                  :key="i"
                  class="recipe-tag"
                >{{ tag }}
                </text>
              </view>
            </view>
          </view>
        </template>
      </CWaterfall>
    </view>
  </view>
</template>


<script setup lang="ts">

import CWaterfall from '@/components/CWaterfall/index.vue';
import allRecipesData from '@/mockData/all_recipes.json';
import xfcRecipesData from '@/mockData/xfc_recipes.json';

const keyword = ref<string>('')

// 完整数据源缓存
const fullList = [...allRecipesData, ...xfcRecipesData]

// 搜索过滤后的临时数据
let filteredList = [...fullList]

function fetchPage(page: number, pageSize: number): Promise<any[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const list = filteredList.slice(start, end)
      resolve(list)
    }, 200)
  })
}

// 点击卡片跳转
function handleClickCard(item) {
  uni.navigateTo({
    url: `/pages/recipeDetail/index?url=${encodeURIComponent(item.url)}`
  })
}

// 输入变化时搜索
function change(val) {
  console.log('change', val)
  keyword.value = val.value.trim()
  filterList()
}

// 搜索按钮点击
function search(val) {
  keyword.value = val.value.trim()
  filterList()
}

// 清空搜索
function clear() {
  keyword.value = ''
  filteredList = [...fullList]
}

// 根据关键字过滤
function filterList() {
  const searchStr = keyword.value.toLowerCase()
  console.log('searchStr', searchStr)
  if (!searchStr) {
    filteredList = [...fullList]
  } else {
    filteredList = fullList.filter(item =>
      item.name.toLowerCase().includes(searchStr) ||
      item.ingredients.includes(searchStr)
    )
  }
}


</script>

<style scoped>

.shop-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.search-wrapper {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.waterfall-wrapper {
  flex: 1;
  overflow: hidden;
}

.waterfall-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;

}

.title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 比例 → 3/4 = 75% */
  overflow: hidden;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.recipe-tag {
  display: inline-block;
  background: linear-gradient(135deg, #fed7aa 0%, #fecaca 100%);
  color: #ea580c;
  font-size: 10px;
  padding: 0 8px;
  border-radius: 8px;
  margin-right: 4px;
  border: 1px solid #fdba74;
}
</style>
