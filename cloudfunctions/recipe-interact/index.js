// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, recipeId, openid, data } = event
  
  const recipeCollection = db.collection('recipe')
  const commentCollection = db.collection('comment')
  
  try {
    switch (action) {
      case 'like': {
        await recipeCollection.doc(recipeId).update({
          'stats.likes': _.inc(1)
        })
        return { code: 200, message: '点赞成功' }
      }
      
      case 'unlike': {
        await recipeCollection.doc(recipeId).update({
          'stats.likes': _.inc(-1)
        })
        return { code: 200, message: '取消点赞' }
      }
      
      case 'favorite': {
        await recipeCollection.doc(recipeId).update({
          'stats.favorites': _.inc(1)
        })
        return { code: 200, message: '收藏成功' }
      }
      
      case 'unfavorite': {
        await recipeCollection.doc(recipeId).update({
          'stats.favorites': _.inc(-1)
        })
        return { code: 200, message: '取消收藏' }
      }
      
      case 'addComment': {
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
        
        await recipeCollection.doc(recipeId).update({
          'stats.comments': _.inc(1)
        })
        
        return { code: 200, message: '评论成功', data: { id: result._id } }
      }
      
      case 'getComments': {
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
        const { commentId } = data
        await commentCollection.doc(commentId).update({
          likeCount: _.inc(1)
        })
        return { code: 200, message: '点赞成功' }
      }
      
      case 'deleteComment': {
        const { commentId } = data
        const comment = await commentCollection.doc(commentId).get()
        
        if (comment.data?.userId !== openid) {
          return { code: 403, message: '无权限' }
        }
        
        await commentCollection.doc(commentId).remove()
        await recipeCollection.doc(recipeId).update({
          'stats.comments': _.inc(-1)
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
