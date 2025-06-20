<template>
  <div class="wedding-invitation vintage-elegant">
    <!-- 顶部装饰 -->
    <div class="decoration top">
      <div class="ornament left"></div>
      <div class="ornament right"></div>
    </div>
    
    <!-- 标题区域 -->
    <div class="header">
      <div class="monogram">{{ brideName[0] }} & {{ groomName[0] }}</div>
      <h1>喜结良缘</h1>
      <h2>{{ brideName }} <span class="and">&</span> {{ groomName }}</h2>
      <p class="date">{{ weddingDate }}</p>
    </div>
    
    <!-- 邀请语 -->
    <div class="invitation-text">
      <p>诚挚地邀请您参加我们的婚礼</p>
      <p>您的祝福是我们最珍贵的礼物</p>
    </div>
    
    <!-- 新人介绍 -->
    <div class="couple-info">
      <div class="photo-container">
        <div class="photo-frame bride">
          <div class="photo" :style="{ backgroundImage: `url(${bridePhoto})` }"></div>
          <div class="frame-border"></div>
        </div>
        
        <div class="photo-frame groom">
          <div class="photo" :style="{ backgroundImage: `url(${groomPhoto})` }"></div>
          <div class="frame-border"></div>
        </div>
      </div>
    </div>
    
    <!-- 婚礼详情 -->
    <div class="wedding-details">
      <div class="detail-item">
        <h3>日期</h3>
        <div class="detail-content">{{ weddingDate }}</div>
      </div>
      
      <div class="detail-item">
        <h3>时间</h3>
        <div class="detail-content">{{ weddingTime }}</div>
      </div>
      
      <div class="detail-item">
        <h3>地点</h3>
        <div class="detail-content">{{ weddingLocation }}</div>
      </div>
    </div>
    
    <!-- 婚礼故事 -->
    <div class="story-section">
      <h3>我们的故事</h3>
      <div class="divider"></div>
      <p>{{ loveStory }}</p>
    </div>
    
    <!-- RSVP区域 -->
    <div class="rsvp-section">
      <h3>恭候您的回复</h3>
      <div class="divider"></div>
      <div class="rsvp-form">
        <div class="form-group">
          <label for="name">姓名</label>
          <input type="text" id="name" v-model="guestName" placeholder="请输入您的姓名">
        </div>
        <div class="form-group">
          <label for="phone">联系电话</label>
          <input type="tel" id="phone" v-model="guestPhone" placeholder="请输入您的联系电话">
        </div>
        <div class="form-group">
          <label>是否参加</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="attendance" value="yes">
              <span>参加</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="attendance" value="no">
              <span>遗憾不能参加</span>
            </label>
          </div>
        </div>
        <div class="form-group" v-if="attendance === 'yes'">
          <label for="attendees">参加人数</label>
          <input type="number" id="attendees" v-model="attendeeCount" min="1" max="10">
        </div>
        <div class="form-group">
          <label for="wishes">祝福语</label>
          <textarea id="wishes" v-model="wishes" placeholder="请写下您的祝福"></textarea>
        </div>
        <button class="submit-btn" @click="submitRSVP">提交回复</button>
      </div>
    </div>
    
    <!-- 底部装饰 -->
    <div class="decoration bottom">
      <div class="ornament left"></div>
      <div class="ornament right"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定义props
const props = defineProps({
  brideName: {
    type: String,
    default: '陈雅'
  },
  groomName: {
    type: String,
    default: '王军'
  },
  weddingDate: {
    type: String,
    default: '2024年8月8日'
  },
  weddingTime: {
    type: String,
    default: '下午一点'
  },
  weddingLocation: {
    type: String,
    default: '杭州市西湖区龙井路99号西湖国宾馆'
  },
  bridePhoto: {
    type: String,
    default: ''
  },
  groomPhoto: {
    type: String,
    default: ''
  },
  loveStory: {
    type: String,
    default: '我们的相遇如同命中注定，在那个秋高气爽的九月，我们在西湖边偶然相识。三年的相知相守，让我们更加确信彼此就是生命中最重要的那个人。今天，我们决定携手步入婚姻的殿堂，共同开启人生的新篇章。'
  }
});

// 表单数据
const guestName = ref('');
const guestPhone = ref('');
const attendance = ref('yes');
const attendeeCount = ref(1);
const wishes = ref('');

