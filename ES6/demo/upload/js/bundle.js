(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcUploadIndexJs = require('../../../src/upload/index.js');

var _srcUploadIndexJs2 = _interopRequireDefault(_srcUploadIndexJs);

(function () {
  var ready = function ready(fn) {
    var doc = document;
    if (doc.addEventListener) {
      doc.addEventListener('DOMContentLoaded', fn, false);
    } else {
      doc.attachEvent('onreadystatechange', fn);
    }
  };
  ready(function () {
    new _srcUploadIndexJs2['default']({
      trigger: 'uploader-1',
      action: '/',
      progress: function progress() {
        console.log(arguments);
      }
    }).success(function (data) {
      alert(data);
    });

    var uploader = new _srcUploadIndexJs2['default']({
      trigger: 'uploader-2',
      action: '/'
    }).change(function (filename) {
      console.log(filename);
      document.getElementById('upload-2-text').innerHTML = filename[0].name.replace(/<.+?>/gim, '');
    }).success(function (data) {
      alert(data);
    });

    document.getElementById('submit-2').onclick = function () {
      uploader.submit();
      return false;
    };

    new _srcUploadIndexJs2['default']({
      trigger: 'uploader-3',
      accept: 'image/*',
      action: '/'
    }).success(function (data) {
      alert(data);
    });

    var uploaderCanBeDisabled = new _srcUploadIndexJs2['default']({
      trigger: 'uploader-4',
      action: '/'
    }).change(function (filename) {
      document.getElementById('upload-4-text').innerHTML = filename[0].name.replace(/<.+?>/gim, '');
    }).success(function (data) {
      alert(data);
    });
    document.getElementById('disable').onclick = function () {
      var txt = $(this).html();
      uploaderCanBeDisabled[txt === 'Disable' ? 'disable' : 'enable']();
      this.innerHTML = txt === 'Disable' ? 'Enable' : 'Disable';
      return false;
    };

    document.getElementById('submit-4').onclick = function () {
      uploaderCanBeDisabled.submit();
      return false;
    };
  }, false);
})();

},{"../../../src/upload/index.js":2}],2:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _mainMainJs = require('./main/main.js');

var _mainMainJs2 = _interopRequireDefault(_mainMainJs);

