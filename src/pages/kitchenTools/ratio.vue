<route lang="json">
{
  "style": { "navigationBarTitleText": "油盐糖比例表" },
  "name": "ratio"
}
</route>

<template>
  <view class="measurement-guide">
    <!-- 顶部搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索食材或计量单位"
          class="search-input"
        />
        <text
          class="clear-icon"
          v-if="searchKeyword"
          @click="searchKeyword = ''"
          >✕</text
        >
      </view>
    </view>

    <!-- 分类标签 -->
    <scroll-view scroll-x class="category-tabs">
      <view
        class="category-tab"
        :class="{ active: activeCategory === category.id }"
        v-for="category in categories"
        :key="category.id"
        @click="activeCategory = category.id"
      >
        <text class="tab-icon">{{ category.icon }}</text>
        <text class="tab-text">{{ category.name }}</text>
      </view>
    </scroll-view>

    <!-- 计量单位转换器 -->
    <view class="converter-section" v-if="activeCategory === 'converter'">
      <view class="converter-title">单位转换计算器</view>
      <view class="converter-form">
        <view class="input-group">
          <input type="number" v-model="convertValue" class="converter-input" />
          <picker
            mode="selector"
            :range="unitOptions"
            @change="handleFromUnitChange"
            class="unit-picker"
          >
            <view class="selected-unit">{{ fromUnit }}</view>
          </picker>
        </view>

        <view class="converter-equals">=</view>

        <view class="result-group">
          <text class="result-value">{{ convertedValue }}</text>
          <picker
            mode="selector"
            :range="unitOptions"
            @change="handleToUnitChange"
            class="unit-picker"
          >
            <view class="selected-unit">{{ toUnit }}</view>
          </picker>
        </view>
      </view>

      <view class="common-conversions">
        <view class="common-title">常用换算</view>
        <view class="common-list">
          <view
            class="common-item"
            v-for="(item, index) in commonConversions"
            :key="index"
          >
            <text class="common-text">{{ item }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 计量单位指南 -->
    <scroll-view
      scroll-y
      class="guide-content"
      v-if="activeCategory !== 'converter'"
    >
      <!-- 计量单位卡片 -->
      <view
        class="measurement-card"
        v-for="item in filteredItems"
        :key="item.title"
        :class="{ highlight: isHighlighted(item) }"
      >
        <view class="card-header">
          <view class="card-title">{{ item.title }}</view>
          <view class="card-icon">{{ item.icon || '📏' }}</view>
        </view>

        <view class="card-content">
          <view class="card-desc">{{ item.desc }}</view>

          <view
            class="conversion-list"
            v-if="item.conversions && item.conversions.length"
          >
            <view
              class="conversion-item"
              v-for="(conversion, idx) in item.conversions"
              :key="idx"
            >
              <text class="conversion-text">{{ conversion }}</text>
            </view>
          </view>

          <view class="tips" v-if="item.tips">
            <text class="tips-title">小贴士：</text>
            <text class="tips-content">{{ item.tips }}</text>
          </view>
        </view>
      </view>

      <!-- 无结果提示 -->
      <view class="no-results" v-if="filteredItems.length === 0">
        <view class="no-results-icon">🔍</view>
        <view class="no-results-text">没有找到相关计量单位</view>
        <view class="no-results-tips">尝试其他关键词或清除搜索</view>
      </view>
    </scroll-view>

    <!-- 底部提示 -->
    <view class="bottom-tips">
      <text>💡 小贴士：不同食材的密度不同，重量换算仅供参考</text>
    </view>
  </view>
</template>

<script setup lang="ts">
// 响应式数据
const searchKeyword = ref('');
const activeCategory = ref('basic');
const convertValue = ref(1);
const fromUnit = ref('克(g)');
const toUnit = ref('毫升(ml)');

// 分类
const categories = [
  { id: 'basic', name: '基础单位', icon: '📏' },
  { id: 'volume', name: '容量单位', icon: '🥄' },
  { id: 'weight', name: '重量单位', icon: '⚖️' },
  { id: 'ingredients', name: '常用食材', icon: '🥘' },
  { id: 'converter', name: '单位转换', icon: '🔄' },
];

// 单位选项
const unitOptions = [
  '克(g)',
  '千克(kg)',
  '毫升(ml)',
  '升(L)',
  '茶匙(tsp)',
  '汤匙(tbsp)',
  '杯(cup)',
  '盎司(oz)',
  '磅(lb)',
  '斤',
];

// 常用换算
const commonConversions = [
  '1杯 = 250毫升',
  '1汤匙 = 15毫升',
  '1茶匙 = 5毫升',
  '1斤 = 500克',
  '1盎司 ≈ 28.35克',
  '1磅 ≈ 453.6克',
  '1杯面粉 ≈ 120克',
  '1杯糖 ≈ 200克',
  '1杯米 ≈ 185克',
  '1杯水 = 250克',
];

// 计量单位数据
const measurementItems = [
  // 基础单位
  {
    title: '汤匙(Tablespoon)',
    desc: '烹饪中最常用的计量单位之一',
    icon: '🥄',
    category: 'basic',
    conversions: ['1汤匙 = 15毫升(ml)', '1汤匙 = 3茶匙', '4汤匙 = 1/4杯'],
    tips: '不同国家的汤匙标准可能略有不同，中式汤匙约15ml，西式可能为14-18ml',
  },
  {
    title: '茶匙(Teaspoon)',
    desc: '用于计量少量调料的单位',
    icon: '🥄',
    category: 'basic',
    conversions: ['1茶匙 = 5毫升(ml)', '3茶匙 = 1汤匙'],
  },
  {
    title: '杯(Cup)',
    desc: '烘焙和烹饪中常用的容量单位',
    icon: '🥛',
    category: 'basic',
    conversions: ['1杯 = 250毫升(ml)', '1杯 = 16汤匙', '1杯 = 48茶匙'],
    tips: '中式量杯通常为250ml，美式量杯为240ml，日式量杯为200ml',
  },

  // 容量单位
  {
    title: '毫升(ml)',
    desc: '液体体积的基本计量单位',
    icon: '💧',
    category: 'volume',
    conversions: ['1000毫升 = 1升(L)', '15毫升 = 1汤匙', '5毫升 = 1茶匙'],
  },
  {
    title: '升(L)',
    desc: '较大容量液体的计量单位',
    icon: '🚰',
    category: 'volume',
    conversions: ['1升 = 1000毫升(ml)', '1升 = 4杯', '1升 ≈ 33.8液体盎司'],
  },
  {
    title: '液体盎司(fl oz)',
    desc: '英美制液体计量单位',
    icon: '🥃',
    category: 'volume',
    conversions: ['1液体盎司 ≈ 29.57毫升', '8液体盎司 = 1杯(美制)'],
  },

  // 重量单位
  {
    title: '克(g)',
    desc: '重量的基本计量单位',
    icon: '⚖️',
    category: 'weight',
    conversions: ['1000克 = 1千克(kg)', '500克 = 1斤', '1克 ≈ 0.035盎司'],
  },
  {
    title: '千克(kg)',
    desc: '较大重量的计量单位',
    icon: '⚖️',
    category: 'weight',
    conversions: ['1千克 = 1000克(g)', '1千克 = 2斤', '1千克 ≈ 2.2磅(lb)'],
  },
  {
    title: '盎司(oz)',
    desc: '英美制重量单位',
    icon: '⚖️',
    category: 'weight',
    conversions: ['1盎司 ≈ 28.35克', '16盎司 = 1磅(lb)'],
  },
  {
    title: '磅(lb)',
    desc: '英美制重量单位',
    icon: '⚖️',
    category: 'weight',
    conversions: ['1磅 ≈ 453.6克', '1磅 = 16盎司'],
  },
  {
    title: '斤',
    desc: '中国传统重量单位',
    icon: '⚖️',
    category: 'weight',
    conversions: ['1斤 = 500克', '2斤 = 1千克'],
    tips: '在不同地区，传统的"斤"可能有所不同，现代统一为500克',
  },

  // 常用食材
  {
    title: '面粉',
    desc: '烘焙必备的基础原料',
    icon: '🌾',
    category: 'ingredients',
    conversions: ['1杯 ≈ 120-130克', '1汤匙 ≈ 8克', '1茶匙 ≈ 3克'],
    tips: '不同面粉密度不同，全麦面粉比普通面粉更重',
  },
  {
    title: '白糖',
    desc: '常用甜味调味料',
    icon: '🧂',
    category: 'ingredients',
    conversions: ['1杯 ≈ 200克', '1汤匙 ≈ 12-15克', '1茶匙 ≈ 4-5克'],
  },
  {
    title: '食用油',
    desc: '烹饪中常用的脂肪来源',
    icon: '🫒',
    category: 'ingredients',
    conversions: [
      '1汤匙 = 15毫升 ≈ 14克',
      '1茶匙 = 5毫升 ≈ 4.5克',
      '1杯 = 250毫升 ≈ 225克',
    ],
  },
  {
    title: '盐',
    desc: '最基础的调味料',
    icon: '🧂',
    category: 'ingredients',
    conversions: ['1汤匙 ≈ 18克', '1茶匙 ≈ 6克'],
    tips: '盐的用量应谨慎，可以少放再调整',
  },
  {
    title: '米饭',
    desc: '主食之一',
    icon: '🍚',
    category: 'ingredients',
    conversions: [
      '1杯生米 ≈ 185克',
      '1杯生米煮熟后 ≈ 3杯米饭',
      '1人份米饭 ≈ 75克生米',
    ],
  },
  {
    title: '鸡蛋',
    desc: '烹饪和烘焙中常用食材',
    icon: '🥚',
    category: 'ingredients',
    conversions: [
      '1个中等大小鸡蛋 ≈ 50-55克',
      '1个鸡蛋的蛋清 ≈ 30克',
      '1个鸡蛋的蛋黄 ≈ 20克',
    ],
  },
  {
    title: '牛奶',
    desc: '烹饪和烘焙中常用液体',
    icon: '🥛',
    category: 'ingredients',
    conversions: ['1杯 = 250毫升 ≈ 258克', '1汤匙 = 15毫升 ≈ 15.5克'],
  },
  {
    title: '黄油/奶油',
    desc: '烘焙中常用的脂肪来源',
    icon: '🧈',
    category: 'ingredients',
    conversions: [
      '1汤匙 ≈ 14克',
      '1/4杯 ≈ 57克',
      '1/2杯 ≈ 113克',
      '1杯 ≈ 227克',
      '1块(stick) ≈ 113克',
    ],
  },
];

const unitMap: Record<string, Record<string, number>> = {
  // 质量类
  '千克(kg)': {
    '克(g)': 1000,
  },
  '克(g)': {
    '千克(kg)': 1 / 1000,
    '磅(lb)': 1 / 453.6,
    '盎司(oz)': 1 / 28.35,
    斤: 1 / 500,
    '毫升(ml)': 1, // 假设密度为 1
  },
  '磅(lb)': {
    '克(g)': 453.6,
  },
  '盎司(oz)': {
    '克(g)': 28.35,
  },
  斤: {
    '克(g)': 500,
  },

  // 容积类
  '毫升(ml)': {
    '克(g)': 1, // 假设密度为 1
    '升(L)': 1 / 1000,
    '杯(cup)': 1 / 250,
    '汤匙(tbsp)': 1 / 15,
    '茶匙(tsp)': 1 / 5,
  },
  '升(L)': {
    '毫升(ml)': 1000,
  },
  '杯(cup)': {
    '毫升(ml)': 250,
  },
  '汤匙(tbsp)': {
    '毫升(ml)': 15,
  },
  '茶匙(tsp)': {
    '毫升(ml)': 5,
  },
};

const convertedValue = computed(() => {
  const value = parseFloat(convertValue.value.toString()) || 0;
  const from = fromUnit.value;
  const to = toUnit.value;

  if (from === to) return value;

  // 直接转换
  const direct = unitMap[from]?.[to];
  if (direct != null) return parseFloat((value * direct).toFixed(4));

  // 反向转换
  const reverse = unitMap[to]?.[from];
  if (reverse != null) return parseFloat((value / reverse).toFixed(4));

  // 间接转换：from → mid → to
  for (const mid in unitMap[from]) {
    const midToTarget = unitMap[mid]?.[to];
    if (midToTarget != null) {
      const first = unitMap[from][mid];
      const total = value * first * midToTarget;
      return parseFloat(total.toFixed(4));
    }
  }

  return '无法转换';
});

// 根据分类和搜索过滤项目
const filteredItems = computed(() => {
  // 排除 converter 分类
  if (activeCategory.value === 'converter') return [];

  const keyword = searchKeyword.value.toLowerCase().trim();

  return measurementItems.filter((item) => {
    const matchCategory = item.category === activeCategory.value;
    const matchKeyword = keyword
      ? item.title.toLowerCase().includes(keyword) ||
        item.desc.toLowerCase().includes(keyword) ||
        item.conversions?.some((c) => c.toLowerCase().includes(keyword))
      : true;

    return matchCategory && matchKeyword;
  });
});

// 处理单位选择变化
function handleFromUnitChange(e: any) {
  fromUnit.value = unitOptions[e.detail.value];
}

function handleToUnitChange(e: any) {
  toUnit.value = unitOptions[e.detail.value];
}

// 判断是否高亮显示（搜索结果）
function isHighlighted(item: any) {
  if (!searchKeyword.value.trim()) return false;

  const keyword = searchKeyword.value.toLowerCase().trim();
  return item.title.toLowerCase().includes(keyword);
}
</script>

<style scoped>
.measurement-guide {
  padding: 10px;
  background-color: #f8f8f8;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 搜索栏 */
.search-section {
  margin-bottom: 10px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 20px;
  padding: 5px 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.search-icon {
  margin-right: 5px;
  font-size: 16px;
}

.search-input {
  flex: 1;
  height: 35px;
  font-size: 14px;
}

.clear-icon {
  padding: 5px;
  color: #999;
}

/* 分类标签 */
.category-tabs {
  white-space: nowrap;
  margin-bottom: 10px;
}

.category-tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 15px;
  margin-right: 8px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.category-tab.active {
  background-color: #e6f7ff;
  border: 0.5px solid #91d5ff;
}

.tab-icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.tab-text {
  font-size: 12px;
  color: #333;
}

/* 计量单位卡片 */
.guide-content {
  flex: 1;
  margin-bottom: 10px;
}

.measurement-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.measurement-card.highlight {
  background-color: #e6f7ff;
  border-left: 2px solid #1890ff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-title {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.card-icon {
  font-size: 20px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-desc {
  color: #666;
  font-size: 14px;
}

.conversion-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 5px;
}

.conversion-item {
  background-color: #f5f5f5;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
}

.tips {
  margin-top: 8px;
  background-color: #fffbe6;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
}

.tips-title {
  color: #d48806;
  font-weight: bold;
  margin-right: 4px;
}

.tips-content {
  color: #666;
}

/* 转换器部分 */
.converter-section {
  background-color: #fff;
  border-radius: 4px;
  padding: 7.5px;
  margin-bottom: 5px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}

.converter-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
  color: #333;
}

.converter-form {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.input-group,
.result-group {
  display: flex;
  align-items: center;
}

.converter-input {
  width: 60px;
  height: 40px;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 16px;
  text-align: center;
}

.unit-picker {
  margin-left: 5px;
}

.selected-unit {
  background-color: #e6f7ff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
  color: #1890ff;
}

.converter-equals {
  margin: 0 10px;
  font-size: 18px;
  color: #999;
}

.result-value {
  font-size: 16px;
  font-weight: bold;
  color: #1890ff;
  margin-right: 5px;
  min-width: 60px;
  text-align: center;
}

.common-conversions {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 10px;
}

.common-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.common-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.common-item {
  background-color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  box-shadow: 0 0.5px 2px rgba(0, 0, 0, 0.05);
}

/* 无结果状态 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #999;
}

.no-results-icon {
  font-size: 40px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.no-results-text {
  font-size: 16px;
  margin-bottom: 5px;
}

.no-results-tips {
  font-size: 12px;
}

/* 底部提示 */
.bottom-tips {
  background-color: #fffbe6;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #d48806;
  text-align: center;
  margin-top: auto;
}
</style>
