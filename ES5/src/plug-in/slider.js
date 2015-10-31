/* 焦点图      "焦点图\焦点图35_向上或向下覆盖_略缩图_水平.html"*/
//用法
/*
var slider1 = new Slider({
    targetElement: 'J_slider_2',//选择焦点图ID
    pattern:['commonMoveLeft'],//选择动画风格
    overORclick:'click',//鼠标触发方式
    seamless:true,//是否无缝轮播
    autoTimetof:true,//是否自动播放
    autoMs:8000,//自动播放间隔时间
    showMarkerText:true,//是否生成图片详细信息
    showMarkerPics: true,//是否生成图片略缩图样式  2选1
    picswORh:"height",// 获取略缩图的宽还是高
    picNum:4,//显示略缩图的数目；
    showMarkers: true,//是否生成图片序列号   2选1
    showMarkersNum: false,//是否生成图片序列号数字
    showControls: false,//是否显示上一页与下一页
    showControlsA: true //是否动画显示上一页与下一页
});

修复IE8以下轮播图响应式问题
var doc_w = $(window).width();
var li = $("#J_slider_2 ul li");
if (doc_w > 1199) {
    slider1.width = 1198;
} else {
    slider1.width = 998;
};
$(window).resize(function () {
    var doc_w = $(window).width();
    if (doc_w > 1199) {
        slider1.width = 1198;
    } else {
        slider1.width = 998;
    };
});

*/


