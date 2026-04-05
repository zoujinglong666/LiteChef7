<route lang="json">
{
  "layout": "tabbar",
  "style": { "navigationBarTitleText": "应季蔬菜" },
  "name": "season"
}
</route>

<template>
  <view class="season-page">
    <!-- 顶部拍照区域 -->
    <view class="camera-section">
      <view class="camera-header">
        <text class="season-title">🥬 应季蔬菜识别</text>
        <text class="season-subtitle">拍照识别蔬菜，获取营养建议</text>
      </view>

      <!-- 拍照按钮 -->
      <view class="camera-container">
        <view
          class="camera-button"
          @click="takePhoto"
          :class="{ loading: isAnalyzing }"
        >
          <view class="camera-icon" v-if="!selectedImage && !isAnalyzing">
            <text class="icon">📷</text>
            <text class="camera-text">点击拍照识别</text>
          </view>

          <!-- 显示拍摄的图片 -->
          <image
            v-if="selectedImage && !isAnalyzing"
            :src="selectedImage"
            mode="aspectFill"
            class="preview-image"
          />

          <!-- 分析中状态 -->
          <view v-if="isAnalyzing" class="analyzing-state">
            <text class="loading-icon">🔍</text>
            <text class="analyzing-text">AI识别中...</text>
          </view>
        </view>

        <!-- 重新拍照按钮 -->
        <view v-if="selectedImage" class="retake-button" @click="retakePhoto">
          <text class="retake-text">重新拍照</text>
        </view>
      </view>
    </view>

    <!-- 识别结果区域 -->
    <view v-if="recognitionResult" class="result-section">
      <!-- 蔬菜信息卡片 -->
      <view class="vegetable-card">
        <view class="vegetable-header">
          <text class="vegetable-name">{{ recognitionResult.name }}</text>
          <view
            class="season-badge"
            :class="recognitionResult.isInSeason ? 'in-season' : 'out-season'"
          >
            <text class="badge-text">{{
              recognitionResult.isInSeason ? '✅ 应季' : '❌ 非应季'
            }}</text>
          </view>
        </view>

        <view class="vegetable-info">
          <text class="confidence"
            >识别准确度: {{ recognitionResult.confidence }}%</text
          >
          <text class="season-info"
            >最佳季节: {{ recognitionResult.bestSeason }}</text
          >
        </view>
      </view>

      <!-- 营养分析 -->
      <view class="nutrition-section">
        <view class="section-title">
          <text class="title-icon">🥗</text>
          <text class="title-text">营养分析</text>
        </view>

        <view class="nutrition-grid">
          <view
            class="nutrition-item"
            v-for="(item, index) in recognitionResult.nutrition"
            :key="index"
          >
            <text class="nutrition-label">{{ item.label }}</text>
            <view class="nutrition-bar">
              <view
                class="nutrition-fill"
                :style="{
                  width: item.value + '%',
                  backgroundColor: item.color,
                }"
              ></view>
            </view>
            <text class="nutrition-value">{{ item.value }}%</text>
          </view>
        </view>
      </view>

      <!-- 健康建议 -->
      <view class="health-advice">
        <view class="section-title">
          <wd-icon name="info-circle" size="14px" class="title-icon" />
          <text class="title-text">健康建议</text>
        </view>

        <view class="advice-content">
          <text class="advice-text">{{ recognitionResult.healthAdvice }}</text>
          <view
            class="suitability"
            :class="recognitionResult.suitability.level"
          >
            <text class="suitability-text">{{
              recognitionResult.suitability.text
            }}</text>
          </view>
        </view>
      </view>

      <!-- 智能食谱推荐 -->
      <view class="recipe-recommendations">
        <view class="section-title">
          <text class="title-icon">👨‍🍳</text>
          <text class="title-text">智能食谱推荐</text>
        </view>

        <scroll-view scroll-x class="recipe-scroll">
          <view class="recipe-list">
            <view
              class="recipe-card"
              v-for="recipe in recognitionResult.recommendedRecipes"
              :key="recipe.id"
              @click="viewRecipeDetail(recipe)"
            >
              <image
                :src="recipe.image"
                mode="aspectFill"
                class="recipe-image"
              />
              <view class="recipe-info">
                <text class="recipe-name">{{ recipe.name }}</text>
                <view class="recipe-tags">
                  <text
                    class="recipe-tag"
                    v-for="tag in recipe.tags"
                    :key="tag"
                    >{{ tag }}</text
                  >
                </view>
                <text class="recipe-time">{{ recipe.cookTime }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 应季蔬菜推荐 -->
    <view class="seasonal-vegetables">
      <view class="section-title">
        <text class="title-icon">🌱</text>
        <text class="title-text">当季推荐蔬菜</text>
      </view>

      <view class="vegetables-grid">
        <view
          class="vegetable-item"
          v-for="vegetable in seasonalVegetables"
          :key="vegetable.id"
          @click="selectVegetable(vegetable)"
        >
          <image
            :src="vegetable.image"
            mode="aspectFill"
            class="vegetable-image"
          />
          <text class="vegetable-name">{{ vegetable.name }}</text>
          <text class="vegetable-benefit">{{ vegetable.benefit }}</text>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getRandomRecipes } from '@/utils/recipes';

