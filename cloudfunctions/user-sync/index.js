// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, openid, data } = event
  
  if (!openid) {
    return { code: 400, message: '缺少 openid' }
  }
  
  const userCollection = db.collection('user-info')
  
  try {
    switch (action) {
      case 'sync': {
        // 全量同步用户数据
        const now = new Date().toISOString()
        await userCollection.doc(openid).update({
          ...data,
          updateTime: now
        })
        return { code: 200, message: '同步成功' }
      }
      
      case 'addFavorite': {
        // 添加收藏
        const recipe = data
        const now = new Date().toISOString()
        
        const user = await userCollection.doc(openid).get()
        const favorites = user.data?.favorites || []
        
        // 检查是否已收藏
        const exists = favorites.some(f => f.name === recipe.name)
        if (exists) {
          return { code: 200, message: '已收藏' }
        }
        
        favorites.unshift({ ...recipe, time: now })
        
        await userCollection.doc(openid).update({
          favorites,
          updateTime: now
        })
        return { code: 200, message: '收藏成功' }
      }
      
      case 'removeFavorite': {
        // 移除收藏
        const { name } = data
        const user = await userCollection.doc(openid).get()
        const favorites = (user.data?.favorites || []).filter(f => f.name !== name)
        
        await userCollection.doc(openid).update({
          favorites,
          updateTime: new Date().toISOString()
        })
        return { code: 200, message: '取消收藏成功' }
      }
      
      case 'addMoodRecord': {
        // 添加心情记录
        const record = data
        const now = new Date().toISOString()
        
        const user = await userCollection.doc(openid).get()
        let moodHistory = user.data?.moodHistory || []
        
        moodHistory.unshift({ ...record, time: now })
        // 最多保留50条
        if (moodHistory.length > 50) {
          moodHistory = moodHistory.slice(0, 50)
        }
        
        await userCollection.doc(openid).update({
          moodHistory,
          updateTime: now
        })
        return { code: 200, message: '记录成功' }
      }
      
      case 'getUserData': {
        // 获取用户数据
        const user = await userCollection.doc(openid).get()
        return { 
          code: 200, 
          data: user.data 
        }
      }
      
      default:
        return { code: 400, message: '未知操作' }
    }
  } catch (error) {
    console.error('同步失败:', error)
    return { code: 500, message: '同步失败', error: error.message }
  }
}
