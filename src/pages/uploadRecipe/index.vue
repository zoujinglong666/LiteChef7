<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "uploadRecipe"
}
</route>

<template>
  <view class="upload-page">
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar" :style="{ paddingTop: capsuleBottomToTop + 'px' }">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">发布菜谱</text>
        <view class="nav-right" />
      </view>
    </view>

    <view class="form-section">
      <!-- 菜名 -->
      <view class="form-item">
        <text class="form-label">菜名 *</text>
        <input type="text" v-model="form.name" placeholder="例如：番茄炒蛋" class="form-input" />
      </view>

      <!-- 简介 -->
      <view class="form-item">
        <text class="form-label">简介</text>
        <textarea v-model="form.description" placeholder="介绍一下这道菜..." class="form-textarea" />
      </view>

      <!-- 菜式 -->
      <view class="form-item">
        <text class="form-label">菜式</text>
        <view class="option-list">
          <view
            v-for="c in cuisines"
            :key="c"
            class="option-item"
            :class="{ active: form.cuisine === c }"
            @click="form.cuisine = c"
          >{{ c }}</view>
        </view>
      </view>

      <!-- 难度 -->
      <view class="form-item">
        <text class="form-label">难度</text>
        <view class="option-list">
          <view
            v-for="d in difficulties"
            :key="d"
            class="option-item"
            :class="{ active: form.difficulty === d }"
            @click="form.difficulty = d"
          >{{ d }}</view>
        </view>
      </view>

      <!-- 烹饪时间 -->
      <view class="form-item">
        <text class="form-label">烹饪时间</text>
        <input type="text" v-model="form.cookTime" placeholder="例如：30分钟" class="form-input" />
      </view>

      <!-- 食材 -->
      <view class="form-item">
        <view class="form-header">
          <text class="form-label">食材 *</text>
          <view class="add-btn" @click="addIngredient">
            <wd-icon name="add" size="16px" color="#FF6B35" />
            <text class="add-text">添加</text>
          </view>
        </view>
        <view class="ingredient-list">
          <view v-for="(ing, i) in form.ingredients" :key="i" class="ingredient-item">
            <input type="text" v-model="ing.name" placeholder="食材名" class="ing-input" />
            <input type="text" v-model="ing.amount" placeholder="用量" class="ing-input short" />
            <view class="del-btn" @click="removeIngredient(i)">×</view>
          </view>
        </view>
      </view>

      <!-- 步骤 -->
      <view class="form-item">
        <view class="form-header">
          <text class="form-label">步骤 *</text>
          <view class="add-btn" @click="addStep">
            <wd-icon name="add" size="16px" color="#FF6B35" />
            <text class="add-text">添加</text>
          </view>
        </view>
        <view class="step-list">
          <view v-for="(step, i) in form.steps" :key="i" class="step-item">
            <view class="step-num">{{ i + 1 }}</view>
            <textarea v-model="step.content" placeholder="描述这一步..." class="step-input" />
            <view class="del-btn" @click="removeStep(i)">×</view>
          </view>
        </view>
      </view>

      <!-- 小贴士 -->
      <view class="form-item">
        <text class="form-label">小贴士</text>
        <textarea v-model="form.tips" placeholder="分享一些烹饪技巧..." class="form-textarea" />
      </view>
    </view>

    <view class="submit-section">
      <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? '发布中...' : '发布菜谱' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { request } from '@/apis/serverApi'
import { getLocalUser } from '@/utils/auth'
import { useSystemInfo } from '@/composables'

const { capsuleBottomToTop } = useSystemInfo()

const cuisines = ['中式', '日式', '西式', '韩式', '东南亚', '其他']
const difficulties = ['简单', '中等', '困难']

const form = ref({
  name: '',
  description: '',
  cuisine: '中式',
  difficulty: '简单',
  cookTime: '',
  ingredients: [{ name: '', amount: '' }],
  steps: [{ content: '' }],
  tips: ''
})

const submitting = ref(false)

function addIngredient() {
  form.value.ingredients.push({ name: '', amount: '' })
}

