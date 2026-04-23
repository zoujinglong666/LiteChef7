/**
 * 系统信息 composable
 * 获取状态栏高度、导航栏高度等系统信息
 */

export interface SystemInfo {
  statusBarHeight: number
  navBarHeight: number
  screenWidth: number
  screenHeight: number
  windowWidth: number
  windowHeight: number
  safeAreaBottom: number
}

export function useSystemInfo() {
  const systemInfo = ref<SystemInfo>({
    statusBarHeight: 0,
    navBarHeight: 44,
    screenWidth: 375,
    screenHeight: 812,
    windowWidth: 375,
    windowHeight: 812,
    safeAreaBottom: 0
  })

  // 计算导航栏 padding（顶部到胶囊底部 + 间距）
  const navBarPaddingTop = computed(() => {
    return `${systemInfo.value.statusBarHeight + 12}px`
  })

  // 导航栏总高度（状态栏+胶囊区域）
  const navBarHeight = computed(() => {
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect?.()
    if (menuButtonInfo) {
      return menuButtonInfo.top - systemInfo.value.statusBarHeight + menuButtonInfo.height
    }
    return 44
  })

  // 胶囊按钮底部到屏幕顶的距离（px），用于动态设置 nav-bar padding
  const capsuleBottomToTop = computed(() => {
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect?.()
    if (menuButtonInfo) {
      return menuButtonInfo.top - systemInfo.value.statusBarHeight + menuButtonInfo.height
    }
    return 44
  })

  // 胶囊按钮位置计算
  const capsulePosition = computed(() => {
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect?.()
    if (!menuButtonInfo) {
      return {
        top: systemInfo.value.statusBarHeight + 10,
        height: 32,
        right: systemInfo.value.screenWidth - 10
      }
    }
    return {
      top: menuButtonInfo.top,
      height: menuButtonInfo.height,
      right: menuButtonInfo.right
    }
  })

  // 初始化系统信息
  function initSystemInfo() {
    try {
      const info = uni.getSystemInfoSync()
      
      // 获取胶囊按钮信息
      const menuButtonInfo = uni.getMenuButtonBoundingClientRect?.() || {
        top: (info.statusBarHeight || 0) + 10,
        height: 32,
        bottom: (info.statusBarHeight || 0) + 42
      }

      // 计算导航栏高度
      const navBarHeight = (menuButtonInfo.top - (info.statusBarHeight || 0)) * 2 + menuButtonInfo.height

      // 计算安全区域底部高度
      const safeAreaBottom = info.safeAreaInsets?.bottom || 0

      systemInfo.value = {
        statusBarHeight: info.statusBarHeight || 0,
        navBarHeight,
        screenWidth: info.screenWidth || 375,
        screenHeight: info.screenHeight || 812,
        windowWidth: info.windowWidth || 375,
        windowHeight: info.windowHeight || 812,
        safeAreaBottom
      }
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  }

  onMounted(() => {
    initSystemInfo()
  })

  return {
    systemInfo: readonly(systemInfo),
    navBarPaddingTop,
    navBarHeight,
    capsuleBottomToTop,
    capsulePosition,
    initSystemInfo
  }
}
