'use strict'
/**
 * 每周挑战赛云函数
 */
const cloud = require('@alicloud/mpserverless-sdk')

exports.main = async (event, context) => {
  const { action, openid, data, challengeId } = event
  const db = cloud.db()
  const challengeCollection = db.collection('challenge')
  
  try {
    switch (action) {
      case 'getCurrent': {
        // 获取当前挑战赛
        const now = new Date().toISOString()
        let current = await challengeCollection
          .where({ status: 'ongoing' })
          .orderBy('startDate', 'desc')
          .limit(1)
          .get()
        
        // 如果没有，自动创建本周挑战
        if (current.data.length === 0) {
          const themes = [
            { theme: '蛋料理大赏', desc: '用鸡蛋创造美味，煎炒烹炸样样行' },
            { theme: '快手菜挑战', desc: '15分钟内完成的快手料理' },
            { theme: '减脂餐特辑', desc: '低卡美味，健康享瘦' },
            { theme: '家常味道', desc: '记忆中外婆的味道' },
            { theme: '面食争霸', desc: '面条、饺子、包子...面食控集合' },
            { theme: '甜品时光', desc: '治愈系甜品，甜蜜满分' }
          ]
          
          const theme = themes[Math.floor(Math.random() * themes.length)]
          const today = new Date()
          const startDate = today.toISOString().split('T')[0]
          const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          
          const newChallenge = {
            ...theme,
            startDate,
            endDate,
            participants: [],
            status: 'ongoing',
            createTime: now
          }
          
          await challengeCollection.add(newChallenge)
          current = await challengeCollection
            .where({ status: 'ongoing' })
            .limit(1)
            .get()
        }
        
        return { code: 200, data: current.data[0] }
      }
      
      case 'join': {
        // 参与挑战
        const { recipeId, recipeName, recipeImage, userInfo } = data
        
        const challenge = await challengeCollection.doc(challengeId).get()
        if (!challenge.data) {
          return { code: 404, message: '挑战不存在' }
        }
        
        // 检查是否已参与
        const exists = challenge.data.participants?.find(p => p.openid === openid)
        if (exists) {
          return { code: 400, message: '已参与，可更新作品' }
        }
        
        const participant = {
          openid,
          nickname: userInfo?.nickname || '厨友',
          avatar: userInfo?.avatar || '👤',
          recipeId,
          recipeName,
          recipeImage,
          likes: 0,
          joinTime: new Date().toISOString()
        }
        
        await challengeCollection.doc(challengeId).update({
          participants: db.command.push(participant)
        })
        
        return { code: 200, message: '参与成功' }
      }
      
      case 'vote': {
        // 投票
        const { participantId } = data
        
        const challenge = await challengeCollection.doc(challengeId).get()
        if (!challenge.data) {
          return { code: 404, message: '挑战不存在' }
        }
        
        const participants = challenge.data.participants.map(p => {
          if (p.openid === participantId) {
            return { ...p, likes: (p.likes || 0) + 1 }
          }
          return p
        })
        
        await challengeCollection.doc(challengeId).update({ participants })
        return { code: 200, message: '投票成功' }
      }
      
      case 'getHistory': {
        // 获取历史挑战赛
        const result = await challengeCollection
          .where({ status: 'ended' })
          .orderBy('endDate', 'desc')
          .limit(10)
          .get()
        
        return { code: 200, data: result.data }
      }
      
      case 'endChallenge': {
        // 结束挑战赛（选出获胜者）
        const challenge = await challengeCollection.doc(challengeId).get()
        if (!challenge.data) {
          return { code: 404, message: '挑战不存在' }
        }
        
        // 找出票数最高的
        const participants = challenge.data.participants || []
        if (participants.length === 0) {
          await challengeCollection.doc(challengeId).update({ status: 'ended' })
          return { code: 200, message: '无人参与' }
        }
        
        const winner = participants.reduce((a, b) => (a.likes > b.likes ? a : b))
        
        await challengeCollection.doc(challengeId).update({
          status: 'ended',
          winnerId: winner.openid
        })
        
        return { code: 200, message: '挑战结束', data: { winner } }
      }
      
      default:
        return { code: 400, message: '未知操作' }
    }
  } catch (error) {
    console.error('操作失败:', error)
    return { code: 500, message: '操作失败', error: error.message }
  }
}
