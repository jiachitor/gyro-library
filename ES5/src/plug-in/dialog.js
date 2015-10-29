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

  Dialog = function(options) {
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
      GLOBAL.Objects.fireEvent(this, "init");

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
      return GLOBAL.Objects.extend(this.options, options || {});
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
      GLOBAL.Objects.fireEvent(this, "initBox");
    },
    //显示
    show: function(isResize) {
      //定位显示
      var style = this.box.style;
      style.position = this.fixed ? "fixed" : "absolute";
      style.zIndex = this.zIndex;
      GLOBAL.Objects.fireEvent(this, "show", isResize);
      style.display = "block";
      this.onShow();
    },
    //关闭
    close: function() {
      this.box.style.display = "none";
      GLOBAL.Objects.fireEvent(this, "close");
      this.onClose();
    },
    //销毁程序
    dispose: function() {
      GLOBAL.Objects.fireEvent(this, "dispose");
      GLOBAL.Dom.setStyle(this.box, this._css); //恢复样式
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
              var size = GLOBAL.Dom.getSize(this.box);
              GLOBAL.Dom.setStyle(this.box, {
                marginTop: (this.fixed ? 0 : GLOBAL.Dom.getScrollTop()) - size.height / 2 + "px",
                marginLeft: (this.fixed ? 0 : GLOBAL.Dom.getScrollLeft()) - size.width / 2 + "px",
                top: "50%",
                left: "50%"
              });
            };
          } else {
            if (this._centerCss) {
              GLOBAL.Dom.setStyle(this.box, this._centerCss);
              this._centerCss = null;
            }
          };
        },
        "dispose": function() {
          if (this._centerCss) GLOBAL.Dom.setStyle(this.box, this._centerCss);
          this._centerCss = null;
        }
      };
    return function() {
      var args = [].slice.call(arguments),
        options = args[1] = args[1] || {};
      //扩展options
      GLOBAL.Objects.extend(options, {
          center: false //是否居中
        },
        false);
      //扩展钩子
      GLOBAL.Arrays.forEach(methods,
        function(method, name) {
          GLOBAL.Objects.addEvent(this, name, method);
        },
        this);
      init.apply(this, args);
    };
  })();

  //覆盖层
  OverLay = function() {
    var overlay;

    function Create() {
      var lay = document.body.insertBefore(document.createElement("div"), document.body.childNodes[0]);
      GLOBAL.Dom.setStyle(lay, {
        overflow: "hidden",
        width: "100%",
        height: "100%",
        border: 0,
        padding: 0,
        margin: 0,
        top: 0,
        left: 0
      });
      overlay = new Dialog({
        box: lay,
        fixed: true
      });
      Create = function() {};
    };
    return {
      "color": "#000", //背景色
      "opacity": 0.5, //透明度(0-1)
      "zIndex": 100, //层叠值
      "show": function() {
        if (Browser.ie6) return; //ie6不使用遮罩
        Create();
        GLOBAL.Dom.setStyle(overlay.box, {
          backgroundColor: this.color,
          opacity: this.opacity
        });
        overlay.zIndex = this.zIndex;
        overlay.show();
      },
      "close": function() {
        overlay && overlay.close();
      }
    };
  }();

  if (typeof define === 'function' && define['amd'])
    define("Dialog", [], function() {
      return Dialog;
    });
  /* Global */
  else
    window['Dialog'] = Dialog;

}));