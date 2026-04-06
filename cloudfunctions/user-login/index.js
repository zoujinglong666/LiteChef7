// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前环境
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, code } = event
  
  if (!code) {
    return { code: 400, message: '缺少 code 参数' }
  }

  try {
    // 1. 通过 code 获取 openid
    const wxRes = await cloud.getOpenData({
      requestData: [code]
    })
    
    // 微信云开发直接获取 openid
    const openid = wxRes.openid || event.userInfo.openId
    
    if (!openid) {
      return { code: 500, message: '获取 openid 失败' }
    }
    
    // 2. 查询或创建用户
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
