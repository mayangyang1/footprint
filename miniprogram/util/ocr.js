let md5 = require('md5.js')
let app_id = '2111275020'//自己的appid
let app_key = 'o2D1urIzGlYzbsnr';//自己的appkey
let faceageUrl = 'https://api.ai.qq.com/fcgi-bin/ocr/ocr_idcardocr';
//身份证检测接口
let faceageRequest = (base64Img, callback) => {
  //拼接鉴权必须的参数
  let params = {
    app_id: app_id,
    image: base64Img,
    nonce_str: Math.random().toString(36).substr(2),
    time_stamp: parseInt(new Date().getTime() / 1000).toString(),
    card_type: 0
  }
  params['sign'] = _genRequestSign(params)
  //发送接口请求
  wx.request({
    url: faceageUrl,
    data: params,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (res) {
      callback.success(res.data)
    },
    fail: function (res) {
      if (callback.fail)
        callback.fail()
    }
  })
}
//对参数进行排序MD5计算
let _genRequestSign = (params) => {
  // 1. 对请求参数按字典升序排序
  params = _sortObject(params)
  // 2. 拼接键值对，value部分进行URL编码
  let paramStr = ''
  let keys = Object.keys(params)
  for (let idx in keys) {
    let key = keys[idx]
    paramStr += key + '=' + encodeURIComponent(params[key]) + '&'
  }
  // 3. 拼接key
  paramStr += 'app_key=' + app_key
  // 4. md5
  return md5.hexMD5(paramStr).toUpperCase()
}
//对KEY进行排序
let _sortObject = (obj) => {
  var keys = Object.keys(obj).sort()
  var newObj = {}
  for (var i = 0; i < keys.length; i++) {
    newObj[keys[i]] = obj[keys[i]]
  }
  return newObj
}
//暴露出去的接口
module.exports = {
  faceageRequest: faceageRequest
}