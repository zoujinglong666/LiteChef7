<route lang="json">
{
"style": { "navigationBarTitleText": "每周食谱" },
"name": "weekRecipes"
}
</route>
<template>
  <view class="content">
    <view class="week-recipes">
      <view class="week-recipes-item" v-for="item in recommendList" :key="item.name" @click="handleClick(item)">
        <view class="week-recipes-item-cover">
          <image :src="item.cover_image" mode="aspectFill" class="cover-image" />
        </view>
        <view class="week-recipes-item-info">
          <view class="week-recipes-item-info-title">
            <wd-text :text="`${item.weekday} · ${item.name}`" :lines="1" size="16px" color="#333" />
          </view>
          <wd-text :text="item.ingredients" :lines="1" size="12px" color="#9c6730"></wd-text>
        </view>
      </view>
    </view>
    <wd-popup v-model="show" position="bottom" :safe-area-inset-bottom="true" closable custom-style="height: 90%;"
              @close="handleClose">
      <iframe
        :src="webUrl"
        style="width: 100%; height: 100%;"
      />
    </wd-popup>
  </view>
  <view class="footer">
    <wd-button style="width: 100%;" type="primary" size="large" @click="handleClickRandomRecipe" block>随机生成菜谱</wd-button>
  </view>
</template>

<script setup lang="ts">
import allRecipesData from '@/mockData/all_recipes.json'
const recommendList = ref([])
const show = ref(false)
const webUrl = ref('')

function handleClick(item) {
  show.value = true
  webUrl.value = item.url
}

function handleClose() {
  show.value = false
  webUrl.value = ''
}

function handleClickRandomRecipe() {
  recommendList.value = getDailyRecipes(allRecipesData, 7)
}

onLoad(() => {
  recommendList.value = getDailyRecipes(allRecipesData, 7)
})
const weekMap = [
  { label: '周一', icon: '🌞' },
  { label: '周二', icon: '🍚' },
  { label: '周三', icon: '🍜' },
  { label: '周四', icon: '🥗' },
  { label: '周五', icon: '🍖' },
  { label: '周六', icon: '🍢' },
  { label: '周日', icon: '🥣' }
]
function getDailyRecipes(allData, count = 7) {
  let seed = Date.now()

  function seededRandom() {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const picked = new Set()
  while (picked.size < count && picked.size < allData.length) {
    const index = Math.floor(seededRandom() * allData.length)
    picked.add(allData[index])
  }

  return Array.from(picked).map((item, index) => ({
    ...item,
    weekday: `${weekMap[index].icon} ${weekMap[index].label}`
  }))
}


</script>


<style scoped lang="scss">
.content {
  width: 100vw;
  height: 100%;
  background-color: #f5f5f5;
  overflow-x: hidden;
  padding: 0 10px;
  box-sizing: border-box;
  padding-bottom: 100px;
}

.week-recipes {
  width: 100%;
  box-sizing: border-box;
}

.week-recipes-item {
  width: 100%;
  display: flex;
  margin-bottom: 8px;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  box-sizing: border-box;
}
.week-recipes-item-info {
  flex: 1;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cover-image {
  width: 113px;
  height: 85px;
  border-radius: 4px;
  object-fit: cover;
  background-color: #f0f0f0;
}

iframe {
  width: 100%;
  border: none;
  outline: none;
}
.footer {
  width: 100%;
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  box-sizing: border-box;
  border-top: 1px solid #eee;
  padding: 10px;
}
</style>
