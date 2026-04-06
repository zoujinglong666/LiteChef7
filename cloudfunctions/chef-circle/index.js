// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, openid, data, postId } = event
  
  const postCollection = db.collection('post')
  const followCollection = db.collection('follow')
  
  try {
    switch (action) {
      case 'createPost': {
        const { content, images, recipeId, recipeInfo, type = 'share' } = data
        const now = new Date().toISOString()
        
        const post = {
          authorId: openid,
          authorInfo: data.authorInfo,
          content,
          images: images || [],
          recipeId,
          recipeInfo,
          type,
          stats: { likes: 0, comments: 0 },
          isWish: type === 'wish',
          wishFulfilled: false,
          createTime: now
        }
        
        const result = await postCollection.add(post)
        return { code: 200, message: '发布成功', data: { id: result._id } }
      }
      
      case 'getFeed': {
        const { page = 1, pageSize = 10 } = data || {}
        
        // 获取关注列表
        const follows = await followCollection.where({ userId: openid }).get()
        const followIds = [openid, ...follows.data.map(f => f.targetUserId)]
        
        const result = await postCollection
          .where({ authorId: _.in(followIds) })
          .orderBy('createTime', 'desc')
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get()
        
        return { code: 200, data: result.data }
      }
      
      case 'getDiscover': {
        const { page = 1, pageSize = 10 } = data || {}
        
        const result = await postCollection
          .orderBy('createTime', 'desc')
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get()
        
        return { code: 200, data: result.data }
      }
      
      case 'getWishes': {
        const result = await postCollection
          .where({ isWish: true })
          .orderBy('createTime', 'desc')
          .limit(20)
          .get()
        
        return { code: 200, data: result.data }
      }
      
      case 'fulfillWish': {
        const { recipeId, recipeName } = data
        await postCollection.doc(postId).update({
          wishFulfilled: true,
          fulfilledRecipe: { id: recipeId, name: recipeName }
        })
        return { code: 200, message: '已推荐' }
      }
      
      case 'likePost': {
        await postCollection.doc(postId).update({
          'stats.likes': _.inc(1)
        })
        return { code: 200, message: '点赞成功' }
      }
      
      case 'deletePost': {
        const post = await postCollection.doc(postId).get()
        if (post.data?.authorId !== openid) {
          return { code: 403, message: '无权限' }
        }
        await postCollection.doc(postId).remove()
        return { code: 200, message: '删除成功' }
      }
      
      case 'follow': {
        const { targetUserId } = data
        if (targetUserId === openid) {
          return { code: 400, message: '不能关注自己' }
        }
        
        const exists = await followCollection
          .where({ userId: openid, targetUserId })
          .get()
        
        if (exists.data.length > 0) {
          return { code: 200, message: '已关注' }
        }
        
        await followCollection.add({
          userId: openid,
          targetUserId,
          createTime: new Date().toISOString()
        })
        return { code: 200, message: '关注成功' }
      }
      
      case 'unfollow': {
        const { targetUserId } = data
        await followCollection
          .where({ userId: openid, targetUserId })
          .remove()
        return { code: 200, message: '取消关注' }
      }
      
      default:
        return { code: 400, message: '未知操作' }
    }
  } catch (error) {
    console.error('操作失败:', error)
    return { code: 500, message: '操作失败', error: error.message }
  }
}
