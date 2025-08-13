<route lang="json">
{
"style": { "navigationBarTitleText": "食记" },
"name": "node"
}
</route>

<template>
  <view class="page">
    <!-- 编辑模式提示 -->
    <view v-if="isEdit" class="edit-tip">
      <wd-icon name="edit" size="14" color="#8d6e63" />
      当前为 <text class="highlight">编辑模式</text>，修改内容后点击提交保存
    </view>

    <!-- 卡片内容 -->
    <view class="card">
      <wd-form ref="form" :model="model">
        <wd-cell-group border>
          <!-- 菜名 -->
          <wd-textarea
            label="菜名"
            label-width="80px"
            prop="name"
            v-model="model.name"
            placeholder="请输入菜名"
            clearable
            auto-height
            :rules="[{ required: true, message: '请输入菜名' }]"
          />

          <!-- 图片上传 -->
          <view class="image-upload-section">
            <view class="upload-label">
              <wd-icon name="image" size="16" color="#8d6e63" />
              菜品图片
            </view>
            <view class="image-container">
              <view
                v-for="(image, index) in model.images"
                :key="index"
                class="image-item"
              >
                <image :src="image" class="uploaded-image" mode="aspectFill" @click="previewImage(index)" />
                <view class="delete-btn" @click="removeImage(index)">
                  <wd-icon name="close" size="10" color="#fff" />
                </view>
              </view>

              <!-- 添加图片按钮 -->
              <view
                v-if="model.images.length < 9"
                class="upload-btn"
                @click="chooseImage"
              >
                <wd-icon name="add" size="20" />
                <text>添加图片</text>
              </view>
            </view>
            <text class="upload-tip">最多可上传9张图片</text>
          </view>

          <!-- 备注 -->
          <wd-textarea
            label="备注"
            label-width="80px"
            prop="remark"
            v-model="model.remark"
            placeholder="分享你的烹饪心得、小贴士或美食故事..."
            clearable
            show-word-limit
            :maxlength="500"
            auto-height
          />
        </wd-cell-group>
      </wd-form>
    </view>

    <!-- 底部按钮 -->
    <view class="footer">
      <wd-button
        type="primary"
        size="large"
        @click="handleSubmit"
        block
        class="submit-btn"
      >
        {{ isEdit ? '更新分享' : '发布分享' }}
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import eventBus from '@/utils/eventBus';
import { formatToDateTime } from '@/utils/dateUtils';

const model = reactive({
  name: '',
  remark: '',
  images: [] as string[],
});

const editItem = ref<any>(null);
const isEdit = ref(false);

onLoad((query) => {
  if (query.item) {
    editItem.value = JSON.parse(query.item);
    Object.assign(model, editItem.value || {});
    isEdit.value = true;
  } else {
    editItem.value = {};
    isEdit.value = false;
  }
});

const form = ref();

function chooseImage() {
  uni.chooseImage({
    count: 9 - model.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      model.images.push(...res.tempFilePaths);
    },
  });
}

function removeImage(index: number) {
  model.images.splice(index, 1);
}

function previewImage(index: number) {
  uni.previewImage({
    current: model.images[index],
    urls: model.images,
  });
}

function handleSubmit() {
  form.value
    .validate()
    .then(({ valid }) => {
      if (valid) {
        const record = {
          ...model,
          createTime: formatToDateTime(new Date()),
        };

        const records = uni.getStorageSync('food_records') || [];

        if (isEdit.value) {
          const index = records.findIndex(
            (item) => item.createTime === editItem.value.createTime,
          );
          if (index !== -1) {
            records[index] = record;
          }
          uni.showToast({ title: '更新成功', icon: 'success' });
        } else {
          records.unshift(record);
          uni.showToast({ title: '发布成功', icon: 'success' });
        }

        uni.setStorageSync('food_records', records);

        nextTick(() => {
          model.name = '';
          model.remark = '';
          model.images = [];
          uni.navigateBack();
          eventBus.emit('refreshNodeList');
        });
      }
    })
    .catch((error) => {
      console.log(error, 'validate error');
    });
}
</script>

<style scoped>
.page {
  padding: 16px;
}

.edit-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  padding: 8px 14px;
  font-size: 14px;
  color: #8d6e63;
  background: rgba(241, 224, 205, 0.7);
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(141, 110, 99, 0.1);
}

.highlight {
  font-weight: 600;
}

.card {
}

.upload-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: #5d4037;
  margin-bottom: 10px;
}

.image-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 8px;
}

.image-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.uploaded-image {
  width: 100%;
  height: 72px;
  object-fit: cover;
  display: block;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0,0,0,0.55);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 72px;
  width: 72px;
  background: rgba(200, 192, 181, 0.12);
  border: 1px dashed #b8a79b;
  border-radius: 10px;
  color: #9e8f87;
  font-size: 12px;
  transition: background 0.2s ease;
}

.upload-btn:active {
  background: rgba(200, 192, 181, 0.25);
}

.upload-tip {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #868e96;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px 28px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.submit-btn {
  font-size: 16px;
  font-weight: 600;
  border-radius: 40px;
  background: linear-gradient(135deg, #d9a7c7 0%, #fffcdc 100%);
  color: #5d4037;
  box-shadow: 0 4px 14px rgba(217, 167, 199, 0.25);
  transition: transform 0.2s ease;
}

.submit-btn:active {
  transform: scale(0.97);
}


</style>
