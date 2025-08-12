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
      <image src="/static/logo.png" class="avatar" mode="aspectFit"/>
      <view class="nickname">Hi，我的美食记录</view>
    </view>
    <view class="menu-section">
      <view
        class="menu-item"
        v-for="(item, index) in menuList"
        :key="index"
        @click="goTo(item.path)"
      >
        <view :class="item.icon" style="margin-right: 10px"/>
        <text class="text">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const menuList = [
  {
    icon: 'sn-icon-park-outline:like', // ❤️ 更贴合“收藏”
    text: '我的收藏',
    path: '/pages/myRecipes/index',
  },
  {
    icon: 'sn-icon-park-outline:chef-hat', // 👨‍🍳 厨房小能手（烹饪工具）
    text: '烹饪计时器',
    path: '/pages/kitchenTools/timer',
  },
  {
    icon: 'sn-icon-park-outline:scale', // ⚖️ 比例工具
    text: '油盐糖比例表',
    path: '/pages/kitchenTools/ratio',
  },
  {
    icon: 'sn-icon-park-outline:info', // ℹ️ 常用表示“关于”信息
    text: '关于项目',
    path: '/pages/about/index',
  },
];


function goTo(url: string) {
  uni.navigateTo({url})
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
