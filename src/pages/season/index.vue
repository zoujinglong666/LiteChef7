<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "season"
}
</route>

<template>
  <view class="season-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">应季蔬菜</text>
        <view class="nav-right" />
      </view>
      <view class="header-content">
        <text class="header-title">🥬 应季蔬菜识别</text>
        <text class="header-sub">拍照识别蔬菜，获取营养建议</text>
      </view>
    </view>

    <!-- 拍照区域 -->
    <view class="camera-section">
      <view
        class="camera-button"
        @click="takePhoto"
        :class="{ loading: isAnalyzing }"
      >
        <view class="camera-icon" v-if="!selectedImage && !isAnalyzing">
          <text class="icon">📷</text>
          <text class="camera-text">点击拍照识别</text>
        </view>

        <image
          v-if="selectedImage && !isAnalyzing"
          :src="selectedImage"
          mode="aspectFill"
          class="preview-image"
        />

        <view v-if="isAnalyzing" class="analyzing-state">
          <text class="loading-icon">🔍</text>
          <text class="analyzing-text">AI识别中...</text>
        </view>
      </view>

      <view v-if="selectedImage" class="retake-button" @click="retakePhoto">
        <text class="retake-text">重新拍照</text>
      </view>
    </view>

    <!-- 识别结果 -->
    <view v-if="recognitionResult" class="result-section">
      <!-- 蔬菜信息 -->
      <view class="vegetable-card">
        <view class="vegetable-header">
          <text class="vegetable-name">{{ recognitionResult.name }}</text>
          <view
            class="season-badge"
            :class="recognitionResult.isInSeason ? 'in-season' : 'out-season'"
          >
            <text class="badge-text">{{ recognitionResult.isInSeason ? '✅ 应季' : '❌ 非应季' }}</text>
          </view>
        </view>
        <view class="vegetable-info">
          <text class="confidence">识别准确度: {{ recognitionResult.confidence }}%</text>
          <text class="season-info">最佳季节: {{ recognitionResult.bestSeason }}</text>
        </view>
      </view>

      <!-- 营养分析 -->
      <view class="nutrition-section">
        <view class="section-title">
          <text class="title-icon">🥗</text>
          <text class="title-text">营养分析</text>
        </view>
        <view class="nutrition-grid">
          <view class="nutrition-item" v-for="(item, index) in recognitionResult.nutrition" :key="index">
            <text class="nutrition-label">{{ item.label }}</text>
            <view class="nutrition-bar">
              <view class="nutrition-fill" :style="{ width: item.value + '%', backgroundColor: item.color }"></view>
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
          <view class="suitability" :class="recognitionResult.suitability.level">
            <text class="suitability-text">{{ recognitionResult.suitability.text }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 当季推荐 -->
    <view class="seasonal-vegetables">
      <view class="section-title">
        <text class="title-icon">🌱</text>
        <text class="title-text">当季推荐蔬菜</text>
      </view>
      <view class="vegetables-grid">
        <view class="vegetable-item" v-for="vegetable in seasonalVegetables" :key="vegetable.id" @click="selectVegetable(vegetable)">
          <text class="vegetable-emoji">{{ vegetable.emoji }}</text>
          <text class="vegetable-name">{{ vegetable.name }}</text>
          <text class="vegetable-benefit">{{ vegetable.benefit }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const selectedImage = ref('')
const isAnalyzing = ref(false)
const recognitionResult = ref<any>(null)

const seasonalVegetables = ref([
  { id: 1, name: '菠菜', emoji: '🥬', benefit: '富含铁质' },
  { id: 2, name: '白萝卜', emoji: '🥕', benefit: '润肺止咳' },
  { id: 3, name: '大白菜', emoji: '🥬', benefit: '维C丰富' },
  { id: 4, name: '胡萝卜', emoji: '🥕', benefit: '护眼明目' },
])

function takePhoto() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      selectedImage.value = res.tempFilePaths[0]
      analyzeVegetable()
    },
    fail: () => {
      uni.showToast({ title: '拍照失败', icon: 'none' })
    }
  })
}

