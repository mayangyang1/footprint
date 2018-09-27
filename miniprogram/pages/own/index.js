// pages/own/index.js
const utils = require('../../util/utils.js');
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