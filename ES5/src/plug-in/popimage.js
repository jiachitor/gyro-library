/* 图片弹出插件    "图片弹出\popImage\popImage插件" */
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

  function fixEvent(event) {
    if (event) return event;
    event = window.event;
    event.target = event.srcElement;
    event.stopPropagation = stopPropagation;
    event.preventDefault = preventDefault;
    var relatedTarget = {
      "mouseout": event.toElement,
      "mouseover": event.fromElement
    }[event.type];
    if (relatedTarget) {
      event.relatedTarget = relatedTarget;
    };
    return event;
  };

  function bindAsEventListener(object, fun) {
    var args = Array.prototype.slice.call(arguments).slice(2);
    //对于apply和call两者在作用上是相同的，但两者在参数上有区别的。 
    //对于第一个参数意义都一样，但对第二个参数： apply传入的是一个参数数组，也就是将多个参数组合成为一个数组传入，而call则作为call的参数传入（从第二个参数开始）。 
    //如 func.call(func1,var1,var2,var3)对应的apply写法为：func.apply(func1,[var1,var2,var3])
    return function(event) {
      return fun.apply(object, [fixEvent(event)].concat(args)); //concat() 方法用于连接两个或多个数组。
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

  function getScrollTop(node) {
    var doc = node ? node.ownerDocument : document;
    return doc.documentElement.scrollTop || doc.body.scrollTop;
  };

  function getScrollLeft(node) {
    var doc = node ? node.ownerDocument : document;
    return doc.documentElement.scrollLeft || doc.body.scrollLeft;
  };

  function setStyle(elems, style, value) {
    if (!elems.length) {
      elems = [elems];
    };
    if (typeof style == "string") {
      var s = style;
      style = {};
      style[s] = value;
    };

    function camelize(s) {
      return s.replace(/-([a-z])/ig,
        function(all, letter) {
          return letter.toUpperCase();
        });
    };
    each(elems,
      function(elem) {
        for (var name in style) {
          var value = style[name];
          if (name == "opacity" && Browser.ie) {
            elem.style.filter = (elem.currentStyle && elem.currentStyle.filter || "").replace(/alpha\([^)]*\)/, "") + " alpha(opacity=" + (value * 100 | 0) + ")";
          } else if (name == "float") {
            elem.style[Browser.ie ? "styleFloat" : "cssFloat"] = value;
          } else {
            elem.style[camelize(name)] = value;
          };
        };
      });
  };

  function rect(node) {
    var left = 0,
      top = 0,
      right = 0,
      bottom = 0;
    //ie8的getBoundingClientRect获取不准确
    if (!node.getBoundingClientRect || Browser.ie8) {
      var n = node;
      while (n) {
        left += n.offsetLeft,
          top += n.offsetTop;
        n = n.offsetParent;
      };
      right = left + node.offsetWidth;
      bottom = top + node.offsetHeight;
    } else {
      var rect = node.getBoundingClientRect();
      left = right = getScrollLeft(node);
      top = bottom = getScrollTop(node);
      left += rect.left;
      right += rect.right;
      top += rect.top;
      bottom += rect.bottom;
    };
    return {
      "left": left,
      "top": top,
      "right": right,
      "bottom": bottom
    };
  };

  function mousePosition(event) {
    if (window.pageYOffset) { //支持pageYOffset属性的浏览器
      return {
        x: event.clientX + window.pageXOffset,
        y: event.clientY + window.pageYOffset
      }
    } else if (document.documentElement) { // IE浏览器
      return {
        x: event.clientX + document.documentElement.scrollLeft,
        y: event.clientY + document.documentElement.scrollTop
      }

    } else if (document.body) { // 其它的浏览器
      return {
        x: event.clientX + document.body.scrollLeft,
        y: event.clientY + document.body.scrollTop
      }
    };
  };

  /*设置透明度*/
  function setOpacity(elem, value) {
    elem.style.opacity = value, elem.style.filter = 'alpha(opacity=' + value * 100 + ')';
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

  var PopImage = function(options) {
    this._initialize(options);
  };
  PopImage.prototype = {
    _initialize: function(options) {
      var opt = this._setOptions(options);
      this.containerClass = opt.containerClass;
      this.tagName = opt.tagName;
      this.timeOut = opt.timeOut;
      this.imagebox = opt.imagebox;
      this.picPlace = opt.picPlace;
      this.closeId = opt.closeId;

      this._setCss();
      this._setBoxHtml();

      this.items = getElementsByClassName(document, "a", this.containerClass);
      this.closeicon = document.getElementById(this.closeId);

      this._each();
    },
    _setOptions: function(options) {
      this.options = { //默认值
        "containerClass": null,
        "tagName": "href",
        "timeOut": "400"
      };
      return extend(this.options, options || {});
    },
    _setCss: function() {
      //	计算popImage的根路径
      var root, script = document.getElementsByTagName('script');
      each(script, function(o) {
        var miuScript = o.src.match(/(.*)popimage(\.mini)?\.js$/);
        if (miuScript !== null) {
          root = miuScript[1];
        };
      });
      //	加载css样式
      var css_href = root + '../../demo/popImage/css/popImage.css';
      var styleTag = document.createElement("link");
      styleTag.setAttribute('type', 'text/css');
      styleTag.setAttribute('rel', 'stylesheet');
      styleTag.setAttribute('href', css_href);
      document.getElementsByTagName("head")[0].appendChild(styleTag);
    },
    _setBoxHtml: function() {
      var picPlace = document.getElementById(this.picPlace);
      if (!picPlace) {
        var cc = "<div id='" + this.picPlace + "'></div><div id='" + this.closeId + "'></div>";
        document.getElementById(this.imagebox).innerHTML = cc;
      };
    },
    _stopDefault: function(e) {
      if (e && e.preventDefault) { //如果是FF下执行这个
        e.preventDefault();
      } else {
        window.event.returnValue = false; //如果是IE下执行这个
      };
      return false;
    },
    _each: function() {
      forEach(this.items, function(o, index) {
          var imgUrl = o.getAttribute(this.tagName),
            this_id = "slide" + index;

          var bigimages = '<img src="' + imgUrl + '" class="' + this_id + '" title="click to close"' + 'style="left:-9999px;top:-999px;"/>';
          document.getElementById(this.picPlace).innerHTML += bigimages;

          addEventListener(o, "click", bindAsEventListener(this, function(event) {
            this._stopDefault(event);
            var thisClass = "slide" + index,
              animate_image = getElementsByClassName(this.picPlace, "img", thisClass);

            //图片动画效果
            this._animate(animate_image[0], event);

            //绑定图片隐藏事件
            this._bandfadeOut(event, animate_image[0]);
          }));
        },
        this);
    },
    _animate: function(image, event) {
      var w_w = document.documentElement.clientWidth,
        w_h = document.documentElement.clientHeight,
        st = document.documentElement.scrollTop + document.body.scrollTop;
      setStyle(this.closeicon, {
        display: "none"
      });

      var o_h = image.height;
      var o_w = image.width;

      var t = st + (w_h - o_h) / 2,
        l = (w_w - o_w) / 2,
        that = this;

      setStyle(image, {
        position: "absolute",
        left: mousePosition(event).x + "px",
        top: mousePosition(event).y + "px",
        height: 0,
        width: 0,
        display: "block",
        opacity: 0.7
      });

      animate(image, 'left', l, this.timeOut, 'linear', null, null, "left");
      animate(image, 'top', t, this.timeOut, 'linear', null, null, "top");
      animate(image, 'height', o_h, this.timeOut, 'linear', null, null, "height");
      animate(image, 'width', o_w, this.timeOut, 'linear', null, function() {
        that._closeShow(image);
      }, 'width');
      animate(image, 'opacity', 1, this.timeOut, 'linear', null, null, "opacity");

    },
    _closeShow: function(image) {
      var position2 = rect(image),
        o_w = image.width;
      setStyle(this.closeicon, {
        left: position2.left + o_w - 6 + "px",
        top: position2.top - 15 + "px",
        display: "block"
      });
    },
    _bandfadeOut: function(event, image) {
      addEventListener(image, "click", bindAsEventListener(this,
        function() {
          this._fadeOut(event, image);
        }));
      addEventListener(this.closeicon, "click", bindAsEventListener(this,
        function() {
          this._fadeOut(event, image);
        }));
    },
    _fadeOut: function(event, image) {
      this._stopDefault(event);
      this.closeicon.style.display = "none";
      animate(image, 'opacity', 0.01, this.timeOut, 'linear',
        function() {},
        function() {
          setStyle(image, {
            left: "-9999px",
            top: "-999px"
          });
        });
    }
  };

  if (typeof define === 'function' && define['amd'])
    define("PopImage", [], function() {
      return PopImage;
    });
  /* Global */
  else
    window['PopImage'] = PopImage;

}));