// pages/createFootprints/index.js
const utils = require('../../util/utils.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    title: '',
    imageId: '../../images/pic.png',
    latitude: '',
    longitude: '',
    click: true
  },
  bindContent(e) {
    let content = e.detail.value;
    this.setData({content: content});
  },
  bindTitle(e) {
    let title = e.detail.value;
    this.setData({title: title})
  },
  bindUploadImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        let randomNum = Date.parse(new Date());
        // 上传图片
        const cloudPath = `record-image${randomNum}` + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            // app.globalData.fileID = res.fileID
            // app.globalData.cloudPath = cloudPath
            // app.globalData.imagePath = filePath
            that.setData({ imageId: res.fileID })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
    
  },
  getLocationWebsite() {
    const that = this;
    wx.getLocation({
      type:'gcj02',
      success(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      complete() {
        that.bindCreateFootprints()
      }
    })
  },
  bindCreateFootprints() {
    const that = this;
    const click = that.data.click;
    const userInfo = wx.getStorageSync('userInfo');
    let nowData = utils.formatTime(new Date())
    if(that.data.content === '') {
      return wx.showToast({
        title: '描述不能为空',
      })
    }
    if(that.data.title === '') {
      return wx.showToast({
        title: '签名不能为空',
      })
    }
    if (that.data.imageId.indexOf('images/pic') > 0) {
      return wx.showToast({
        title: '图片不能为空',
      })
    }
    if(click) {
      that.setData({click: false});
      wx.showLoading({
        title: '创建中...',
      })
      wx.cloud.callFunction({
        name: 'record',
        data: {
          content: that.data.content,
          title: that.data.title,
          imageId: that.data.imageId,
          createTime: nowData,
          latitude: that.data.latitude,
          longitude: that.data.longitude,
          avatarUrl: userInfo.avatarUrl,
          userName: userInfo.nickName
        },
        success: res => {
          wx.showToast({
            title: '创建成功',
            mask: true
          })
          setTimeout(() => {
            var pages = getCurrentPages();
            let prePage = pages[pages.length-2];
            prePage.data.recordList = [];
            prePage.data.page = 0;
            prePage.getuserRecordList();
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '调用失败',
          })
          console.error('[云函数] [sum] 调用失败：', err)
        },
        complete() {
          wx.hideLoading();
          that.setData({click: true})
        }
      })
    }
   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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