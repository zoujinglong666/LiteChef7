<route lang="json">
{
"style": { "navigationBarTitleText": "每周食谱" },
"name": "weekRecipes"
}
</route>
<template>
  <view class="content">
    <!-- 筛选和设置区域 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-label">菜品数量</view>
        <view class="number-selector">
          <view class="number-btn" @click="decreaseCount">-</view>
          <view class="number-value">{{ recipeCount }}</view>
          <view class="number-btn" @click="increaseCount">+</view>
        </view>
      </view>

      <view class="filter-content" :class="{ 'hidden': isFilterCollapsed }">
        <view class="filter-row filter-row-wrap">
          <view class="filter-label">菜系</view>
          <view class="tag-selector">
            <view
              v-for="(tag, index) in cuisineTags"
              :key="index"
              :class="['filter-tag', { active: selectedCuisines.includes(tag) }]"
              @click="toggleCuisine(tag)"
            >
              {{ tag }}
            </view>
          </view>
        </view>

        <view class="filter-row filter-row-wrap">
          <view class="filter-label">口味</view>
          <view class="tag-selector">
            <view
              v-for="(tag, index) in flavorTags"
              :key="index"
              :class="['filter-tag', { active: selectedFlavors.includes(tag) }]"
              @click="toggleFlavor(tag)"
            >
              {{ tag }}
            </view>
          </view>
        </view>

        <view class="filter-row filter-row-wrap">
          <view class="filter-label">类型</view>
          <view class="tag-selector">
            <view
              v-for="(tag, index) in typeTags"
              :key="index"
              :class="['filter-tag', { active: selectedTypes.includes(tag) }]"
              @click="toggleType(tag)"
            >
              {{ tag }}
            </view>
          </view>
        </view>
      </view>

      <!-- 展开/收起按钮 -->
      <view class="collapse-button" @click="toggleFilterCollapse">
        <text>{{ isFilterCollapsed ? '展开筛选' : '收起筛选' }}</text>
        <text class="collapse-icon">{{ isFilterCollapsed ? '↓' : '↑' }}</text>
      </view>
    </view>

    <!-- 加载动画 -->
    <view class="loading-container" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在精心挑选美味食谱...</text>
    </view>

    <!-- 菜谱列表 -->
    <view class="week-recipes" v-else>
      <view
        class="week-recipes-item"
        v-for="item in recommendList"
        :key="item.name"
        @click="handleClick(item)"
      >
        <view class="week-recipes-item-cover">
          <image :src="item.image" mode="aspectFill" class="cover-image" />
          <view class="weekday-badge">{{ item.weekday }}</view>
        </view>
        <view class="week-recipes-item-info">
          <view class="week-recipes-item-info-title">
            <text class="recipe-name">{{ item.name }}</text>
          </view>
          <view class="ingredients-row">
            <text class="ingredients-icon">🍳</text>
            <text class="ingredients-text">{{ (item.ingredients||[]).join('、') }}</text>
          </view>
        </view>
      </view>
    </view>

    <wd-popup
      v-model="show"
      position="bottom"
      :safe-area-inset-bottom="true"
      closable
      custom-style="height: 90%;"
      @close="handleClose"
    >
      <iframe
        :src="webUrl"
        style="width: 100%; height: 100%;"
      />
    </wd-popup>
  </view>

  <view class="footer">
    <view class="generate-button" @click="handleClickRandomRecipe" :class="{ 'loading-btn': isLoading }">
      <text class="shuffle-icon  sn-icon-park-outline:refresh" >
      </text>
      <text class="button-text">{{ isLoading ? '加载中...' : '重新生成美味食谱' }}</text>
    </view>



  </view>
</template>

<script setup lang="ts">
import { getTodayRecipes } from '@/utils/recipes'

const recommendList = ref([])
const show = ref(false)
const webUrl = ref('')
const recipeCount = ref(7) // 默认7天菜谱
const isLoading = ref(false)
const isFilterCollapsed = ref(false) // 筛选面板是否收起

// 展开/收起筛选面板
function toggleFilterCollapse() {
  isFilterCollapsed.value = !isFilterCollapsed.value
}

// 筛选条件
const cuisineTags = ['川菜', '粤菜', '鲁菜', '苏菜', '浙菜', '闽菜', '湘菜', '徽菜']
const flavorTags = ['咸鲜', '麻辣', '酸甜', '清淡', '香辣', '咖喱', '五香', '酱香']
const typeTags = ['家常菜', '快手菜', '肉类', '素食', '汤类', '主食', '小吃', '早餐', '午餐', '晚餐', '宵夜']

const selectedCuisines = ref([])
const selectedFlavors = ref([])
const selectedTypes = ref([])

// 增减菜品数量
function increaseCount() {
  if (recipeCount.value < 14) {
    recipeCount.value++
    handleClickRandomRecipe()
  }
}

