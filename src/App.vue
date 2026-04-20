<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { login, getLocalUser } from '@/utils/auth'

onLaunch(async () => {
  console.log('App Launch')
  
  // 初始化用户
  try {
    await login()
    console.log('✅ 用户初始化成功')
  } catch (error) {
    console.error('❌ 用户初始化失败:', error)
  }
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* 全局样式 */
page {
  background-color: #FFFAF6;
}

/* 移除云函数相关样式 */
</style>
