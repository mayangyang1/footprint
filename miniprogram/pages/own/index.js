// pages/own/index.js
const utils = require('../../util/utils.js');
var api = require('../../util/ocr.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:'../../images/users.png',
    logged: false,
    userInfo: {},
    oepnId: '',
    img: ''
  },
  onGetUserInfo: function(e) {
    wx.showLoading({
      title: '登录...',
    })
    setTimeout(()=>{
      if (!this.logged && e.detail.userInfo) {
        this.setData({
          logged: true,
          avatarUrl: e.detail.userInfo.avatarUrl,
          userInfo: e.detail.userInfo
        })
        wx.setStorageSync('userInfo', this.data.userInfo);
      }
      this.onGetOpenid()
    }, 1000)
    
  },
  onGetOpenid: function () {
    const that = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        let openId = res.result.openid
        wx.setStorageSync('openid', openId)
        that.setData({ oepnId: openId})
        const db = wx.cloud.database();
        db.collection('user_info').where({
          _openid: openId
        }).get({
          success: res => {
            console.log(res)
            const user_info_list = res.data.length ? true : false;
            if (user_info_list) {
              return user_info_list
            } else {
              db.collection('user_info').add({
                data: {
                  openId: openId, //用户id值
                  avatarUrl: that.data.userInfo.avatarUrl, //用户头像
                  userName: that.data.userInfo.nickName, //用户昵称
                  createTime: utils.formatTime(new Date()), //用户创建时间
                }
              })
            }
          }
        })
        
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      },
      complete: ()=>{
        wx.hideLoading();
      }
    })
    
    
  },
  bindLoginOut() {
    const that = this;
    wx.showLoading({
      title: '退出...',
    })
    setTimeout(()=> {
      wx.clearStorageSync({
        success(res) {

        }
      })
      that.setData({
        logged: false,
        userInfo: {}
      })
      wx.hideLoading();
    },1000)
   
  },
  bindtaps() {
    const that = this;
    let timeStamp = parseInt((new Date().getTime() / 1000));
    wx.chooseImage({
      count: 1, // 默认9
      //sizeType: ['original', 'compressed'],
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: function (res) {
        var fs = wx.getFileSystemManager();
        fs.readFile({
          filePath: res.tempFilePaths[0].toString(),
          encoding: 'base64',
          success(result) {
            //获取到图片的base64 进行请求接口
            api.faceageRequest(result.data, {
              success(result) {
                var code = result.ret;
                if (code == 0) {
                  wx.hideLoading();
                  that.setData({
                    img: 'data:image/png;base64,' + result.data.frontimage
                  })
                } else {
                  wx.hideLoading();
                  wx.showModal({
                    title: '错误提示',
                    content: result.msg,
                    showCancel: false
                  })
                }
              }
            })
          }
        })
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ 
        logged: true,
        userInfo: userInfo,
        oepnId: ''
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})