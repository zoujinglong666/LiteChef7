<route lang="json">
{
  "style": { "navigationBarTitleText": "烹饪计时器" },
  "name": "ratio"
}
</route>
<template>
  <view class="timer-page">
    <!-- 计时器显示区域 -->
    <view class="timer-container">
      <view class="timer-circle-container">
        <!-- 添加SVG圆形进度条 -->
        <svg
          class="progress-ring"
          width="300px"
          height="300px"
          viewBox="0 0 300 300"
        >
          <circle
            class="progress-ring-circle-bg"
            stroke="#e6e6e6"
            stroke-width="10"
            fill="transparent"
            r="140"
            cx="150"
            cy="150"
          />
          <circle
            class="progress-ring-circle"
            :stroke="isRunning ? '#3498db' : '#a0d8ff'"
            stroke-width="10"
            fill="transparent"
            r="140"
            cx="150"
            cy="150"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90, 150, 150)"
          />
        </svg>
        <view class="timer-circle" :class="{ active: isRunning }">
          <view class="timer-value">{{ formatTime(remaining) }}</view>
          <view class="timer-status">{{
            isRunning ? '计时中...' : remaining > 0 ? '已暂停' : '设置时间'
          }}</view>
        </view>
      </view>

      <!-- 控制按钮 -->
      <view class="control-buttons">
        <view
          class="control-btn"
          @click="isRunning ? pauseTimer() : startTimer(remaining)"
          v-if="remaining > 0"
        >
          <text class="btn-icon">{{ isRunning ? '⏸' : '▶️' }}</text>
          <text class="btn-text">{{ isRunning ? '暂停' : '继续' }}</text>
        </view>
        <view
          class="control-btn reset"
          @click="resetTimer()"
          v-if="remaining > 0"
        >
          <text class="btn-icon">🔄</text>
          <text class="btn-text">重置</text>
        </view>
      </view>
    </view>

    <!-- 自定义时间设置 -->
    <view class="custom-time-section">
      <text class="section-title">自定义时间</text>
      <view class="time-picker">
        <view class="time-unit">
          <view class="unit-controls">
            <text class="control-up" @click="adjustTime('minutes', 1)">⬆️</text>
            <text class="control-down" @click="adjustTime('minutes', -1)"
              >⬇️</text
            >
          </view>
          <input
            type="number"
            class="time-input"
            v-model="customMinutes"
            maxlength="2"
            @blur="validateInput('minutes')"
          />
          <text class="unit-label">分钟</text>
        </view>

        <view class="time-separator">:</view>

        <view class="time-unit">
          <view class="unit-controls">
            <text class="control-up" @click="adjustTime('seconds', 1)">⬆️</text>
            <text class="control-down" @click="adjustTime('seconds', -1)"
              >⬇️</text
            >
          </view>
          <input
            type="number"
            class="time-input"
            v-model="customSeconds"
            maxlength="2"
            @blur="validateInput('seconds')"
          />
          <text class="unit-label">秒钟</text>
        </view>
      </view>

      <view class="custom-start-btn" @click="startCustomTimer()">
        开始计时
      </view>
    </view>

    <!-- 预设时间选项 -->
    <view class="presets-section">
      <text class="section-title">常用时间</text>
      <view class="preset-grid">
        <view
          v-for="item in presets"
          :key="item.label"
          class="preset-item"
          @click="startTimer(item.time)"
        >
          <text class="preset-icon">{{ item.icon }}</text>
          <text class="preset-label">{{ item.label }}</text>
          <text class="preset-time">{{ formatTime(item.time) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// 预设时间选项
const presets = [
  { label: '煮蛋', time: 180, icon: '🥚' },
  { label: '煮面', time: 300, icon: '🍜' },
  { label: '蒸饭', time: 600, icon: '🍚' },
  { label: '炖汤', time: 1800, icon: '🍲' },
  { label: '烤箱', time: 1200, icon: '🍞' },
  { label: '煲粥', time: 2400, icon: '🥣' },
];

// 响应式数据
const remaining = ref(0);
const isRunning = ref(false);
const customMinutes = ref('5');
const customSeconds = ref('00');
let timer: any = null;

// 进度条相关数据
const initialTime = ref(0); // 初始设置的总时间
const circumference = 2 * Math.PI * 140; // 圆的周长
const dashOffset = computed(() => {
  if (initialTime.value === 0 || remaining.value === 0) return circumference;
  // 计算进度比例，从完全不显示到完全显示
  const progress = (initialTime.value - remaining.value) / initialTime.value;
  return circumference * (1 - progress);
});

// 开始计时
function startTimer(seconds: number) {
  clearInterval(timer);
  remaining.value = seconds;
  initialTime.value = seconds; // 记录初始时间用于计算进度
  isRunning.value = true;

  timer = setInterval(() => {
    if (remaining.value <= 1) {
      timerComplete();
    } else {
      remaining.value--;
    }
  }, 1000);
}

// 暂停计时
function pauseTimer() {
  clearInterval(timer);
  isRunning.value = false;
}

// 重置计时
function resetTimer() {
  clearInterval(timer);
  remaining.value = 0;
  initialTime.value = 0;
  isRunning.value = false;
}

// 计时完成
function timerComplete() {
  clearInterval(timer);
  isRunning.value = false;
  remaining.value = 0;

  // 震动提醒
  uni.vibrateShort({
    success: function () {
      console.log('震动成功');
      // 连续震动两次以增强提醒效果
      setTimeout(() => {
        uni.vibrateLong();
      }, 500);
    },
    fail: function () {
      console.log('震动失败');
    },
  });

  // 显示提醒
  uni.showModal({
    title: '时间到',
    content: '您设置的计时时间已到',
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
        console.log('用户点击确定');
      }
    },
  });
}

