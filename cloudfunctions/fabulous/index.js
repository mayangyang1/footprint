// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const doc_id = event.id || '';
    if (doc_id) {
      let falousArr = await db.collection('records').doc(doc_id).field({
        fabulous: true
      }).get({
        success(res) {
          return JSON.parse(res.data.fabulous);
        }
      })
      falousArr = falousArr.data.fabulous;
      let newArr = [];
      if (falousArr.includes(event.userInfo.openId)) {
        falousArr.forEach((_value, i) =>{
          if (_value != event.userInfo.openId) {
            newArr.push(_value);
          }
        })
        // newArr = falousArr.reduce((arr, _value) => {
        //   if (_value != event.userInfo.openId){
        //     arr.push(_value)
        //   }
        // },[])
        await db.collection('records').doc(doc_id).update({
          data: {
            fabulous:newArr,
            isFabulous: false
          }
        })
      } else {
        await db.collection('records').doc(doc_id).update({
          data: {
            fabulous: _.push(event.userInfo.openId),
            isFabulous: true
          }
        })
      }
    }
    return await db.collection('records').field({
      isFabulous: true,
      createTime: true,
      fabulous: true,
    }).orderBy('createTime', 'desc').get()
  }catch(e) {
    console.log(e)
  }
}