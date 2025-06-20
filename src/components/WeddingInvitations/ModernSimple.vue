<template>
  <div class="wedding-invitation modern-simple">
    <!-- 顶部装饰 -->
    <div class="decoration top">
      <svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,10 Q25,20 50,10 T100,10" fill="none" stroke="#d4b08c" stroke-width="1"/>
      </svg>
    </div>
    
    <!-- 标题区域 -->
    <div class="header">
      <h1>我们结婚啦</h1>
      <h2>{{ brideName }} & {{ groomName }}</h2>
      <p class="date">{{ weddingDate }}</p>
    </div>
    
    <!-- 新人介绍 -->
    <div class="couple-info">
      <div class="photo-container">
        <div class="photo bride" :style="{ backgroundImage: `url(${bridePhoto})` }"></div>
        <div class="photo groom" :style="{ backgroundImage: `url(${groomPhoto})` }"></div>
      </div>
      <p class="love-story">{{ loveStory }}</p>
    </div>
    
    <!-- 婚礼详情 -->
    <div class="wedding-details">
      <div class="detail-item">
        <div class="icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19,4h-1V2h-2v2H8V2H6v2H5C3.89,4,3.01,4.9,3.01,6L3,20c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V6C21,4.9,20.1,4,19,4z M19,20 H5V9h14V20z M5,7V6h14v1H5z M7,11h5v5H7V11z" fill="#d4b08c"/>
          </svg>
        </div>
        <div class="text">
          <h3>日期</h3>
          <p>{{ weddingDate }}</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5 s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z" fill="#d4b08c"/>
          </svg>
        </div>
        <div class="text">
          <h3>地点</h3>
          <p>{{ weddingLocation }}</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.99,2C6.47,2,2,6.48,2,12s4.47,10,9.99,10C17.52,22,22,17.52,22,12S17.52,2,11.99,2z M12,20c-4.42,0-8-3.58-8-8 s3.58-8,8-8s8,3.58,8,8S16.42,20,12,20z M12.5,7H11v6l5.25,3.15l0.75-1.23l-4.5-2.67V7z" fill="#d4b08c"/>
          </svg>
        </div>
        <div class="text">
          <h3>时间</h3>
          <p>{{ weddingTime }}</p>
        </div>
      </div>
    </div>
    
    <!-- RSVP区域 -->
    <div class="rsvp">
      <h3>恭候您的回复</h3>
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
            <label>
              <input type="radio" v-model="attendance" value="yes">
              <span>参加</span>
            </label>
            <label>
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
      <svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,10 Q25,0 50,10 T100,10" fill="none" stroke="#d4b08c" stroke-width="1"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定义props
const props = defineProps({
  brideName: {
    type: String,
    default: '李梅'
  },
  groomName: {
    type: String,
    default: '张伟'
  },
  weddingDate: {
    type: String,
    default: '2024年6月1日'
  },
  weddingTime: {
    type: String,
    default: '下午三点'
  },
  weddingLocation: {
    type: String,
    default: '北京市朝阳区星光大道888号星光酒店'
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
    default: '我们相识于2018年的春天，在一次偶然的相遇中，我们彼此吸引，开始了美好的恋爱旅程。经过五年的相知相守，我们决定携手走进婚姻的殿堂，共同开启人生的新篇章。'
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
  background-color: #fff;
  color: #333;
  font-family: 'SimSun', 'STSong', serif;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.modern-simple {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.decoration {
  width: 100%;
  height: 30px;
  margin: 20px 0;
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
}

.header h1 {
  font-size: 36px;
  color: #d4b08c;
  margin-bottom: 10px;
  font-weight: normal;
}

.header h2 {
  font-size: 28px;
  margin-bottom: 15px;
  font-weight: normal;
}

.header .date {
  font-size: 18px;
  color: #888;
}

.couple-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.photo-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px;
}

.photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin: 0 20px;
  border: 3px solid #d4b08c;
}

.love-story {
  text-align: center;
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  max-width: 600px;
}

.wedding-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-bottom: 40px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin: 10px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  width: calc(33% - 20px);
  min-width: 200px;
  transition: transform 0.3s ease;
}

.detail-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 40px;
  height: 40px;
  margin-right: 15px;
}

.text h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #d4b08c;
  font-weight: normal;
}

.text p {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.rsvp {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 40px;
}

.rsvp h3 {
  text-align: center;
  font-size: 24px;
  color: #d4b08c;
  margin-bottom: 20px;
  font-weight: normal;
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
  color: #666;
}

input[type="text"],
input[type="tel"],
input[type="number"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #d4b08c;
}

textarea {
  height: 100px;
  resize: vertical;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-group input {
  margin-right: 8px;
}

.submit-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #d4b08c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #c09b7b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wedding-details {
    flex-direction: column;
    align-items: center;
  }
  
  .detail-item {
    width: 100%;
    margin: 10px 0;
  }
  
  .photo {
    width: 120px;
    height: 120px;
  }
  
  .header h1 {
    font-size: 30px;
  }
  
  .header h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .photo {
    width: 100px;
    height: 100px;
    margin: 0 10px;
  }
  
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
}
</style>