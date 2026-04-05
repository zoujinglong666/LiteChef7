<route lang="json">
{
"style": { "navigationBarTitleText": "搜索结果" },
"name": "searchResults"
}
</route>

<template>
  <view class="search-results-page">
    <!-- 搜索栏 -->
    <view class="search-header">
      <wd-search
        v-model="searchKeyword"
        placeholder="搜索美食、食材..."
        @search="handleSearch"
        @clear="handleClear"
        show-action
      >
      </wd-search>
    </view>

    <!-- 搜索状态 -->
    <view class="search-status" v-if="searchKeyword">
      <text class="status-text">搜索"{{ searchKeyword }}"</text>
      <text class="result-count" v-if="!isLoading">找到 {{ filteredResults.length }} 个结果</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <wd-loading type="spinner" size="24px"/>
      <text class="loading-text">搜索中...</text>
    </view>

    <!-- 搜索结果 -->
    <scroll-view v-else-if="filteredResults.length > 0" scroll-y class="results-container">
      <!-- 筛选标签 -->
      <view class="filter-section" v-if="searchKeyword">
        <text class="filter-title">筛选：</text>
        <view class="filter-tags">
          <text
            class="filter-tag"
            :class="{ active: activeFilter === 'all' }"
            @click="setFilter('all')"
          >
            全部({{ allResults.length }})
          </text>
          <text
            class="filter-tag"
            :class="{ active: activeFilter === 'name' }"
            @click="setFilter('name')"
          >
            菜名({{ nameResults.length }})
          </text>
          <text
            class="filter-tag"
            :class="{ active: activeFilter === 'ingredients' }"
            @click="setFilter('ingredients')"
          >
            食材({{ ingredientResults.length }})
          </text>
        </view>
      </view>

      <!-- 结果列表 -->
      <view class="recipe-list">
        <view
          class="recipe-item"
          v-for="(recipe, index) in filteredResults"
          :key="recipe.url"
          @click="viewRecipeDetail(recipe)"
        >
          <view class="recipe-emoji"><text class="emoji-icon">{{ recipe.image }}</text></view>
          <view class="recipe-content">
            <text class="recipe-name">{{recipe.name}}</text>
            <text class="recipe-ingredients">{{recipe.ingredients.join("、")}}</text>
            <view class="recipe-meta">
              <text class="match-type">{{ getMatchType(recipe) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 无结果状态 -->
    <view v-else-if="searchKeyword && !isLoading" class="no-results">
      <view class="no-results-icon">🔍</view>
      <text class="no-results-title">未找到相关结果</text>
      <text class="no-results-subtitle">试试其他关键词或浏览推荐内容</text>

      <!-- 推荐搜索 -->
      <view class="recommended-searches">
        <text class="recommend-title">推荐搜索：</text>
        <view class="recommend-tags">
          <text
            class="recommend-tag"
            v-for="tag in recommendedKeywords"
            :key="tag"
            @click="searchRecommended(tag)"
          >
            {{ tag }}
          </text>
        </view>
      </view>
    </view>

    <!-- 默认状态（无搜索关键词） -->
    <view v-else class="default-state">
      <view class="default-icon">🍳</view>
      <text class="default-title">发现美味食谱</text>
      <text class="default-subtitle">搜索你想要的美食或食材</text>

      <!-- 热门搜索 -->
      <view class="hot-searches">
        <text class="hot-title">热门搜索</text>
        <view class="hot-tags">
          <text
            class="hot-tag"
            v-for="tag in hotKeywords"
            :key="tag"
            @click="searchHot(tag)"
          >
            {{ tag }}
          </text>
        </view>
      </view>

      <!-- 最近搜索 -->
      <view class="recent-searches" v-if="recentSearches.length > 0">
        <view class="recent-header">
          <text class="recent-title">最近搜索</text>
          <text class="clear-recent" @click="clearRecentSearches">清空</text>
        </view>
        <view class="recent-tags">
          <text
            class="recent-tag"
            v-for="tag in recentSearches"
            :key="tag"
            @click="searchRecent(tag)"
          >
            {{ tag }}
          </text>
        </view>
      </view>
    </view>
    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { searchRecipes } from '@/utils/recipes'

// 响应式数据
const searchKeyword = ref('')
const isLoading = ref(false)
const activeFilter = ref('all')
const recentSearches = ref<string[]>([])

// 合并所有食谱数据
// 热门搜索关键词
const hotKeywords = ['红烧肉', '宫保鸡丁', '麻婆豆腐', '糖醋排骨', '鱼香肉丝', '西红柿鸡蛋', '青椒肉丝', '回锅肉']

// 推荐搜索关键词
const recommendedKeywords = ['家常菜', '川菜', '素食', '汤类', '快手菜', '下饭菜']

// 搜索结果
const allResults = computed((): any[] => {
  if (!searchKeyword.value.trim()) return []
  return searchRecipes(searchKeyword.value.trim())
})

// 按菜名搜索的结果
const nameResults = computed((): any[] => {
  if (!searchKeyword.value.trim()) return []
  return allResults.value.filter((r: any) => r.name.includes(searchKeyword.value.trim()))
})

// 按食材搜索的结果
const ingredientResults = computed((): any[] => {
  if (!searchKeyword.value.trim()) return []
  return allResults.value.filter((r: any) =>
    r.ingredients.some((i: string) => i.includes(searchKeyword.value.trim()))
  )
})

// 筛选后的结果
const filteredResults = computed(() => {
  switch (activeFilter.value) {
    case 'name':
      return nameResults.value
    case 'ingredients':
      return ingredientResults.value
    default:
      return allResults.value
  }
})

// 高亮关键词
// const highlightKeyword = (text: string) => {
//   if (!searchKeyword.value.trim()) return text
//
//   const keyword = searchKeyword.value.trim()
//   const regex = new RegExp(`(${keyword})`, 'gi')
//   return text.replace(regex, '<span style="color: #FF6B35; font-weight: bold;">$1</span>')
// }

function highlightKeyword(text: string): any[] {
  if (!searchKeyword.value) return [{type: 'text', text}];

  const parts = text.split(searchKeyword.value);
  const result: any[] = [];

  parts.forEach((part, index) => {
    if (part) result.push({type: 'text', text: part});
    if (index < parts.length - 1) {
      result.push({
        name: 'text',
        attrs: {
          style: 'color: #e67e22; font-weight: bold;',
        },
        children: [{type: 'text', text: searchKeyword.value}],
      });
    }
  });

  return result;
}

function htmlToRichTextNodes(htmlStr: string): any[] {
  // 简化版：仅支持 <span style="...">text</span>
  const spanRegex = /<span style="([^"]+)">([^<]*)<\/span>/g;
  const nodes: any[] = [];

  let lastIndex = 0;
  let match;
  while ((match = spanRegex.exec(htmlStr))) {
    const [full, style, content] = match;
    const index = match.index;

    // 前面纯文本
    if (index > lastIndex) {
      nodes.push({type: 'text', text: htmlStr.slice(lastIndex, index)});
    }

    // 高亮部分
    nodes.push({
      name: 'text',
      attrs: {style},
      children: [{type: 'text', text: content}],
    });

    lastIndex = index + full.length;
  }

  // 剩余文本
  if (lastIndex < htmlStr.length) {
    nodes.push({type: 'text', text: htmlStr.slice(lastIndex)});
  }

  return nodes;
}

