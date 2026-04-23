<route lang="json">
{
  "layout": "default",
  "style": { "navigationStyle": "custom" },
  "name": "kitchenTools"
}
</route>

<template>
  <view class="tools-page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-bar" :style="{ paddingTop: capsuleBottomToTop + 'px' }">
        <view class="back-btn" @click="goBack">
          <wd-icon name="chevron-left" size="20px" color="#fff" />
        </view>
        <text class="nav-title">厨房工具箱</text>
        <view class="nav-right" />
      </view>
      <view class="header-content">
        <text class="header-title">实用工具</text>
        <text class="header-sub">让烹饪更简单高效</text>
      </view>
    </view>

    <!-- 工具列表 -->
    <view class="tools-list">
      <view class="tool-card primary" @click="go('/pages/kitchenTools/timer')">
        <view class="tool-left">
          <view class="tool-icon-wrap orange">
            <wd-icon name="clock" size="24px" color="#fff" />
          </view>
        </view>
        <view class="tool-right">
          <text class="tool-name">多任务计时器</text>
          <text class="tool-desc">同时管理多个烹饪倒计时，炖肉蒸蛋两不误</text>
          <view class="tool-tags">
            <text class="tool-tag">多任务</text>
            <text class="tool-tag">提醒</text>
          </view>
        </view>
        <wd-icon name="chevron-right" size="18px" color="#CCC" />
      </view>

      <view class="tool-card primary" @click="go('/pages/kitchenTools/scale')">
        <view class="tool-left">
          <view class="tool-icon-wrap orange">
            <wd-icon name="chart-bar" size="24px" color="#fff" />
          </view>
        </view>
        <view class="tool-right">
          <text class="tool-name">分量计算器</text>
          <text class="tool-desc">2人份→4人份，自动换算所有食材用量</text>
          <view class="tool-tags">
            <text class="tool-tag">智能换算</text>
            <text class="tool-tag">精准</text>
          </view>
        </view>
        <wd-icon name="chevron-right" size="18px" color="#CCC" />
      </view>

      <view class="tool-card" @click="go('/pages/kitchenTools/replace')">
        <view class="tool-left">
          <view class="tool-icon-wrap orange">
            <wd-icon name="refresh" size="24px" color="#fff" />
          </view>
        </view>
        <view class="tool-right">
          <text class="tool-name">智能替换</text>
          <text class="tool-desc">缺食材？AI 推荐最佳替代方案</text>
          <view class="tool-tags">
            <text class="tool-tag">AI推荐</text>
          </view>
        </view>
        <wd-icon name="chevron-right" size="18px" color="#CCC" />
      </view>

      <view class="tool-card" @click="go('/pages/kitchenTools/thaw')">
        <view class="tool-left">
          <view class="tool-icon-wrap orange">
            <wd-icon name="time" size="24px" color="#fff" />
          </view>
        </view>
        <view class="tool-right">
          <text class="tool-name">解冻时间计算</text>
          <text class="tool-desc">根据肉类类型和重量，计算最佳解冻时间</text>
          <view class="tool-tags">
            <text class="tool-tag">科学</text>
          </view>
        </view>
        <wd-icon name="chevron-right" size="18px" color="#CCC" />
      </view>

      <view class="tool-card" @click="go('/pages/kitchenTools/ratio')">
        <view class="tool-left">
          <view class="tool-icon-wrap orange">
            <wd-icon name="chart-pie" size="24px" color="#fff" />
          </view>
        </view>
        <view class="tool-right">
          <text class="tool-name">调料比例表</text>
          <text class="tool-desc">油盐酱醋黄金比例，新手也能调出好味道</text>
          <view class="tool-tags">
            <text class="tool-tag">参考</text>
          </view>
        </view>
        <wd-icon name="chevron-right" size="18px" color="#CCC" />
      </view>

      <view class="tool-card" @click="go('/pages/kitchenTools/calorie')">
        <view class="tool-left">
          <view class="tool-icon-wrap orange">
            <wd-icon name="warning" size="24px" color="#fff" />
          </view>
        </view>
        <view class="tool-right">
          <text class="tool-name">热量计算器</text>
          <text class="tool-desc">计算菜品总热量，健康饮食好帮手</text>
          <view class="tool-tags">
            <text class="tool-tag">健康</text>
          </view>
        </view>
        <wd-icon name="chevron-right" size="18px" color="#CCC" />
      </view>
    </view>

    <view class="bottom-placeholder" />
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/composables'
const { capsuleBottomToTop } = useSystemInfo()

function go(url: string) {
  uni.navigateTo({ url })
}
function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.tools-page {
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
  top: 0; left: 0; right: 0;
  height: 300rpx;
  background: linear-gradient(135deg, #FF9E4D 0%, #FF6B35 100%);
}

.nav-bar {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 40rpx 20rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title { font-size: 34rpx; font-weight: bold; color: #fff; position: relative; }
.nav-right { width: 72rpx; }

.header-content {
  position: relative;
  padding: 20rpx 50rpx 50rpx;
}

.header-title { display: block; font-size: 48rpx; font-weight: bold; color: #fff; margin-bottom: 12rpx; }
.header-sub { font-size: 26rpx; color: rgba(255,255,255,0.85); }

.tools-list {
  padding: 0 30rpx;
  padding-top: 330rpx;
}

.tool-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.tool-card.primary {
  background: linear-gradient(135deg, #FFF9F5, #FFF5EE);
  border: 2rpx solid #FFE4D4;
}

.tool-left { margin-right: 24rpx; }

.tool-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-icon-wrap.orange { background: linear-gradient(135deg, #FF9E4D, #FF6B35); }

.tool-right { flex: 1; }

.tool-name { display: block; font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.tool-desc { display: block; font-size: 24rpx; color: #888; margin-bottom: 12rpx; line-height: 1.5; }

.tool-tags { display: flex; gap: 12rpx; }
.tool-tag {
  font-size: 20rpx;
  color: #FF6B35;
  background: #FFF0E8;
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
}

.bottom-placeholder { height: 60rpx; }
</style>