function removeIngredient(index: number) {
  if (form.value.ingredients.length > 1) {
    form.value.ingredients.splice(index, 1)
  }
}

function addStep() {
  form.value.steps.push({ content: '' })
}

function removeStep(index: number) {
  if (form.value.steps.length > 1) {
    form.value.steps.splice(index, 1)
  }
}

async function handleSubmit() {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入菜名', icon: 'none' })
    return
  }

  const validIngredients = form.value.ingredients.filter(i => i.name.trim())
  if (validIngredients.length === 0) {
    uni.showToast({ title: '请添加食材', icon: 'none' })
    return
  }

  const validSteps = form.value.steps.filter(s => s.content.trim())
  if (validSteps.length === 0) {
    uni.showToast({ title: '请添加步骤', icon: 'none' })
    return
  }

  const user = getLocalUser()
  if (!user?.openid) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  submitting.value = true

  try {
    // 使用 userId (优先) 或 openid
    const userIdParam = user.id || user.openid
    const res = await request<any>('/recipe/create?userId=' + userIdParam, {
      method: 'POST',
      data: {
        name: form.value.name,
        description: form.value.description,
        cuisine: form.value.cuisine,
        difficulty: form.value.difficulty,
        cookTime: form.value.cookTime,
        ingredients: validIngredients,
        steps: validSteps.map((s, i) => ({ order: i + 1, content: s.content })),
        tips: form.value.tips
      }
    })

    if (res?.code === 200) {
      uni.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res?.message || '发布失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '发布失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.upload-page { min-height: 100vh; background: #F8F9FA; }

.header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; overflow: hidden; }
.header-bg { position: absolute; top: 0; left: 0; right: 0; height: 200rpx; background: linear-gradient(135deg, #FF9E4D, #FF6B35); }
.nav-bar { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 0 40rpx 20rpx; }
.back-btn { width: 64rpx; height: 64rpx; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.nav-title { font-size: 34rpx; font-weight: bold; color: #fff; }
.nav-right { width: 64rpx; }

.form-section { padding: 30rpx; padding-top: 230rpx; }
.form-item { background: #fff; border-radius: 20rpx; padding: 30rpx; margin-bottom: 20rpx; }
.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.form-label { display: block; font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }
.form-input { width: 100%; font-size: 28rpx; padding: 20rpx; background: #F5F5F5; border-radius: 12rpx; }
.form-textarea { width: 100%; height: 160rpx; font-size: 28rpx; padding: 20rpx; background: #F5F5F5; border-radius: 12rpx; }

.option-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.option-item { padding: 16rpx 32rpx; background: #F5F5F5; border-radius: 30rpx; font-size: 26rpx; color: #666; }
.option-item.active { background: #FF6B35; color: #fff; }

.add-btn { display: flex; align-items: center; gap: 8rpx; }
.add-text { font-size: 26rpx; color: #FF6B35; }

.ingredient-list { display: flex; flex-direction: column; gap: 16rpx; }
.ingredient-item { display: flex; align-items: center; gap: 16rpx; }
.ing-input { flex: 1; font-size: 26rpx; padding: 16rpx; background: #F5F5F5; border-radius: 12rpx; }
.ing-input.short { flex: 0.5; }
.del-btn { width: 48rpx; height: 48rpx; background: #FFE4E4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32rpx; color: #FF6B35; }

.step-list { display: flex; flex-direction: column; gap: 16rpx; }
.step-item { display: flex; align-items: flex-start; gap: 16rpx; }
.step-num { width: 48rpx; height: 48rpx; background: #FF6B35; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24rpx; color: #fff; font-weight: bold; flex-shrink: 0; }
.step-input { flex: 1; min-height: 80rpx; font-size: 26rpx; padding: 16rpx; background: #F5F5F5; border-radius: 12rpx; }

.submit-section { padding: 30rpx; padding-bottom: 100rpx; }
.submit-btn { width: 100%; background: linear-gradient(135deg, #FF9E4D, #FF6B35); color: #fff; font-size: 32rpx; font-weight: bold; padding: 30rpx; border-radius: 40rpx; text-align: center; }
.submit-btn[disabled] { opacity: 0.6; }
</style>
