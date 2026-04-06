'use strict'
/**
 * 用户数据同步云函数
 * 同步收藏、心情历史、设置等到云端
 */
const cloud = require('@alicloud/mpserverless-sdk')

exports.main = async (event, context) => {
  const { action, openid, data } = event
  
  if (!openid) {
    return { code: 400, message: '缺少 openid' }
  }
  
  const db = cloud.db()
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
        
        // 检查是否已收藏
        const user = await userCollection.doc(openid).get()
        const exists = user.data?.favorites?.some(f => f.name === recipe.name)
        
        if (exists) {
          return { code: 200, message: '已收藏' }
        }
        
        await userCollection.doc(openid).update({
          favorites: cloud.db.command.push({ ...recipe, time: now }),
          updateTime: now
        })
        return { code: 200, message: '收藏成功' }
      }
      
      case 'removeFavorite': {
        // 移除收藏
        const { name } = data
        const user = await userCollection.doc(openid).get()
        const favorites = user.data?.favorites?.filter(f => f.name !== name) || []
        
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
        
        await userCollection.doc(openid).update({
          moodHistory: cloud.db.command.unshift(record),
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