function retakePhoto() {
  selectedImage.value = ''
  recognitionResult.value = null
  takePhoto()
}

function analyzeVegetable() {
  isAnalyzing.value = true

  setTimeout(() => {
    const mockResults = [
      {
        name: '菠菜',
        confidence: 95,
        isInSeason: true,
        bestSeason: '秋冬季',
        nutrition: [
          { label: '维生素C', value: 85, color: '#FF6B35' },
          { label: '铁质', value: 92, color: '#FF9E4D' },
          { label: '叶酸', value: 78, color: '#FFB366' },
          { label: '膳食纤维', value: 70, color: '#FFCC99' },
        ],
        healthAdvice: '菠菜富含铁质和叶酸，特别适合贫血人群食用。建议焯水后食用，可以去除草酸。',
        suitability: { level: 'excellent', text: '非常适合食用' }
      }
    ]

    recognitionResult.value = mockResults[0]
    isAnalyzing.value = false
    uni.showToast({ title: '识别完成', icon: 'success' })
  }, 2000)
}

function selectVegetable(vegetable: any) {
  uni.showToast({ title: `选择了${vegetable.name}`, icon: 'none' })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.season-page {
  min-height: 100vh;
  background: #F8F9FA;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
}

.nav-bar {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 40rpx 20rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.nav-right {
  width: 64rpx;
}

.header-content {
  position: relative;
  padding: 20rpx 50rpx 50rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
}

.header-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
}

.header-sub {
  font-size: 26rpx;
  color: rgba(255,255,255,0.85);
}

.camera-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx;
  padding-top: 400rpx;
}

.camera-button {
  width: 300rpx;
  height: 300rpx;
  background: #fff;
  border: 4rpx dashed #FF6B35;
  border-radius: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.camera-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.camera-text {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: 500;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.analyzing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-icon {
  font-size: 60rpx;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.analyzing-text {
  font-size: 28rpx;
  color: #FF6B35;
  margin-top: 16rpx;
}

.retake-button {
  margin-top: 24rpx;
  padding: 16rpx 40rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  border-radius: 30rpx;
}

.retake-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}

.result-section {
  padding: 0 30rpx;
}

.vegetable-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.vegetable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.vegetable-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.season-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.season-badge.in-season {
  background: #FFF0E8;
  color: #FF6B35;
}

.season-badge.out-season {
  background: #FFE4E4;
  color: #FF4D4F;
}

.vegetable-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.confidence, .season-info {
  font-size: 26rpx;
  color: #666;
}

.nutrition-section, .health-advice, .seasonal-vegetables {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.title-icon {
  font-size: 32rpx;
}

.title-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.nutrition-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.nutrition-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.nutrition-label {
  width: 140rpx;
  font-size: 26rpx;
  color: #666;
}

.nutrition-bar {
  flex: 1;
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;
}

.nutrition-fill {
  height: 100%;
  border-radius: 6rpx;
}

.nutrition-value {
  width: 60rpx;
  font-size: 24rpx;
  color: #666;
  text-align: right;
}

.advice-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.advice-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.suitability {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  text-align: center;
}

.suitability.excellent {
  background: #FFF0E8;
  color: #FF6B35;
}

.suitability.good {
  background: #FFF7E6;
  color: #FA8C16;
}

.suitability-text {
  font-size: 26rpx;
  font-weight: 500;
}

.vegetables-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.vegetable-item {
  background: #FFF9F5;
  border-radius: 20rpx;
  padding: 24rpx;
  text-align: center;
  border: 2rpx solid #FFE4D4;
}

.vegetable-emoji {
  font-size: 60rpx;
  display: block;
  margin-bottom: 12rpx;
}

.vegetable-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.vegetable-benefit {
  font-size: 22rpx;
  color: #999;
}
</style>
