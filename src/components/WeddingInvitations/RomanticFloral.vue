<template>
  <div class="wedding-invitation romantic-floral">
    <!-- 顶部花卉装饰 -->
    <div class="floral-decoration top">
      <svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,15 C15,5 25,5 30,15 C35,5 45,5 50,15 C55,5 65,5 70,15 C75,5 85,5 90,15" fill="none" stroke="#d4a6a9" stroke-width="1.5" stroke-dasharray="1,1"/>
        <circle cx="30" cy="15" r="5" fill="#f8d7da">
          <animate attributeName="r" values="4;5;4" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="15" r="5" fill="#f8d7da">
          <animate attributeName="r" values="5;6;5" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="70" cy="15" r="5" fill="#f8d7da">
          <animate attributeName="r" values="4;5;4" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>

    <!-- 标题区域 -->
    <div class="header">
      <div class="title-box">
        <div class="title-decoration left"></div>
        <h1>婚礼邀请函</h1>
        <h2>{{ brideName }} <span class="and">&</span> {{ groomName }}</h2>
        <p class="date">{{ weddingDate }}</p>
        <div class="title-decoration right"></div>
      </div>
    </div>

    <!-- 新人介绍 -->
    <div class="couple-info">
      <div class="photo-frame bride">
        <div class="photo" :style="{ backgroundImage: `url(${bridePhoto})` }">
          <div class="photo-overlay"></div>
        </div>
        <div class="name">{{ brideName }}</div>
      </div>

      <div class="heart">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M16,28.261c0,0-14-7.926-14-17.046c0-9.356,13.159-10.399,14-0.454c1.011-9.938,14-8.903,14,0.454 C30,20.335,16,28.261,16,28.261z" fill="#f7c4c7">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>

      <div class="photo-frame groom">
        <div class="photo" :style="{ backgroundImage: `url(${groomPhoto})` }">
          <div class="photo-overlay"></div>
        </div>
        <div class="name">{{ groomName }}</div>
      </div>
    </div>

    <div class="love-quote">
      <div class="quote-mark left">❝</div>
      <p>{{ loveQuote }}</p>
      <div class="quote-mark right">❞</div>
    </div>

    <!-- 婚礼详情 -->
    <div class="wedding-details">
      <div class="detail-card">
        <div class="icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19,4h-1V2h-2v2H8V2H6v2H5C3.89,4,3.01,4.9,3.01,6L3,20c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V6C21,4.9,20.1,4,19,4z M19,20 H5V9h14V20z M5,7V6h14v1H5z M7,11h5v5H7V11z" fill="#f7c4c7"/>
          </svg>
        </div>
        <h3>日期</h3>
        <p>{{ weddingDate }}</p>
      </div>

      <div class="detail-card">
        <div class="icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.99,2C6.47,2,2,6.48,2,12s4.47,10,9.99,10C17.52,22,22,17.52,22,12S17.52,2,11.99,2z M12,20c-4.42,0-8-3.58-8-8 s3.58-8,8-8s8,3.58,8,8S16.42,20,12,20z M12.5,7H11v6l5.25,3.15l0.75-1.23l-4.5-2.67V7z" fill="#f7c4c7"/>
          </svg>
        </div>
        <h3>时间</h3>
        <p>{{ weddingTime }}</p>
      </div>

      <div class="detail-card">
        <div class="icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5 s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z" fill="#f7c4c7"/>
          </svg>
        </div>
        <h3>地点</h3>
        <p>{{ weddingLocation }}</p>
      </div>
    </div>

    <!-- 婚礼故事 -->
    <div class="story-section">
      <div class="section-title">
        <span class="line"></span>
        <h3>我们的故事</h3>
        <span class="line"></span>
      </div>
      <p>{{ loveStory }}</p>
    </div>

    <!-- RSVP区域 -->
    <div class="rsvp-section">
      <div class="section-title">
        <span class="line"></span>
        <h3>恭候您的回复</h3>
        <span class="line"></span>
      </div>
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

    <!-- 底部花卉装饰 -->
    <div class="floral-decoration bottom">
      <svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,15 C15,25 25,25 30,15 C35,25 45,25 50,15 C55,25 65,25 70,15 C75,25 85,25 90,15" fill="none" stroke="#f7c4c7" stroke-width="1.5" stroke-dasharray="1,1"/>
        <circle cx="30" cy="15" r="5" fill="#fce0e3">
          <animate attributeName="r" values="4;5;4" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="15" r="5" fill="#fce0e3">
          <animate attributeName="r" values="5;6;5" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="70" cy="15" r="5" fill="#fce0e3">
          <animate attributeName="r" values="4;5;4" dur="3s" repeatCount="indefinite" />
        </circle>
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
    default: '王芳'
  },
  groomName: {
    type: String,
    default: '李强'
  },
  weddingDate: {
    type: String,
    default: '2024年7月7日'
  },
  weddingTime: {
    type: String,
    default: '下午两点'
  },
  weddingLocation: {
    type: String,
    default: '上海市浦东新区花园大道123号玫瑰花园酒店'
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
    default: '我们在大学相识，经过七年的爱情长跑，终于决定携手步入婚姻的殿堂。感谢一路上有你的陪伴，让我们的生活充满了欢笑和幸福。'
  },
  loveQuote: {
    type: String,
    default: '爱情是灵魂的相遇，是心与心的交融'
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
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600&display=swap');

.wedding-invitation {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #fffbfa;
  color: #5a5a5a;
  font-family: 'Noto Serif SC', 'SimSun', serif;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  border: 1px solid #f0d4d6;
}

.romantic-floral {
  background-image: linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)),
  url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="3" fill="%23fce0e3" opacity="0.3"/></svg>');
  position: relative;
}

