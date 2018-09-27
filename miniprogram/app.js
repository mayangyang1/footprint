const amapFile = require('./lib/amap-wx.js');
var qqmapsdk;
//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true
      })
    }
    // 实例化API核心类
    qqmapsdk = new amapFile.AMapWX({
      key: 'e96b189390d85354f8e3e4a1cbf0c3ed'
    });

    this.qqmapsdk = qqmapsdk;
  },
  qqmapsdk: '',
  globalData: {}
})
