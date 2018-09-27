// pages/footprintsDetail/index.js
const utils = require('../../util/utils.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    dataObj: {},
    fabulousList: [],
    commentId:'',
    isComment: false,
    commentValue: '',
  },
  bindSeeImage(e) {
    let url = e.currentTarget.dataset.id;
    wx.previewImage({
      urls: [url],
      current: url,
    })
  },
  bindComment(e) {
    let id = e.currentTarget.dataset.id;
    const _openid = wx.getStorageSync('openid');
    if (_openid){
      this.setData({ commentId: id, isComment: true })
    }else{
      wx.showToast({
        title: '请先登录...',
        icon: 'none'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '../own/index',
        })
      }, 2000)
    }
  },
  bindCommentValue(e) {
    let comment = e.detail.value;
    this.setData({ commentValue: comment })
  },
  bindRelease(e) { //发表评论
    const that = this;
    const _id = e.currentTarget.dataset.id;
    const comment_value = this.data.commentValue;
    const nowData = utils.formatTime(new Date())
    const db = wx.cloud.database();
    wx.showLoading({
      title: '发表中',
    })
    const _openid = wx.getStorageSync('openid');
    db.collection('user_info').where({
      _openid: _openid
    }).field({
      avatarUrl: true,
      userName: true
    }).get({
      success: res => {
        const userInfo = res.data[0];
        wx.cloud.callFunction({
          name: 'comment',
          data: {
            id: _id, //选项卡记录id
            comment_value: comment_value, // 评论内容
            create_time: nowData,
            avatarUrl: userInfo.avatarUrl,
            userName: userInfo.userName,
          },
          success(res) {
            that.data.dataObj.comment_item_list = res.result.data;
            that.setData({ dataObj: that.data.dataObj, commentId: '', commentValue: '' })
          },
          complete() {
            wx.hideLoading();
          }
        })
      }
    })
    

  },
  bindFalous(e) { //点赞
    let id = e.currentTarget.dataset.id;
    const _openid = wx.getStorageSync('openid');
    if (_openid) {
      const that = this;
      wx.showLoading({
        title: '处理中...',
      })
      wx.cloud.callFunction({
        name: 'fabulous',
        data: {
          id: id
        },
        success(res) {
          const db = wx.cloud.database();
          db.collection('records').doc(id).field({
            isFabulous: true,
            fabulous: true
          }).get({
            success: (_res) => {
              const fabulousList = _res.data;
              that.data.dataObj['isFabulous'] = fabulousList.isFabulous
              that.data.dataObj['fabulous'] = fabulousList.fabulous
              that.setData({ dataObj: that.data.dataObj })
            }
          })

        },
        complete() {
          wx.hideLoading();
        }
      })
    }else{
      wx.showToast({
        title: '请先登录...',
        icon:'none'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '../own/index',
        })
      }, 2000)
    }
    
  },
  getFootPrintsDetails(id) {
    const that = this;
    const db = wx.cloud.database();
    db.collection('records').doc(id).get({
      success: (res) => {
        const dataObj = res.data;
        db.collection('comment').where({
          theme_id: id
        }).orderBy('create_time', 'desc').get({
          success: (_res) => {
            console.log(res);
            dataObj['comment_item_list'] = _res.data;
            that.setData({ dataObj: dataObj});
          },
          complete: () => {
          }
        })
        const openId = wx.getStorageSync('openid');
        if (dataObj.fabulous.includes(openId)) {
          dataObj.isFabulous = true;
        } else {
          dataObj.isFabulous = false;
        }
        let longitude = dataObj.longitude;
        let latitude = dataObj.latitude;
        let locatinString = `${longitude},${latitude}`
        app.qqmapsdk.getRegeo({
          location: locatinString,
          success: function (data) {
            //成功回调
            if (data.length > 0) {
              const item = data[0];
              const address = item.regeocodeData.formatted_address;
              dataObj['addressName'] = address;
              that.setData({
                dataObj: dataObj
              })
            }
          },
          fail: function (info) {
            //失败回调
            console.log(info)
          }
        })
        that.setData({ dataObj: dataObj });
      }
    })

  },
  bindSeeAdress(e) {
    const longitude = Number(e.currentTarget.dataset.longitude);
    const latitude = Number(e.currentTarget.dataset.latitude);
    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })
  },
  bindReturnBack() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    this.setData({id: id});
    this.getFootPrintsDetails(id);
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
  onShareAppMessage: function (res) {
    const that = this;
    let num = Math.ceil(Math.random() * 10);
    if(num > 5) {
      num = 5;
    }
    if (res.from === 'button') {
      return {
        title: '足迹',
        path: `/pages/footprintsDetail/index?id=${that.data.id}`,
        imageUrl: `/images/cat${num}.jpg`
      }
    }else if(res.from === 'menu') {
      return {
        title: '足迹',
        path: `/pages/footprintsDetail/index?id=${that.data.id}`,
        imageUrl: `/images/cat${num}.jpg`
      }
    }
  }
})