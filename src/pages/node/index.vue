<route lang="json">
{
  "style": { "navigationBarTitleText": "食记" },
  "name": "node"
}
</route>
<template>
  <view class="page">
    <view v-if="isEdit" class="edit-tip">
      <wd-icon name="edit" size="14" color="#e67e22" />
      当前为 <text class="highlight">编辑模式</text>，修改内容后点击提交保存
    </view>

    <view class="card">
      <wd-form ref="form" :model="model">
        <wd-cell-group border>
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

          <view class="image-upload-section">
            <view class="upload-label">
              <wd-icon name="image" size="16" color="#666" />
              菜品图片
            </view>
            <view class="image-container">
              <view
                v-for="(image, index) in model.images"
                :key="index"
                class="image-item"
              >
                <image :src="image" class="uploaded-image" mode="aspectFill" />
                <view class="delete-btn" @click="removeImage(index)">
                  <wd-icon name="close" size="10" color="#fff" />
                </view>
              </view>
              <view
                v-if="model.images.length < 9"
                class="upload-btn"
                @click="chooseImage"
              >
                <view class="upload-icon">
                  <wd-icon name="add" size="20" color="#ccc" />
                </view>
                <text class="upload-text">添加图片</text>
              </view>
            </view>
            <text class="upload-tip">最多可上传9张图片</text>
          </view>

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

const model = reactive<{
  name: string;
  remark: string;
  images: string[];
}>({
  name: '',
  remark: '',
  images: [],
});

const editItem = ref<any>(null);
const isEdit = ref<any>(null);

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

// 选择图片
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

// 删除图片
function removeImage(index: number) {
  model.images.splice(index, 1);
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
          // 编辑模式：找到并替换原记录
          const index = records.findIndex(
            (item) => item.createTime === editItem.value.createTime,
          );
          if (index !== -1) {
            records[index] = record;
          }
          uni.showToast({ title: '更新成功', icon: 'success' });
        } else {
          // 新增模式
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
  box-sizing: border-box;
  min-height: 100vh;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.edit-tip {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
  color: #e67e22;
  background: rgba(253, 246, 236, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(230, 126, 34, 0.1);
}

.highlight {
  font-weight: 600;
  color: #e67e22;
}

.card {
  padding: 24px 20px;
  margin-bottom: 100px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

.image-upload-section {
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.upload-label {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
  font-size: 26px;
  font-weight: 500;
  color: #333;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item {
  position: relative;
  width: 120px;
  height: 120px;
  overflow: hidden;
  border: 2px solid #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 14px;
}

.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 50%;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  cursor: pointer;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px dashed #dee2e6;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-btn:active {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  border-color: #adb5bd;
  transform: scale(0.98);
}

.upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.upload-text {
  font-size: 20px;
  font-weight: 500;
  color: #6c757d;
}

.upload-tip {
  display: block;
  margin-top: 12px;
  font-size: 20px;
  font-weight: 400;
  color: #868e96;
}

.footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  padding: 16px 20px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.08);
}

.submit-btn {
  font-size: 30px;
  font-weight: 600;
  background: linear-gradient(135deg, #ffb56e 0%, #ff9a3c 100%);
  border: none;
  border-radius: 50px;
  box-shadow: 0 8px 24px rgba(255, 181, 110, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:active {
  box-shadow: 0 4px 16px rgba(255, 181, 110, 0.4);
  transform: translateY(2px);
}
</style>