// 响应式数据
const selectedImage = ref('');
const isAnalyzing = ref(false);
const recognitionResult = ref(null);

// 当季蔬菜数据
const seasonalVegetables = ref([
  {
    id: 1,
    name: '菠菜',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300',
    benefit: '富含铁质',
  },
  {
    id: 2,
    name: '白萝卜',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300',
    benefit: '润肺止咳',
  },
  {
    id: 3,
    name: '大白菜',
    image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300',
    benefit: '维C丰富',
  },
  {
    id: 4,
    name: '胡萝卜',
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300',
    benefit: '护眼明目',
  },
]);

// 拍照功能
const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      selectedImage.value = res.tempFilePaths[0];
      analyzeVegetable();
    },
    fail: (err) => {
      uni.showToast({
        title: '拍照失败',
        icon: 'none',
      });
    },
  });
};

// 重新拍照
const retakePhoto = () => {
  selectedImage.value = '';
  recognitionResult.value = null;
  takePhoto();
};

// 分析蔬菜（模拟AI识别）
const analyzeVegetable = () => {
  isAnalyzing.value = true;

  // 模拟AI识别延迟
  setTimeout(() => {
    // 模拟识别结果
    const mockResults = [
      {
        name: '菠菜',
        confidence: 95,
        isInSeason: true,
        bestSeason: '秋冬季',
        nutrition: [
          { label: '维生素C', value: 85, color: '#4ade80' },
          { label: '铁质', value: 92, color: '#f87171' },
          { label: '叶酸', value: 78, color: '#60a5fa' },
          { label: '膳食纤维', value: 70, color: '#a78bfa' },
        ],
        healthAdvice:
          '菠菜富含铁质和叶酸，特别适合贫血人群食用。建议焯水后食用，可以去除草酸。',
        suitability: {
          level: 'excellent',
          text: '非常适合食用',
        },
        recommendedRecipes: [
          {
            id: 1,
            name: '菠菜蛋花汤',
            image:
              'https://images.unsplash.com/photo-1547592180-85f173990554?w=300',
            tags: ['清淡', '营养'],
            cookTime: '15分钟',
          },
          {
            id: 2,
            name: '凉拌菠菜',
            image:
              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
            tags: ['爽口', '下饭'],
            cookTime: '10分钟',
          },
        ],
      },
      {
        name: '西红柿',
        confidence: 88,
        isInSeason: false,
        bestSeason: '夏季',
        nutrition: [
          { label: '维生素C', value: 75, color: '#4ade80' },
          { label: '番茄红素', value: 90, color: '#f87171' },
          { label: '维生素A', value: 65, color: '#60a5fa' },
          { label: '钾', value: 55, color: '#a78bfa' },
        ],
        healthAdvice:
          '西红柿富含番茄红素，具有抗氧化作用。虽然不是当季蔬菜，但营养价值依然很高。',
        suitability: {
          level: 'good',
          text: '适合食用',
        },
        recommendedRecipes: [
          {
            id: 3,
            name: '西红柿鸡蛋',
            image:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
            tags: ['家常', '下饭'],
            cookTime: '12分钟',
          },
        ],
      },
    ];

    // 随机选择一个结果
    recognitionResult.value =
      mockResults[Math.floor(Math.random() * mockResults.length)];
    isAnalyzing.value = false;

    uni.showToast({
      title: '识别完成',
      icon: 'success',
    });
  }, 2000);
};

// 选择蔬菜
const selectVegetable = (vegetable) => {
  uni.showToast({
    title: `选择了${vegetable.name}`,
    icon: 'none',
  });
  // 可以跳转到详情页或触发识别
};