function decreaseCount() {
  if (recipeCount.value > 3) {
    recipeCount.value--
    handleClickRandomRecipe()
  }
}

// 切换标签选择
function toggleCuisine(tag) {
  if (selectedCuisines.value.includes(tag)) {
    selectedCuisines.value = selectedCuisines.value.filter(t => t !== tag)
  } else {
    selectedCuisines.value.push(tag)
  }
}

function toggleFlavor(tag) {
  if (selectedFlavors.value.includes(tag)) {
    selectedFlavors.value = selectedFlavors.value.filter(t => t !== tag)
  } else {
    selectedFlavors.value.push(tag)
  }
}

function toggleType(tag) {
  if (selectedTypes.value.includes(tag)) {
    selectedTypes.value = selectedTypes.value.filter(t => t !== tag)
  } else {
    selectedTypes.value.push(tag)
  }
}

// 根据标签筛选菜品
function filterRecipesByTags(recipes) {
  if (selectedCuisines.value.length === 0 &&
    selectedFlavors.value.length === 0 &&
    selectedTypes.value.length === 0) {
    return recipes
  }

  return recipes.filter(recipe => {
    const name = recipe.name.toLowerCase()
    const ingredients = (item.ingredients || []).join('、').toLowerCase()

    // 检查菜系
    const cuisineMatch = selectedCuisines.value.length === 0 || selectedCuisines.value.some(cuisine => {
      switch(cuisine) {
        case '川菜':
          return /川|辣椒|花椒|豆瓣|麻辣/.test(name + ingredients)
        case '粤菜':
          return /粤|广东|清蒸|煲汤|白灼/.test(name + ingredients)
        case '鲁菜':
          return /鲁|山东|爆炒|红烧|葱爆/.test(name + ingredients)
        case '苏菜':
          return /苏|江苏|清炖|蟹粉|松鼠/.test(name + ingredients)
        case '浙菜':
          return /浙|杭州|西湖|东坡|糖醋/.test(name + ingredients)
        case '闽菜':
          return /闽|福建|佛跳墙|沙茶|鱼丸/.test(name + ingredients)
        case '湘菜':
          return /湘|湖南|剁椒|腊肉|臭豆腐/.test(name + ingredients)
        case '徽菜':
          return /徽|安徽|臭鳜鱼|毛豆腐|腌菜/.test(name + ingredients)
        default:
          return true
      }
    })

    // 检查口味
    const flavorMatch = selectedFlavors.value.length === 0 || selectedFlavors.value.some(flavor => {
      switch(flavor) {
        case '咸鲜':
          return /咸|鲜|盐|鸡精|味精|酱油/.test(ingredients)
        case '麻辣':
          return /麻|辣|花椒|辣椒|辣酱/.test(name + ingredients)
        case '酸甜':
          return /酸|甜|糖醋|番茄|菠萝|醋/.test(name + ingredients)
        case '清淡':
          return /清|淡|蒸|白灼|水煮/.test(name) && !/辣|麻|咸|酸|甜/.test(name)
        case '香辣':
          return /香|辣|香辣|辣椒/.test(name + ingredients)
        case '咖喱':
          return /咖喱/.test(name + ingredients)
        case '五香':
          return /五香|香料|八角|桂皮|茴香/.test(ingredients)
        case '酱香':
          return /酱|豆瓣|豆酱|甜面酱|黄豆酱/.test(ingredients)
        default:
          return true
      }
    })

    // 检查类型
    const typeMatch = selectedTypes.value.length === 0 || selectedTypes.value.some(type => {
      switch(type) {
        case '家常菜':
          return true // 所有菜都可以是家常菜
        case '快手菜':
          return ingredients.split('、').length <= 5 // 食材少的视为快手菜
        case '肉类':
          return /肉|牛|猪|鸡|鸭|羊/.test(ingredients)
        case '素食':
          return !/肉|牛|猪|鸡|鸭|羊|鱼|虾|蟹|贝/.test(ingredients)
        case '汤类':
          return /汤|羹/.test(name)
        case '主食':
          return /饭|面|粥|馒头|包子|饼|粉/.test(name)
        case '小吃':
          return /小吃|点心|零食|糕点|丸子|饼干/.test(name)
        case '早餐':
          return /早餐|粥|豆浆|油条|包子|馒头|煎饼|三明治/.test(name)
        case '午餐':
          return /饭|面|炒|煮|炖|蒸/.test(name) && !/早餐|宵夜/.test(name)
        case '晚餐':
          return /饭|面|炒|煮|炖|蒸/.test(name) && !/早餐|宵夜/.test(name)
        case '宵夜':
          return /宵夜|烧烤|串|夜宵|小吃|零食/.test(name)
        default:
          return true
      }
    })

    return cuisineMatch && flavorMatch && typeMatch
  })
}