.romantic-floral::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to right, #fce0e3, #f7c4c7, #fce0e3);
}

.floral-decoration {
  width: 100%;
  height: 50px;
  margin: 20px 0;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.floral-decoration:hover {
  opacity: 1;
}

.floral-decoration.top {
  margin-top: 0;
}

.floral-decoration.bottom {
  margin-bottom: 0;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.title-box {
  position: relative;
  padding: 25px;
  border: 2px solid #fce0e3;
  border-radius: 15px;
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease;
}

.title-box:hover {
  transform: translateY(-5px);
}

.title-decoration {
  position: absolute;
  width: 30px;
  height: 30px;
  border-style: solid;
  border-color: #f7c4c7;
  border-width: 2px;
  opacity: 0.7;
}

.title-decoration.left {
  top: 10px;
  left: 10px;
  border-right: none;
  border-bottom: none;
}

.title-decoration.right {
  bottom: 10px;
  right: 10px;
  border-left: none;
  border-top: none;
}

.header h1 {
  font-size: 32px;
  color: #f7c4c7;
  margin-bottom: 15px;
  font-weight: 500;
  letter-spacing: 2px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
}

.header h2 {
  font-size: 26px;
  margin-bottom: 15px;
  font-weight: 400;
  color: #5a5a5a;
  letter-spacing: 1px;
}

.header .and {
  font-family: 'Times New Roman', serif;
  font-style: italic;
  color: #f7c4c7;
  font-size: 28px;
  padding: 0 10px;
}

.header .date {
  font-size: 18px;
  color: #888;
  font-weight: 300;
  letter-spacing: 1px;
}

.couple-info {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}

.photo-frame {
  text-align: center;
  width: 180px;
  transition: transform 0.3s ease;
}

.photo-frame:hover {
  transform: translateY(-5px);
}

.photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin: 0 auto 15px;
  border: 3px solid #fce0e3;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, transparent 60%, rgba(252, 224, 227, 0.3) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo:hover .photo-overlay {
  opacity: 1;
}

.photo:hover {
  transform: scale(1.05);
  border-color: #f7c4c7;
}

.photo-frame .name {
  font-size: 18px;
  color: #f7c4c7;
  font-weight: 500;
  letter-spacing: 1px;
  transition: color 0.3s ease;
}

.photo-frame:hover .name {
  color: #e9a6ab;
}

.heart {
  width: 60px;
  height: 60px;
  margin: 0 30px;
  animation: pulse 1.5s infinite;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.1));
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.love-quote {
  text-align: center;
  font-style: italic;
  color: #f7c4c7;
  margin-bottom: 40px;
  font-size: 18px;
  padding: 0 40px;
  position: relative;
}

