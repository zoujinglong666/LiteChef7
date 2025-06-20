<template>
  <wd-config-provider theme="light" :theme-vars="themeVars">
    <view class="tabbar-app-layout">
      <slot />
      <wd-toast />
      <wd-message-box />
    </view>
  </wd-config-provider>
</template>

<script setup lang="ts">
  import type { ConfigProviderThemeVars } from 'wot-design-uni';
  const themeVars: ConfigProviderThemeVars = {
    colorTheme: '#5474f2',
  };
  
</script>

<style lang="scss" scoped>
  .tabbar-app-layout {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
</style>