function handleClick(item) {
  show.value = true
  webUrl.value = item.url
}

function handleClose() {
  show.value = false
  webUrl.value = ''
}

async function handleClickRandomRecipe() {
  isLoading.value = true

  // 使用setTimeout模拟加载过程
  setTimeout(() => {
    recommendList.value = getDailyRecipes(allRecipesData, recipeCount.value)
    isLoading.value = false
  }, 800) // 800ms的加载时间，可以根据需要调整
}

onLoad(() => {
  isLoading.value = true
  setTimeout(() => {
    recommendList.value = getDailyRecipes(allRecipesData, recipeCount.value)
    isLoading.value = false
  }, 800)
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

  // 先筛选符合条件的菜品
  const filteredData = filterRecipesByTags(allData)

  // 如果筛选后没有数据，则使用全部数据
  const dataToUse = filteredData.length > 0 ? filteredData : allData

  const picked = new Set()
  while (picked.size < count && picked.size < dataToUse.length) {
    const index = Math.floor(seededRandom() * dataToUse.length)
    picked.add(dataToUse[index])
  }

  // 如果不够数量，从全部数据中补充
  if (picked.size < count && filteredData.length < allData.length) {
    const remaining = count - picked.size
    const pickedIds = Array.from(picked).map(item => item.url)

    let attempts = 0
    while (picked.size < count && attempts < allData.length) {
      const index = Math.floor(seededRandom() * allData.length)
      const item = allData[index]
      if (!pickedIds.includes(item.url)) {
        picked.add(item)
      }
      attempts++
    }
  }

  return Array.from(picked).map((item, index) => ({
    ...item,
    weekday: index < weekMap.length
      ? `${weekMap[index].icon} ${weekMap[index].label}`
      : `${weekMap[index % 7].icon} 额外`
  }))
}
</script>

<style scoped lang="scss">
.content {
  width: 100vw;
  height: 100%;
  background-color: #f8f5f2;
  overflow-x: hidden;
  padding: 12px;
  box-sizing: border-box;
  padding-bottom: 100px;
}

/* 筛选区域样式 */
.filter-section {
  background-color: white;
  border-radius: 16px;
  padding: 16px 16px 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.3s ease;
}

.filter-content {
  max-height: 500px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.filter-content.hidden {
  max-height: 0;
}

.collapse-button {
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff7e1f;
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
  cursor: pointer;
  position: relative;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 8px;
}

.collapse-icon {
  margin-left: 4px;
  font-size: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.filter-row-wrap {
  align-items: flex-start;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  width: 80px;
  flex-shrink: 0;
}

.number-selector {
  display: flex;
  align-items: center;
}

.number-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff9a3c 0%, #ff7e1f 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.number-value {
  margin: 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  min-width: 24px;
  text-align: center;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.filter-tag {
  padding: 6px 12px;
  border-radius: 20px;
  background-color: #f0f0f0;
  color: #666;
  font-size: 13px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.filter-tag.active {
  background: linear-gradient(135deg, #ff9a3c 0%, #ff7e1f 100%);
  color: white;
}

/* 加载动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 126, 31, 0.2);
  border-radius: 50%;
  border-top-color: #ff7e1f;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #666;
}

/* 菜谱列表样式 */
.week-recipes {
  width: 100%;
  box-sizing: border-box;
}

.week-recipes-item {
  width: 100%;
  display: flex;
  margin-bottom: 16px;
  background-color: #fff;
  padding: 0;
  border-radius: 16px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
}

.week-recipes-item-cover {
  position: relative;
  width: 130px;
  height: 130px;
  flex-shrink: 0; /* 防止图片被压缩 */
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.weekday-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.week-recipes-item-info {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0; /* 确保文本可以正确截断 */
}

.recipe-name {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%; /* 确保宽度受限 */
}

.ingredients-row {
  display: flex;
  align-items: flex-start;
  margin-top: 8px;
  width: 100%; /* 确保宽度受限 */
}

.ingredients-icon {
  font-size: 14px;
  margin-right: 6px;
  flex-shrink: 0;
}

.ingredients-text {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%; /* 确保宽度受限 */
}

/* 底部按钮样式 */
.footer {
  width: 100%;
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f5f2;
  box-sizing: border-box;
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.generate-button {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #ff9a3c 0%, #ff7e1f 100%);
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 126, 31, 0.3);
}

.generate-button.loading-btn {
  background: linear-gradient(135deg, #ffb56e 0%, #ff9a3c 100%);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}


.shuffle-icon {
  margin-right: 8px;
  color: white;
  transition: transform 0.3s;
}

.shuffle-icon.rotating {
  animation: rotate 1s linear infinite;
}

.button-text {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

iframe {
  width: 100%;
  border: none;
  outline: none;
}
</style>
