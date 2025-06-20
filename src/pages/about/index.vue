<route lang="json">
{
"style": { "navigationBarTitleText": "关于项目" },
"name": "about"
}
</route>

<template>
  <view class="about-page">
    <!-- 顶部封面 / 标题 -->
    <view class="header">
      <image src="/static/logo.png" class="logo" mode="aspectFit" />
      <view class="title">每日推荐菜谱</view>
      <view class="subtitle">简单 · 好做 · 下饭</view>
    </view>

    <!-- 项目简介 -->
    <view class="section">
      <view class="section-title">📌 项目简介</view>
      <view class="section-content">
        这是一款基于 <text class="highlight">uni-app</text> 开发的轻量小程序，旨在帮助用户在生活中快速获取简单、美味、适合的家常菜推荐，特别适合工作日下厨、周末搭配、以及记录自己喜爱的菜品。
      </view>
    </view>

    <!-- 功能亮点 -->
    <view class="section">
      <view class="section-title">✨ 功能亮点</view>
      <view class="tag-list">
        <text class="tag">✅ 每日随机推荐</text>
        <text class="tag">✅ 每周精选食谱</text>
        <text class="tag">✅ 离线可用</text>
        <text class="tag">✅ 食谱评分记录</text>
        <text class="tag">✅ 极简交互体验</text>
      </view>
    </view>

    <!-- 技术栈 -->
    <view class="section">
      <view class="section-title">🛠️ 技术架构</view>
      <view class="section-content">
        - Vue 3 + Composition API + TypeScript<br/>
        - uni-app 跨端框架（H5 / 微信小程序）<br/>
        - WD-UI 小程序组件库 + SCSS 样式模块<br/>
        - 本地数据存储 + 模拟数据源
      </view>
    </view>

    <!-- 作者信息 -->
    <view class="section">
      <view class="section-title">👨‍💻 作者信息</view>
      <view class="section-content">
        项目开发者：<text class="highlight">Jinglong Zou</text><br/>
        GitHub：<text class="link" @click="openGithub">https://github.com/zoujinglong666</text><br/>
        联系邮箱：<text selectable>hi@example.com</text><br/>
        欢迎交流与建议 💬
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
</script>

<style scoped lang="scss">
.about-page {
  padding: 20px;
  background-color: #f5f5f5;
  box-sizing: border-box;
  min-height: 100vh;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;

  .logo {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    margin-bottom: 10px;
  }

  .title {
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }

  .subtitle {
    font-size: 14px;
    color: #999;
    margin-top: 4px;
  }
}

.section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.section-content {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
}

.highlight {
  color: #ff6700;
  font-weight: 500;
}

.link {
  color: #007aff;
  text-decoration: underline;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 6px;

  .tag {
    background-color: #f0f0f0;
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 14px;
    color: #555;
  }
}
</style>
