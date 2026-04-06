// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, data, recipeId, openid } = event
  
  const recipeCollection = db.collection('recipe')
  
  try {
    switch (action) {
      case 'create': {
        // 创建菜谱
        const now = new Date().toISOString()
        const recipe = {
          ...data,
          authorId: openid,
          createTime: now,
          updateTime: now,
          stats: { views: 0, likes: 0, favorites: 0, comments: 0 },
          status: 'approved',
          isFeatured: false
        }
        
        const result = await recipeCollection.add(recipe)
        return { code: 200, message: '发布成功', data: { id: result._id } }
      }
      
      case 'getList': {
        // 获取菜谱列表
        const { page = 1, pageSize = 10, filter } = data || {}
        const skip = (page - 1) * pageSize
        
        let query = { status: 'approved' }
        if (filter?.cuisine) query.cuisine = filter.cuisine
        if (filter?.difficulty) query.difficulty = filter.difficulty
        if (filter?.mood) query.mood = filter.mood
        if (filter?.authorId) query.authorId = filter.authorId
        
        const result = await recipeCollection
          .where(query)
          .orderBy('createTime', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
        
        return { code: 200, data: result.data }
      }
      
      case 'getDetail': {
        // 获取菜谱详情
        if (!recipeId) return { code: 400, message: '缺少 recipeId' }
        
        const recipe = await recipeCollection.doc(recipeId).get()
        
        if (!recipe.data) {
          return { code: 404, message: '菜谱不存在' }
        }
        
        // 增加浏览量
        await recipeCollection.doc(recipeId).update({
          'stats.views': _.inc(1)
        })
        
        return { code: 200, data: recipe.data }
      }
      
      case 'update': {
        // 更新菜谱
        if (!recipeId) return { code: 400, message: '缺少 recipeId' }
        
        const recipe = await recipeCollection.doc(recipeId).get()
        
        if (recipe.data?.authorId !== openid) {
          return { code: 403, message: '无权限' }
        }
        
        await recipeCollection.doc(recipeId).update({
          ...data,
          updateTime: new Date().toISOString()
        })
        
        return { code: 200, message: '更新成功' }
      }
      
      case 'delete': {
        // 删除菜谱
        if (!recipeId) return { code: 400, message: '缺少 recipeId' }
        
        const recipe = await recipeCollection.doc(recipeId).get()
        
        if (recipe.data?.authorId !== openid) {
          return { code: 403, message: '无权限' }
        }
        
        await recipeCollection.doc(recipeId).remove()
        return { code: 200, message: '删除成功' }
      }
      
      case 'search': {
        // 搜索菜谱
        const { keyword } = data
        const result = await recipeCollection
          .where({
            status: 'approved',
            name: db.RegExp({ regexp: keyword, options: 'i' })
          })
          .limit(20)
          .get()
        
        return { code: 200, data: result.data }
      }
      
      case 'getFeatured': {
        // 获取精选菜谱
        const result = await recipeCollection
          .where({ status: 'approved', isFeatured: true })
          .orderBy('stats.likes', 'desc')
          .limit(10)
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
