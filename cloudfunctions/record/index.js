const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('records').add({
      data: {
        content: event.content,
        title: event.title,
        imageId: event.imageId,
        createTime: event.createTime,
        _openid: event.userInfo.openId,
        avatarUrl: event.avatarUrl,
        userName: event.userName,
        id:1,
        latitude: event.latitude || '',
        longitude: event.longitude || '',
        fabulous: [], //点赞集合
        comment: [], //评论集合
        isFabulous: false, //是否已经点赞
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        wx.showToast({
          title: '新增记录成功',
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  } catch(e) {
    console.log(e)
  }
  
}