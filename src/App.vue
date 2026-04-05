<script setup lang="ts">
import { initUser, pullFromCloud } from '@/utils/auth'

onLaunch(async () => {
  console.log('App Launch')
  
  // 初始化用户（微信登录 + 云同步）
  try {
    const user = await initUser()
    console.log('✅ 用户初始化成功:', user.openid)
    
    // 尝试从云端拉取最新数据
    await pullFromCloud()
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

</style>
