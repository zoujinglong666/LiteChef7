<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "replace"
}
</route>

<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack"><wd-icon name="chevron-left" size="20px" color="#fff" /></view>
        <text class="nav-title">智能替换</text>
        <view class="nav-right" />
      </view>
      <view class="header-info">
        <text class="header-title">缺食材？</text>
        <text class="header-sub">AI 为你推荐最佳替代方案</text>
      </view>
    </view>

    <!-- 输入区 -->
    <view class="section">
      <view class="section-head">
        <wd-icon name="search" size="16px" class="section-icon" />
        <text class="section-title">你缺少什么食材？</text>
      </view>
      <view class="input-row">
        <input
          class="main-input"
          v-model="missingIngredient"
          placeholder="如：香菇、蚝油、生姜..."
          @confirm="searchReplace"
        />
        <button class="search-btn" @click="searchReplace">找替代</button>
      </view>
      <view class="quick-list">
        <text class="quick-label">常见：</text>
        <text
          class="quick-tag"
          v-for="q in quickList"
          :key="q"
          @click="missingIngredient = q; searchReplace()"
        >{{ q }}</text>
      </view>
    </view>

    <!-- 结果区 -->
    <view class="result-area" v-if="result">
      <!-- 加载中 -->
      <view class="loading-box" v-if="loading">
        <text class="loading-icon">🤔</text>
        <text class="loading-text">正在思考替代方案...</text>
      </view>

      <!-- 结果 -->
      <view class="result-card" v-else>
        <view class="result-head">
          <text class="result-missing">{{ result.missing }}</text>
          <text class="result-arrow">→</text>
          <text class="result-count">{{ result.replacements.length }} 种替代</text>
        </view>

        <view class="replace-list">
          <view
            class="replace-item"
            v-for="(r, i) in result.replacements"
            :key="i"
          >
            <view class="replace-rank">
              <text class="rank-num">{{ i + 1 }}</text>
            </view>
            <view class="replace-info">
              <text class="replace-name">{{ r.name }}</text>
              <text class="replace-ratio">替换比例：{{ r.ratio }}</text>
              <text class="replace-tip">{{ r.tip }}</text>
            </view>
            <view class="replace-score">
              <text class="score-label">相似度</text>
              <text class="score-num">{{ r.score }}%</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-hint" v-else>
      <wd-icon name="info-circle" size="14px" class="hint-icon" />
      <text class="hint-text">输入缺少的食材，AI 会推荐最佳替代品</text>
    </view>

    <view class="bottom-placeholder" />
  </view>
</template>

<script setup lang="ts">
const missingIngredient = ref('')
const loading = ref(false)
const result = ref<any>(null)

const quickList = ['香菇', '蚝油', '生姜', '料酒', '生抽', '花椒', '香菜', '牛奶']

interface Replacement {
  name: string
  ratio: string
  tip: string
  score: number
}

// 本地知识库（AI 不可用时降级）
const localKnowledge: Record<string, Replacement[]> = {
  '香菇': [
    { name: '杏鲍菇', ratio: '1:1', tip: '口感相似，鲜味稍淡', score: 90 },
    { name: '金针菇', ratio: '1:1.2', tip: '更爽脆，适合炒菜', score: 75 },
    { name: '口蘑', ratio: '1:1', tip: '味道清淡，需多加调料', score: 70 },
  ],
  '蚝油': [
    { name: '生抽+老抽', ratio: '2:1', tip: '颜色深，咸味重，少放盐', score: 85 },
    { name: '鲍鱼汁', ratio: '1:1', tip: '味道更浓郁，成本较高', score: 80 },
    { name: '鸡精+糖', ratio: '1:0.5', tip: '提鲜效果相似', score: 65 },
  ],
  '生姜': [
    { name: '姜粉', ratio: '1:0.3', tip: '去腥效果稍弱', score: 80 },
    { name: '葱姜蒜', ratio: '用葱蒜替代', tip: '风味不同但去腥有效', score: 70 },
  ],
  '料酒': [
    { name: '白酒', ratio: '1:0.5', tip: '酒味更重，少放', score: 75 },
    { name: '黄酒', ratio: '1:1', tip: '效果相同，风味更醇', score: 90 },
    { name: '啤酒', ratio: '1:2', tip: '去腥效果弱，适合炖菜', score: 60 },
  ],
  '生抽': [
    { name: '老抽', ratio: '1:1', tip: '颜色更深，少放', score: 70 },
    { name: '蒸鱼豉油', ratio: '1:1', tip: '鲜味更足', score: 85 },
  ],
  '花椒': [
    { name: '花椒油', ratio: '几滴即可', tip: '麻味更集中', score: 85 },
    { name: '胡椒粉', ratio: '1:1', tip: '辣味不同，但可提味', score: 60 },
  ],
  '香菜': [
    { name: '芹菜叶', ratio: '1:1', tip: '清香相似', score: 70 },
    { name: '小葱花', ratio: '1:1', tip: '风味不同但可点缀', score: 55 },
  ],
  '牛奶': [
    { name: '豆浆', ratio: '1:1', tip: '植物蛋白，口感略稀', score: 80 },
    { name: '椰浆', ratio: '1:0.8', tip: '椰香浓郁，适合甜点', score: 75 },
    { name: '淡奶油', ratio: '1:0.5', tip: '更浓郁，热量高', score: 70 },
  ],
}