function getHighlightedName(name: string): any[] {
  const keyword = searchKeyword.value.toLowerCase().trim()
  console.log(keyword)
  if (!keyword) return [{type: 'text', text: name}]
  const highlighted = name.replace(
    new RegExp(keyword, 'g'),
    `<span style="color: #e67e22; font-weight: bold;">${keyword}</span>`
  )
  return htmlToRichTextNodes(highlighted)
}

// 获取匹配类型
const getMatchType = (recipe: any) => {
  const keyword = searchKeyword.value.toLowerCase().trim()
  const nameMatch = recipe.name.toLowerCase().includes(keyword)
  const ingredientMatch = recipe.ingredients.join("、").toLowerCase().includes(keyword)

  if (nameMatch && ingredientMatch) return '菜名+食材'
  if (nameMatch) return '菜名匹配'
  if (ingredientMatch) return '食材匹配'
  return ''
}

// 设置筛选器
const setFilter = (filter: string) => {
  activeFilter.value = filter
}

// 执行搜索
const handleSearch = (val?: any) => {
  const keyword = val?.value || searchKeyword.value
  if (!keyword.trim()) return

  isLoading.value = true

  // 添加到最近搜索
  addToRecentSearches(keyword.trim())

  // 模拟搜索延迟
  setTimeout(() => {
    isLoading.value = false
    activeFilter.value = 'all'
  }, 500)
}

// 清空搜索
const handleClear = () => {
  searchKeyword.value = ''
  activeFilter.value = 'all'
}

