<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" }
}
</route>

<template>
  <view class="page">
    <!-- 顶部背景 -->
    <view class="header-bg" />

    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: capsuleBottomToTop + 'px' }">
      <view class="back-btn" @click="goBack">
        <wd-icon name="arrow-left" size="20px" color="#fff" />
      </view>
      <text class="nav-title">饮食偏好</text>
      <view style="width: 64rpx" />
    </view>

    <!-- 内容 -->
    <view class="content" :style="{ paddingTop: (capsuleBottomToTop + 88) + 'px' }">

      <!-- 简介 -->
      <view class="intro-card">
        <text class="intro-icon">🍽</text>
        <view class="intro-text">
          <text class="intro-title">精准推荐从这里开始</text>
          <text class="intro-desc">设置你的饮食偏好和忌口，AI会为你推荐更适合的菜谱</text>
        </view>
      </view>

      <!-- 忌口食材 -->
      <view class="section-card">
        <view class="section-head">
          <text class="section-icon">🚫</text>
          <text class="section-title">忌口食材</text>
          <text class="section-tip">（请勿使用这些食材）</text>
        </view>
        <view class="tag-list">
          <view
            v-for="ing in allIngredients"
            :key="ing"
            class="tag"
            :class="{ active: selectedDislike.includes(ing) }"
            @click="toggleTag(ing, 'dislike')"
          >{{ ing }}</view>
        </view>
        <view class="custom-input-row">
          <input
            class="custom-input"
            v-model="customDislike"
            placeholder="添加其他忌口（多个用逗号分隔）"
            placeholder-class="ph"
          />
        </view>
      </view>

      <!-- 疾病限制 -->
      <view class="section-card">
        <view class="section-head">
          <text class="section-icon">🏥</text>
          <text class="section-title">疾病/饮食限制</text>
          <text class="section-tip">（推荐低糖低脂低嘌呤菜谱）</text>
        </view>
        <view class="tag-list">
          <view
            v-for="d in allDiseases"
            :key="d.name"
            class="tag disease-tag"
            :class="{ active: selectedDisease.includes(d.name) }"
            @click="toggleTag(d.name, 'disease')"
          >
            <text class="tag-icon">{{ d.icon }}</text>
            {{ d.name }}
          </view>
        </view>
      </view>

      <!-- 口味偏好 -->
      <view class="section-card">
        <view class="section-head">
          <text class="section-icon">👅</text>
          <text class="section-title">口味偏好</text>
        </view>
        <view class="single-list">
          <view
            v-for="f in flavorOptions"
            :key="f"
            class="single-tag"
            :class="{ active: selectedFlavor === f }"
            @click="selectedFlavor = f"
          >{{ f }}</view>
        </view>
      </view>

      <!-- 菜系偏好 -->
      <view class="section-card">
        <view class="section-head">
          <text class="section-icon">🌏</text>
          <text class="section-title">菜系偏好</text>
        </view>
        <view class="tag-list">
          <view
            v-for="c in cuisineOptions"
            :key="c"
            class="tag"
            :class="{ active: selectedCuisine.includes(c) }"
            @click="toggleTag(c, 'cuisine')"
          >{{ c }}</view>
        </view>
      </view>

      <!-- 烹饪水平 -->
      <view class="section-card">
        <view class="section-head">
          <text class="section-icon">🔥</text>
          <text class="section-title">烹饪水平</text>
        </view>
        <view class="single-list">
          <view
            v-for="s in skillOptions"
            :key="s"
            class="single-tag"
            :class="{ active: selectedSkill === s }"
            @click="selectedSkill = s"
          >
            <text>{{ s }}</text>
            <text class="skill-desc">{{ skillDesc[s] || '' }}</text>
          </view>
        </view>
      </view>

      <!-- 保存按钮 -->
      <view class="save-btn" @click="saveProfile">
        <text v-if="!saving">保存设置</text>
        <text v-else>保存中...</text>
      </view>

      <view style="height: 60rpx" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
import { getLocalUser } from '@/utils/auth'
import { getDietProfile, saveDietProfile } from '@/apis/dietApi'

const { capsuleBottomToTop } = useSystemInfo()

const user = getLocalUser()
const userId = (user?.id as any) || 1

// 数据
const selectedDislike = ref<string[]>([])
const customDislike = ref('')
const selectedDisease = ref<string[]>([])
const selectedFlavor = ref('')
const selectedCuisine = ref<string[]>([])
const selectedSkill = ref('')
const saving = ref(false)

const allIngredients = [
  '香菜', '韭菜', '苦瓜', '香菇', '茄子', '肥肉', '内脏',
  '辣椒', '大蒜', '洋葱', '虾', '蟹', '芒果', '菠萝'
]

const allDiseases = [
  { name: '糖尿病', icon: '🩺' },
  { name: '痛风', icon: '🦴' },
  { name: '高血压', icon: '💗' },
  { name: '高血脂', icon: '🩸' },
  { name: '胃病', icon: '🤢' },
  { name: '肾病', icon: '🫘' }
]

