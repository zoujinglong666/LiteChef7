'use strict'
/**
 * 用户登录云函数
 * 通过 code 换取 openid，创建或获取用户信息
 */
const cloud = require('@alicloud/mpserverless-sdk')

exports.main = async (event, context) => {
  const { code } = event
  
  if (!code) {
    return { code: 400, message: '缺少 code 参数' }
  }

  try {
    // 1. 通过 code 获取 openid（微信小程序）
    // 注意：需要在微信公众平台配置 AppSecret
    const wxAppId = context.APPID
    const wxAppSecret = process.env.WX_APPSECRET // 从环境变量获取
    
    // 调用微信接口获取 openid
    const wxRes = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${wxAppId}&secret=${wxAppSecret}&js_code=${code}&grant_type=authorization_code`
    )
    const wxData = await wxRes.json()
    
    if (wxData.errcode) {
      console.error('微信登录失败:', wxData)
      return { code: 500, message: '微信登录失败', error: wxData }
    }
    
    const { openid, session_key } = wxData
    
    // 2. 查询或创建用户
    const db = cloud.db()
    const userCollection = db.collection('user-info')
    
    let user = await userCollection.doc(openid).get()
    
    if (!user.data) {
      // 新用户，创建记录
      const now = new Date().toISOString()
      const newUser = {
        _id: openid,
        openid,
        createTime: now,
        updateTime: now,
        moodHistory: [],
        favorites: [],
        settings: {
          defaultCuisine: '中式',
          notifications: true
        },
        vipInfo: {
          isVip: false
        }
      }
      
      await userCollection.add(newUser)
      user = { data: newUser }
      console.log('✅ 新用户创建:', openid)
    } else {
      console.log('✅ 用户已存在:', openid)
    }
    
    return {
      code: 200,
      message: '登录成功',
      data: {
        openid,
        userInfo: user.data
      }
    }
    
  } catch (error) {
    console.error('登录失败:', error)
    return { code: 500, message: '登录失败', error: error.message }
  }
}
