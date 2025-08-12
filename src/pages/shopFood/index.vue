<route lang="json">
{
"layout": "tabbar",
"style": { "navigationBarTitleText": "逛菜" },
"name": "shopFood"
}
</route>


<template>
  <view class="shop-food-container">
    <CWaterfall
      :request="fetchLocalPage"
      :item-key="'id'"
      :imageField="'cover_image'"
      :cols="2"
      :gap="12"
    >
      <template #item="{ item }">
        <view class="waterfall-card" @click="handleClickCard(item)">
          <view class="image-wrapper">
            <image :src="item['cover_image']" mode="widthFix" class="cover-image"/>
            <view class="overlay-gradient"></view>
<!--            <view class="like-badge" v-if="item.likes">-->
<!--              <text class="iconfont icon-heart"></text>-->
<!--              <text class="like-count">{{item.likes}}</text>-->
<!--            </view>-->
          </view>
          <view class="content">
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
.shop-food-container {
  background-color: #FFF9F0;
  min-height: 100vh;
}

.waterfall-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.waterfall-card:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.waterfall-card:hover .cover-image {
  transform: scale(1.05);
}

.overlay-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
  z-index: 1;
}

.like-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon-heart {
  color: #ff4757;
  font-size: 12px;
  margin-right: 4px;
}

.like-count {
  font-size: 12px;
  color: #333;
  font-weight: bold;
}

.content {
  padding: 12px;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.recipe-tag {
  display: inline-block;
  background: linear-gradient(135deg, #fff0e5 0%, #ffe0cc 100%);
  color: #ff6b35;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #ffcbb3;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}


</style>
