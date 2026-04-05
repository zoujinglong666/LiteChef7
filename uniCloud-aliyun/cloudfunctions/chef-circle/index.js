'use strict'
/**
 * 厨友圈云函数
 */
const cloud = require('@alicloud/mpserverless-sdk')

exports.main = async (event, context) => {
  const { action, openid, data, postId } = event
  const db = cloud.db()
  const postCollection = db.collection('post')
  const followCollection = db.collection('follow')
  
  try {
    switch (action) {
      case 'createPost': {
        // 发布动态
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
        return { code: 200, message: '发布成功', data: { id: result.id } }
      }
      
      case 'getFeed': {
        // 获取动态流（关注的人 + 自己）
        const { page = 1, pageSize = 10 } = data || {}
        const skip = (page - 1) * pageSize
        
        // 获取关注列表
        const follows = await followCollection.where({ userId: openid }).get()
        const followIds = [openid, ...follows.data.map(f => f.targetUserId)]
        
        const result = await postCollection
          .where({ authorId: db.command.in(followIds) })
          .orderBy('createTime', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
        
        return { code: 200, data: result.data }
      }
      
      case 'getDiscover': {
        // 发现页（所有动态）
        const { page = 1, pageSize = 10 } = data || {}
        const skip = (page - 1) * pageSize
        
        const result = await postCollection
          .orderBy('createTime', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
        
        return { code: 200, data: result.data }
      }
      
      case 'getWishes': {
        // 获取许愿墙
        const result = await postCollection
          .where({ isWish: true })
          .orderBy('createTime', 'desc')
          .limit(20)
          .get()
        
        return { code: 200, data: result.data }
      }
      
      case 'fulfillWish': {
        // 实现许愿（推荐菜谱）
        const { recipeId, recipeName } = data
        await postCollection.doc(postId).update({
          wishFulfilled: true,
          fulfilledBy: openid,
          fulfilledRecipe: { id: recipeId, name: recipeName }
        })
        return { code: 200, message: '已推荐' }
      }
      
      case 'likePost': {
        // 点赞
        await postCollection.doc(postId).update({
          'stats.likes': db.command.inc(1)
        })
        return { code: 200, message: '点赞成功' }
      }
      
      case 'deletePost': {
        // 删除动态
        const post = await postCollection.doc(postId).get()
        if (post.data?.authorId !== openid) {
          return { code: 403, message: '无权限' }
        }
        await postCollection.doc(postId).remove()
        return { code: 200, message: '删除成功' }
      }
      
      case 'follow': {
        // 关注
        const { targetUserId } = data
        if (targetUserId === openid) {
          return { code: 400, message: '不能关注自己' }
        }
        
        // 检查是否已关注
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
        // 取消关注
        const { targetUserId } = data
        const result = await followCollection
          .where({ userId: openid, targetUserId })
          .remove()
        return { code: 200, message: '取消关注' }
      }
      
      case 'getFollowers': {
        // 获取粉丝列表
        const result = await followCollection
          .where({ targetUserId: openid })
          .get()
        return { code: 200, data: result.data }
      }
      
      case 'getFollowing': {
        // 获取关注列表
        const result = await followCollection
          .where({ userId: openid })
          .get()
        return { code: 200, data: result.data }
      }
      
      default:
        return { code: 400, message: '未知操作' }
    }
  } catch (error) {
    console.error('操作失败:', error)
    return { code: 500, message: '操作失败', error: error.message }
  }
}
