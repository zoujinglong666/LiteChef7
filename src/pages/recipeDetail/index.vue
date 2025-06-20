<route lang="json">
{
"layout": "default",
"style": { "navigationBarTitleText": "菜谱详情" },
"name": "recipeDetail"
}
</route>
<template>
  <view class="mine-page">
    <web-view
      :src="url"
      style="width: 100%; height: 100%;"
    />
  </view>
</template>


<script setup lang="ts">


const url = ref('')

onLoad((query) => {
  if (query.url) {
    url.value = decodeURIComponent(query.url)
  } else {
    url.value = 'https://www.baidu.com' // 默认地址
  }
})

</script>