// 查看食谱详情
const viewRecipeDetail = (recipe) => {
  // 从mock数据中查找对应的食谱
  const foundRecipe = allRecipesData.find((item) =>
    item.name.includes(recipe.name.split('').slice(0, 2).join('')),
  );

  if (foundRecipe) {
    uni.navigateTo({
      url: `/pages/recipeDetail/index?url=${encodeURIComponent(foundRecipe.url)}`,
    });
  } else {
    uni.showToast({
      title: '食谱详情暂未收录',
      icon: 'none',
    });
  }
};

// 获取当前季节
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return '春季';
  if (month >= 6 && month <= 8) return '夏季';
  if (month >= 9 && month <= 11) return '秋季';
  return '冬季';
};

onMounted(() => {
  console.log(`当前季节: ${getCurrentSeason()}`);
});
</script>

<style scoped>
.season-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}
/* 顶部拍照区域 */
.camera-section {
  padding: 20px 16px;
  text-align: center;
}

.camera-header {
  margin-bottom: 24px;
}

.season-title {
  display: block;
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: bold;
  color: #166534;
}

.season-subtitle {
  font-size: 14px;
  color: #65a30d;
}

.camera-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.camera-button {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  overflow: hidden;
  background: #f7fee7;
  border: 3px dashed #22c55e;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.camera-button.loading {
  background: #eff6ff;
  border-color: #3b82f6;
}

.camera-button:active {
  transform: scale(0.95);
}

.camera-icon {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.icon {
  font-size: 48px;
}

.camera-text {
  font-size: 16px;
  font-weight: 500;
  color: #166534;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.analyzing-state {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.loading-icon {
  font-size: 36px;
  animation: pulse 1.5s infinite;
}

.analyzing-text {
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.retake-button {
  padding: 8px 20px;
  font-size: 14px;
  color: white;
  background: #22c55e;
  border-radius: 20px;
}
/* 识别结果区域 */
.result-section {
  padding: 0 16px;
  margin-bottom: 24px;
}

.vegetable-card {
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.vegetable-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.vegetable-name {
  font-size: 20px;
  font-weight: bold;
  color: #166534;
}

.season-badge {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
}

.season-badge.in-season {
  color: #166534;
  background: #dcfce7;
}

.season-badge.out-season {
  color: #dc2626;
  background: #fef2f2;
}

.vegetable-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.confidence,
.season-info {
  font-size: 14px;
  color: #6b7280;
}
/* 营养分析 */
.nutrition-section {
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.title-icon {
  font-size: 20px;
}

.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #374151;
}

.nutrition-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nutrition-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.nutrition-label {
  width: 80px;
  font-size: 14px;
  color: #6b7280;
}

.nutrition-bar {
  flex: 1;
  height: 8px;
  overflow: hidden;
  background: #f3f4f6;
  border-radius: 4px;
}

.nutrition-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.nutrition-value {
  width: 40px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-align: right;
}
/* 健康建议 */
.health-advice {
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.advice-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.advice-text {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
}

.suitability {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  border-radius: 12px;
}

.suitability.excellent {
  color: #166534;
  background: #dcfce7;
}

.suitability.good {
  color: #d97706;
  background: #fef3c7;
}

.suitability.caution {
  color: #dc2626;
  background: #fef2f2;
}
/* 食谱推荐 */
.recipe-recommendations {
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.recipe-scroll {
  margin-top: 12px;
}

.recipe-list {
  display: flex;
  gap: 12px;
  padding: 4px 0;
}

.recipe-card {
  flex-shrink: 0;
  width: 140px;
  overflow: hidden;
  background: #f9fafb;
  border-radius: 12px;
}

.recipe-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.recipe-info {
  padding: 12px;
}

.recipe-name {
  display: -webkit-box;
  margin-bottom: 6px;
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.recipe-tag {
  padding: 2px 6px;
  font-size: 10px;
  color: #6b7280;
  background: #e5e7eb;
  border-radius: 6px;
}

.recipe-time {
  font-size: 12px;
  color: #9ca3af;
}
/* 应季蔬菜推荐 */
.seasonal-vegetables {
  padding: 0 16px;
  margin-bottom: 24px;
}

.vegetables-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.vegetable-item {
  padding: 16px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.vegetable-item:active {
  transform: scale(0.95);
}

.vegetable-image {
  width: 60px;
  height: 60px;
  margin-bottom: 8px;
  object-fit: cover;
  border-radius: 30px;
}

.vegetable-name {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.vegetable-benefit {
  font-size: 12px;
  color: #6b7280;
}

.safe-area-bottom {
  height: 20px;
}
</style>
