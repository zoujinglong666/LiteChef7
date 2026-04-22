<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { silentLogin, getLocalUser } from '@/utils/auth'

onLaunch(async () => {
  console.log('🚀 App Launch')
  
  // 自动静默登录
  try {
    const user = await silentLogin()
    console.log('✅ 静默登录成功:', user.nickname, user.openid)
  } catch (error) {
    console.error('❌ 静默登录失败:', error)
  }
})

onShow(() => {
  console.log('📱 App Show')
})

onHide(() => {
  console.log('📴 App Hide')
})
</script>

<style>
/* 全局样式 */
page {
  background-color: #FFFAF6;
}
</style>
