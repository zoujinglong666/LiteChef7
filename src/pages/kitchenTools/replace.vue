<!-- pages/kitchen-tools/replace.vue -->
<template>
  <view class="page">
    <view v-for="item in dataList" :key="item.name" class="row">
      <text class="name">{{ item.name }}</text>
      <text class="arrow">→</text>
      <text class="replace">{{ item.replace }}</text>
    </view>
  </view>
</template>

<script setup>
const dataList = [
  { name: '香菇', replace: '杏鲍菇' },
  { name: '白糖', replace: '冰糖' },
  { name: '生姜', replace: '姜粉' },
  { name: '牛奶', replace: '豆浆' },
];
</script>

<style scoped>
.page {
  padding: 30px;
}
.row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 28px;
}
.name {
  font-weight: bold;
  margin-right: 20px;
}
.arrow {
  margin: 0 10px;
  color: #999;
}
.replace {
  color: #666;
}
</style>
