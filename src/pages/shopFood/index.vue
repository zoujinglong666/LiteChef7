<template>
  <CWaterfall
    :request="fetchData"
    :item-key="'id'"
  >
    <template #item="{ item }">
      <view class="waterfall-card">
        <image :src="item.cover" mode="widthFix" />
        <view class="title">{{ item.title }}</view>
      </view>
    </template>
  </CWaterfall>
</template>

<script setup lang="ts">
import CWaterfall from '@/components/CWaterfall/index.vue'
function fetchData(p: number): Promise<any[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = Array.from({ length: 10 }).map((_, i) => ({
        id: `item_${p}_${i}`,
        title: `菜品 ${p}-${i}`,
        cover: `https://picsum.photos/300/2${i}0?random=${p}${i}`
      }))
      resolve(list)
    }, 500)
  })
}
</script>

<style scoped>
.waterfall-card {
  margin-bottom: 12px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.title {
  font-size: 14px;
  margin-top: 6px;
  color: #333;
}
</style>
