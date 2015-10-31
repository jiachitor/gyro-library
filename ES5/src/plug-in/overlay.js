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

  //覆盖层
  var OverLay = function() {
    var overlay;

    function Create() {
      var lay = document.body.insertBefore(document.createElement("div"), document.body.childNodes[0]);
      setStyle(lay, {
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
        setStyle(overlay.box, {
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
    define("OverLay", [], function() {
      return OverLay;
    });
  /* Global */
  else
    window['OverLay'] = OverLay;

}));