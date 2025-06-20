// platform.ts
const rawPlatform = uni.getSystemInfoSync().platform || ''

export const platform = rawPlatform
export const isH5 = rawPlatform === 'h5'
export const isApp = rawPlatform === 'app' || rawPlatform === 'app-plus'
export const isMp = rawPlatform.startsWith('mp-')
export const isMpWeixin = rawPlatform === 'mp-weixin'
export const isMpAlipay = rawPlatform === 'mp-alipay'
export const isMpToutiao = rawPlatform === 'mp-toutiao'

export const PLATFORM = {
  platform,
  isH5,
  isApp,
  isMp,
  isMpWeixin,
  isMpAlipay,
  isMpToutiao,
}

export default PLATFORM