async function searchReplace() {
  if (!missingIngredient.value.trim()) return

  loading.value = true
  result.value = null

  const ingredient = missingIngredient.value.trim()

  // 先查本地知识库
  if (localKnowledge[ingredient]) {
    loading.value = false
    result.value = {
      missing: ingredient,
      replacements: localKnowledge[ingredient]
    }
    return
  }

  // 调用 AI
  try {
    const apiKey = (import.meta.env.VITE_ZHIPU_API_KEY as string) || ''
    if (!apiKey) throw new Error('无API Key')

    const prompt = `用户缺少食材"${ingredient}"，请推荐3-4种最佳替代品。

返回严格合法的JSON（不要markdown代码块）：
{
  "replacements": [
    {
      "name": "替代品名称",
      "ratio": "替换比例，如 1:1 或 1:0.5",
      "tip": "使用提示，15字以内",
      "score": 相似度分数(60-95的整数)
    }
  ]
}

按 score 从高到低排序。`

    const res: any = await new Promise((resolve, reject) => {
      uni.request({
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: 'glm-4-flash',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        },
        timeout: 15000,
        success: resolve,
        fail: reject
      })
    })

    let content = res.data.choices[0].message.content.trim()
    content = content.replace(/^```json?\s*/m, '').replace(/```\s*$/m, '').trim()
    const data = JSON.parse(content)

    loading.value = false
    result.value = {
      missing: ingredient,
      replacements: data.replacements.sort((a: any, b: any) => b.score - a.score)
    }
  } catch {
    // 降级到通用建议
    loading.value = false
    result.value = {
      missing: ingredient,
      replacements: [
        { name: '同类食材', ratio: '1:1', tip: '选择口感相似的食材', score: 60 },
        { name: '省略不用', ratio: '-', tip: '部分菜品可省略', score: 40 },
      ]
    }
  }
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page { min-height: 100vh; background: #F8F9FA; }

/* 顶部 */
.header {
  background: linear-gradient(135deg, #FF6B35 0%, #FF9E4D 100%);
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 40rpx 20rpx;
}

.back-btn {
  width: 72rpx; height: 72rpx;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.back-icon { font-size: 52rpx; color: #fff; font-weight: bold; }
.nav-title { font-size: 34rpx; font-weight: bold; color: #fff; }
.nav-right { width: 72rpx; }

.header-info { padding: 10rpx 50rpx; }
.header-title { display: block; font-size: 44rpx; font-weight: bold; color: #fff; margin-bottom: 8rpx; }
.header-sub { font-size: 26rpx; color: rgba(255,255,255,0.85); }

/* section */
.section {
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.section-head {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-icon { font-size: 32rpx; margin-right: 12rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; }

/* 输入 */
.input-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.main-input {
  flex: 1;
  background: #F5F5F5;
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  font-size: 30rpx;
}

.search-btn {
  background: linear-gradient(135deg, #FF6B35, #FF9E4D);
  color: #fff;
  border: none;
  border-radius: 24rpx;
  padding: 0 32rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.quick-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.quick-label { font-size: 24rpx; color: #888; }
.quick-tag {
  font-size: 24rpx;
  color: #FF6B35;
  background: #FFF0E8;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* 结果 */
.result-area { margin: 20rpx 30rpx; }

.loading-box {
  background: #fff;
  border-radius: 28rpx;
  padding: 60rpx;
  text-align: center;
}

.loading-icon { font-size: 80rpx; display: block; margin-bottom: 20rpx; }
.loading-text { font-size: 28rpx; color: #888; }

.result-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.result-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 28rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx dashed #EEE;
}

.result-missing { font-size: 32rpx; color: #999; text-decoration: line-through; }
.result-arrow { font-size: 36rpx; color: #FF6B35; }
.result-count { font-size: 28rpx; color: #FF6B35; font-weight: bold; }

.replace-list { display: flex; flex-direction: column; gap: 16rpx; }

.replace-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  background: #F8F9FA;
  border-radius: 20rpx;
  padding: 24rpx;
}

.replace-rank {
  width: 48rpx; height: 48rpx;
  background: linear-gradient(135deg, #FF6B35, #FF9E4D);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.rank-num { font-size: 24rpx; color: #fff; font-weight: bold; }

.replace-info { flex: 1; }
.replace-name { display: block; font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.replace-ratio { display: block; font-size: 24rpx; color: #FF6B35; margin-bottom: 6rpx; }
.replace-tip { display: block; font-size: 22rpx; color: #888; }

.replace-score { text-align: center; }
.score-label { display: block; font-size: 20rpx; color: #888; margin-bottom: 4rpx; }
.score-num { font-size: 32rpx; font-weight: bold; color: #FF6B35; }

/* 空状态 */
.empty-hint {
  margin: 60rpx 30rpx;
  text-align: center;
  padding: 60rpx;
  background: #fff;
  border-radius: 28rpx;
}

.hint-icon { font-size: 80rpx; display: block; margin-bottom: 20rpx; }
.hint-text { font-size: 28rpx; color: #888; }

.bottom-placeholder { height: 60rpx; }
</style>