module.exports = _mainMainJs2["default"];

},{"./main/main.js":3}],3:[function(require,module,exports){
"use strict";

var iframeCount = 0;

/*获取浏览器信息*/
var Browser = (function (ua) {
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

function extend(object) {
  // Takes an unlimited number of extenders.
  var args = Array.prototype.slice.call(arguments, 1);

  // For each extender, copy their properties on our object.
  for (var i = 0, source; source = args[i]; i++) {
    if (!source) continue;
    for (var property in source) {
      object[property] = source[property];
    }
  }

  return object;
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

//curStyle是用来获取元素的最终样式表的
function curStyle(elem) {
  if (document.defaultView && document.defaultView.getComputedStyle) {
    return document.defaultView.getComputedStyle(elem, null); //这是w3c标准方法，取得元素的样式信息，因为有些样式是在外部css文件定义的，所以用elem.style是取不到的
  } else {
      return elem.currentStyle; //如果是ie,可以用 elem.currentStyle["name"]
    };
};

function offsetTop(elements) {
  var top = elements.offsetTop;
  var parent = elements.offsetParent;
  while (parent != null) {
    top += parent.offsetTop;
    parent = parent.offsetParent;
  };
  return top;
};

function offsetLeft(elements) {
  var left = elements.offsetLeft;
  var parent = elements.offsetParent;
  while (parent != null) {
    left += parent.offsetLeft;
    parent = parent.offsetParent;
  };
  return left;
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
    return s.replace(/-([a-z])/ig, function (all, letter) {
      return letter.toUpperCase();
    });
  };
  each(elems, function (elem) {
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

function contains(root, elem) {
  if (!root && !elem) {
    return false;
  };
  if (root.compareDocumentPosition) return root === elem || !!(root.compareDocumentPosition(elem) & 16);
  if (root.contains && elem.nodeType === 1) {
    return root.contains(elem) && root !== elem;
  };
  while (elem = elem.parentNode) if (elem === root) return true;
  return false;
};

function fixedMouse(e, that) {
  //that 为触发该事件传递下来的this指针
  var related,
      type = e.type.toLowerCase(); //这里获取事件名字
  if (type == 'mouseover') {
    related = e.relatedTarget || e.fromElement; //移入目标元素
  } else if (type = 'mouseout') {
      related = e.relatedTarget || e.toElement; //移出目标元素
    } else return true;
  var contain = contains(that, related);
  return 'document' && related && related.prefix != 'xul' && !contain && related !== that;
};

function mouseEnter(element, callback) {
  addEventListener(element, "mouseover", function (e) {
    var that = this;
    if (fixedMouse(e, that)) {
      callback.call(); //封装回调函数
    };
  }, false);
};

function mouseLeave(element, callback) {
  addEventListener(element, "mouseout", function (e) {
    var that = this;
    if (fixedMouse(e, that)) {
      callback.call(); //封装回调函数
    };
  }, false);
};

// 创建完整Ajax程序包 ，该包不支持跨域
function ajax(options) {
  options = {
    type: options.type || "GET",
    dataType: options.dataType || "json",
    url: options.url || "",
    xhr: options.xhr || function () {
      try {
        return new XMLHttpRequest();
      } catch (e) {}
    },
    data: options.data || "",
    timeout: options.timeout || 5000,
    onComplete: options.onComplete || function () {},
    onError: options.onError || function () {},
    onSuccess: options.onSuccess || function () {}
  };

  var xml = options.xhr();
  xml.open(options.type, options.url, true);
  var timeoutLength = options.timeout;

  var requestDone = false;

  // 初始化一个5秒后执行的回调函数,用于取消请求
  setTimeout(function () {
    requestDone = true;
  }, timeoutLength);

  // 监听文档更新状态
  xml.onreadystatechange = function () {
    // 保持等待 只到数据全部加载 且没有超时
    if (xml.readyState == 4 && !requestDone) {
      // 检查是否请求成功
      if (httpSuccess(xml)) {
        // 以服务器返回的数据作为参数执行成功回调函数
        options.onSuccess(httpData(xml, options.dataType));
      } else {
        options.onError();
      };

      // 调用完成后的回调函数
      options.onComplete();
      // 避免内存泄露,清理文档
      xml = null;
    };
  };

  // 建立与服务器的链接
  xml.send(options.data);

  // 判断HTTP响应是否成功
  function httpSuccess(r) {
    try {
      // 如果得不到服务器状态,且我们正在请求本地文件,则认为成功
      return !r.status && location.protocol == "file:" ||
      // 所有200-300之间的状态码 表示成功
      r.status >= 200 && r.status <= 300 ||
      // 文档未修改也算成功
      r.status == 304 ||
      // Safari在文档未修改的时候返回空状态
      navigator.userAgent.indexOf('Safari') >= 0 && typeof r.status == "undefined";
    } catch (e) {};

    // 若检查状态失败,则假定请求是失败的
    return false;
  };

  // 从HTTP响应中解析正确数据
  function httpData(r, type) {
    // 获取content-type的头部
    var ct = r.getResponseHeader("content-type");
    // 如果没有提供默认类型, 判断服务器返回的是否是XML形式
    var data = !type && ct && ct.indexOf('xml') >= 0;

    // 如果是XML则获得XML对象 否则返回文本内容
    data = type == "xml" || data ? r.responseXML : r.responseText;

    // 如果指定类型是script,则以javascript形式执行返回文本
    if (type == "script") {
      eval.call(window, data);
    };

    // 返回响应数据
    return data;
  };
};

function Uploader(options) {
  if (!(this instanceof Uploader)) {
    return new Uploader(options);
  }
  if (isString(options)) {
    options = {
      trigger: options
    };
  }

  var settings = {
    trigger: null,
    name: null,
    action: null,
    data: null,
    accept: null,
    change: null,
    error: null,
    multiple: true,
    success: null
  };
  if (options) {
    extend(settings, options);
  }
  var $trigger = settings.trigger;

  // settings.action = settings.action || $trigger.dataset.action || '/upload';
  // settings.name = settings.name || $trigger.getAttribute('name') || $trigger.dataset.name || 'file';
  // settings.data = settings.data || parse($trigger.dataset.data);
  // settings.accept = settings.accept || $trigger.dataset.accept;
  // settings.success = settings.success || $trigger.dataset.success;

  settings.action = settings.action || '/upload';
  settings.name = settings.name || $trigger.getAttribute('name') || 'file';
  settings.data = settings.data;
  settings.accept = settings.accept;
  settings.success = settings.success;
  this.settings = settings;

  this.setup();
  this.bind();
}

// initialize
// create input, form, iframe
Uploader.prototype.setup = function () {
  var self = this;
  var timestamp = new Date().valueOf();
  this.id = "upload_" + timestamp;
  this.form = document.createElement('form');
  this.form.id = this.id;
  this.form.action = this.settings.action;
  this.form.method = "post";
  this.form.enctype = "multipart/form-data";
  this.form.encoding = "multipart/form-data";
  this.form.target = "";
  document.body.appendChild(this.form);

  this.iframe = newIframe();
  //setAttribute
  this.form.setAttribute('target', this.iframe.getAttribute('name'));
  //var $uploadForm = document.getElementById(form_id);

  var data = this.settings.data;

  this.form.innerHTML = createInputs(data);
  if (window.FormData) {
    this.form.appendChild(createInputs({
      '_uploader_': 'formdata'
    })[0]);
  } else {
    this.form.appendChild(createInputs({
      '_uploader_': 'iframe'
    })[0]);
  }

  var input = document.createElement('input');
  input.type = 'file';
  input.name = this.settings.name;
  if (this.settings.accept) {
    input.accept = this.settings.accept;
  }
  if (this.settings.multiple) {
    input.multiple = true;
    input.setAttribute('multiple', 'multiple');
  }
  this.input = input;

  var $trigger = this.settings.trigger;
  var triggerCss = curStyle($trigger);

  this.outerWidth = parseInt(triggerCss.width) + parseInt(triggerCss.paddingLeft) + parseInt(triggerCss.paddingRight) + parseInt(triggerCss.borderLeftWidth) + parseInt(triggerCss.borderRightWidth) + parseInt(triggerCss.marginLeft) + parseInt(triggerCss.marginRight);
  this.outerHeight = parseInt(triggerCss.height) + parseInt(triggerCss.paddingTop) + parseInt(triggerCss.paddingBottom) + parseInt(triggerCss.borderTopWidth) + parseInt(triggerCss.borderBottomWidth) + parseInt(triggerCss.marginTop) + parseInt(triggerCss.marginBottom);

  this.input.setAttribute('hidefocus', true);

  setStyle(this.input, {
    position: 'absolute',
    top: "0px",
    right: "0px",
    opacity: 0,
    outline: "0px",
    cursor: 'pointer',
    height: self.outerHeight + "px"
  });

  this.form.appendChild(this.input);

  setStyle(this.form, {
    position: 'absolute',
    top: parseInt(offsetTop($trigger)) + "px",
    left: parseInt(offsetLeft($trigger)) + "px",
    overflow: 'hidden',
    width: self.outerWidth + "px",
    height: self.outerHeight + "px",
    zIndex: $trigger.style.zIndex + 100
  });

  return this;
};

// bind events
Uploader.prototype.bind = function () {
  var self = this;
  var $trigger = self.settings.trigger;
  mouseEnter($trigger, function () {
    setStyle(self.form, {
      top: $trigger.style.offsetTop + "px",
      left: $trigger.style.offsetLeft + "px",
      overflow: 'hidden',
      width: self.outerWidth + "px",
      height: self.outerHeight + "px"
    });
  });
  self.bindInput();
};

Uploader.prototype.bindInput = function () {
  var self = this;
  addEventListener(this.input, "change", function (e) {
    // ie9 don't support FileList Object
    // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
    self._files = this.files || [{
      name: e.target ? e.target.value : e.srcElement.value
    }];
    var file = self.input.value;
    if (self.settings.change) {
      self.settings.change.call(self, self._files);
    } else if (file) {
      return self.submit();
    }
  });
};

// handle submit event
// prepare for submiting form
Uploader.prototype.submit = function () {
  var self = this;
  if (window.FormData && self._files) {
    // build a FormData
    var form = new FormData(self.form);
    // use FormData to upload
    form.append(self.settings.name, self._files);

    var optionXhr;

    if (self.settings.progress) {
      // fix the progress target file
      var files = self._files;
      optionXhr = function () {

        function updateProgress(event) {
          // event.total是需要传输的总字节, event.loaded是已经传输的字节.
          // 如果event.lengthComputable不为真，则event.total等于0
          var percent = 0;
          var position = event.loaded || event.position; /*event.position is deprecated*/
          var total = event.total;
          console.log(event.total);
          if (event.lengthComputable) {
            percent = Math.ceil(position / total * 100);
          }
          self.settings.progress(event, position, total, percent, files);
        }

        function uploadComplete(event) {
          console.log("uploadComplete");
        }

        function uploadFailed(event) {
          console.log("uploadFailed");
        }

        function uploadCanceled(event) {
          console.log("uploadCanceled");
        }

        var xhr = new XMLHttpRequest();

        // 定义progress事件的回调函数
        if (xhr.upload) {
          //进度条    
          addEventListener(xhr.upload, "progress", updateProgress);
          //下载           
          xhr.addEventListener("load", uploadComplete, false);
          //错误信息           
          xhr.addEventListener("error", uploadFailed, false);
          //取消   
          xhr.addEventListener("abort", uploadCanceled, false);
        }

        return xhr;
      };
    }

    ajax({
      type: 'post',
      url: self.settings.action,
      timeout: 2000,
      xhr: optionXhr,
      onError: self.settings.error,
      onSuccess: self.settings.success,
      data: form
    });
    return this;
  } else {
    // iframe upload
    this.iframe = newIframe();
    this.form.setAttribute('target', this.iframe.getAttribute('name'));
    document.body.appendChild(this.iframe);

    this.iframe.onreadystatechange = function () {
      if (self.iframe.readyState == "complete") {
        var input_iframe = document.createElement("iframe");
        input_iframe.src = "javascript:false;";
        input_iframe.style.display = "none";
        self.form.appendChild(input_iframe);
        input_iframe.parentNode.removeChild(input_iframe);

        var response;
        try {
          response = self.iframe.contentWindow.document.body.innerHTML;
        } catch (e) {
          response = "cross-domain";
        }
        self.iframe.parentNode.removeChild(self.iframe);
        if (!response) {
          if (self.settings.error) {
            self.settings.error(self.input.value);
          }
        } else {
          if (self.settings.success) {
            self.settings.success(response);
          }
        }
      }
    };
    this.form.submit();
  }
  return this;
};

Uploader.prototype.refreshInput = function () {
  //replace the input element, or the same file can not to be uploaded
  var newInput = this.input.cloneNode(true);
  this.input.parentNode.insertBefore(newInput, this.input.nextSibling);
  removeEventListener(this.input, 'change');
  this.input.parentNode.removeChild(this.input);
  this._files = null;
  this.input = newInput;
  this.bindInput();
};

// handle change event
// when value in file input changed
Uploader.prototype.change = function (callback) {
  if (!callback) {
    return this;
  }
  this.settings.change = callback;
  return this;
};

// handle when upload success
Uploader.prototype.success = function (callback) {
  var self = this;
  // response 就是返回的数据
  this.settings.success = function (response) {
    self.refreshInput();
    if (callback) {
      callback(response);
    }
  };
  return this;
};

// handle when upload error
Uploader.prototype.error = function (callback) {
  var me = this;
  this.settings.error = function (response) {
    if (callback) {
      me.refreshInput();
      callback(response);
    }
  };
  return this;
};

// enable
Uploader.prototype.enable = function () {
  this.input.disabled = false;
  setStyle(this.input, {
    cursor: 'pointer'
  });
};

// disable
Uploader.prototype.disable = function () {
  this.input.disabled = true;
  setStyle(this.input, {
    cursor: 'not-allowed'
  });
};

// Helpers
// -------------

function isString(val) {
  return Object.prototype.toString.call(val) === '[object String]';
}

function createInputs(data) {
  if (!data) return [];

  var inputs = [],
      i,
      html = '';
  for (var name in data) {
    i = document.createElement('input');
    i.type = 'hidden';
    i.name = name;
    i.value = data[name];
    inputs.push(i);
  }
  return inputs;
}

function parse(str) {
  if (!str) return {};
  var ret = {};

  var pairs = str.split('&');
  var unescape = function unescape(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  };

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    var key = unescape(pair[0]);
    var val = unescape(pair[1]);
    ret[key] = val;
  }

  return ret;
}

function findzIndex($node) {
  var parents = $node.parentsUntil('body');
  var zIndex = 0;
  for (var i = 0; i < parents.length; i++) {
    var item = parents.eq(i);
    if (item.css('position') !== 'static') {
      zIndex = parseInt(item.css('zIndex'), 10) || zIndex;
    }
  }
  return zIndex;
}

function newIframe() {
  var iframeName = 'iframe-uploader-' + iframeCount;
  var iframe = document.createElement("iframe");
  iframe.setAttribute("id", iframeName);
  iframe.setAttribute("name", iframeName);
  iframe.style.display = "none";
  iframeCount += 1;
  return iframe;
}

function MultipleUploader(options) {
  if (!(this instanceof MultipleUploader)) {
    return new MultipleUploader(options);
  }

  if (isString(options)) {
    options = {
      trigger: options
    };
  }
  var $trigger = options.trigger;

  var uploaders = [];
  options.trigger = document.getElementById($trigger);
  uploaders.push(new Uploader(options));
  this._uploaders = uploaders;
}

MultipleUploader.prototype.submit = function () {
  each(this._uploaders, function (item) {
    item.submit();
  });
  return this;
};

MultipleUploader.prototype.change = function (callback) {
  each(this._uploaders, function (item) {
    item.change(callback);
  });
  return this;
};

MultipleUploader.prototype.success = function (callback) {
  each(this._uploaders, function (item) {
    item.success(callback);
  });
  return this;
};

MultipleUploader.prototype.error = function (callback) {
  each(this._uploaders, function (item) {
    item.error(callback);
  });
  return this;
};

MultipleUploader.prototype.enable = function () {
  each(this._uploaders, function (item) {
    item.enable();
  });
  return this;
};

MultipleUploader.prototype.disable = function () {
  each(this._uploaders, function (item) {
    item.disable();
  });
  return this;
};

MultipleUploader.Uploader = Uploader;

module.exports = MultipleUploader;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkOi9qb2JEZXZlbG9wbWVudC9teSBlbHNlL2d5cm8tbGlicmFyeS9FUzYvZGVtby91cGxvYWQvanMvYXBwLmpzIiwiZDovam9iRGV2ZWxvcG1lbnQvbXkgZWxzZS9neXJvLWxpYnJhcnkvRVM2L3NyYy91cGxvYWQvaW5kZXguanMiLCJkOi9qb2JEZXZlbG9wbWVudC9teSBlbHNlL2d5cm8tbGlicmFyeS9FUzYvc3JjL3VwbG9hZC9tYWluL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O2dDQ0FxQiw4QkFBOEI7Ozs7QUFFbkQsQ0FBQyxZQUFXO0FBQ1YsTUFBSSxLQUFLLEdBQUcsU0FBUixLQUFLLENBQVksRUFBRSxFQUFFO0FBQ3ZCLFFBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN4QixTQUFHLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3JELE1BQU07QUFDTCxTQUFHLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzNDO0dBQ0YsQ0FBQztBQUNGLE9BQUssQ0FBQyxZQUFXO0FBQ2Ysc0NBQWE7QUFDWCxhQUFPLEVBQUUsWUFBWTtBQUNyQixZQUFNLEVBQUUsR0FBRztBQUNYLGNBQVEsRUFBRSxvQkFBVztBQUNuQixlQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ3hCO0tBQ0YsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFTLElBQUksRUFBRTtBQUN4QixXQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDYixDQUFDLENBQUM7O0FBRUgsUUFBSSxRQUFRLEdBQUcsa0NBQWE7QUFDMUIsYUFBTyxFQUFFLFlBQVk7QUFDckIsWUFBTSxFQUFFLEdB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SSxDQUFDLEVBQUUsQ0FBQztHQUMxQixDQUFDO0FBQ0YsTUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2YsT0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDZixRQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNSLFdBQUssR0FBRyxRQUFRLElBQUksQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDdEMsWUFBTTtLQUNQLENBQUM7R0FDSCxDQUFDO0FBQ0YsR0FBQyxDQUFDLE9BQU8sR0FBRyxLQUFLLElBQUksTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFDNUYsR0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ2QsR0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQyxHQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9DLEdBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0MsR0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQyxHQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFD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LFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDeEIsQ0FBQyxDQUFDO0FBQ0gsU0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOztBQUVGLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDcEQsTUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDbkMsUUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUN0QixDQUFDLENBQUM7QUFDSCxTQUFPLElBQUksQ0FBQztDQUNiLENBQUM7O0FBRUYsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFXO0FBQzdDLE1BQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFVBQVMsSUFBSSxFQUFFO0FBQ25DLFFBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUNmLENBQUMsQ0FBQztBQUNILFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7QUFFRixnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFlBQVc7QUFDOUMsTUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDbkMsUUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ2hCLENBQUMsQ0FBQztBQUNILFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7QUFFRixnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztBQUVyQyxNQUFNLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBVcGxvYWRlciBmcm9tICcuLi8uLi8uLi9zcmMvdXBsb2FkL2luZGV4LmpzJztcblxuKGZ1bmN0aW9uKCkge1xuICBsZXQgcmVhZHkgPSBmdW5jdGlvbihmbikgeyAgXG4gICAgbGV0IGRvYyA9IGRvY3VtZW50O1xuICAgIGlmIChkb2MuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbiwgZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb2MuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZuKTtcbiAgICB9XG4gIH07XG4gIHJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIG5ldyBVcGxvYWRlcih7XG4gICAgICB0cmlnZ2VyOiAndXBsb2FkZXItMScsXG4gICAgICBhY3Rpb246ICcvJyxcbiAgICAgIHByb2dyZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGFsZXJ0KGRhdGEpO1xuICAgIH0pO1xuXG4gICAgdmFyIHVwbG9hZGVyID0gbmV3IFVwbG9hZGVyKHtcbiAgICAgIHRyaWdnZXI6ICd1cGxvYWRlci0yJyxcbiAgICAgIGFjdGlvbjogJy8nXG4gICAgfSkuY2hhbmdlKGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gICAgICBjb25zb2xlLmxvZyhmaWxlbmFtZSlcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1cGxvYWQtMi10ZXh0JykuaW5uZXJIVE1MID0gZmlsZW5hbWVbMF0ubmFtZS5yZXBsYWNlKC88Lis/Pi9naW0sJycpO1xuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgYWxlcnQoZGF0YSk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VibWl0LTInKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB1cGxvYWRlci5zdWJtaXQoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgbmV3IFVwbG9hZGVyKHtcbiAgICAgIHRyaWdnZXI6ICd1cGxvYWRlci0zJyxcbiAgICAgIGFjY2VwdDogJ2ltYWdlLyonLFxuICAgICAgYWN0aW9uOiAnLydcbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGFsZXJ0KGRhdGEpO1xuICAgIH0pO1xuXG4gICAgdmFyIHVwbG9hZGVyQ2FuQmVEaXNhYmxlZCA9IG5ldyBVcGxvYWRlcih7XG4gICAgICB0cmlnZ2VyOiAndXBsb2FkZXItNCcsXG4gICAgICBhY3Rpb246ICcvJ1xuICAgIH0pLmNoYW5nZShmdW5jdGlvbihmaWxlbmFtZSkge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VwbG9hZC00LXRleHQnKS5pbm5lckhUTUwgPSBmaWxlbmFtZVswXS5uYW1lLnJlcGxhY2UoLzwuKz8+L2dpbSwnJyk7XG4gICAgfSkuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICBhbGVydChkYXRhKTtcbiAgICB9KTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlzYWJsZScpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0eHQgPSAkKHRoaXMpLmh0bWwoKTtcbiAgICAgIHVwbG9hZGVyQ2FuQmVEaXNhYmxlZFt0eHQgPT09ICdEaXNhYmxlJz8gJ2Rpc2FibGUnOiAnZW5hYmxlJ10oKTtcbiAgICAgIHRoaXMuaW5uZXJIVE1MID0gKHR4dCA9PT0gJ0Rpc2FibGUnPyAnRW5hYmxlJzogJ0Rpc2FibGUnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Ym1pdC00Jykub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgdXBsb2FkZXJDYW5CZURpc2FibGVkLnN1Ym1pdCgpOyAgXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgfSwgZmFsc2UpO1xuXG59KSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgcXJjb2RlIGZyb20gJy4vbWFpbi9tYWluLmpzJztcblxubW9kdWxlLmV4cG9ydHMgPSBxcmNvZGU7XG4iLCJ2YXIgaWZyYW1lQ291bnQgPSAwO1xuXG4vKuiOt+WPlua1j+iniOWZqOS/oeaBryovXG52YXIgQnJvd3NlciA9IChmdW5jdGlvbih1YSkge1xuICB2YXIgYiA9IHtcbiAgICBtc2llOiAvbXNpZS8udGVzdCh1YSkgJiYgIS9vcGVyYS8udGVzdCh1YSksXG4gICAgb3BlcmE6IC9vcGVyYS8udGVzdCh1YSksXG4gICAgc2FmYXJpOiAvd2Via2l0Ly50ZXN0KHVhKSAmJiAhL2Nocm9tZS8udGVzdCh1YSksXG4gICAgZmlyZWZveDogL2ZpcmVmb3gvLnRlc3QodWEpLFxuICAgIGNocm9tZTogL2Nocm9tZS8udGVzdCh1YSlcbiAgfTtcbiAgdmFyIHZNYXJrID0gXCJcIjtcbiAgZm9yICh2YXIgaSBpbiBiKSB7XG4gICAgaWYgKGJbaV0pIHtcbiAgICAgIHZNYXJrID0gXCJzYWZhcmlcIiA9PSBpID8gXCJ2ZXJzaW9uXCIgOiBpO1xuICAgICAgYnJlYWs7XG4gICAgfTtcbiAgfTtcbiAgYi52ZXJzaW9uID0gdk1hcmsgJiYgUmVnRXhwKFwiKD86XCIgKyB2TWFyayArIFwiKVtcXFxcLzogXShbXFxcXGQuXSspXCIpLnRlc3QodWEpID8gUmVnRXhwLiQxIDogXCIwXCI7XG4gIGIuaWUgPSBiLm1zaWU7XG4gIGIuaWU2ID0gYi5tc2llICYmIHBhcnNlSW50KGIudmVyc2lvbiwgMTApID09IDY7XG4gIGIuaWU3ID0gYi5tc2llICYmIHBhcnNlSW50KGIudmVyc2lvbiwgMTApID09IDc7XG4gIGIuaWU4ID0gYi5tc2llICYmIHBhcnNlSW50KGIudmVyc2lvbiwgMTApID09IDg7XG4gIGIuaWU5ID0gYi5tc2llICYmIHBhcnNlSW50KGIudmVyc2lvbiwgMTApID09IDk7XG4gIGIuaWUxMCA9IGIubXNpZSAmJiBwYXJzZUludChiLnZlcnNpb24sIDEwKSA9PSAxMDtcbiAgcmV0dXJuIGI7XG59KSh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKTtcblxuZnVuY3Rpb24gZXh0ZW5kKG9iamVjdCkge1xuICAvLyBUYWtlcyBhbiB1bmxpbWl0ZWQgbnVtYmVyIG9mIGV4dGVuZGVycy5cbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gIC8vIEZvciBlYWNoIGV4dGVuZGVyLCBjb3B5IHRoZWlyIHByb3BlcnRpZXMgb24gb3VyIG9iamVjdC5cbiAgZm9yICh2YXIgaSA9IDAsIHNvdXJjZTsgc291cmNlID0gYXJnc1tpXTsgaSsrKSB7XG4gICAgaWYgKCFzb3VyY2UpIGNvbnRpbnVlO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHNvdXJjZSkge1xuICAgICAgb2JqZWN0W3Byb3BlcnR5XSA9IHNvdXJjZVtwcm9wZXJ0eV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iamVjdDtcbn07XG5cbmZ1bmN0aW9uIGVhY2gob2JqZWN0LCBjYWxsYmFjaykge1xuICBpZiAodW5kZWZpbmVkID09PSBvYmplY3QubGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiBvYmplY3QpIHtcbiAgICAgIGlmIChmYWxzZSA9PT0gY2FsbGJhY2sob2JqZWN0W25hbWVdLCBuYW1lLCBvYmplY3QpKSBicmVhaztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG9iamVjdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKGkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChmYWxzZSA9PT0gY2FsbGJhY2sob2JqZWN0W2ldLCBpLCBvYmplY3QpKSBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xuXG4vL2N1clN0eWxl5piv55So5p2l6I635Y+W5YWD57Sg55qE5pyA57uI5qC35byP6KGo55qEXG5mdW5jdGlvbiBjdXJTdHlsZShlbGVtKSB7XG4gIGlmIChkb2N1bWVudC5kZWZhdWx0VmlldyAmJiBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWxlbSwgbnVsbCk7IC8v6L+Z5pivdzNj5qCH5YeG5pa55rOV77yM5Y+W5b6X5YWD57Sg55qE5qC35byP5L+h5oGv77yM5Zug5Li65pyJ5Lqb5qC35byP5piv5Zyo5aSW6YOoY3Nz5paH5Lu25a6a5LmJ55qE77yM5omA5Lul55SoZWxlbS5zdHlsZeaYr+WPluS4jeWIsOeahFxuICB9IGVsc2Uge1xuICAgIHJldHVybiBlbGVtLmN1cnJlbnRTdHlsZTsgLy/lpoLmnpzmmK9pZSzlj6/ku6XnlKggZWxlbS5jdXJyZW50U3R5bGVbXCJuYW1lXCJdXG4gIH07XG59O1xuXG5mdW5jdGlvbiBvZmZzZXRUb3AoZWxlbWVudHMpIHtcbiAgdmFyIHRvcCA9IGVsZW1lbnRzLm9mZnNldFRvcDtcbiAgdmFyIHBhcmVudCA9IGVsZW1lbnRzLm9mZnNldFBhcmVudDtcbiAgd2hpbGUgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgdG9wICs9IHBhcmVudC5vZmZzZXRUb3A7XG4gICAgcGFyZW50ID0gcGFyZW50Lm9mZnNldFBhcmVudDtcbiAgfTtcbiAgcmV0dXJuIHRvcDtcbn07XG5cbmZ1bmN0aW9uIG9mZnNldExlZnQoZWxlbWVudHMpIHtcbiAgdmFyIGxlZnQgPSBlbGVtZW50cy5vZmZzZXRMZWZ0O1xuICB2YXIgcGFyZW50ID0gZWxlbWVudHMub2Zmc2V0UGFyZW50O1xuICB3aGlsZSAocGFyZW50ICE9IG51bGwpIHtcbiAgICBsZWZ0ICs9IHBhcmVudC5vZmZzZXRMZWZ0O1xuICAgIHBhcmVudCA9IHBhcmVudC5vZmZzZXRQYXJlbnQ7XG4gIH07XG4gIHJldHVybiBsZWZ0O1xufTtcblxuZnVuY3Rpb24gc2V0U3R5bGUoZWxlbXMsIHN0eWxlLCB2YWx1ZSkge1xuICBpZiAoIWVsZW1zLmxlbmd0aCkge1xuICAgIGVsZW1zID0gW2VsZW1zXTtcbiAgfTtcbiAgaWYgKHR5cGVvZiBzdHlsZSA9PSBcInN0cmluZ1wiKSB7XG4gICAgdmFyIHMgPSBzdHlsZTtcbiAgICBzdHlsZSA9IHt9O1xuICAgIHN0eWxlW3NdID0gdmFsdWU7XG4gIH07XG5cbiAgZnVuY3Rpb24gY2FtZWxpemUocykge1xuICAgIHJldHVybiBzLnJlcGxhY2UoLy0oW2Etel0pL2lnLFxuICAgICAgZnVuY3Rpb24oYWxsLCBsZXR0ZXIpIHtcbiAgICAgICAgcmV0dXJuIGxldHRlci50b1VwcGVyQ2FzZSgpO1xuICAgICAgfSk7XG4gIH07XG4gIGVhY2goZWxlbXMsXG4gICAgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgZm9yICh2YXIgbmFtZSBpbiBzdHlsZSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBzdHlsZVtuYW1lXTtcbiAgICAgICAgaWYgKG5hbWUgPT0gXCJvcGFjaXR5XCIgJiYgQnJvd3Nlci5pZSkge1xuICAgICAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gKGVsZW0uY3VycmVudFN0eWxlICYmIGVsZW0uY3VycmVudFN0eWxlLmZpbHRlciB8fCBcIlwiKS5yZXBsYWNlKC9hbHBoYVxcKFteKV0qXFwpLywgXCJcIikgKyBcIiBhbHBoYShvcGFjaXR5PVwiICsgKHZhbHVlICogMTAwIHwgMCkgKyBcIilcIjtcbiAgICAgICAgfSBlbHNlIGlmIChuYW1lID09IFwiZmxvYXRcIikge1xuICAgICAgICAgIGVsZW0uc3R5bGVbQnJvd3Nlci5pZSA/IFwic3R5bGVGbG9hdFwiIDogXCJjc3NGbG9hdFwiXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW0uc3R5bGVbY2FtZWxpemUobmFtZSldID0gdmFsdWU7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcihvVGFyZ2V0LCBzRXZlbnRUeXBlLCBmbkhhbmRsZXIpIHtcbiAgaWYgKG9UYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIG9UYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihzRXZlbnRUeXBlLCBmbkhhbmRsZXIsIGZhbHNlKTtcbiAgfSBlbHNlIGlmIChvVGFyZ2V0LmF0dGFjaEV2ZW50KSB7XG4gICAgb1RhcmdldC5hdHRhY2hFdmVudChcIm9uXCIgKyBzRXZlbnRUeXBlLCBmbkhhbmRsZXIpO1xuICB9IGVsc2Uge1xuICAgIG9UYXJnZXRbXCJvblwiICsgc0V2ZW50VHlwZV0gPSBmbkhhbmRsZXI7XG4gIH07XG59O1xuXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKG9UYXJnZXQsIHNFdmVudFR5cGUsIGZuSGFuZGxlcikge1xuICBpZiAob1RhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgb1RhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHNFdmVudFR5cGUsIGZuSGFuZGxlciwgZmFsc2UpO1xuICB9IGVsc2UgaWYgKG9UYXJnZXQuZGV0YWNoRXZlbnQpIHtcbiAgICBpZiAoZm5IYW5kbGVyKSB7XG4gICAgICBvVGFyZ2V0LmRldGFjaEV2ZW50KFwib25cIiArIHNFdmVudFR5cGUsIGZuSGFuZGxlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9UYXJnZXQuZGV0YWNoRXZlbnQoXCJvblwiICsgc0V2ZW50VHlwZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG9UYXJnZXRbXCJvblwiICsgc0V2ZW50VHlwZV0gPSBudWxsO1xuICB9O1xufTtcblxuZnVuY3Rpb24gY29udGFpbnMocm9vdCwgZWxlbSkge1xuICBpZiAoIXJvb3QgJiYgIWVsZW0pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG4gIGlmIChyb290LmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKSByZXR1cm4gcm9vdCA9PT0gZWxlbSB8fCAhIShyb290LmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGVsZW0pICYgMTYpO1xuICBpZiAocm9vdC5jb250YWlucyAmJiBlbGVtLm5vZGVUeXBlID09PSAxKSB7XG4gICAgcmV0dXJuIHJvb3QuY29udGFpbnMoZWxlbSkgJiYgcm9vdCAhPT0gZWxlbTtcbiAgfTtcbiAgd2hpbGUgKChlbGVtID0gZWxlbS5wYXJlbnROb2RlKSlcbiAgICBpZiAoZWxlbSA9PT0gcm9vdCkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIGZpeGVkTW91c2UoZSwgdGhhdCkgeyAvL3RoYXQg5Li66Kem5Y+R6K+l5LqL5Lu25Lyg6YCS5LiL5p2l55qEdGhpc+aMh+mSiFxuICB2YXIgcmVsYXRlZCwgdHlwZSA9IGUudHlwZS50b0xvd2VyQ2FzZSgpOyAvL+i/memHjOiOt+WPluS6i+S7tuWQjeWtl1xuICBpZiAodHlwZSA9PSAnbW91c2VvdmVyJykge1xuICAgIHJlbGF0ZWQgPSBlLnJlbGF0ZWRUYXJnZXQgfHwgZS5mcm9tRWxlbWVudDsgLy/np7vlhaXnm67moIflhYPntKBcbiAgfSBlbHNlIGlmICh0eXBlID0gJ21vdXNlb3V0Jykge1xuICAgIHJlbGF0ZWQgPSBlLnJlbGF0ZWRUYXJnZXQgfHwgZS50b0VsZW1lbnQ7IC8v56e75Ye655uu5qCH5YWD57SgXG4gIH0gZWxzZSByZXR1cm4gdHJ1ZTtcbiAgdmFyIGNvbnRhaW4gPSBjb250YWlucyh0aGF0LCByZWxhdGVkKTtcbiAgcmV0dXJuICdkb2N1bWVudCcgJiYgcmVsYXRlZCAmJiByZWxhdGVkLnByZWZpeCAhPSAneHVsJyAmJiAhY29udGFpbiAmJiByZWxhdGVkICE9PSB0aGF0O1xufTtcblxuZnVuY3Rpb24gbW91c2VFbnRlcihlbGVtZW50LCBjYWxsYmFjaykge1xuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQsIFwibW91c2VvdmVyXCIsXG4gICAgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgaWYgKGZpeGVkTW91c2UoZSwgdGhhdCkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCgpOyAvL+WwgeijheWbnuiwg+WHveaVsFxuICAgICAgfTtcbiAgICB9LFxuICAgIGZhbHNlKTtcbn07XG5cbmZ1bmN0aW9uIG1vdXNlTGVhdmUoZWxlbWVudCwgY2FsbGJhY2spIHtcbiAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50LCBcIm1vdXNlb3V0XCIsXG4gICAgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgaWYgKGZpeGVkTW91c2UoZSwgdGhhdCkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCgpOyAvL+WwgeijheWbnuiwg+WHveaVsFxuICAgICAgfTtcbiAgICB9LFxuICAgIGZhbHNlKTtcbn07XG5cblxuLy8g5Yib5bu65a6M5pW0QWpheOeoi+W6j+WMhSDvvIzor6XljIXkuI3mlK/mjIHot6jln59cbmZ1bmN0aW9uIGFqYXgob3B0aW9ucykge1xuICBvcHRpb25zID0ge1xuICAgIHR5cGU6IG9wdGlvbnMudHlwZSB8fCBcIkdFVFwiLFxuICAgIGRhdGFUeXBlOiBvcHRpb25zLmRhdGFUeXBlIHx8IFwianNvblwiLFxuICAgIHVybDogb3B0aW9ucy51cmwgfHwgXCJcIixcbiAgICB4aHI6IG9wdGlvbnMueGhyIHx8IGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9LFxuICAgIGRhdGE6IG9wdGlvbnMuZGF0YSB8fCBcIlwiLFxuICAgIHRpbWVvdXQ6IG9wdGlvbnMudGltZW91dCB8fCA1MDAwLFxuICAgIG9uQ29tcGxldGU6IG9wdGlvbnMub25Db21wbGV0ZSB8fCBmdW5jdGlvbigpIHt9LFxuICAgIG9uRXJyb3I6IG9wdGlvbnMub25FcnJvciB8fCBmdW5jdGlvbigpIHt9LFxuICAgIG9uU3VjY2Vzczogb3B0aW9ucy5vblN1Y2Nlc3MgfHwgZnVuY3Rpb24oKSB7fVxuICB9O1xuXG4gIHZhciB4bWwgPSBvcHRpb25zLnhocigpO1xuICB4bWwub3BlbihvcHRpb25zLnR5cGUsIG9wdGlvbnMudXJsLCB0cnVlKTtcbiAgdmFyIHRpbWVvdXRMZW5ndGggPSBvcHRpb25zLnRpbWVvdXQ7XG5cbiAgdmFyIHJlcXVlc3REb25lID0gZmFsc2U7XG5cbiAgLy8g5Yid5aeL5YyW5LiA5LiqNeenkuWQjuaJp+ihjOeahOWbnuiwg+WHveaVsCznlKjkuo7lj5bmtojor7fmsYJcbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHJlcXVlc3REb25lID0gdHJ1ZTtcbiAgICB9LFxuICAgIHRpbWVvdXRMZW5ndGgpO1xuXG4gIC8vIOebkeWQrOaWh+aho+abtOaWsOeKtuaAgVxuICB4bWwub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8g5L+d5oyB562J5b6FIOWPquWIsOaVsOaNruWFqOmDqOWKoOi9vSDkuJTmsqHmnInotoXml7ZcbiAgICBpZiAoeG1sLnJlYWR5U3RhdGUgPT0gNCAmJiAhcmVxdWVzdERvbmUpIHtcbiAgICAgIC8vIOajgOafpeaYr+WQpuivt+axguaIkOWKn1xuICAgICAgaWYgKGh0dHBTdWNjZXNzKHhtbCkpIHtcbiAgICAgICAgLy8g5Lul5pyN5Yqh5Zmo6L+U5Zue55qE5pWw5o2u5L2c5Li65Y+C5pWw5omn6KGM5oiQ5Yqf5Zue6LCD5Ye95pWwXG4gICAgICAgIG9wdGlvbnMub25TdWNjZXNzKGh0dHBEYXRhKHhtbCwgb3B0aW9ucy5kYXRhVHlwZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0aW9ucy5vbkVycm9yKCk7XG4gICAgICB9O1xuXG4gICAgICAvLyDosIPnlKjlrozmiJDlkI7nmoTlm57osIPlh73mlbBcbiAgICAgIG9wdGlvbnMub25Db21wbGV0ZSgpO1xuICAgICAgLy8g6YG/5YWN5YaF5a2Y5rOE6ZyyLOa4heeQhuaWh+aho1xuICAgICAgeG1sID0gbnVsbDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIOW7uueri+S4juacjeWKoeWZqOeahOmTvuaOpVxuICB4bWwuc2VuZChvcHRpb25zLmRhdGEpO1xuXG4gIC8vIOWIpOaWrUhUVFDlk43lupTmmK/lkKbmiJDlip9cbiAgZnVuY3Rpb24gaHR0cFN1Y2Nlc3Mocikge1xuICAgIHRyeSB7XG4gICAgICAvLyDlpoLmnpzlvpfkuI3liLDmnI3liqHlmajnirbmgIEs5LiU5oiR5Lus5q2j5Zyo6K+35rGC5pys5Zyw5paH5Lu2LOWImeiupOS4uuaIkOWKn1xuICAgICAgcmV0dXJuICFyLnN0YXR1cyAmJiBsb2NhdGlvbi5wcm90b2NvbCA9PSBcImZpbGU6XCIgfHxcbiAgICAgICAgLy8g5omA5pyJMjAwLTMwMOS5i+mXtOeahOeKtuaAgeeggSDooajnpLrmiJDlip9cbiAgICAgICAgKHIuc3RhdHVzID49IDIwMCAmJiByLnN0YXR1cyA8PSAzMDApIHx8XG4gICAgICAgIC8vIOaWh+aho+acquS/ruaUueS5n+eul+aIkOWKn1xuICAgICAgICByLnN0YXR1cyA9PSAzMDQgfHxcbiAgICAgICAgLy8gU2FmYXJp5Zyo5paH5qGj5pyq5L+u5pS555qE5pe25YCZ6L+U5Zue56m654q25oCBXG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignU2FmYXJpJykgPj0gMCAmJiB0eXBlb2Ygci5zdGF0dXMgPT0gXCJ1bmRlZmluZWRcIjtcbiAgICB9IGNhdGNoIChlKSB7fTtcblxuICAgIC8vIOiLpeajgOafpeeKtuaAgeWksei0pSzliJnlgYflrpror7fmsYLmmK/lpLHotKXnmoRcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLy8g5LuOSFRUUOWTjeW6lOS4reino+aekOato+ehruaVsOaNrlxuICBmdW5jdGlvbiBodHRwRGF0YShyLCB0eXBlKSB7XG4gICAgLy8g6I635Y+WY29udGVudC10eXBl55qE5aS06YOoXG4gICAgdmFyIGN0ID0gci5nZXRSZXNwb25zZUhlYWRlcihcImNvbnRlbnQtdHlwZVwiKTtcbiAgICAvLyDlpoLmnpzmsqHmnInmj5Dkvpvpu5jorqTnsbvlnossIOWIpOaWreacjeWKoeWZqOi/lOWbnueahOaYr+WQpuaYr1hNTOW9ouW8j1xuICAgIHZhciBkYXRhID0gIXR5cGUgJiYgY3QgJiYgY3QuaW5kZXhPZigneG1sJykgPj0gMDtcblxuICAgIC8vIOWmguaenOaYr1hNTOWImeiOt+W+l1hNTOWvueixoSDlkKbliJnov5Tlm57mlofmnKzlhoXlrrlcbiAgICBkYXRhID0gdHlwZSA9PSBcInhtbFwiIHx8IGRhdGEgPyByLnJlc3BvbnNlWE1MIDogci5yZXNwb25zZVRleHQ7XG5cbiAgICAvLyDlpoLmnpzmjIflrprnsbvlnovmmK9zY3JpcHQs5YiZ5LulamF2YXNjcmlwdOW9ouW8j+aJp+ihjOi/lOWbnuaWh+acrFxuICAgIGlmICh0eXBlID09IFwic2NyaXB0XCIpIHtcbiAgICAgIGV2YWwuY2FsbCh3aW5kb3csIGRhdGEpO1xuICAgIH07XG5cbiAgICAvLyDov5Tlm57lk43lupTmlbDmja5cbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbn07XG5cblxuZnVuY3Rpb24gVXBsb2FkZXIob3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVXBsb2FkZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBVcGxvYWRlcihvcHRpb25zKTtcbiAgfVxuICBpZiAoaXNTdHJpbmcob3B0aW9ucykpIHtcbiAgICBvcHRpb25zID0ge1xuICAgICAgdHJpZ2dlcjogb3B0aW9uc1xuICAgIH07XG4gIH1cblxuICB2YXIgc2V0dGluZ3MgPSB7XG4gICAgdHJpZ2dlcjogbnVsbCxcbiAgICBuYW1lOiBudWxsLFxuICAgIGFjdGlvbjogbnVsbCxcbiAgICBkYXRhOiBudWxsLFxuICAgIGFjY2VwdDogbnVsbCxcbiAgICBjaGFuZ2U6IG51bGwsXG4gICAgZXJyb3I6IG51bGwsXG4gICAgbXVsdGlwbGU6IHRydWUsXG4gICAgc3VjY2VzczogbnVsbFxuICB9O1xuICBpZiAob3B0aW9ucykge1xuICAgIGV4dGVuZChzZXR0aW5ncywgb3B0aW9ucyk7XG4gIH1cbiAgdmFyICR0cmlnZ2VyID0gc2V0dGluZ3MudHJpZ2dlcjtcblxuICAvLyBzZXR0aW5ncy5hY3Rpb24gPSBzZXR0aW5ncy5hY3Rpb24gfHwgJHRyaWdnZXIuZGF0YXNldC5hY3Rpb24gfHwgJy91cGxvYWQnO1xuICAvLyBzZXR0aW5ncy5uYW1lID0gc2V0dGluZ3MubmFtZSB8fCAkdHJpZ2dlci5nZXRBdHRyaWJ1dGUoJ25hbWUnKSB8fCAkdHJpZ2dlci5kYXRhc2V0Lm5hbWUgfHwgJ2ZpbGUnO1xuICAvLyBzZXR0aW5ncy5kYXRhID0gc2V0dGluZ3MuZGF0YSB8fCBwYXJzZSgkdHJpZ2dlci5kYXRhc2V0LmRhdGEpO1xuICAvLyBzZXR0aW5ncy5hY2NlcHQgPSBzZXR0aW5ncy5hY2NlcHQgfHwgJHRyaWdnZXIuZGF0YXNldC5hY2NlcHQ7XG4gIC8vIHNldHRpbmdzLnN1Y2Nlc3MgPSBzZXR0aW5ncy5zdWNjZXNzIHx8ICR0cmlnZ2VyLmRhdGFzZXQuc3VjY2VzcztcblxuICBzZXR0aW5ncy5hY3Rpb24gPSBzZXR0aW5ncy5hY3Rpb24gfHwgJy91cGxvYWQnO1xuICBzZXR0aW5ncy5uYW1lID0gc2V0dGluZ3MubmFtZSB8fCAkdHJpZ2dlci5nZXRBdHRyaWJ1dGUoJ25hbWUnKSB8fCAnZmlsZSc7XG4gIHNldHRpbmdzLmRhdGEgPSBzZXR0aW5ncy5kYXRhO1xuICBzZXR0aW5ncy5hY2NlcHQgPSBzZXR0aW5ncy5hY2NlcHQ7XG4gIHNldHRpbmdzLnN1Y2Nlc3MgPSBzZXR0aW5ncy5zdWNjZXNzO1xuICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cbiAgdGhpcy5zZXR1cCgpO1xuICB0aGlzLmJpbmQoKTtcbn1cblxuLy8gaW5pdGlhbGl6ZVxuLy8gY3JlYXRlIGlucHV0LCBmb3JtLCBpZnJhbWVcblVwbG9hZGVyLnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB0aW1lc3RhbXAgPSAobmV3IERhdGUoKSkudmFsdWVPZigpO1xuICB0aGlzLmlkID0gXCJ1cGxvYWRfXCIgKyB0aW1lc3RhbXA7XG4gIHRoaXMuZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgdGhpcy5mb3JtLmlkID0gdGhpcy5pZDtcbiAgdGhpcy5mb3JtLmFjdGlvbiA9IHRoaXMuc2V0dGluZ3MuYWN0aW9uO1xuICB0aGlzLmZvcm0ubWV0aG9kID0gXCJwb3N0XCI7XG4gIHRoaXMuZm9ybS5lbmN0eXBlID0gXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCI7XG4gIHRoaXMuZm9ybS5lbmNvZGluZyA9IFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiO1xuICB0aGlzLmZvcm0udGFyZ2V0ID0gXCJcIjtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmZvcm0pO1xuXG4gIHRoaXMuaWZyYW1lID0gbmV3SWZyYW1lKCk7XG4gIC8vc2V0QXR0cmlidXRlXG4gIHRoaXMuZm9ybS5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsIHRoaXMuaWZyYW1lLmdldEF0dHJpYnV0ZSgnbmFtZScpKTtcbiAgLy92YXIgJHVwbG9hZEZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmb3JtX2lkKTtcblxuICB2YXIgZGF0YSA9IHRoaXMuc2V0dGluZ3MuZGF0YTtcblxuICB0aGlzLmZvcm0uaW5uZXJIVE1MID0gY3JlYXRlSW5wdXRzKGRhdGEpO1xuICBpZiAod2luZG93LkZvcm1EYXRhKSB7XG4gICAgdGhpcy5mb3JtLmFwcGVuZENoaWxkKGNyZWF0ZUlucHV0cyh7XG4gICAgICAnX3VwbG9hZGVyXyc6ICdmb3JtZGF0YSdcbiAgICB9KVswXSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5mb3JtLmFwcGVuZENoaWxkKGNyZWF0ZUlucHV0cyh7XG4gICAgICAnX3VwbG9hZGVyXyc6ICdpZnJhbWUnXG4gICAgfSlbMF0pO1xuICB9XG5cbiAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgaW5wdXQudHlwZSA9ICdmaWxlJztcbiAgaW5wdXQubmFtZSA9IHRoaXMuc2V0dGluZ3MubmFtZTtcbiAgaWYgKHRoaXMuc2V0dGluZ3MuYWNjZXB0KSB7XG4gICAgaW5wdXQuYWNjZXB0ID0gdGhpcy5zZXR0aW5ncy5hY2NlcHQ7XG4gIH1cbiAgaWYgKHRoaXMuc2V0dGluZ3MubXVsdGlwbGUpIHtcbiAgICBpbnB1dC5tdWx0aXBsZSA9IHRydWU7XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKCdtdWx0aXBsZScsICdtdWx0aXBsZScpO1xuICB9XG4gIHRoaXMuaW5wdXQgPSBpbnB1dDtcblxuICB2YXIgJHRyaWdnZXIgPSB0aGlzLnNldHRpbmdzLnRyaWdnZXI7XG4gIHZhciB0cmlnZ2VyQ3NzID0gY3VyU3R5bGUoJHRyaWdnZXIpO1xuXG4gIHRoaXMub3V0ZXJXaWR0aCA9IHBhcnNlSW50KHRyaWdnZXJDc3Mud2lkdGgpICsgcGFyc2VJbnQodHJpZ2dlckNzcy5wYWRkaW5nTGVmdCkgKyBwYXJzZUludCh0cmlnZ2VyQ3NzLnBhZGRpbmdSaWdodCkgKyBwYXJzZUludCh0cmlnZ2VyQ3NzLmJvcmRlckxlZnRXaWR0aCkgKyBwYXJzZUludCh0cmlnZ2VyQ3NzLmJvcmRlclJpZ2h0V2lkdGgpICsgcGFyc2VJbnQodHJpZ2dlckNzcy5tYXJnaW5MZWZ0KSArIHBhcnNlSW50KHRyaWdnZXJDc3MubWFyZ2luUmlnaHQpO1xuICB0aGlzLm91dGVySGVpZ2h0ID0gcGFyc2VJbnQodHJpZ2dlckNzcy5oZWlnaHQpICsgcGFyc2VJbnQodHJpZ2dlckNzcy5wYWRkaW5nVG9wKSArIHBhcnNlSW50KHRyaWdnZXJDc3MucGFkZGluZ0JvdHRvbSkgKyBwYXJzZUludCh0cmlnZ2VyQ3NzLmJvcmRlclRvcFdpZHRoKSArIHBhcnNlSW50KHRyaWdnZXJDc3MuYm9yZGVyQm90dG9tV2lkdGgpICsgcGFyc2VJbnQodHJpZ2dlckNzcy5tYXJnaW5Ub3ApICsgcGFyc2VJbnQodHJpZ2dlckNzcy5tYXJnaW5Cb3R0b20pO1xuXG4gIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCdoaWRlZm9jdXMnLCB0cnVlKTtcblxuICBzZXRTdHlsZSh0aGlzLmlucHV0LCB7XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgdG9wOiBcIjBweFwiLFxuICAgIHJpZ2h0OiBcIjBweFwiLFxuICAgIG9wYWNpdHk6IDAsXG4gICAgb3V0bGluZTogXCIwcHhcIixcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICBoZWlnaHQ6IHNlbGYub3V0ZXJIZWlnaHQgKyBcInB4XCJcbiAgfSk7XG5cbiAgdGhpcy5mb3JtLmFwcGVuZENoaWxkKHRoaXMuaW5wdXQpO1xuXG4gIHNldFN0eWxlKHRoaXMuZm9ybSwge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIHRvcDogcGFyc2VJbnQob2Zmc2V0VG9wKCR0cmlnZ2VyKSkgKyBcInB4XCIsXG4gICAgbGVmdDogcGFyc2VJbnQob2Zmc2V0TGVmdCgkdHJpZ2dlcikpICsgXCJweFwiLFxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICB3aWR0aDogc2VsZi5vdXRlcldpZHRoICsgXCJweFwiLFxuICAgIGhlaWdodDogc2VsZi5vdXRlckhlaWdodCArIFwicHhcIixcbiAgICB6SW5kZXg6ICR0cmlnZ2VyLnN0eWxlLnpJbmRleCArIDEwMFxuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGJpbmQgZXZlbnRzXG5VcGxvYWRlci5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciAkdHJpZ2dlciA9IHNlbGYuc2V0dGluZ3MudHJpZ2dlcjtcbiAgbW91c2VFbnRlcigkdHJpZ2dlcixcbiAgICBmdW5jdGlvbigpIHtcbiAgICAgIHNldFN0eWxlKHNlbGYuZm9ybSwge1xuICAgICAgICB0b3A6ICR0cmlnZ2VyLnN0eWxlLm9mZnNldFRvcCArIFwicHhcIixcbiAgICAgICAgbGVmdDogJHRyaWdnZXIuc3R5bGUub2Zmc2V0TGVmdCArIFwicHhcIixcbiAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICB3aWR0aDogc2VsZi5vdXRlcldpZHRoICsgXCJweFwiLFxuICAgICAgICBoZWlnaHQ6IHNlbGYub3V0ZXJIZWlnaHQgKyBcInB4XCJcbiAgICAgIH0pO1xuICAgIH0pO1xuICBzZWxmLmJpbmRJbnB1dCgpO1xufTtcblxuVXBsb2FkZXIucHJvdG90eXBlLmJpbmRJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGFkZEV2ZW50TGlzdGVuZXIodGhpcy5pbnB1dCwgXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZSkge1xuICAgIC8vIGllOSBkb24ndCBzdXBwb3J0IEZpbGVMaXN0IE9iamVjdFxuICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTI4MzAwNTgvaWU4LWlucHV0LXR5cGUtZmlsZS1nZXQtZmlsZXNcbiAgICBzZWxmLl9maWxlcyA9IHRoaXMuZmlsZXMgfHwgW3tcbiAgICAgIG5hbWU6IGUudGFyZ2V0ID8gZS50YXJnZXQudmFsdWUgOiBlLnNyY0VsZW1lbnQudmFsdWVcbiAgICB9XTtcbiAgICB2YXIgZmlsZSA9IHNlbGYuaW5wdXQudmFsdWU7XG4gICAgaWYgKHNlbGYuc2V0dGluZ3MuY2hhbmdlKSB7XG4gICAgICBzZWxmLnNldHRpbmdzLmNoYW5nZS5jYWxsKHNlbGYsIHNlbGYuX2ZpbGVzKTtcbiAgICB9IGVsc2UgaWYgKGZpbGUpIHtcbiAgICAgIHJldHVybiBzZWxmLnN1Ym1pdCgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBoYW5kbGUgc3VibWl0IGV2ZW50XG4vLyBwcmVwYXJlIGZvciBzdWJtaXRpbmcgZm9ybVxuVXBsb2FkZXIucHJvdG90eXBlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICh3aW5kb3cuRm9ybURhdGEgJiYgc2VsZi5fZmlsZXMpIHtcbiAgICAvLyBidWlsZCBhIEZvcm1EYXRhXG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoc2VsZi5mb3JtKTtcbiAgICAvLyB1c2UgRm9ybURhdGEgdG8gdXBsb2FkXG4gICAgZm9ybS5hcHBlbmQoc2VsZi5zZXR0aW5ncy5uYW1lLCBzZWxmLl9maWxlcyk7XG5cbiAgICB2YXIgb3B0aW9uWGhyO1xuXG4gICAgaWYgKHNlbGYuc2V0dGluZ3MucHJvZ3Jlc3MpIHtcbiAgICAgIC8vIGZpeCB0aGUgcHJvZ3Jlc3MgdGFyZ2V0IGZpbGVcbiAgICAgIHZhciBmaWxlcyA9IHNlbGYuX2ZpbGVzO1xuICAgICAgb3B0aW9uWGhyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlUHJvZ3Jlc3MoZXZlbnQpIHtcbiAgICAgICAgICAvLyBldmVudC50b3RhbOaYr+mcgOimgeS8oOi+k+eahOaAu+Wtl+iKgiwgZXZlbnQubG9hZGVk5piv5bey57uP5Lyg6L6T55qE5a2X6IqCLlxuICAgICAgICAgIC8vIOWmguaenGV2ZW50Lmxlbmd0aENvbXB1dGFibGXkuI3kuLrnnJ/vvIzliJlldmVudC50b3RhbOetieS6jjBcbiAgICAgICAgICB2YXIgcGVyY2VudCA9IDA7XG4gICAgICAgICAgdmFyIHBvc2l0aW9uID0gZXZlbnQubG9hZGVkIHx8IGV2ZW50LnBvc2l0aW9uOyAvKmV2ZW50LnBvc2l0aW9uIGlzIGRlcHJlY2F0ZWQqL1xuICAgICAgICAgIHZhciB0b3RhbCA9IGV2ZW50LnRvdGFsO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGV2ZW50LnRvdGFsKVxuICAgICAgICAgIGlmIChldmVudC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICBwZXJjZW50ID0gTWF0aC5jZWlsKHBvc2l0aW9uIC8gdG90YWwgKiAxMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLnNldHRpbmdzLnByb2dyZXNzKGV2ZW50LCBwb3NpdGlvbiwgdG90YWwsIHBlcmNlbnQsIGZpbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHVwbG9hZENvbXBsZXRlKGV2ZW50KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJ1cGxvYWRDb21wbGV0ZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHVwbG9hZEZhaWxlZChldmVudCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwidXBsb2FkRmFpbGVkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdXBsb2FkQ2FuY2VsZWQoZXZlbnQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInVwbG9hZENhbmNlbGVkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIC8vIOWumuS5iXByb2dyZXNz5LqL5Lu255qE5Zue6LCD5Ye95pWwXG4gICAgICAgIGlmICh4aHIudXBsb2FkKSB7XG4gICAgICAgICAgLy/ov5vluqbmnaEgICAgIFxuICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoeGhyLnVwbG9hZCwgXCJwcm9ncmVzc1wiLCB1cGRhdGVQcm9ncmVzcyk7XG4gICAgICAgICAgLy/kuIvovb0gICAgICAgICAgICBcbiAgICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgdXBsb2FkQ29tcGxldGUsIGZhbHNlKTtcbiAgICAgICAgICAvL+mUmeivr+S/oeaBryAgICAgICAgICAgIFxuICAgICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgdXBsb2FkRmFpbGVkLCBmYWxzZSk7XG4gICAgICAgICAgLy/lj5bmtoggICAgXG4gICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCB1cGxvYWRDYW5jZWxlZCwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHhocjtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgYWpheCh7XG4gICAgICB0eXBlOiAncG9zdCcsXG4gICAgICB1cmw6IHNlbGYuc2V0dGluZ3MuYWN0aW9uLFxuICAgICAgdGltZW91dDogMjAwMCxcbiAgICAgIHhocjogb3B0aW9uWGhyLFxuICAgICAgb25FcnJvcjogc2VsZi5zZXR0aW5ncy5lcnJvcixcbiAgICAgIG9uU3VjY2Vzczogc2VsZi5zZXR0aW5ncy5zdWNjZXNzLFxuICAgICAgZGF0YTogZm9ybVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9IGVsc2Uge1xuICAgIC8vIGlmcmFtZSB1cGxvYWRcbiAgICB0aGlzLmlmcmFtZSA9IG5ld0lmcmFtZSgpO1xuICAgIHRoaXMuZm9ybS5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsIHRoaXMuaWZyYW1lLmdldEF0dHJpYnV0ZSgnbmFtZScpKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuaWZyYW1lKTtcbiBcbiAgICB0aGlzLmlmcmFtZS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzZWxmLmlmcmFtZS5yZWFkeVN0YXRlID09IFwiY29tcGxldGVcIikge1xuICAgICAgICB2YXIgaW5wdXRfaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKTtcbiAgICAgICAgaW5wdXRfaWZyYW1lLnNyYyA9IFwiamF2YXNjcmlwdDpmYWxzZTtcIjtcbiAgICAgICAgaW5wdXRfaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgc2VsZi5mb3JtLmFwcGVuZENoaWxkKGlucHV0X2lmcmFtZSk7XG4gICAgICAgIGlucHV0X2lmcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGlucHV0X2lmcmFtZSk7XG5cbiAgICAgICAgdmFyIHJlc3BvbnNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3BvbnNlID0gc2VsZi5pZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5LmlubmVySFRNTDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlc3BvbnNlID0gXCJjcm9zcy1kb21haW5cIjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmlmcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNlbGYuaWZyYW1lKTtcbiAgICAgICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgICAgIGlmIChzZWxmLnNldHRpbmdzLmVycm9yKSB7XG4gICAgICAgICAgICBzZWxmLnNldHRpbmdzLmVycm9yKHNlbGYuaW5wdXQudmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc2VsZi5zZXR0aW5ncy5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzZWxmLnNldHRpbmdzLnN1Y2Nlc3MocmVzcG9uc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5mb3JtLnN1Ym1pdCgpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuVXBsb2FkZXIucHJvdG90eXBlLnJlZnJlc2hJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAvL3JlcGxhY2UgdGhlIGlucHV0IGVsZW1lbnQsIG9yIHRoZSBzYW1lIGZpbGUgY2FuIG5vdCB0byBiZSB1cGxvYWRlZFxuICB2YXIgbmV3SW5wdXQgPSB0aGlzLmlucHV0LmNsb25lTm9kZSh0cnVlKTtcbiAgdGhpcy5pbnB1dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdJbnB1dCwgdGhpcy5pbnB1dC5uZXh0U2libGluZyk7XG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5pbnB1dCwgJ2NoYW5nZScpO1xuICB0aGlzLmlucHV0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5pbnB1dCk7XG4gIHRoaXMuX2ZpbGVzID0gbnVsbDtcbiAgdGhpcy5pbnB1dCA9IG5ld0lucHV0O1xuICB0aGlzLmJpbmRJbnB1dCgpO1xufTtcblxuLy8gaGFuZGxlIGNoYW5nZSBldmVudFxuLy8gd2hlbiB2YWx1ZSBpbiBmaWxlIGlucHV0IGNoYW5nZWRcblVwbG9hZGVyLnByb3RvdHlwZS5jaGFuZ2UgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5zZXR0aW5ncy5jaGFuZ2UgPSBjYWxsYmFjaztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBoYW5kbGUgd2hlbiB1cGxvYWQgc3VjY2Vzc1xuVXBsb2FkZXIucHJvdG90eXBlLnN1Y2Nlc3MgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIC8vIHJlc3BvbnNlIOWwseaYr+i/lOWbnueahOaVsOaNrlxuICB0aGlzLnNldHRpbmdzLnN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgIHNlbGYucmVmcmVzaElucHV0KCk7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayhyZXNwb25zZSk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGhhbmRsZSB3aGVuIHVwbG9hZCBlcnJvclxuVXBsb2FkZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgdGhpcy5zZXR0aW5ncy5lcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBtZS5yZWZyZXNoSW5wdXQoKTtcbiAgICAgIGNhbGxiYWNrKHJlc3BvbnNlKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW5hYmxlXG5VcGxvYWRlci5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW5wdXQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgc2V0U3R5bGUodGhpcy5pbnB1dCwge1xuICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gIH0pO1xufTtcblxuLy8gZGlzYWJsZVxuVXBsb2FkZXIucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbnB1dC5kaXNhYmxlZCA9IHRydWU7XG4gIHNldFN0eWxlKHRoaXMuaW5wdXQsIHtcbiAgICBjdXJzb3I6ICdub3QtYWxsb3dlZCdcbiAgfSk7XG59O1xuXG4vLyBIZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJbnB1dHMoZGF0YSkge1xuICBpZiAoIWRhdGEpIHJldHVybiBbXTtcblxuICB2YXIgaW5wdXRzID0gW10sXG4gICAgaSwgaHRtbCA9ICcnO1xuICBmb3IgKHZhciBuYW1lIGluIGRhdGEpIHtcbiAgICBpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICBpLnR5cGUgPSAnaGlkZGVuJztcbiAgICBpLm5hbWUgPSBuYW1lO1xuICAgIGkudmFsdWUgPSBkYXRhW25hbWVdO1xuICAgIGlucHV0cy5wdXNoKGkpO1xuICB9XG4gIHJldHVybiBpbnB1dHM7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICBpZiAoIXN0cikgcmV0dXJuIHt9O1xuICB2YXIgcmV0ID0ge307XG5cbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciB1bmVzY2FwZSA9IGZ1bmN0aW9uKHMpIHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHMucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICB9O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGFpciA9IHBhaXJzW2ldLnNwbGl0KCc9Jyk7XG4gICAgdmFyIGtleSA9IHVuZXNjYXBlKHBhaXJbMF0pO1xuICAgIHZhciB2YWwgPSB1bmVzY2FwZShwYWlyWzFdKTtcbiAgICByZXRba2V5XSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGZpbmR6SW5kZXgoJG5vZGUpIHtcbiAgdmFyIHBhcmVudHMgPSAkbm9kZS5wYXJlbnRzVW50aWwoJ2JvZHknKTtcbiAgdmFyIHpJbmRleCA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gcGFyZW50cy5lcShpKTtcbiAgICBpZiAoaXRlbS5jc3MoJ3Bvc2l0aW9uJykgIT09ICdzdGF0aWMnKSB7XG4gICAgICB6SW5kZXggPSBwYXJzZUludChpdGVtLmNzcygnekluZGV4JyksIDEwKSB8fCB6SW5kZXg7XG4gICAgfVxuICB9XG4gIHJldHVybiB6SW5kZXg7XG59XG5cbmZ1bmN0aW9uIG5ld0lmcmFtZSgpIHtcbiAgdmFyIGlmcmFtZU5hbWUgPSAnaWZyYW1lLXVwbG9hZGVyLScgKyBpZnJhbWVDb3VudDtcbiAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG4gIGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJpZFwiLGlmcmFtZU5hbWUpOyAgXG4gIGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsaWZyYW1lTmFtZSk7ICBcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgaWZyYW1lQ291bnQgKz0gMTtcbiAgcmV0dXJuIGlmcmFtZTtcbn1cblxuZnVuY3Rpb24gTXVsdGlwbGVVcGxvYWRlcihvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBNdWx0aXBsZVVwbG9hZGVyKSkge1xuICAgIHJldHVybiBuZXcgTXVsdGlwbGVVcGxvYWRlcihvcHRpb25zKTtcbiAgfVxuXG4gIGlmIChpc1N0cmluZyhvcHRpb25zKSkge1xuICAgIG9wdGlvbnMgPSB7XG4gICAgICB0cmlnZ2VyOiBvcHRpb25zXG4gICAgfTtcbiAgfVxuICB2YXIgJHRyaWdnZXIgPSBvcHRpb25zLnRyaWdnZXI7XG5cbiAgdmFyIHVwbG9hZGVycyA9IFtdO1xuICBvcHRpb25zLnRyaWdnZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgkdHJpZ2dlcik7XG4gIHVwbG9hZGVycy5wdXNoKG5ldyBVcGxvYWRlcihvcHRpb25zKSk7XG4gIHRoaXMuX3VwbG9hZGVycyA9IHVwbG9hZGVycztcbn1cblxuTXVsdGlwbGVVcGxvYWRlci5wcm90b3R5cGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gIGVhY2godGhpcy5fdXBsb2FkZXJzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgaXRlbS5zdWJtaXQoKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuTXVsdGlwbGVVcGxvYWRlci5wcm90b3R5cGUuY2hhbmdlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgZWFjaCh0aGlzLl91cGxvYWRlcnMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBpdGVtLmNoYW5nZShjYWxsYmFjayk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbk11bHRpcGxlVXBsb2FkZXIucHJvdG90eXBlLnN1Y2Nlc3MgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICBlYWNoKHRoaXMuX3VwbG9hZGVycywgZnVuY3Rpb24oaXRlbSkge1xuICAgIGl0ZW0uc3VjY2VzcyhjYWxsYmFjayk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbk11bHRpcGxlVXBsb2FkZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgZWFjaCh0aGlzLl91cGxvYWRlcnMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBpdGVtLmVycm9yKGNhbGxiYWNrKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuTXVsdGlwbGVVcGxvYWRlci5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gIGVhY2godGhpcy5fdXBsb2FkZXJzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgaXRlbS5lbmFibGUoKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuTXVsdGlwbGVVcGxvYWRlci5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICBlYWNoKHRoaXMuX3VwbG9hZGVycywgZnVuY3Rpb24oaXRlbSkge1xuICAgIGl0ZW0uZGlzYWJsZSgpO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5NdWx0aXBsZVVwbG9hZGVyLlVwbG9hZGVyID0gVXBsb2FkZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gTXVsdGlwbGVVcGxvYWRlcjsiXX0=
