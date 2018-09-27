//index.js
const utils = require('../../util/utils.js');
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    recordList: [],
    page:0,
    size:10,
    commentId: '',
    commentValue: '',
  },
  bindComment(e) {
    let id = e.currentTarget.dataset.id;
    const _openid = wx.getStorageSync('openid');
    if(_openid) {
      this.setData({ commentId: id });
    }else{
      wx.switchTab({
        url: '../own/index',
      })
    }
    
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
    console.log(_openid);
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
            that.data.recordList.forEach((_v, _i) => {
              if (_v._id === res.result.data[0].theme_id) {
                _v.comment_item_list = res.result.data;
              }
            })
            that.setData({ recordList: that.data.recordList, commentId: '', commentValue: '' })
          },
          complete(){
            wx.hideLoading();
          }
        })
      }
    })
    
  },
  bindCommentValue(e) {
    let comment = e.detail.value;
    this.setData({ commentValue: comment})
  },
 
  bindFalous(e) { //点赞
    let id = e.currentTarget.dataset.id;
    const _openid = wx.getStorageSync('openid');
    if(_openid) {
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
          console.log(res.result.data)
          const fabulousList = res.result.data;
          that.setData({ fabulousList: fabulousList })
        },
        complete() {
          wx.hideLoading();
        }
      })
    }else{
      wx.showToast({
        title: '请先登录...',
        icon: 'none'
      })
      setTimeout(()=>{
        wx.switchTab({
          url: '../own/index',
        })
      },2000)
      
    }
  
  },
  getuserRecordList() {
    const that = this;
    let page = this.data.page;
    let size = this.data.size;
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    wx.showLoading({
      title: '加载中...',
    })
    if(page === 0) {
      db.collection('records').where({
        id: 1
      }).orderBy('createTime', 'desc').limit(size).get({
        success: res => {

          if(res.data.length){
            that.data.recordList = res.data;
            page++;
            for(let _i=0; _i< that.data.recordList.length; _i++) {
              let longitude = that.data.recordList[_i].longitude;
              let latitude = that.data.recordList[_i].latitude;
              let locatinString = `${longitude},${latitude}`
              db.collection('comment').where({
                theme_id: that.data.recordList[_i]._id
              }).orderBy('create_time', 'desc').get({
                success: (res) => {
                  console.log(res);
                  that.data.recordList[_i]['comment_item_list'] = res.data;
                  that.setData({ recordList: that.data.recordList});
                  
                },
                complete:() => {
                  console.log(this.data.recordList)
                }
              })
            }
            that.setData({
              page: page
            })
            const openId = wx.getStorageSync('openid');
            wx.cloud.callFunction({
              name: 'fabulous',
              data: {
                id: ''
              },
              success(res) {
                const fabulousList = res.result.data;
                fabulousList.forEach((v, i) => {
                  if (v.fabulous.includes(openId)){
                    v.isFabulous = true;
                  }else{
                    v.isFabulous = false;
                  }
                  that.setData({ fabulousList: fabulousList })
                })
                
              },
              complete() {
                wx.hideLoading();
              }
            })
          }
          
          wx.stopPullDownRefresh();
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        },
        complete() {
          wx.hideLoading();
          console.log(this.data.recordList)
        }
      })
    }else {
      db.collection('records').where({
        id: 1
      }).orderBy('createTime', 'desc').limit(size).skip(10*page).get({
        success: res => {
          if (res.data.length) {
            that.data.recordList = that.data.recordList.concat(res.data);
            for (let _i = 0; _i < that.data.recordList.length; _i++) {
              db.collection('comment').orderBy('create_time', 'desc').get({
                success: (vlue) => {
                  that.data.recordList[_i]['comment_item_list'] = res.data;
                  that.setData({ recordList: that.data.recordList });
                }
              })
              
            }
            that.setData({
              page: page
            })
          }

          wx.stopPullDownRefresh();
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        },
        complete() {
          wx.hideLoading();
          console.log(this.data.recordList)
        }
      })
    }
  },
  bindDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../footprintsDetail/index?id=${id}`,
    })
  },
 
  bindDeleatItem(e) {
    const that = this;
    let _id = e.currentTarget.dataset.id;
    let imageId = e.currentTarget.dataset.imageid;
    wx.showModal({
      title: '提示',
      content: '确认删除?',
      success(res) {
        if(res.confirm) {
          wx.cloud.callFunction({
            name: 'remove',
            data: {
              id: _id,
              imageId: imageId
            },
            success(res) {
              that.setData({ recordList: [], page: 0 })
              that.getuserRecordList()
            }
          })
        }
      }
    })
    
  },
  bindCreateFootprints() {
    const userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo)
    if (userInfo) {
      wx.navigateTo({
        url: '../createFootprints/index',
      })
    }else{
      wx.switchTab({
        url: '../own/index',
      })
    }
  },
  onShow() {
    this.setData({ recordList: [], page: 0 })
    this.getuserRecordList();
    
  },
  onLoad: function() {
    
  },
  onPullDownRefresh() {
    this.setData({ recordList: [], page:0 })
    this.getuserRecordList()
  },
  onReachBottom() {
    
    this.getuserRecordList()
  },
  onShareAppMessage(res) {
    return {
      title: '足迹',
      path: '/pages/index/index',
      imageUrl: '/images/cat3.png'
    }
  }
   
})
