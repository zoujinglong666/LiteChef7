<route lang="json">
{
  "layout": "tabbar",
  "style": { "navigationBarTitleText": "我的" },
  "name": "my"
}
</route>
  <template>
    <view class="mine-page">
      <view class="user-card">
        <image class="avatar" src="/static/avatar.png" mode="aspectFill" />
        <view class="nickname">Hi，我的美食记录</view>
      </view>

      <view class="menu-section">
        <view class="menu-item" @click="goTo('/pages/weekRecipes/index')">
          <text class="icon">📅</text>
          <text class="text">每周菜谱</text>
        </view>
        <view class="menu-item" @click="goTo('/pages/toDayRecipes/index')">
          <text class="icon">📅</text>
          <text class="text">今日菜谱</text>
        </view>
        <view class="menu-item" @click="goTo('/pages/myRecipes/index')">
          <text class="icon">📖</text>
          <text class="text">我的菜谱</text>
        </view>

        <view class="menu-item" @click="goTo('/pages/about/index')">
          <text class="icon">ℹ️</text>
          <text class="text">关于项目</text>
        </view>


      </view>
    </view>
  </template>


<script setup lang="ts">
function goTo(url: string) {
  uni.navigateTo({ url })
}
</script>
<style scoped lang="scss">
.mine-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #eee;
  }

  .nickname {
    margin-top: 10px;
    font-size: 16px;
    color: #333;
  }
}

.menu-section {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  .menu-item {
    display: flex;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 1px solid #f0f0f0;

    .icon {
      font-size: 20px;
      width: 30px;
    }

    .text {
      font-size: 15px;
      color: #333;
    }
  }

  .menu-item:last-child {
    border-bottom: none;
  }
}
</style>
