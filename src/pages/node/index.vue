<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "node"
}
</route>

<template>
  <view class="node-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">{{ isEdit ? '编辑食记' : '发布食记' }}</text>
        <view class="nav-right" />
      </view>
    </view>

    <!-- 编辑提示 -->
    <view v-if="isEdit" class="edit-tip">
      <wd-icon name="edit" size="14px" color="#FF6B35" />
      <text>当前为编辑模式，修改后点击保存</text>
    </view>

    <!-- 表单 -->
    <view class="form-section">
      <!-- 菜名 -->
      <view class="form-item">
        <text class="form-label">菜名 *</text>
        <input
          type="text"
          v-model="model.name"
          placeholder="请输入菜名"
          class="form-input"
        />
      </view>

      <!-- 图片上传 -->
      <view class="form-item">
        <text class="form-label">菜品图片</text>
        <view class="image-grid">
          <view v-for="(image, index) in model.images" :key="index" class="image-item">
            <image :src="image" class="uploaded-image" mode="aspectFill" @click="previewImage(index)" />
            <view class="delete-btn" @click="removeImage(index)">
              <wd-icon name="close" size="12px" color="#fff" />
            </view>
          </view>
          <view v-if="model.images.length < 9" class="upload-btn" @click="chooseImage">
            <wd-icon name="add" size="24px" color="#CCC" />
            <text class="upload-text">添加图片</text>
          </view>
        </view>
        <text class="upload-tip">最多可上传9张图片</text>
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea
          v-model="model.remark"
          placeholder="分享你的烹饪心得、小贴士或美食故事..."
          class="form-textarea"
          :maxlength="500"
        />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="footer">
      <button class="submit-btn" @click="handleSubmit">
        {{ isEdit ? '更新分享' : '发布分享' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import eventBus from '@/utils/eventBus'

const model = reactive({
  name: '',
  remark: '',
  images: [] as string[]
})

const editItem = ref<any>(null)
const isEdit = ref(false)

onLoad((query: any) => {
  if (query.item) {
    editItem.value = JSON.parse(query.item)
    Object.assign(model, editItem.value)
    isEdit.value = true
  }
})

function chooseImage() {
  uni.chooseImage({
    count: 9 - model.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      model.images.push(...res.tempFilePaths)
    }
  })
}

function removeImage(index: number) {
  model.images.splice(index, 1)
}

function previewImage(index: number) {
  uni.previewImage({
    current: model.images[index],
    urls: model.images
  })
}

function handleSubmit() {
  if (!model.name.trim()) {
    uni.showToast({ title: '请输入菜名', icon: 'none' })
    return
  }

  const record = {
    ...model,
    score: 5,
    createTime: new Date().toLocaleString('zh-CN')
  }

  const records = uni.getStorageSync('food_records') || []

  if (isEdit.value) {
    const index = records.findIndex((item: any) => item.createTime === editItem.value.createTime)
    if (index !== -1) {
      records[index] = record
    }
    uni.showToast({ title: '更新成功', icon: 'success' })
  } else {
    records.unshift(record)
    uni.showToast({ title: '发布成功', icon: 'success' })
  }

  uni.setStorageSync('food_records', records)

  nextTick(() => {
    model.name = ''
    model.remark = ''
    model.images = []
    uni.navigateBack()
    eventBus.emit('refreshNodeList')
  })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.node-page {
  min-height: 100vh;
  background: #F8F9FA;
  padding-bottom: 140rpx;
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
  height: 200rpx;
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

.edit-tip {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 30rpx;
  background: #FFF0E8;
  margin: 20rpx 30rpx;
  margin-top: 220rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #FF6B35;
}

.form-section {
  padding: 0 30rpx;
  padding-top: 20rpx;
}

.form-item {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.form-input {
  width: 100%;
  font-size: 28rpx;
  padding: 20rpx;
  background: #F5F5F5;
  border-radius: 16rpx;
}

.form-textarea {
  width: 100%;
  min-height: 200rpx;
  font-size: 28rpx;
  padding: 20rpx;
  background: #F5F5F5;
  border-radius: 16rpx;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16rpx;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  width: 100%;
  aspect-ratio: 1;
  background: #F5F5F5;
  border: 2rpx dashed #CCC;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.upload-tip {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #999;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 30rpx;
  background: #fff;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #FF9E4D, #FF6B35);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  padding: 28rpx;
  border-radius: 50rpx;
  border: none;
}
</style>