// 提交RSVP
const submitRSVP = () => {
  // 这里可以添加表单验证和提交逻辑
  console.log({
    name: guestName.value,
    phone: guestPhone.value,
    attendance: attendance.value,
    attendeeCount: attendance.value === 'yes' ? attendeeCount.value : 0,
    wishes: wishes.value
  });
  
  // 提交成功后清空表单
  guestName.value = '';
  guestPhone.value = '';
  attendance.value = 'yes';
  attendeeCount.value = 1;
  wishes.value = '';
  
  // 这里可以添加提交成功的提示
  alert('感谢您的回复！');
};
</script>

<style scoped>
.wedding-invitation {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f9f7f1;
  color: #5a4a42;
  font-family: 'SimSun', 'STSong', serif;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  border: 8px double #d4c1a1;
}

.vintage-elegant {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f9f7f1"/><path d="M0,0 L100,100 M100,0 L0,100" stroke="%23d4c1a1" stroke-width="0.5" stroke-opacity="0.1"/></svg>');
}

.decoration {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  height: 40px;
  position: relative;
}

.decoration:before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 1px;
  background-color: #d4c1a1;
}

.ornament {
  width: 40px;
  height: 40px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M20,0 L40,20 L20,40 L0,20 Z" fill="none" stroke="%23d4c1a1" stroke-width="1"/><circle cx="20" cy="20" r="5" fill="none" stroke="%23d4c1a1" stroke-width="1"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  z-index: 1;
}

.decoration.top {
  margin-top: 0;
}

.decoration.bottom {
  margin-bottom: 0;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.monogram {
  font-size: 36px;
  color: #a18a68;
  font-family: 'Times New Roman', serif;
  margin-bottom: 20px;
  border: 2px solid #d4c1a1;
  width: 80px;
  height: 80px;
  line-height: 80px;
  border-radius: 50%;
  margin: 0 auto 20px;
}

.header h1 {
  font-size: 36px;
  color: #a18a68;
  margin-bottom: 15px;
  font-weight: normal;
  letter-spacing: 4px;
}

.header h2 {
  font-size: 28px;
  margin-bottom: 15px;
  font-weight: normal;
  color: #5a4a42;
}

.header .and {
  font-family: 'Times New Roman', serif;
  font-style: italic;
  color: #a18a68;
  font-size: 24px;
  padding: 0 10px;
}

.header .date {
  font-size: 18px;
  color: #7d6e63;
}

.invitation-text {
  text-align: center;
  margin-bottom: 40px;
  font-size: 18px;
  line-height: 1.8;
  color: #7d6e63;
}

.couple-info {
  margin-bottom: 40px;
}

.photo-container {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.photo-frame {
  position: relative;
  width: 180px;
  height: 180px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.photo {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.frame-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid #d4c1a1;
  pointer-events: none;
}

.wedding-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 30px;
  border: 1px solid #d4c1a1;
}

.detail-item {
  text-align: center;
  margin-bottom: 20px;
  width: 100%;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item h3 {
  font-size: 20px;
  color: #a18a68;
  margin-bottom: 10px;
  font-weight: normal;
}

.detail-content {
  font-size: 18px;
  color: #5a4a42;
}

.story-section,
.rsvp-section {
  margin-bottom: 40px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid #d4c1a1;
}

.story-section h3,
.rsvp-section h3 {
  text-align: center;
  font-size: 24px;
  color: #a18a68;
  margin-bottom: 15px;
  font-weight: normal;
}

.divider {
  height: 1px;
  background-color: #d4c1a1;
  width: 100px;
  margin: 0 auto 20px;
}

.story-section p {
  text-align: center;
  font-size: 16px;
  line-height: 1.8;
  color: #5a4a42;
}

.rsvp-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: #5a4a42;
}

input[type="text"],
input[type="tel"],
input[type="number"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d4c1a1;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 0;
  font-size: 16px;
  color: #5a4a42;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #a18a68;
}

textarea {
  height: 100px;
  resize: vertical;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input {
  margin-right: 8px;
}

.submit-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #a18a68;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #8a7355;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .photo-container {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .header h1 {
    font-size: 30px;
  }
  
  .header h2 {
    font-size: 24px;
  }
  
  .monogram {
    width: 70px;
    height: 70px;
    line-height: 70px;
    font-size: 30px;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 26px;
  }
  
  .header h2 {
    font-size: 20px;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .monogram {
    width: 60px;
    height: 60px;
    line-height: 60px;
    font-size: 24px;
  }
  
  .photo-frame {
    width: 150px;
    height: 150px;
  }
}
</style>