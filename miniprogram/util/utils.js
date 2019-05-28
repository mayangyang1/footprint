var gaodemap = null;

function formatNumber(n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

function formatTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('-')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}
/**
 * 公用地址
 */
const mainUrl = {
  yfb: 'https://rltx2-yfb-gateway.rltx.com', // 预发布
  rlyshj: 'https://yanshigateway.rltx.com', //企业端演示环境
  xd: 'https://gateway.xdwliu.com', //信达物流
  htys: 'https://gateway.haotianys.com', //浩田物流
  arlys: 'https://gateway.anruilong.com', //安瑞隆物流
  ksys: 'https://gateway.nmgkswl.com', //凯顺物流
  wcys: 'https://gateway.nmglabei.com', //万创物流
  whtys: 'https://gateway.wht56.com', //万和通物流
  jzys: 'https://gateway.jzwl66.com', //九州物流
  mmyd: 'https://gateway.mmydwl.cn', //茂名远大物流
  dfxw: 'https://wccygw.hopekc.cn', //东方希望物流
  xtwl: 'https://gateway.xtjy.com.cn', //鑫泰物流
  tdwl: 'https://gateway.tdsxwl.com', //天盾物流
  zkpa: 'https://pinggateway.rltx.com', //周口平安
  ltwl: 'https://ltjagateway.rltx.com', //龙泰
}
const hostUrl = mainUrl.yfb;
/**
 * 获取当前页面的路径
 */
const getCurrentRouteUrl = () => {
  var pages = getCurrentPages(); //小程序方法
  var currentPage = pages[pages.length - 1];
  var currentRouteUrl = currentPage.route;
  return currentRouteUrl;
}
/**
 * 获取cookie并储存到storage里;
 */
const getCookieAndSaveInStorage = res => {
  const cookiestr = res.header['Set-Cookie'];
  const cookiesarr = cookiestr.split(';');
  for (let data of cookiesarr) {
    if (data.indexOf('JSESSIONID') != -1) {
      let itemar = data.split('=');
      const cookies = itemar[itemar.length - 1];
      //保存小程序cookies
      wx.setStorageSync("cookies", cookies);
    }
  }
}
/**
 * 封装微信的ajax
 */
const ajax = (types, url, params, callfunc, attch) => {
  let that = this;
  if (url == '' || types == '') return;
  params = params || {};
  let cookie = wx.getStorageSync('cookies');
  callfunc = callfunc || {};
  wx.showNavigationBarLoading();
  wx.request({
    url: url,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'charset': 'UTF-8',
      'Cookie': 'JSESSIONID=' + cookie
    },
    method: types,
    data: params,
    success(res) {
      if (res.data.code === 501) { //用户没有登录
        wx.redirectTo({ //调到登录页去登录
          url: '/pages/login/index'
        })
      }
      if (res.data.code === 500) {
        return errorToast(res.data.content);
      }
      if (res.data.code === 3003) {
        return errorToast(res.data.content);
      }
      if (isLogin(res) && callfunc.success) {
        callfunc.success(res, attch)
      }
    },
    complete(res) {
      wx.hideNavigationBarLoading();
      if (callfunc.complete) callfunc.complete(res, attch);
    },
    fail(res) {
      if (callfunc.fail) callfunc.fail(res, attch);
    }
  })
}
/**
 * 判断微信登录用户是否注册
 */
const isLogin = (res) => {
  var that = this;
  if (res.statusCode === 401) { //session失效
    wx.reLaunch({
      url: '/pages/login/index'
    })
    return false;
  } else {
    return true;
  }
}
/**
 * 调用方式封装(get,post)
 */
const postAjax = (url, params, callfunc) => {
  ajax("POST", url, params, callfunc);
}

const getAjax = (url, callfunc, attch) => {
  ajax("GET", url, {}, callfunc, attch);
}
/**
 * 防抖函数
 */
const debounce = (fun, delay) => { //防抖函数
  return function (args) {
    let that = this
    let _args = args
    clearTimeout(fun.id)
    fun.id = setTimeout(function () {
      fun.call(that, _args)
    }, delay)
  }
}

/**
 * 显示方法
 */
const errorToast = (title) => {
  wx.showToast({
    title: title,
    image: '/images/sb.png',
    mask: true
  });
}
const successToast = (title) => {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: 2000,
    mask: true
  });
}
const tipsToast = (title) => {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: 2000,
    mask: true
  });
}
const loading = (status, title, url) => {
  if (status) {
    var title = title || '数据保存中...';
    wx.showLoading({
      title: title,
      mask: true
    })
  } else {
    wx.hideLoading();
    var title = title || '保存成功';
    wx.showToast({
      title: title,
      icon: 'succes',
      duration: 1000,
      mask: true,
      success: function () {
        setTimeout(function () {
          console.log('url: ' + url);
          if (!url || url == 1 || url == 2 || url == 3) {
            var params = (url > 0) ? {
              delta: url
            } : {};
            wx.navigateBack(params)
          } else {
            wx.navigateTo({
              url: url
            });
          }
        }, 1000);
      }
    })
  }
}

export {
  formatTime,
  ajax,
  postAjax,
  getAjax,
  errorToast,
  successToast,
  tipsToast,
  loading,
  debounce
}