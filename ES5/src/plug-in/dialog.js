/*弹出插件      "弹出与拖拽\#dialog弹出插件案例.html"*/
//说明： 功能性弹出框插件，有居中、fixed、遮罩，和显示与关闭事件等
(function(global, factory) {

  if (typeof module === "object" && typeof module.exports === "object") {
    // For CommonJS and CommonJS-like environments where a proper `window`
    // is present, execute the factory and get jQuery.
    // For environments that do not have a `window` with a `document`
    // (such as Node.js), expose a factory as module.exports.
    // This accentuates the need for the creation of a real `window`.
    // e.g. var jQuery = require("jquery")(window);
    // See ticket #14549 for more info.
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

  var jc = 1;

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

  function fireEvent(object, type) {
    if (!object.cusevents) return;
    var args = Array.prototype.slice.call(arguments, 2),
      handlers = object.cusevents[type];
    for (var i in handlers) {
      handlers[i].apply(object, args);
    };
  };

  function addEvent(object, type, handler) {
    if (!handler.guid) handler.guid = jc++;
    if (!object.cusevents) object.cusevents = {};
    if (!object.cusevents[type]) object.cusevents[type] = {};
    object.cusevents[type][handler.guid] = handler;
  };

  //获取元素大小值
  function getSize(elem) {
    var width = elem.offsetWidth,
      height = elem.offsetHeight;
    if (!width && !height) {
      var repair = contains(document.body, elem),
        parent;
      if (repair) { //如果元素不在body上
        parent = elem.parentNode;
        document.body.insertBefore(elem, document.body.childNodes[0]);
      };
      var style = elem.style,
        cssShow = {
          position: "absolute",
          visibility: "hidden",
          display: "block",
          left: "-9999px",
          top: "-9999px"
        },
        cssBack = {
          position: style.position,
          visibility: style.visibility,
          display: style.display,
          left: style.left,
          top: style.top
        };
      setStyle(elem, cssShow);
      width = elem.offsetWidth;
      height = elem.offsetHeight;
      setStyle(elem, cssBack);
      if (repair) {
        parent ? parent.appendChild(elem) : document.body.removeChild(elem);
      };
    };
    return {
      "width": width,
      "height": height
    };
  };

  //获取元素指定样式属性的最终样式值的 . elem指元素，name指样式名称
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

  //其中getScrollTop和getScrollLeft分别是获取文档滚动的scrollTop和scrollLeft。
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

  //contains方法是判断参数1元素对象是否包含了参数2元素对象。
  function contains(root, elem) {
      if (!root && !elem) {
          return false;
      };
      if (root.compareDocumentPosition) return root === elem || !!(root.compareDocumentPosition(elem) & 16);
      if (root.contains && elem.nodeType === 1) {
          return root.contains(elem) && root !== elem;
      };
      while ((elem = elem.parentNode))
          if (elem === root) return true;
      return false;
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



  var Dialog = function(options) {
    this._initialize(options);
  };
  Dialog.prototype = {
    _initialize: function(options) {
      this._css = null; //备份样式
      this._setOptions(options);
      var obj = typeof(this.options.box);
      this.box = (obj == "object") ? this.options.box : document.getElementById(this.options.box); //显示层
      this.fixed = !!this.options.fixed;
      this.zIndex = this.options.zIndex;
      this.onShow = this.options.onShow;
      this.onClose = this.options.onClose;
      fireEvent(this, "init");

      this._initBox();
    },
    //设置默认属性
    _setOptions: function(options) {
      this.options = { //默认值
        box: null,
        fixed: false, //是否固定定位
        zIndex: 1000, //层叠值
        onShow: function() {}, //显示时执行
        onClose: function() {} //关闭时执行
      };
      return extend(this.options, options || {});
    },
    //初始化显示层对象
    _initBox: function() {
      var style = this.box.style;
      this._css = {
        "display": style.display,
        "visibility": style.visibility,
        "position": style.position,
        "zIndex": style.zIndex
      }; //备份样式
      style.display = "none";
      style.visibility = "visible";
      document.body.insertBefore(this.box, document.body.childNodes[0]);
      fireEvent(this, "initBox");
    },
    //显示
    show: function(isResize) {
      //定位显示
      var style = this.box.style;
      style.position = this.fixed ? "fixed" : "absolute";
      style.zIndex = this.zIndex;
      fireEvent(this, "show", isResize);
      style.display = "block";
      this.onShow();
    },
    //关闭
    close: function() {
      this.box.style.display = "none";
      fireEvent(this, "close");
      this.onClose();
    },
    //销毁程序
    dispose: function() {
      fireEvent(this, "dispose");
      setStyle(this.box, this._css); //恢复样式
      //清除属性
      this.box = this.onShow = this.onClose = null;
    }
  };

  //居中扩展
  Dialog.prototype._initialize = (function() {
    var init = Dialog.prototype._initialize,
      methods = {
        "init": function() {
          this._centerCss = null; //记录原始样式
          this.center = !!this.options.center;
        },
        "show": function(isResize) {
          if (this.center) {
            if (!this._centerCss) {
              var style = this.box.style;
              this._centerCss = {
                marginTop: style.marginTop,
                marginLeft: style.marginLeft,
                left: style.left,
                top: style.top
              };
              isResize = true;
            };
            if (isResize) {
              var size = getSize(this.box);
              setStyle(this.box, {
                marginTop: (this.fixed ? 0 : getScrollTop()) - size.height / 2 + "px",
                marginLeft: (this.fixed ? 0 : getScrollLeft()) - size.width / 2 + "px",
                top: "50%",
                left: "50%"
              });
            };
          } else {
            if (this._centerCss) {
              setStyle(this.box, this._centerCss);
              this._centerCss = null;
            }
          };
        },
        "dispose": function() {
          if (this._centerCss) setStyle(this.box, this._centerCss);
          this._centerCss = null;
        }
      };
    return function() {
      var args = [].slice.call(arguments),
        options = args[1] = args[1] || {};
      //扩展options
      extend(options, {
          center: false //是否居中
        },
        false);
      //扩展钩子
      forEach(methods,
        function(method, name) {
          addEvent(this, name, method);
        },
        this);
      init.apply(this, args);
    };
  })();

  if (typeof define === 'function' && define['amd'])
    define("Dialog", [], function() {
      return Dialog;
    });
  /* Global */
  else
    window['Dialog'] = Dialog;

}));