const flavorOptions = ['清淡', '微甜', '微辣', '酸', '重口']
const cuisineOptions = ['中式', '日式', '西式', '韩式']
const skillOptions = ['新手', '家常', '熟练', '大厨']
const skillDesc: Record<string, string> = {
  '新手': '步骤要详细', '家常': '简单易上手', '熟练': '技巧丰富', '大厨': '追求极致'
}

// 加载已有偏好
onMounted(async () => {
  uni.showLoading({ title: '加载中...', mask: true })
  try {
    const profile = await getDietProfile(userId)
    if (profile.dislikeIngredients) {
      selectedDislike.value = profile.dislikeIngredients.split(',').filter(Boolean)
    }
    if (profile.diseaseRestrictions) {
      selectedDisease.value = profile.diseaseRestrictions.split(',').filter(Boolean)
    }
    selectedFlavor.value = profile.flavorPreference || ''
    if (profile.cuisinePreference) {
      selectedCuisine.value = profile.cuisinePreference.split(',').filter(Boolean)
    }
    selectedSkill.value = profile.cookingSkill || ''
  } catch (e) {
    console.error('加载偏好失败', e)
  } finally {
    uni.hideLoading()
  }
})

function toggleTag(val: string, type: 'dislike' | 'disease' | 'cuisine') {
  if (type === 'dislike') {
    const idx = selectedDislike.value.indexOf(val)
    if (idx >= 0) selectedDislike.value.splice(idx, 1)
    else selectedDislike.value.push(val)
  } else if (type === 'disease') {
    const idx = selectedDisease.value.indexOf(val)
    if (idx >= 0) selectedDisease.value.splice(idx, 1)
    else selectedDisease.value.push(val)
  } else {
    const idx = selectedCuisine.value.indexOf(val)
    if (idx >= 0) selectedCuisine.value.splice(idx, 1)
    else selectedCuisine.value.push(val)
  }
}

async function saveProfile() {
  if (saving.value) return
  saving.value = true
  uni.showLoading({ title: '保存中...', mask: true })
  try {
    const allDislike = [
      ...selectedDislike.value,
      ...customDislike.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    ].join(',')
    await saveDietProfile(userId, {
      userId,
      dislikeIngredients: allDislike,
      diseaseRestrictions: selectedDisease.value.join(','),
      flavorPreference: selectedFlavor.value,
      cuisinePreference: selectedCuisine.value.join(','),
      cookingSkill: selectedSkill.value
    } as any)
    uni.showToast({ title: '保存成功 ✓', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1200)
  } catch (e: any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
    uni.hideLoading()
  }
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page { min-height: 100vh; background: #FFFAF6; }
.header-bg {
  position: fixed; top: 0; left: 0; right: 0;
  height: 500rpx;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  border-radius: 0 0 60rpx 60rpx;
  z-index: 0;
}
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 30rpx 20rpx;
  z-index: 10;
}
.back-btn {
  width: 64rpx; height: 64rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.nav-title { font-size: 34rpx; font-weight: bold; color: #fff; }

.content { padding: 0 24rpx; position: relative; z-index: 1; }

.intro-card {
  display: flex; align-items: center; gap: 24rpx;
  background: #fff; border-radius: 24rpx;
  padding: 30rpx; margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(255,107,53,0.1);
}
.intro-icon { font-size: 60rpx; }
.intro-text { display: flex; flex-direction: column; gap: 6rpx; }
.intro-title { font-size: 30rpx; font-weight: bold; color: #333; }
.intro-desc { font-size: 24rpx; color: #999; line-height: 1.5; }

.section-card {
  background: #fff; border-radius: 24rpx;
  padding: 30rpx; margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}
.section-head {
  display: flex; align-items: center; gap: 10rpx;
  margin-bottom: 24rpx; flex-wrap: wrap;
}
.section-icon { font-size: 28rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; }
.section-tip { font-size: 22rpx; color: #999; }

.tag-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tag {
  padding: 12rpx 24rpx; border-radius: 100rpx;
  background: #F5F5F5; color: #666;
  font-size: 26rpx; border: 2rpx solid transparent;
  transition: all 0.2s;
}
.tag.active {
  background: rgba(255,107,53,0.1);
  color: #FF6B35; border-color: #FF6B35;
}
.disease-tag { display: flex; align-items: center; gap: 6rpx; }
.tag-icon { font-size: 24rpx; }

.custom-input-row { margin-top: 20rpx; }
.custom-input {
  width: 100%; box-sizing: border-box;
  padding: 20rpx 24rpx; border-radius: 16rpx;
  background: #F8F8F8; font-size: 28rpx; color: #333;
}
.ph { color: #BBB; }

.single-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.single-tag {
  padding: 16rpx 32rpx; border-radius: 100rpx;
  background: #F5F5F5; color: #666;
  font-size: 28rpx; border: 2rpx solid transparent;
  display: flex; flex-direction: column; align-items: center; gap: 4rpx;
  transition: all 0.2s;
}
.single-tag.active {
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff; border-color: transparent;
}
.skill-desc { font-size: 20rpx; opacity: 0.8; }

.save-btn {
  width: 100%; padding: 28rpx 0;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff; font-size: 32rpx; font-weight: bold;
  text-align: center; border-radius: 100rpx;
  margin-top: 10rpx;
  box-shadow: 0 8rpx 24rpx rgba(255,107,53,0.35);
}
</style>
