/**
 * 微信云开发初始化
 * v3.0
 */

// 云开发环境ID（需要替换为实际的）
export const CLOUD_ENV = '' // 在微信开发者工具中查看

/**
 * 初始化微信云开发
 */
export function initCloud() {
  if (typeof wx === 'undefined' || !wx.cloud) {
    console.warn('非微信环境，跳过云初始化')
    return
  }
  
  wx.cloud.init({
    env: CLOUD_ENV || 'cloud1-2grw3bbx061c1340', // 默认环境
    traceUser: true
  })
  
  console.log('☁️ 微信云开发已初始化')
}

/**
 * 获取云数据库引用
 */
export function getCloudDB() {
  if (!wx.cloud) {
    throw new Error('云开发未初始化')
  }
  return wx.cloud.database()
}

/**
 * 获取云函数引用
 */
export function callCloudFunction(name: string, data: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'))
      return
    }
    
    wx.cloud.callFunction({
      name,
      data,
      success: (res: any) => {
        resolve(res)
      },
      fail: (err: any) => {
        console.error(`云函数 ${name} 调用失败:`, err)
        reject(err)
      }
    })
  })
}
