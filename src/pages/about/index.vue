<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "about"
}
</route>

<template>
  <view class="about-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">关于</text>
        <view class="nav-right" />
      </view>

      <!-- Logo -->
      <view class="logo-section">
        <text class="logo-emoji">🍳</text>
        <text class="logo-title">7天轻厨</text>
        <text class="logo-subtitle">简单 · 好做 · 下饭</text>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="content">
      <!-- 项目简介 -->
      <view class="section">
        <view class="section-header">
          <text class="section-icon">📌</text>
          <text class="section-title">项目简介</text>
        </view>
        <text class="section-text">
          这是一款基于 uni-app 开发的轻量小程序，旨在帮助用户在生活中快速获取简单、美味、适合的家常菜推荐。特别适合工作日下厨、周末搭配、以及记录自己喜爱的菜品。
        </text>
      </view>

      <!-- 功能亮点 -->
      <view class="section">
        <view class="section-header">
          <text class="section-icon">✨</text>
          <text class="section-title">功能亮点</text>
        </view>
        <view class="feature-list">
          <view class="feature-item">
            <wd-icon name="check-circle" size="16px" color="#FF6B35" />
            <text>心情选菜，AI智能推荐</text>
          </view>
          <view class="feature-item">
            <wd-icon name="check-circle" size="16px" color="#FF6B35" />
            <text>每日随机推荐</text>
          </view>
          <view class="feature-item">
            <wd-icon name="check-circle" size="16px" color="#FF6B35" />
            <text>每周精选食谱</text>
          </view>
          <view class="feature-item">
            <wd-icon name="check-circle" size="16px" color="#FF6B35" />
            <text>菜谱广场，UGC社区</text>
          </view>
          <view class="feature-item">
            <wd-icon name="check-circle" size="16px" color="#FF6B35" />
            <text>厨友圈，社交分享</text>
          </view>
          <view class="feature-item">
            <wd-icon name="check-circle" size="16px" color="#FF6B35" />
            <text>厨房工具箱</text>
          </view>
        </view>
      </view>

      <!-- 技术栈 -->
      <view class="section">
        <view class="section-header">
          <text class="section-icon">🔧</text>
          <text class="section-title">技术架构</text>
        </view>
        <view class="tech-list">
          <text class="tech-item">• Vue 3 + Composition API + TypeScript</text>
          <text class="tech-item">• uni-app 跨端框架</text>
          <text class="tech-item">• wot-design-uni 组件库</text>
          <text class="tech-item">• Spring Boot 3 后端</text>
          <text class="tech-item">• 智谱AI 推荐引擎</text>
        </view>
      </view>

      <!-- 作者信息 -->
      <view class="section">
        <view class="section-header">
          <text class="section-icon">👨‍💻</text>
          <text class="section-title">作者信息</text>
        </view>
        <view class="author-info">
          <text class="author-item">开发者：<text class="highlight">Jinglong Zou</text></text>
          <text class="author-item">GitHub：<text class="link" @click="openGithub">zoujinglong666</text></text>
          <text class="author-item">欢迎交流与建议 💬</text>
        </view>
      </view>

      <!-- 版本 -->
      <view class="version">
        <text>版本 3.0.0</text>
        <text>© 2026 7天轻厨</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
function openGithub() {
  uni.setClipboardData({
    data: 'https://github.com/zoujinglong666',
    success() {
      uni.showToast({ title: '链接已复制', icon: 'none' })
    }
  })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #F8F9FA;
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
  height: 400rpx;
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

.logo-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0 60rpx;
}

.logo-emoji {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.logo-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
}

.logo-subtitle {
  font-size: 26rpx;
  color: rgba(255,255,255,0.85);
}

.content {
  position: relative;
  margin-top: -40rpx;
  padding: 0 30rpx 40rpx;
  padding-top: 400rpx;
}

.section {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.section-icon {
  font-size: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.tech-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tech-item {
  font-size: 26rpx;
  color: #666;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.author-item {
  font-size: 28rpx;
  color: #666;
}

.highlight {
  color: #FF6B35;
  font-weight: 500;
}

.link {
  color: #007AFF;
  text-decoration: underline;
}

.version {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>