// 调整自定义时间
function adjustTime(unit: 'minutes' | 'seconds', change: number) {
  if (unit === 'minutes') {
    let value = parseInt(customMinutes.value) + change;
    if (value < 0) value = 0;
    if (value > 99) value = 99;
    customMinutes.value = String(value);
  } else {
    let value = parseInt(customSeconds.value) + change;
    if (value < 0) value = 0;
    if (value > 59) value = 59;
    customSeconds.value = String(value);
  }
}

// 验证输入 - 只在失去焦点时格式化
function validateInput(unit: 'minutes' | 'seconds') {
  if (unit === 'minutes') {
    let value = parseInt(customMinutes.value);
    if (isNaN(value)) value = 0;
    if (value > 99) value = 99;
    customMinutes.value = String(value).padStart(2, '0');
  } else {
    let value = parseInt(customSeconds.value);
    if (isNaN(value)) value = 0;
    if (value > 59) value = 59;
    customSeconds.value = String(value).padStart(2, '0');
  }
}

// 开始自定义计时
function startCustomTimer() {
  const minutes = parseInt(customMinutes.value) || 0;
  const seconds = parseInt(customSeconds.value) || 0;
  const totalSeconds = minutes * 60 + seconds;

  if (totalSeconds > 0) {
    startTimer(totalSeconds);
  } else {
    uni.showToast({
      title: '请设置有效的时间',
      icon: 'none',
    });
  }
}

// 格式化时间显示
function formatTime(sec: number) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}
</script>

<style scoped>
.timer-page {
  padding: 30px;
  background-color: #f9f9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 计时器显示区域 */
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.timer-circle-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin-bottom: 40px;
}

.timer-circle {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  box-shadow:
    10px 10px 20px #d9d9d9,
    -10px -10px 20px #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.3s ease;
}

.timer-circle.active {
  background: linear-gradient(145deg, #f0f8ff, #e6f7ff);
  box-shadow:
    10px 10px 20px #d9d9d9,
    -10px -10px 20px #ffffff,
    inset 0 0 10px rgba(0, 150, 255, 0.1);
  border: 2px solid rgba(0, 150, 255, 0.2);
}

/* 添加进度环样式 */
.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.progress-ring-circle-bg {
  opacity: 0.3;
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.5s;
  transform-origin: center;
  stroke-linecap: round;
}

.timer-value {
  font-size: 60px;
  font-weight: bold;
  color: #333;
  z-index: 2;
}

.timer-status {
  font-size: 24px;
  color: #888;
  margin-top: 10px;
  z-index: 2;
}

/* 控制按钮 */
.control-buttons {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  padding: 20px 40px;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.control-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.control-btn.reset {
  background-color: #f8f8f8;
}

.btn-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.btn-text {
  font-size: 24px;
  color: #666;
}

/* 自定义时间设置 */
.custom-time-section {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  display: block;
}

.time-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.unit-controls {
  display: flex;
  flex-direction: column;
  position: absolute;
  right: -60px;
  top: 0;
  height: 100%;
  justify-content: space-between;
}

.control-up,
.control-down {
  font-size: 24px;
  padding: 6px;
  opacity: 0.7;
}

.time-input {
  width: 120px;
  height: 100px;
  background-color: #f5f5f5;
  border-radius: 12px;
  text-align: center;
  font-size: 48px;
  font-weight: bold;
  color: #333;
}

.time-separator {
  font-size: 48px;
  font-weight: bold;
  margin: 0 30px;
  color: #333;
}

.unit-label {
  font-size: 24px;
  color: #888;
  margin-top: 10px;
}

.custom-start-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  text-align: center;
  padding: 24px 0;
  border-radius: 50px;
  font-size: 32px;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(41, 128, 185, 0.3);
  transition: all 0.2s ease;
}

.custom-start-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 5px rgba(41, 128, 185, 0.2);
}

/* 预设时间选项 */
.presets-section {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.preset-item {
  background-color: #f9f9f9;
  border-radius: 16px;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.preset-item:active {
  transform: scale(0.95);
  background-color: #f0f0f0;
}

.preset-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.preset-label {
  font-size: 28px;
  color: #333;
  margin-bottom: 6px;
}

.preset-time {
  font-size: 22px;
  color: #888;
}
</style>
ss
