// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  try {
   await db.collection('records').doc(event.id).update({
     data: {
       comment: _.unshift(event.userInfo.openId)
     }
   })
    await db.collection('comment').add({
      data:{
        post_id: event.userInfo.openId, //发表者的id值
        theme_id: event.id, //主题id
        theme_title: event.comment_value, //主题内容
        son_comment_id:[], // 主题下二级评论
        create_time: event.create_time, //创建时间
        avatarUrl: event.avatarUrl, //创建者头像
        userName: event.userName, //创建者昵称
      },
      success(res) {
        console.log(res)
      }
    })
   return await db.collection('comment').where({
     theme_id: event.id
   }).orderBy('create_time', 'desc').get({
      success(res) {
        console.log(res)
      }
    })
  }catch(e) {
    console.log(e)
  }
}