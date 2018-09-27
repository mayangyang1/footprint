// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    
    const message = await db.collection('records').doc(event.id).remove({
      success(res){
        
      }
    })
    await db.collection('comment').where({
      theme_id: event.id
    }).remove();
    const fileIDs = [event.imageId];
    const result = await cloud.deleteFile({
      fileList: fileIDs,
    })
    return { message, result}
  } catch (e) {
    console.log(e)
  }
}