.quote-mark {
  font-size: 36px;
  color: #fce0e3;
  position: absolute;
  opacity: 0.7;
}

.quote-mark.left {
  top: -15px;
  left: 20px;
}

.quote-mark.right {
  bottom: -15px;
  right: 20px;
}

.love-quote p {
  font-weight: 300;
  line-height: 1.6;
  letter-spacing: 0.5px;
}

.wedding-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.detail-card {
  text-align: center;
  padding: 25px;
  border: 1px solid #fce0e3;
  border-radius: 15px;
  background-color: white;
  width: 200px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.detail-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05);
  border-color: #f7c4c7;
}

.icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  transition: transform 0.3s ease;
}

.detail-card:hover .icon {
  transform: scale(1.1);
}

.detail-card h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #f7c4c7;
  font-weight: 500;
  letter-spacing: 1px;
}

.detail-card p {
  margin: 0;
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
}

.section-title h3 {
  text-align: center;
  font-size: 24px;
  color: #f7c4c7;
  margin: 0 15px;
  font-weight: 500;
  letter-spacing: 1px;
}

.section-title .line {
  height: 1px;
  flex-grow: 1;
  background: linear-gradient(to right, transparent, #fce0e3, transparent);
  max-width: 100px;
}

.story-section {
  background-color: white;
  padding: 35px;
  border-radius: 15px;
  margin-bottom: 40px;
  border: 1px solid #fce0e3;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease;
}

.story-section:hover {
  transform: translateY(-5px);
}

.story-section p {
  text-align: center;
  font-size: 16px;
  line-height: 1.8;
  color: #666;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.rsvp-section {
  background-color: white;
  padding: 35px;
  border-radius: 15px;
  margin-bottom: 40px;
  border: 1px solid #fce0e3;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.03);
}

.rsvp-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-size: 16px;
  color: #666;
  font-weight: 400;
  letter-spacing: 0.5px;
}

input[type="text"],
input[type="tel"],
input[type="number"],
textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #f0d4d6;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  transition: all 0.3s ease;
  background-color: #fffbfa;
  font-family: 'Noto Serif SC', 'SimSun', serif;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #d4a6a9;
  box-shadow: 0 0 10px rgba(212, 166, 169, 0.2);
  background-color: #fff;
}

textarea {
  height: 120px;
  resize: vertical;
  line-height: 1.6;
}

.radio-group {
  display: flex;
  gap: 30px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.radio-label:hover {
  transform: translateY(-2px);
}

.radio-label input {
  margin-right: 10px;
  accent-color: #d4a6a9;
}

.radio-label span {
  font-size: 16px;
  color: #666;
}

.submit-btn {
  display: block;
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #d4a6a9, #c99a9d, #d4a6a9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 1px;
  box-shadow: 0 5px 15px rgba(212, 166, 169, 0.3);
  font-family: 'Noto Serif SC', 'SimSun', serif;
}

.submit-btn:hover {
  background: linear-gradient(to right, #c99a9d, #b68e91, #c99a9d);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 166, 169, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .couple-info {
    flex-direction: column;
  }

  .photo-frame {
    margin: 15px 0;
  }

  .heart {
    margin: 15px 0;
  }

  .wedding-details {
    flex-direction: column;
    align-items: center;
  }

  .detail-card {
    width: 90%;
    max-width: 300px;
  }

  .header h1 {
    font-size: 28px;
  }

  .header h2 {
    font-size: 22px;
  }

  .title-box {
    padding: 20px;
  }

  .story-section,
  .rsvp-section {
    padding: 25px;
  }
}

@media (max-width: 480px) {
  .wedding-invitation {
    padding: 30px 15px;
  }

  .photo {
    width: 130px;
    height: 130px;
  }

  .header h1 {
    font-size: 24px;
  }

  .header h2 {
    font-size: 20px;
  }

  .radio-group {
    flex-direction: column;
    gap: 15px;
  }

  .title-box {
    padding: 15px;
  }

  .section-title h3 {
    font-size: 20px;
  }

  .section-title .line {
    max-width: 60px;
  }

  .love-quote {
    padding: 0 20px;
  }

  .quote-mark.left {
    left: 5px;
  }

  .quote-mark.right {
    right: 5px;
  }
}
</style>
