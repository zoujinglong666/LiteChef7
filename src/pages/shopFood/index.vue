<route lang="json">
{
"layout": "tabbar",
"style": { "navigationBarTitleText": "逛菜" },
"name": "shopFood"
}
</route>


<template>
  <CWaterfall
    :request="fetchLocalPage"
    :item-key="'id'"
    :imageField="'cover_image'"
  >
    <template #item="{ item }">
      <view class="waterfall-card" @click="handleClickCard(item)">
        <view class="image-wrapper">
          <image :src="item['cover_image']" mode="widthFix" class="cover-image" />
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
</template>

<script setup lang="ts">
import CWaterfall from '@/components/CWaterfall/index.vue';
import allRecipesData from '@/mockData/all_recipes.json';
import xfcRecipesData from '@/mockData/xfc_recipes.json';

function fetchLocalPage(page: number, pageSize: number): Promise<any[]> {
  return new Promise(resolve => {
    setTimeout(() => {

      const res = getPagedData(page, pageSize)

      if (!res.hasMore) {
        return
      }

      resolve(res.list)
    }, 300) // 模拟网络延迟
  })
}

function handleClickCard(item) {
  uni.navigateTo({
    url: `/pages/recipeDetail/index?url=${encodeURIComponent(item.url)}`
  })
}

function getPagedData(page: number, pageSize: number) {
  const totalData = [...allRecipesData, ...xfcRecipesData]
  const total = totalData.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = totalData.slice(start, end)
  return {
    total,
    list,
    page,
    pageSize,
    hasMore: end < total
  }
}
</script>

<style scoped>
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
  top: 0; left: 0;
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
