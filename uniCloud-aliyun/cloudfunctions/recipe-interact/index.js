'use strict'
/**
 * 菜谱互动云函数（点赞、收藏、评论）
 */
const cloud = require('@alicloud/mpserverless-sdk')

exports.main = async (event, context) => {
  const { action, recipeId, openid, data } = event
  const db = cloud.db()
  const recipeCollection = db.collection('recipe')
  const commentCollection = db.collection('comment')
  const userCollection = db.collection('user-info')
  
  try {
    switch (action) {
      case 'like': {
        // 点赞
        await recipeCollection.doc(recipeId).update({
          'stats.likes': db.command.inc(1)
        })
        return { code: 200, message: '点赞成功' }
      }
      
      case 'unlike': {
        // 取消点赞
        await recipeCollection.doc(recipeId).update({
          'stats.likes': db.command.inc(-1)
        })
        return { code: 200, message: '取消点赞' }
      }
      
      case 'favorite': {
        // 收藏（已在前端 auth.ts 实现）
        await recipeCollection.doc(recipeId).update({
          'stats.favorites': db.command.inc(1)
        })
        return { code: 200, message: '收藏成功' }
      }
      
      case 'unfavorite': {
        // 取消收藏
        await recipeCollection.doc(recipeId).update({
          'stats.favorites': db.command.inc(-1)
        })
        return { code: 200, message: '取消收藏' }
      }
      
      case 'addComment': {
        // 添加评论
        const { content, userInfo } = data
        const now = new Date().toISOString()
        
        const comment = {
          recipeId,
          userId: openid,
          userInfo,
          content,
          likeCount: 0,
          createTime: now
        }
        
        const result = await commentCollection.add(comment)
        
        // 增加评论数
        await recipeCollection.doc(recipeId).update({
          'stats.comments': db.command.inc(1)
        })
        
        return { code: 200, message: '评论成功', data: { id: result.id } }
      }
      
      case 'getComments': {
        // 获取评论列表
        const { page = 1, pageSize = 20 } = data || {}
        const skip = (page - 1) * pageSize
        
        const result = await commentCollection
          .where({ recipeId })
          .orderBy('createTime', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
        
        return { code: 200, data: result.data }
      }
      
      case 'likeComment': {
        // 点赞评论
        const { commentId } = data
        await commentCollection.doc(commentId).update({
          likeCount: db.command.inc(1)
        })
        return { code: 200, message: '点赞成功' }
      }
      
      case 'deleteComment': {
        // 删除评论
        const { commentId } = data
        const comment = await commentCollection.doc(commentId).get()
        
        if (comment.data?.userId !== openid) {
          return { code: 403, message: '无权限' }
        }
        
        await commentCollection.doc(commentId).remove()
        
        // 减少评论数
        await recipeCollection.doc(recipeId).update({
          'stats.comments': db.command.inc(-1)
        })
        
        return { code: 200, message: '删除成功' }
      }
      
      default:
        return { code: 400, message: '未知操作' }
    }
  } catch (error) {
    console.error('操作失败:', error)
    return { code: 500, message: '操作失败', error: error.message }
  }
}