/*轮播图*/
(function(global, factory) {

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.document ?
      factory(global, true) :
      function(w) {
        if (!w.document) {
          throw new Error("Position requires a window with a document");
        }
        return factory(w);
      };
  } else {
    factory(global);
  }

  // Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
  "use strict";

  var animateID = {};

  var Browser = (function(ua) {
    var b = {
      msie: /msie/.test(ua) && !/opera/.test(ua),
      opera: /opera/.test(ua),
      safari: /webkit/.test(ua) && !/chrome/.test(ua),
      firefox: /firefox/.test(ua),
      chrome: /chrome/.test(ua)
    };
    var vMark = "";
    for (var i in b) {
      if (b[i]) {
        vMark = "safari" == i ? "version" : i;
        break;
      };
    };
    b.version = vMark && RegExp("(?:" + vMark + ")[\\/: ]([\\d.]+)").test(ua) ? RegExp.$1 : "0";
    b.ie = b.msie;
    b.ie6 = b.msie && parseInt(b.version, 10) == 6;
    b.ie7 = b.msie && parseInt(b.version, 10) == 7;
    b.ie8 = b.msie && parseInt(b.version, 10) == 8;
    b.ie9 = b.msie && parseInt(b.version, 10) == 9;
    b.ie10 = b.msie && parseInt(b.version, 10) == 10;
    return b;
  })(window.navigator.userAgent.toLowerCase());


  function extend(destination, source, override) {
    if (override === undefined) override = true;
    for (var property in source) {
      if (override || !(property in destination)) {
        destination[property] = source[property];
      };
    };
    return destination;
  };

  function bindFunction(object, fun) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function() {
      return fun.apply(object, args.concat(Array.prototype.slice.call(arguments)));
    };
  };

  function getElementsByClassName(fatherId, tagName, className) {
    var node = fatherId && document.getElementById(fatherId) || document;
    tagName = tagName || "*";
    className = className.split(" ");
    var classNameLength = className.length;
    for (var i = 0, j = classNameLength; i < j; i++) {
      className[i] = new RegExp("(^|\\s)" + className[i].replace(/\-/g, "\\-") + "(\\s|$)");
    };
    var elements = node.getElementsByTagName(tagName);
    var result = [];
    for (var i = 0, j = elements.length, k = 0; i < j; i++) {
      var element = elements[i];
      while (className[k++].test(element.className)) {
        if (k === classNameLength) {
          result[result.length] = element;
          break;
        };
      };
      k = 0;
    };
    return result;
  };


  function addEventListener(oTarget, sEventType, fnHandler) {
    if (oTarget.addEventListener) {
      oTarget.addEventListener(sEventType, fnHandler, false);
    } else if (oTarget.attachEvent) {
      oTarget.attachEvent("on" + sEventType, fnHandler);
    } else {
      oTarget["on" + sEventType] = fnHandler;
    };
  };

  function removeEventListener(oTarget, sEventType, fnHandler) {
    if (oTarget.removeEventListener) {
      oTarget.removeEventListener(sEventType, fnHandler, false);
    } else if (oTarget.detachEvent) {
      if (fnHandler) {
        oTarget.detachEvent("on" + sEventType, fnHandler);
      } else {
        oTarget.detachEvent("on" + sEventType);
      }
    } else {
      oTarget["on" + sEventType] = null;
    };
  };

  function getStyle(elem, name) {
    var camelize = function(s) {
      return s.replace(/-([a-z])/ig,
        function(all, letter) {
          return letter.toUpperCase();
        });
    };
    if (document.defaultView) {
      var style = document.defaultView.getComputedStyle(elem, null);
      return name in style ? style[name] : style.getPropertyValue(name);
    } else {
      var style = elem.style,
        curStyle = elem.currentStyle;
      if (name == "opacity") {
        if (/alpha\(opacity=(.*)\)/i.test(curStyle.filter)) {
          var opacity = parseFloat(RegExp.$1);
          return opacity ? opacity / 100 : 0;
        };
        return 1;
      };
      if (name == "float") {
        name = "styleFloat";
      };
      var ret = curStyle[name] || curStyle[camelize(name)];
      if (!/^-?\d+(?:px)?$/i.test(ret) && /^\-?\d/.test(ret)) {
        var left = style.left,
          rtStyle = elem.runtimeStyle,
          rsLeft = rtStyle.left;

        rtStyle.left = curStyle.left;
        style.left = ret || 0;
        ret = style.pixelLeft + "px";

        style.left = left;
        rtStyle.left = rsLeft;
      };
      return ret;
    };
  };


  function setOpacity(elem, num) {
    console.log(num)
    if (elem.filters) {
      elem.style.filter = "alpha(opacity=" + num + ")";
    } else {
      elem.style.opacity = num / 100;
    };
  };

  /*设置元素的px值*/
  function setAnimateStyle(elem, value, attr, m) {
    elem.style[attr] = Math[m](value) + 'px';
  };

  /*动画执行函数*/
  function animate(elem, attr, value, time, type, funcBefore, funcAfter, ID) {
    var isOpacity = attr === 'opacity',
      diffValue = false;
    funcBefore && funcBefore.call();
    if (typeof value === 'string') {
      if (/^[+-]=\d+/.test(value)) value = value.replace('=', ''), diffValue = true;
      value = parseFloat(value);
    };
    var oriVal = parseInt(getStyle(elem, attr)), //原始属性值
      b = isNaN(oriVal) ? 0 : oriVal, //开始值,无值时为0
      c = diffValue ? value : value - b, //差值
      d = time, //总运行时间
      e = easing[type], //缓动类型
      m = c > 0 ? 'ceil' : 'floor', //取最大绝对值
      setProperty = isOpacity ? setOpacity : setAnimateStyle, //属性设置方法
      origTime = (new Date) * 1, //原始时间值
      iID = ID ? ID : "JCL"; //计数器id
    animateID[iID] && window.cancelAnimationFrame(animateID[iID]);

    function go() {
      var t = (new Date) - origTime; //已运行时间
      if (t <= d) {
        setProperty(elem, e(t, b, c, d), attr, m);
        animateID[iID] = window.requestAnimationFrame(go);
      } else {
        setProperty(elem, b + c, attr, m); //设置最终值
        window.cancelAnimationFrame(animateID[iID]);
        animateID[iID] = null;
        funcAfter && funcAfter.call();
      };
    };
    animateID[iID] = window.requestAnimationFrame(go);
  };

  /*根据给定的 iID 值，来停止相对应的动画*/
  function animateStop(iID) {
    window.cancelAnimationFrame(animateID[iID]);
  };

  /*动画扩展算法*/
  var easing = {
    linear: function(t, b, c, d) {
      return c * t / d + b;
    },
    quartIn: function(t, b, c, d) { /*easeIn*/
      return c * (t /= d) * t * t * t + b;
    },
    quartOut: function(t, b, c, d) { /*easeOut*/
      return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    quartInOut: function(t, b, c, d) { /*easeInOut*/
      if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
      return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    sineInOut: function(t, b, c, d) { /*swing*/
      return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    }
  };

  function each(object, callback) {
    if (undefined === object.length) {
      for (var name in object) {
        if (false === callback(object[name], name, object)) break;
      }
    } else {
      for (var i = 0, len = object.length; i < len; i++) {
        if (i in object) {
          if (false === callback(object[i], i, object)) break;
        }
      }
    };
  };

  function forEach(object, callback, thisp) {
    each(object, function() {
      callback.apply(thisp, arguments);
    });
  };

  var Slider = function(options) {
    this._initialize(options);
  };

  Slider.prototype = {
    _initialize: function(options) {
      var opt = this._setOptions(options);

      this.target = opt.targetElement;
      this.showMarkerPics = opt.showMarkerPics;
      this.MarkerPicsAuto = opt.MarkerPicsAuto;
      this.picswORh = opt.picswORh;
      this.picNum = opt.picNum;
      this.showMarkers = opt.showMarkers;
      this.showMarkersNum = opt.showMarkersNum;
      this.showControls = opt.showControls;
      this.showControlsA = opt.showControlsA;
      this.showMarkerText = opt.showMarkerText;
      this.overORclick = opt.overORclick;
      this.pattern = opt.pattern;
      this.seamless = opt.seamless;
      this.runTimer = null;
      this.autoTimetof = opt.autoTimetof;
      this.autoMs = opt.autoMs;
      this.onSlideInit = this.options.onSlideInit;
      this.onSlideStart = this.options.onSlideStart;
      this.onSlideStop = this.options.onSlideStop;
      this.showThumbnailControls = opt.showThumbnailControls;
      this.indexLast = 0; //上一次显示图片的序号，可能不按照顺序
      this.nextToPx = 0; //下一次移动到的的像素值，用于图片移动的效果
      this.distance = 0;
      this.animateStatus = 0; //动画执行状态
      this.animateStatusmove = 0; //
      this.init();
    },
    //设置默认属性
    _setOptions: function(options) {
      this.options = { //默认值
        targetElement: 'J_slider', //选择焦点图ID
        showMarkerPics: false, //是否生成图片略缩图样式 2选1
        MarkerPicsAuto: false, //略缩图是否自动滚动适应
        showThumbnailControls: false, //是否显示略缩图的上一个和下一个功能
        picswORh: 'height', // 获取略缩图的宽还是高
        picNum: '4', //显示略缩图的个数
        showMarkers: false, //是否生成图片序列号  2选1
        showMarkersNum: false, //是否生成图片序列号数字
        showControls: false, //是否显示上一页与下一页
        showControlsA: false, //是否动画显示上一页与下一页
        showMarkerText: false, //是否生成图片详细信息
        overORclick: 'mouseover', //鼠标触发方式
        pattern: ['doMove'], //选择动画风格
        seamless: false, // 是否无缝轮播
        autoTimetof: false, //定义是否自动播放
        autoMs: 5000, //效果的间隔时间
        onSlideInit: function(i, num) {}, //每一帧动画执行前执行
        onSlideStart: function(i, num) {}, //每一帧动画执行前执行
        onSlideStop: function(i, num) {} //每一帧动画结束时执行
      };
      return extend(this.options, options || {});
    },
    init: function() { //初始化
      this.obj = document.getElementById(this.target);
      this.mainPic = getElementsByClassName(this.target, '', "ui-slider-content")[0];
      this.oUl = this.mainPic.getElementsByTagName('ul')[0];
      this.aUlLis = this.oUl.getElementsByTagName('li');
      this.width = this.aUlLis[0].offsetWidth;
      this.height = this.aUlLis[0].offsetHeight;
      this.number = this.aUlLis.length;
      this.oUl.style.width = this.width * this.number + 'px';
      this.MarkerPics();
      this.Markers();
      this.MarkerText();
      this.Controls();
      this.onSlideInit();
      this.initEvent();
    },
    MarkerPics: function() { //生成略缩图
      if (this.showMarkerPics) {
        var aLis1 = [];
        this.aLis1 = getElementsByClassName(this.target, '', "ui-slider-thumbnail")[0].getElementsByTagName('p');
        this.aLis1[0].className = 'ui-slider-active';
      };
    },
    Markers: function() { //生成序列号
      if (this.showMarkers) {
        var oDiv = document.createElement('div');
        oDiv.className = 'ui-slider-dot';
        var aLis1 = [];
        if (!this.showMarkersNum) {
          for (var i = 0; i < this.number; i++) {
            aLis1.push('<li>' + '<\/li>');
          };
        } else {
          for (var i = 0; i < this.number; i++) {
            var k = i + 1;
            aLis1.push('<li>' + k + '<\/li>');
          };
        };
        oDiv.innerHTML = '<ol>' + aLis1.join('') + '<\/ol>';
        this.obj.appendChild(oDiv);
        this.aLis1 = getElementsByClassName(this.target, 'div', "ui-slider-dot")[0].getElementsByTagName('ol')[0].getElementsByTagName('li');
        this.aLis1[0].className = 'ui-slider-active';
        oDiv = null;
      };
    },
    MarkerText: function() { //生成信息
      if (this.showMarkerText) {
        var oDiv = document.createElement('div');
        oDiv.className = 'ui-slider-txt';
        var aLis3 = [];
        for (var i = 0; i < this.number; i++) {
          var imgS = getElementsByClassName(this.target, '', "J_ui_content_pic");
          var picAlt = imgS[i].alt;
          aLis3.push('<li>' + picAlt + '<\/li>');
        };
        oDiv.innerHTML = '<ul id="J_slider_txt">' + aLis3.join('') + '<\/ul>';
        this.obj.appendChild(oDiv);
        this.aLis3 = document.getElementById('J_slider_txt').getElementsByTagName('li');
        this.aLis3[0].className = 'ui-slider-active';
        oDiv = null;
      };
    },
    Controls: function() { //生成上一个与下一个标签
      if (this.showControls) {
        this.oPrev = document.createElement('div');
        this.oNext = document.createElement('div');
        this.oPrev.className = 'ui-slider-prev';
        this.oNext.className = 'ui-slider-next';
        this.obj.appendChild(this.oPrev);
        this.obj.appendChild(this.oNext);
      };
    },
    initEvent: function() {
      var that = this;
      var pattern = this.pattern[0];
      this[pattern]();

      if (this.showMarkers || this.showMarkerPics) {
        forEach(this.aLis1, function(o, index) {
            if (this.overORclick == "click") {
              addEventListener(o, 'click', bindFunction(this, function() {
                if (this.animateStatus) return;
                if (o.className == "ui-slider-active") return;
                this.run(index);
              }));
            } else if (this.overORclick == "mouseover") {
              addEventListener(o, 'mouseover', bindFunction(this, function() {
                if (!this.animateStatusmove) {
                  this.run(index);
                } else {
                  return;
                }
              }));
            }
          },
          this);
      };

      if (this.showControls) {
        addEventListener(this.oPrev, 'click', bindFunction(this, function() {
          if (this.animateStatus) return;
          this.run('-=1');
        }));
        addEventListener(this.oNext, 'click', bindFunction(this, function() {
          if (this.animateStatus) return;
          this.run('+=1');
        }));
        if (this.showControlsA && !Browser.ie6) {
          setOpacity(this.oPrev, 0);
          setOpacity(this.oNext, 0);
          addEventListener(this.oPrev, 'mouseover', bindFunction(this, function() {
            animateStop("oPrev_out");
            animate(this.oPrev, 'opacity', 1, "400", 'linear', null, null, "oPrev_over");
          }));
          addEventListener(this.oPrev, 'mouseout', bindFunction(this, function() {
            animateStop("oPrev_over");
            animate(this.oPrev, 'opacity', 0, "400", 'linear', null, null, "oPrev_out");
          }));
          addEventListener(this.oNext, 'mouseover', bindFunction(this, function() {
            animateStop("oNext_out");
            animate(this.oNext, 'opacity', 1, "400", 'linear', null, null, "oNext_over");
          }));
          addEventListener(this.oNext, 'mouseout', bindFunction(this, function() {
            animateStop("oNext_over");
            animate(this.oNext, 'opacity', 0, "400", 'linear', null, null, "oNext_out");
          }));
        }

      };
      /*略缩图的上一个和下一个标签*/
      if (this.showThumbnailControls) {
        this.oThumbnailPrev = getElementsByClassName(this.target, 'div', "ui-slider-thumbnail-prev")[0];
        this.oThumbnailNext = getElementsByClassName(this.target, 'div', "ui-slider-thumbnail-next")[0];
        addEventListener(this.oThumbnailPrev, 'click', bindFunction(this, function() {
          if (this.animateStatus) return;
          this.run('-=1');
        }));
        addEventListener(this.oThumbnailNext, 'click', bindFunction(this, function() {
          if (this.animateStatus) return;
          this.run('+=1');
        }));
      };
    },
    addActive: function(index) {
      var that = this,
        ma = 0,
        mb = 0;
      if (this.showMarkers || this.showMarkerPics) {
        if (index < this.number) {
          for (var i = 0; i < this.number; i++) {
            i == index ? this.aLis1[i].className = 'ui-slider-active' : this.aLis1[i].className = '';
          };
        } else {
          for (var i = this.number; i < 2 * this.number; i++) {
            ma = i - this.number;
            (function(i) {
              i == index ? that.aLis1[ma].className = 'ui-slider-active' : that.aLis1[ma].className = '';
            })(i);
          };
        }
      };
      if (this.showMarkerText) {
        if (index < this.number) {
          for (var j = 0; j < this.number; j++) {
            j == index ? this.aLis3[j].className = 'ui-slider-active' : this.aLis3[j].className = '';
          };
        } else {
          for (var j = this.number; j < 2 * this.number; j++) {
            mb = j - this.number;
            (function(j) {
              j == index ? that.aLis3[mb].className = 'ui-slider-active' : that.aLis3[mb].className = '';
            })(j);
          };
        }
      };
    },
    scrollToindex: function(i) {
      if (!this.showMarkerPics) {
        return;
      };
      if (!this.MarkerPicsAuto) {
        return;
      };
      if (this.seamless) {
        return;
      }; //无缝轮播的话返回
      var that = this;
      var ul = getElementsByClassName(that.target, '', "ui-slider-thumbnail")[0],
        distance = parseInt(getStyle(that.aLis1[0], that.picswORh)),
        showNum = that.picNum,
        num_2p = parseInt(showNum / 2);
      var n = that.number,
        time = 500,
        showStart = i,
        showEnd = i + showNum;
      if (n < 2) return; //图片数量小于2张时，返回
      var tORl = (that.picswORh == "width" ? "left" : "top");
      if (i >= showEnd) { //next
        showEnd = i < n - 1 ? i + 1 : i;
        showStart = showEnd - showNum + 1;
      } else if (i <= showStart) { //prev
        showEnd = showStart + showNum - 1;
      };
      movedistance = -(showStart - num_2p) * distance + "px";
      movedistance2 = 0 + "px";
      movedistance3 = -(n - 2 * num_2p - 1) * distance + "px";
      //中间图片时 ,保持选中的图片在中间
      if (i <= n - num_2p - 1 && i >= num_2p) {
        animate(ul, tORl, movedistance, time, "quartInOut", null, null);
      };
      //第一张图片时,回到最左边
      if (i == 0) {
        animate(ul, tORl, movedistance2, time, "quartInOut", null, null);
      };
      //最后一张图片时，回到最右边
      if (i == n - 1) {
        animate(ul, tORl, movedistance3, time, "quartInOut", null, null);
      };
    },
    play: function(funcLastFrame, funcCurrentFrame, seamless, isLevel) {
      var that = this,
        n = this.number,
        direction = isLevel ? 'left' : 'top',
        distance = isLevel ? this.width : this.height,
        indexCurrent = 0,
        t = this.autoMs,
        indexLast = this.indexLast;
      this.run = function(value) {
        /* that.animateStatus = that.overORclick==="mouseover" ? 0:1;*/ //这里有问题
        if (!that.autoTimetof) {}; //这里用于点击控制是否自动播放
        that.animateStatus = 0;
        funcLastFrame && funcLastFrame(that.indexLast, n);
        indexCurrent = typeof value === 'string' ? that.indexLast + parseInt(value.replace('=', '')) : value;
        if (indexCurrent <= -1) {
          indexCurrent = n - 1;
          if (that.seamless) that.oUl.style[direction] = -n * distance + 'px';
        };
        if (indexCurrent >= n) {
          if (!that.seamless) indexCurrent = 0;
          if (indexCurrent >= 2 * n) {
            that.oUl.style[direction] = -(n - 1) * distance + 'px';
            indexCurrent = n;
          }
        };
        if (seamless && indexLast >= n && indexCurrent < n) indexCurrent += n;
        funcCurrentFrame && funcCurrentFrame(indexCurrent, n, that.indexLast);
        that.scrollToindex(indexCurrent);
        that.indexLast = indexCurrent;
        return false;
      };
      try {
        that.run(indexCurrent)
      } catch (e) {
        setTimeout(function() {
          that.run(indexCurrent)
        }, 0)
      };
      if (that.autoTimetof && n > 1) {
        that.runTimer = setInterval(function() {
          that.run('+=1');
        }, t);
        addEventListener(that.obj, 'mouseover', function() {
          clearInterval(that.runTimer);
        });
        addEventListener(that.obj, 'mouseout', function() {
          that.runTimer = setInterval(function() {
            that.run('+=1')
          }, t);
        });
      };
    },
    commonMoveLeft: function() { //效果1,向左移动
      var that = this;
      var indexLast = this.indexLast;
      this.oUl.innerHTML += this.oUl.innerHTML;
      var ulwidth = getStyle(this.oUl, "width");
      this.oUl.style.width = 2 * parseInt(ulwidth) + "px";
      this.play(function(indexLast, n) {
        var elemPre = that.aUlLis[indexLast];
        elemPre.className = '';
      }, function(index, n, indexLast) {
        var elem = that.aUlLis[index];
        that.nextToPx = -index * that.width;
        animate(that.oUl, "left", that.nextToPx, "500", "linear", function() {
          that.addActive(index);
        }, function() {
          elem.className = "ui-slider-content-active";
          that.animateStatus = 0;
        }, "commonMoveLeft");
      }, true, true);
    },
    commonMoveTop: function() { //向上移动
      var that = this;
      var indexLast = this.indexLast;
      this.oUl.innerHTML += this.oUl.innerHTML;
      var hei = getStyle(this.aUlLis[0], "height");
      this.oUl.style.height = 2 * parseInt(hei) + "px";
      this.oUl.style.height = 1048 + "px";
      this.play(function(indexLast, n) {
        var elemPre = that.aUlLis[indexLast];
        elemPre.className = '';
      }, function(index, n, indexLast) {
        var elem = that.aUlLis[index];
        that.nextToPx = -index * that.height;
        animate(that.oUl, "top", that.nextToPx, "500", "linear", function() {
          that.addActive(index);
        }, function() {
          elem.className = "ui-slider-content-active";
          that.animateStatus = 0;
        }, "commonMoveTop");
      }, true, false);
    },
    fadeIn: function() { //淡入
      var that = this;
      var indexLast = this.indexLast;
      this.play(function(indexLast, n) {}, function(index, n, indexLast) {
        var elemPre = that.aUlLis[indexLast];
        var elem = that.aUlLis[index];
        elem.style.top = "0px";
        that.addActive(index);
        if (index != indexLast) {
          animate(elemPre, 'opacity', 0, "700", 'linear',
            null,
            function() {
              elemPre.style.top = "-999px";
              elemPre.className = "";
            }, "fadeIn_elemPre_hide");
          animate(elem, 'opacity', 1, "700", 'linear',
            function() {
              elem.style.opacity = "0";
              that.animateStatusmove = 1;
              that.onSlideStart(index, that.number);
            },
            function() {
              elem.className = "ui-slider-content-active";
              that.animateStatus = 0;
              that.animateStatusmove = 0;
              that.onSlideStop(index, that.number);
            }, "fadeIn_elem_show");
        };
      }, false, false);
    },
    commonIn: function() { //普通显示
      var that = this;
      var indexLast = this.indexLast;
      this.play(function(indexLast, n) {
        var elemPre = that.aUlLis[indexLast];
        elemPre.style.top = "-999px";
        elemPre.className = "";
      }, function(index, n, indexLast) {
        var elem = that.aUlLis[index];
        elem.style.top = "0px";
        that.addActive(index);
        that.onSlideStart(index, that.number);
        if (index != indexLast) {
          elem.className = "ui-slider-content-active";
          that.animateStatus = 0;
          that.animateStatusmove = 0;
          that.onSlideStop(index, that.number);
        };
      }, false, false);
    },
    leftCover: function() { //向左覆盖
      var that = this;
      var indexLast = this.indexLast;
      this.play(function(indexLast, n) { //运行前一帧
        var elemPre = that.aUlLis[indexLast];
        elemPre.className = '';
      }, function(index, n, indexLast) { //运行当前帧
        var elem = that.aUlLis[index];
        var elemPre = that.aUlLis[indexLast];
        elem.style.zIndex = 2;
        animate(elem, "left", "0px", "400", "quartInOut", function() {
          that.addActive(index);
        }, function() {
          elem.className = "ui-slider-content-active";
          elem.style.zIndex = "";
          if (index !== indexLast) {
            elemPre.style.left = that.width + 'px';
          };
          that.animateStatus = 0;
        }, "leftCover");
      }, false, false);
    },
    scrollUpDown: function() { //向上或向下滚动
      var that = this;
      var indexLast = this.indexLast;
      this.play(function(indexLast, n) { //运行前一帧
        var elemPre = that.aUlLis[indexLast];
        elemPre.className = '';
      }, function(index, n, indexLast) { //运行当前帧
        var elem = that.aUlLis[index];
        var elemPre = that.aUlLis[indexLast];
        elem.style.zIndex = 2;
        that.addActive(index);
        var upORdown = index > indexLast ? "up" : "down";
        switch (upORdown) {
          case "up":
            if (index !== indexLast) {
              elem.style.top = that.height + 'px';
              animate(elemPre, "top", -that.height, "800", "quartInOut", null, null, "scrollUpDown_elemPre_hide");
            };
            animate(elem, "top", "0px", "800", "quartInOut", null, function() {
              elem.className = "ui-slider-content-active";
              elem.style.zIndex = "";
              if (index !== indexLast) {
                elemPre.style.top = that.height + 'px';
              };
              that.animateStatus = 0;
            }, "scrollUpDown_elem_show");
            break;
          case "down":
            if (index !== indexLast) {
              elem.style.top = -that.height + 'px';
              animate(elemPre, "top", that.height, "800", "quartInOut", null, null, "scrollUpDown_elemPre_hide");
            };
            animate(elem, "top", "0px", "800", "quartInOut", null, function() {
              elem.className = "ui-slider-content-active";
              elem.style.zIndex = "";
              if (index !== indexLast) {
                elemPre.style.top = -that.height + 'px';
              };
              that.animateStatus = 0;
            }, "scrollUpDown_elem_show");
            break;
        }
      }, false, false);
    }
  };

  if (typeof define === 'function' && define['amd'])
    define("Slider", [], function() {
      return Slider;
    });
  /* Global */
  else
    window['Slider'] = Slider;

}));