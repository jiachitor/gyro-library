/*zoom 插件             "图片放大\ImageZoom插件.html"  */

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
    return function(event) {
      return fun.apply(object, [fixEvent(event)].concat(args)); //concat() 方法用于连接两个或多个数组。
    };
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

  function addEvent(object, type, handler) {
    if (!handler.guid) handler.guid = jc++;
    if (!object.cusevents) object.cusevents = {};
    if (!object.cusevents[type]) object.cusevents[type] = {};
    object.cusevents[type][handler.guid] = handler;
  };

  function removeEvent(object, type, handler) {
    if (object.cusevents && object.cusevents[type]) {
      delete object.cusevents[type][handler.guid];
    };
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

  function fireEvent(object, type) {
    if (!object.cusevents) return;
    var args = Array.prototype.slice.call(arguments, 2),
      handlers = object.cusevents[type];
    for (var i in handlers) {
      handlers[i].apply(object, args);
    };
  };


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


  function getScrollTop(node) {
    var doc = node ? node.ownerDocument : document;
    return doc.documentElement.scrollTop || doc.body.scrollTop;
  };

  function getScrollLeft(node) {
    var doc = node ? node.ownerDocument : document;
    return doc.documentElement.scrollLeft || doc.body.scrollLeft;
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
    forEach(elems,
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

  function forEach(object, callback, thisp) {
    each(object, function() {
      callback.apply(thisp, arguments);
    });
  };



  var ImageZoom = function(image, viewer, options) {
    this._initialize(image, viewer, options);
    this._initLoad();
  };

  ImageZoom.prototype = {
    //初始化程序
    _initialize: function(image, viewer, options) {
      this._image = document.getElementById(image); //原图
      this._zoom = document.createElement("img"); //显示图
      this._viewer = document.getElementById(viewer); //显示框
      this._viewerWidth = 0; //显示框宽
      this._viewerHeight = 0; //显示框高
      this._preload = new Image(); //预载对象
      this._rect = null; //原图坐标
      this._repairLeft = 0; //显示图x坐标修正
      this._repairTop = 0; //显示图y坐标修正
      this._rangeWidth = 0; //显示范围宽度
      this._rangeHeight = 0; //显示范围高度
      this._timer = null; //计时器
      this._loaded = false; //是否加载
      this._substitute = false; //是否替换
      var opt = this._setOptions(options);

      this._scale = opt.scale;
      this._max = opt.max;
      this._min = opt.min;
      this._originPic = opt.originPic;
      this._zoomPic = opt.zoomPic;
      this._rangeWidth = opt.rangeWidth;
      this._rangeHeight = opt.rangeHeight;

      this.delay = opt.delay;
      this.autoHide = opt.autoHide;
      this.mouse = opt.mouse;
      this.rate = opt.rate;

      this.onLoad = opt.onLoad;
      this.onStart = opt.onStart;
      this.onMove = opt.onMove;
      this.onEnd = opt.onEnd;

      var oThis = this,
        END = function() {
          oThis._end();
        };
      this._END = function() {
        oThis._timer = setTimeout(END, oThis.delay);
      };
      this._START = bindAsEventListener(this, this._start);
      this._MOVE = bindAsEventListener(this, this._move);
      this._MOUSE = bindAsEventListener(this, this._mouse);
      this._OUT = bindAsEventListener(this, function(e) {
        if (!e.relatedTarget) this._END();
      });

      fireEvent(this, "init");
    },
    //设置默认属性
    _setOptions: function(options) {
      this.options = { //默认值
        scale: 0, //比例(大图/原图)
        max: 10, //最大比例
        min: 1.5, //最小比例
        originPic: "", //原图地址
        zoomPic: "", //大图地址
        rangeWidth: 0, //显示范围宽度
        rangeHeight: 0, //显示范围高度
        delay: 20, //延迟结束时间
        autoHide: true, //是否自动隐藏
        mouse: false, //鼠标缩放
        rate: .2, //鼠标缩放比率
        onLoad: function() {}, //加载完成时执行
        onStart: function() {}, //开始放大时执行
        onMove: function() {}, //放大移动时执行
        onEnd: function() {} //放大结束时执行
      };
      return extend(this.options, options || {});
    },
    //初始化加载
    _initLoad: function() {
      var image = this._image,
        originPic = this._originPic,
        useOrigin = !this._zoomPic && this._scale,
        loadImage = bindFunction(this, useOrigin ? this._loadOriginImage : this._loadImage);
      //设置自动隐藏
      this.autoHide && this._hide();
      //先加载原图,如果元素当前有加载图片的话，先通过complete判断是否加载完成，没完成就设置onload，已经完成的话就直接执行加载程序
      if (originPic && originPic != image.src) { //使用自定义地址
        image.onload = loadImage;
        image.src = originPic;
      } else if (image.src) { //使用元素地址
        if (!image.complete) { //未载入完
          image.onload = loadImage;
        } else { //已经载入
          loadImage();
        };
      } else {
        return; //没有原图地址
      };
      //加载大图
      if (!useOrigin) {
        var preload = this._preload,
          zoomPic = this._zoomPic || image.src,
          loadPreload = bindFunction(this, this._loadPreload);
        if (zoomPic != preload.src) { //新地址重新加载
          preload.onload = loadPreload;
          preload.src = zoomPic;
        } else { //正在加载
          if (!preload.complete) { //未载入完
            preload.onload = loadPreload;
          } else { //已经载入
            this._loadPreload();
          }
        };
      };
    },
    //原图放大加载程序
    _loadOriginImage: function() {
      this._image.onload = null;
      this._zoom.src = this._image.src;
      this._initLoaded();
    },
    //原图加载程序
    _loadImage: function() {
      this._image.onload = null;
      if (this._loaded) { //大图已经加载
        this._initLoaded();
      } else {
        this._loaded = true;
        if (this._scale) { //有自定义比例才用原图放大替换大图
          this._substitute = true;
          this._zoom.src = this._image.src;
          this._initLoaded();
        };
      };
    },
    //大图预载程序
    _loadPreload: function() {
      this._preload.onload = null;
      this._zoom.src = this._preload.src;
      if (this._loaded) { //原图已经加载
        //没有使用替换
        if (!this._substitute) {
          this._initLoaded();
        }
      } else {
        this._loaded = true;
      };
    },
    //初始化加载设置
    _initLoaded: function(src) {
      //初始化显示图尺寸
      this._initSize();
      //初始化显示框
      this._initViewer();
      //初始化数据
      this._initData();
      //开始执行
      fireEvent(this, "load");
      this.onLoad();
      this.start();
    },
    //初始化显示图尺寸
    _initSize: function() {
      var zoom = this._zoom,
        image = this._image,
        scale = this._scale;
      if (!scale) {
        scale = this._preload.width / image.width;
      };
      this._scale = scale = Math.min(Math.max(this._min, scale), this._max);
      //按比例设置显示图大小
      zoom.width = Math.ceil(image.width * scale);
      zoom.height = Math.ceil(image.height * scale);
    },
    //初始化显示框
    _initViewer: function() {
      var zoom = this._zoom,
        viewer = this._viewer;
      //设置样式
      var styles = {
          padding: 0,
          overflow: "hidden"
        },
        p = getStyle(viewer, "position");
      if (p != "relative" && p != "absolute") {
        styles.position = "relative";
      };
      setStyle(viewer, styles);
      zoom.style.position = "absolute";
      //插入显示图
      if (!contains(viewer, zoom)) {
        viewer.appendChild(zoom);
      };
    },
    //初始化数据
    _initData: function() {
      var zoom = this._zoom,
        image = this._image,
        viewer = this._viewer,
        scale = this._scale,
        rangeWidth = this._rangeWidth,
        rangeHeight = this._rangeHeight;
      //原图坐标
      this._rect = rect(image);
      //修正参数
      this._repairLeft = image.clientLeft + parseInt(getStyle(image, "padding-left"));
      this._repairTop = image.clientTop + parseInt(getStyle(image, "padding-top"));
      //设置范围参数和显示框大小
      if (rangeWidth > 0 && rangeHeight > 0) {
        rangeWidth = Math.ceil(rangeWidth);
        rangeHeight = Math.ceil(rangeHeight);
        this._viewerWidth = Math.ceil(rangeWidth * scale);
        this._viewerHeight = Math.ceil(rangeHeight * scale);
        setStyle(viewer, {
          width: this._viewerWidth + "px",
          height: this._viewerHeight + "px"
        });
      } else {
        var styles;
        if (!viewer.clientWidth) { //隐藏
          var style = viewer.style;
          styles = {
            display: style.display,
            position: style.position,
            visibility: style.visibility
          };
          setStyle(viewer, {
            display: "block",
            position: "absolute",
            visibility: "hidden"
          });
        };
        this._viewerWidth = viewer.clientWidth;
        this._viewerHeight = viewer.clientHeight;
        if (styles) {
          setStyle(viewer, styles);
        };
        rangeWidth = Math.ceil(this._viewerWidth / scale);
        rangeHeight = Math.ceil(this._viewerHeight / scale);
      };
      this._rangeWidth = rangeWidth;
      this._rangeHeight = rangeHeight;
    },
    //开始
    _start: function() {
      clearTimeout(this._timer);
      var viewer = this._viewer,
        image = this._image,
        scale = this._scale;
      viewer.style.display = "block";
      fireEvent(this, "start");
      this.onStart();
      removeEventListener(image, "mouseover", this._START);
      removeEventListener(image, "mousemove", this._START);
      addEventListener(document, "mousemove", this._MOVE);
      addEventListener(document, "mouseout", this._OUT);
      this.mouse && addEventListener(document, Browser.firefox ? "DOMMouseScroll" : "mousewheel", this._MOUSE);
    },
    //移动
    _move: function(e) {
      clearTimeout(this._timer);
      var x = e.pageX,
        y = e.pageY,
        rect = this._rect;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        this._END(); //移出原图范围
      } else {
        var pos = {},
          scale = this._scale,
          zoom = this._zoom,
          viewerWidth = this._viewerWidth,
          viewerHeight = this._viewerHeight;
        //修正坐标
        pos.left = viewerWidth / 2 - (x - rect.left - this._repairLeft) * scale;
        pos.top = viewerHeight / 2 - (y - rect.top - this._repairTop) * scale;

        fireEvent(this, "repair", e, pos);
        //范围限制
        x = Math.ceil(Math.min(Math.max(pos.left, viewerWidth - zoom.width), 0));
        y = Math.ceil(Math.min(Math.max(pos.top, viewerHeight - zoom.height), 0));
        //设置定位
        zoom.style.left = x + "px";
        zoom.style.top = y + "px";

        fireEvent(this, "move", e, x, y);
        this.onMove();
      };
    },
    //结束
    _end: function() {
      fireEvent(this, "end");
      this.onEnd();
      this.autoHide && this._hide();
      this.stop();
      this.start();
    },
    //隐藏
    _hide: function() {
      this._viewer.style.display = "none";
    },
    //鼠标缩放
    _mouse: function(e) {
      this._scale += (e.wheelDelta ? e.wheelDelta / (-120) : (e.detail || 0) / 3) * this.rate;

      var opt = this.options;
      this._rangeWidth = opt.rangeWidth;
      this._rangeHeight = opt.rangeHeight;

      this._initSize();
      this._initData();
      this._move(e);
      e.preventDefault(); //防止触发页面滚动
    },
    //开始
    start: function() {
      if (this._viewerWidth && this._viewerHeight) {
        var image = this._image,
          START = this._START;
        addEventListener(image, "mouseover", START);
        addEventListener(image, "mousemove", START);
      };
    },
    //停止
    stop: function() {
      clearTimeout(this._timer);
      removeEventListener(this._image, "mouseover", this._START);
      removeEventListener(this._image, "mousemove", this._START);
      removeEventListener(document, "mousemove", this._MOVE);
      removeEventListener(document, "mouseout", this._OUT);
      removeEventListener(document, Browser.firefox ? "DOMMouseScroll" : "mousewheel", this._MOUSE);
    },
    //修改设置,如果程序加载完成后又修改了影响程序计算的样式，例如原图大小，显示框大小等，也要执行一次reset来重新设置参数和属性
    reset: function(options) {
      this.stop();

      var viewer = this._viewer,
        zoom = this._zoom;
      if (contains(viewer, zoom)) {
        viewer.removeChild(zoom);
      };

      var opt = extend(this.options, options || {});
      this._scale = opt.scale;
      this._max = opt.max;
      this._min = opt.min;
      this._originPic = opt.originPic;
      this._zoomPic = opt.zoomPic;
      this._rangeWidth = opt.rangeWidth;
      this._rangeHeight = opt.rangeHeight;

      //重置属性
      this._loaded = this._substitute = false;
      this._rect = null;
      this._repairLeft = this._repairTop = this._viewerWidth = this._viewerHeight = 0;

      this._initLoad();
    },
    //销毁程序
    dispose: function() {
      fireEvent(this, "dispose");
      this.stop();
      if (contains(this._viewer, this._zoom)) {
        this._viewer.removeChild(this._zoom);
      };
      this._image.onload = this._preload.onload = this._image = this._preload = this._zoom = this._viewer = this.onLoad = this.onStart = this.onMove = this.onEnd = this._START = this._MOVE = this._END = this._OUT = null
    }
  };

  /*几种放大模式*/
  ImageZoom._MODE = {
    //跟随
    "follow": {
      methods: {
        init: function() {
          this._stylesFollow = null; //备份样式
          this._repairFollowLeft = 0; //修正坐标left
          this._repairFollowTop = 0; //修正坐标top
        },
        load: function() {
          var viewer = this._viewer,
            style = viewer.style,
            styles;
          this._stylesFollow = {
            left: style.left,
            top: style.top,
            position: style.position
          };
          viewer.style.position = "absolute";
          //获取修正参数
          if (!viewer.offsetWidth) { //隐藏
            styles = {
              display: style.display,
              visibility: style.visibility
            };
            setStyle(viewer, {
              display: "block",
              visibility: "hidden"
            });
          };
          //修正中心位置
          this._repairFollowLeft = viewer.offsetWidth / 2;
          this._repairFollowTop = viewer.offsetHeight / 2;
          //修正offsetParent位置
          if (!/BODY|HTML/.test(viewer.offsetParent.nodeName)) {
            var parent = viewer.offsetParent,
              _rect = rect(parent);
            this._repairFollowLeft += _rect.left + parent.clientLeft;
            this._repairFollowTop += _rect.top + parent.clientTop;
          };
          if (styles) {
            setStyle(viewer, styles);
          };
        },
        repair: function(e, pos) {
          var zoom = this._zoom,
            viewerWidth = this._viewerWidth,
            viewerHeight = this._viewerHeight;
          pos.left = (viewerWidth / 2 - pos.left) * (viewerWidth / zoom.width - 1);
          pos.top = (viewerHeight / 2 - pos.top) * (viewerHeight / zoom.height - 1);
        },
        move: function(e) {
          var style = this._viewer.style;
          style.left = e.pageX - this._repairFollowLeft + "px";
          style.top = e.pageY - this._repairFollowTop + "px";
        },
        dispose: function() {
          setStyle(this._viewer, this._stylesFollow);
        }
      }
    },
    //拖柄
    "handle": {
      options: { //默认值,options是可选参数扩展
        handle: "" //拖柄对象
      },
      methods: { //methods是程序结构的扩展,包含要扩展的钩子程序，是扩展的主要部分
        init: function() {
          var handle = document.getElementById(this.options.handle);
          if (!handle) { //没有定义的话用复制显示框代替
            var body = document.body;
            handle = body.insertBefore(this._viewer.cloneNode(false), body.childNodes[0]);
            handle.id = "";
            handle["_createbyhandle"] = true; //生成标识用于移除
          } else {
            var style = handle.style;
            this._stylesHandle = {
              left: style.left,
              top: style.top,
              position: style.position,
              display: style.display,
              visibility: style.visibility,
              padding: style.padding,
              margin: style.margin,
              width: style.width,
              height: style.height
            };
          };
          setStyle(handle, {
            padding: 0,
            margin: 0,
            display: "none"
          });

          this._handle = handle;
          this._repairHandleLeft = 0; //修正坐标left
          this._repairHandleTop = 0; //修正坐标top
        },
        load: function() {
          var handle = this._handle,
            rect = this._rect;
          setStyle(handle, {
            position: "absolute",
            width: this._rangeWidth + "px",
            height: this._rangeHeight + "px",
            display: "block",
            visibility: "hidden"
          });
          //获取修正参数
          this._repairHandleLeft = rect.left + this._repairLeft - handle.clientLeft;
          this._repairHandleTop = rect.top + this._repairTop - handle.clientTop;
          //修正offsetParent位置
          if (!/BODY|HTML/.test(handle.offsetParent.nodeName)) {
            var parent = handle.offsetParent,
              rect = rect(parent);
            this._repairHandleLeft -= rect.left + parent.clientLeft;
            this._repairHandleTop -= rect.top + parent.clientTop;
          };
          //隐藏
          setStyle(handle, {
            display: "none",
            visibility: "visible"
          });
        },
        start: function() {
          this._handle.style.display = "block";
        },
        move: function(e, x, y) {
          var style = this._handle.style,
            scale = this._scale;
          style.left = Math.ceil(this._repairHandleLeft - x / scale) + "px";
          style.top = Math.ceil(this._repairHandleTop - y / scale) + "px";
        },
        end: function() {
          this._handle.style.display = "none";
        },
        dispose: function() {
          if ("_createbyhandle" in this._handle) {
            document.body.removeChild(this._handle);
          } else {
            setStyle(this._handle, this._stylesHandle);
          };
          this._handle = null;
        }
      }
    },
    //切割
    "cropper": {
      options: { //默认值
        opacity: .5 //透明度
      },
      methods: {
        init: function() {
          var body = document.body,
            cropper = body.insertBefore(document.createElement("img"), body.childNodes[0]);
          cropper.style.display = "none";

          this._cropper = cropper;
          this.opacity = this.options.opacity;
        },
        load: function() {
          var cropper = this._cropper,
            image = this._image,
            rect = this._rect;
          cropper.src = image.src;
          cropper.width = image.width;
          cropper.height = image.height;
          setStyle(cropper, {
            position: "absolute",
            left: rect.left + this._repairLeft + "px",
            top: rect.top + this._repairTop + "px"
          });
        },
        start: function() {
          this._cropper.style.display = "block";
          setStyle(this._image, "opacity", this.opacity);
        },
        move: function(e, x, y) {
          var w = this._rangeWidth,
            h = this._rangeHeight,
            scale = this._scale;
          x = Math.ceil(-x / scale);
          y = Math.ceil(-y / scale);
          this._cropper.style.clip = "rect(" + y + "px " + (x + w) + "px " + (y + h) + "px " + x + "px)";
        },
        end: function() {
          setStyle(this._image, "opacity", 1);
          this._cropper.style.display = "none";
        },
        dispose: function() {
          setStyle(this._image, "opacity", 1);
          document.body.removeChild(this._cropper);
          this._cropper = null;
        }
      }
    }
  };

  //扩展需要在程序初始化时进行，要放在_initialize程序之前执行
  //为了不影响原程序的结构，这里用织入法在_initialize之前插入一段程序
  //原理就是先保存原来的函数，插入一段程序组成新函数，然后重新替换原来的函数
  //考虑到组合基础模式的情况，使用了一个对象保存真正使用的模式
  ImageZoom.prototype._initialize = (function() {
    var init = ImageZoom.prototype._initialize,
      mode = ImageZoom._MODE,
      modes = {
        "follow": [mode.follow], //这里是把定义好的方法当成参数扩展到options 里
        "handle": [mode.handle],
        "cropper": [mode.cropper],
        "handle-cropper": [mode.handle, mode.cropper]
      };
    return function() {
      //首先扩展options可选参数对象，由于可选参数是第三个参数，所以用arguments[2]获取。extend的第三个参数设为false，说明不重写相同属性，即保留自定义的属性值。然后把methods里面的方法作为钩子函数逐个添加到程序中
      //可以看到这里用了织入法（weave）和钩子法（hook）对程序做扩展。织入法是一种aop，可以在不改变原程序的基础上进行扩展，但只能在函数前面或后面加入程序。而钩子法必须在原程序中设置好对应钩子才能配合使用，但位置相对灵活
      var options = arguments[2];
      if (options && options.mode && modes[options.mode]) {
        forEach(modes[options.mode],
          function(mode) {
            //扩展options
            extend(options, mode.options, false);
            //扩展钩子
            forEach(mode.methods,
              function(method, name) {
                addEvent(this, name, method);
              },
              this);
          },
          this);
      };
      init.apply(this, arguments);
    };
  })();



  if (typeof define === 'function' && define['amd'])
    define("ImageZoom", [], function() {
      return ImageZoom;
    });
  /* Global */
  else
    window['ImageZoom'] = ImageZoom;

}));