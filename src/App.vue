<script setup lang="ts">
import { initUser, pullFromCloud } from '@/utils/auth'

// 初始化微信云开发
function initCloud() {
  if (typeof wx === 'undefined' || !wx.cloud) return
  
  try {
    wx.cloud.init({
      env: 'LiteChef7-xxxx', // TODO: 替换为实际云环境ID
      traceUser: true
    })
    console.log('☁️ 微信云开发已初始化')
  } catch (e) {
    console.warn('云开发初始化跳过')
  }
}

// 检查小程序版本更新
function checkForUpdate() {
  if (typeof uni.getUpdateManager === 'undefined') {
    console.log('非微信环境，跳过版本检查')
    return
  }
  
  const updateManager = uni.getUpdateManager()
  
  // 检查是否有新版本
  updateManager.onCheckForUpdate((res) => {
    if (res.hasUpdate) {
      console.log('有新版本可用')
    }
  })
  
  // 新版本下载完成
  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: '更新提示',
      content: '新版本已准备好，是否重启应用？',
      confirmText: '立即更新',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          updateManager.applyUpdate()
        }
      }
    })
  })
  
  // 新版本下载失败
  updateManager.onUpdateFailed(() => {
    uni.showModal({
      title: '更新失败',
      content: '新版本下载失败，请检查网络后重试',
      confirmText: '知道了',
      showCancel: false
    })
  })
}

onLaunch(async () => {
  console.log('App Launch')
  
  // 初始化云开发
  initCloud()
  
  // 检查版本更新
  checkForUpdate()
  
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