// 添加到最近搜索
const addToRecentSearches = (keyword: string) => {
  const searches = recentSearches.value.filter(item => item !== keyword)
  searches.unshift(keyword)
  recentSearches.value = searches.slice(0, 8) // 最多保存8个
  // 保存到本地存储
  uni.setStorageSync('recent_searches', recentSearches.value)
}

// 搜索推荐关键词
const searchRecommended = (keyword: string) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 搜索热门关键词
const searchHot = (keyword: string) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 搜索最近关键词
const searchRecent = (keyword: string) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 清空最近搜索
const clearRecentSearches = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空最近搜索记录吗？',
    success: (res) => {
      if (res.confirm) {
        recentSearches.value = []
        uni.removeStorageSync('recent_searches')
        uni.showToast({
          title: '已清空',
          icon: 'success'
        })
      }
    }
  })
}

// 查看食谱详情（弹窗展示）
const viewRecipeDetail = (recipe: any) => {
  uni.showModal({
    title: recipe.name,
    content: `${recipe.description}\n\n食材：${recipe.ingredients.join('、')}\n\n时间：${recipe.cookTime}\n\n步骤：\n${recipe.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}`,
    confirmText: '知道了',
    showCancel: false
  })
}

// 页面加载时获取参数
onMounted(() => {
  // 获取最近搜索记录
  recentSearches.value = uni.getStorageSync('recent_searches') || []

  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}

  if (options.keyword) {
    searchKeyword.value = decodeURIComponent(options.keyword)
    handleSearch()
  }
})
</script>

<style scoped>
.search-results-page {
  min-height: 100vh;
  background-color: #FFFAF6;
}

/* 搜索栏 */
.search-header {
  padding: 10px 15px;
  background-color: #FFFAF6;
  border-bottom: 1px solid #f0f0f0;
}

.search-action {
  color: #FF6B35;
  font-size: 14px;
  padding: 0 10px;
}

/* 搜索状态 */
.search-status {
  padding: 12px 15px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.status-text {
  font-size: 14px;
  color: #333;
  margin-right: 10px;
}

.result-count {
  font-size: 12px;
  color: #999;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #999;
}

/* 筛选区域 */
.filter-section {
  padding: 12px 15px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.filter-title {
  font-size: 14px;
  color: #666;
  margin-right: 10px;
}

.filter-tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.filter-tag {
  padding: 4px 12px;
  background: #f5f5f5;
  color: #666;
  font-size: 12px;
  border-radius: 12px;
  transition: all 0.3s;
}

.filter-tag.active {
  background: #FF6B35;
  color: white;
}

/* 结果列表 */
.results-container {
  flex: 1;
}

.recipe-list {
  padding: 0 15px;
}

.recipe-item {
  display: flex;
  background: white;
  align-items: center;
  padding: 0 8px;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.recipe-item:active {
  transform: scale(0.98);
}

.recipe-image {
  width: 113px;
  height: 85px;
  border-radius: 4px;
  background-color: #f0f0f0;
  object-fit: cover;
  flex-shrink: 0;
}

.recipe-emoji {
  width: 113px;
  height: 85px;
  border-radius: 4px;
  background: #FFF5E6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.emoji-icon {
  font-size: 50px;
}

.recipe-content {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.recipe-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.3;
}

.recipe-ingredients {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recipe-likes {
  font-size: 12px;
  color: #ff4757;
}

.match-type {
  font-size: 10px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 8px;
}

/* 无结果状态 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-results-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.no-results-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.recommended-searches {
  width: 100%;
}

.recommend-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.recommend-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recommend-tag {
  padding: 6px 12px;
  background: #FFF0E8;
  color: #FF6B35;
  font-size: 12px;
  border-radius: 16px;
  border: 1px solid #FFE0CC;
}

/* 默认状态 */
.default-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.default-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.default-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.default-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 32px;
}

.hot-searches, .recent-searches {
  width: 100%;
  margin-bottom: 24px;
}

.hot-title, .recent-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.clear-recent {
  font-size: 12px;
  color: #999;
}

.hot-tags, .recent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hot-tag, .recent-tag {
  padding: 8px 16px;
  background: white;
  color: #666;
  font-size: 14px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s;
}

.hot-tag:active, .recent-tag:active {
  background: #FF6B35;
  color: white;
  border-color: #FF6B35;
}

.safe-area-bottom {
  height: 20px;
}
</style>
