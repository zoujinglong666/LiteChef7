<template>
  <div class="wedding-invitation-demo">
    <h1 class="demo-title">婚礼请柬模板展示</h1>
    
    <div class="style-selector">
      <button 
        v-for="style in styles" 
        :key="style.id"
        :class="['style-btn', { active: currentStyle === style.id }]"
        @click="currentStyle = style.id"
      >
        {{ style.name }}
      </button>
    </div>
    
    <div class="preview-container">
      <!-- 现代简约风格 -->
      <ModernSimple 
        v-if="currentStyle === 'modern'"
        :bride-name="brideInfo.name"
        :groom-name="groomInfo.name"
        :wedding-date="weddingInfo.date"
        :wedding-time="weddingInfo.time"
        :wedding-location="weddingInfo.location"
        :bride-photo="brideInfo.photo"
        :groom-photo="groomInfo.photo"
        :love-story="weddingInfo.story"
      />
      
      <!-- 浪漫花卉风格 -->
      <RomanticFloral 
        v-if="currentStyle === 'floral'"
        :bride-name="brideInfo.name"
        :groom-name="groomInfo.name"
        :wedding-date="weddingInfo.date"
        :wedding-time="weddingInfo.time"
        :wedding-location="weddingInfo.location"
        :bride-photo="brideInfo.photo"
        :groom-photo="groomInfo.photo"
        :love-story="weddingInfo.story"
        :love-quote="weddingInfo.quote"
      />
      
      <!-- 复古典雅风格 -->
      <VintageElegant 
        v-if="currentStyle === 'vintage'"
        :bride-name="brideInfo.name"
        :groom-name="groomInfo.name"
        :wedding-date="weddingInfo.date"
        :wedding-time="weddingInfo.time"
        :wedding-location="weddingInfo.location"
        :bride-photo="brideInfo.photo"
        :groom-photo="groomInfo.photo"
        :love-story="weddingInfo.story"
      />
    </div>
    
    <div class="customize-panel">
      <h2>自定义请柬信息</h2>
      
      <div class="form-section">
        <h3>新娘信息</h3>
        <div class="form-group">
          <label>姓名</label>
          <input type="text" v-model="brideInfo.name">
        </div>
        <div class="form-group">
          <label>照片链接</label>
          <ImageLinkInput v-model="brideInfo.photo" mode="single" />
        </div>
      </div>
      
      <div class="form-section">
        <h3>新郎信息</h3>
        <div class="form-group">
          <label>姓名</label>
          <input type="text" v-model="groomInfo.name">
        </div>
        <div class="form-group">
          <label>照片链接</label>
          <ImageLinkInput v-model="groomInfo.photo" mode="single" />
        </div>
      </div>
      
      <div class="form-section">
        <h3>婚礼信息</h3>
        <div class="form-group">
          <label>日期</label>
          <input type="text" v-model="weddingInfo.date">
        </div>
        <div class="form-group">
          <label>时间</label>
          <input type="text" v-model="weddingInfo.time">
        </div>
        <div class="form-group">
          <label>地点</label>
          <input type="text" v-model="weddingInfo.location">
        </div>
        <div class="form-group">
          <label>爱情故事</label>
          <textarea v-model="weddingInfo.story" rows="4"></textarea>
        </div>
        <div class="form-group" v-if="currentStyle === 'floral'">
          <label>爱情语录</label>
          <input type="text" v-model="weddingInfo.quote">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ModernSimple from './ModernSimple.vue';
import RomanticFloral from './RomanticFloral.vue';
import VintageElegant from './VintageElegant.vue';
import ImageLinkInput from '../ImageLinkInput.vue';

// 当前选择的风格
const currentStyle = ref('modern');

// 风格列表
const styles = [
  { id: 'modern', name: '现代简约风' },
  { id: 'floral', name: '浪漫花卉风' },
  { id: 'vintage', name: '复古典雅风' }
];

// 新娘信息
const brideInfo = ref({
  name: '李梅',
  photo: 'https://img.freepik.com/free-photo/portrait-young-asian-woman_23-2149082279.jpg'
});

// 新郎信息
const groomInfo = ref({
  name: '张伟',
  photo: 'https://img.freepik.com/free-photo/portrait-handsome-young-man_23-2149082548.jpg'
});

// 婚礼信息
const weddingInfo = ref({
  date: '2024年6月1日',
  time: '下午三点',
  location: '北京市朝阳区星光大道888号星光酒店',
  story: '我们相识于2018年的春天，在一次偶然的相遇中，我们彼此吸引，开始了美好的恋爱旅程。经过五年的相知相守，我们决定携手走进婚姻的殿堂，共同开启人生的新篇章。',
  quote: '爱情是灵魂的相遇，是心与心的交融'
});
</script>

<style scoped>
.wedding-invitation-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'SimSun', 'STSong', serif;
}

.demo-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 32px;
}

.style-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 15px;
}

.style-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  border-radius: 4px;
}

.style-btn:hover {
  background-color: #f0f0f0;
}

.style-btn.active {
  background-color: #4a6baf;
  color: white;
  border-color: #4a6baf;
}

.preview-container {
  margin-bottom: 40px;
  border: 1px dashed #ddd;
  padding: 20px;
  background-color: #fafafa;
}

.customize-panel {
  background-color: #f5f5f5;
  padding: 30px;
  border-radius: 8px;
}

.customize-panel h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.form-section {
  margin-bottom: 30px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.form-section h3 {
  margin-bottom: 15px;
  color: #4a6baf;
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 16px;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .style-selector {
    flex-wrap: wrap;
  }
  
  .style-btn {
    flex: 1 0 calc(33.333% - 10px);
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .style-btn {
    flex: 1 0 100%;
  }
}
</style>