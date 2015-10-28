var iframeCount = 0;

/*获取浏览器信息*/
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
  while ((elem = elem.parentNode))
    if (elem === root) return true;
  return false;
};

function fixedMouse(e, that) { //that 为触发该事件传递下来的this指针
  var related, type = e.type.toLowerCase(); //这里获取事件名字
  if (type == 'mouseover') {
    related = e.relatedTarget || e.fromElement; //移入目标元素
  } else if (type = 'mouseout') {
    related = e.relatedTarget || e.toElement; //移出目标元素
  } else return true;
  var contain = contains(that, related);
  return 'document' && related && related.prefix != 'xul' && !contain && related !== that;
};

function mouseEnter(element, callback) {
  addEventListener(element, "mouseover",
    function(e) {
      var that = this;
      if (fixedMouse(e, that)) {
        callback.call(); //封装回调函数
      };
    },
    false);
};

function mouseLeave(element, callback) {
  addEventListener(element, "mouseout",
    function(e) {
      var that = this;
      if (fixedMouse(e, that)) {
        callback.call(); //封装回调函数
      };
    },
    false);
};


// 创建完整Ajax程序包 ，该包不支持跨域
function ajax(options) {
  options = {
    type: options.type || "GET",
    dataType: options.dataType || "json",
    url: options.url || "",
    xhr: options.xhr || function() {
      try {
        return new XMLHttpRequest();
      } catch (e) {}
    },
    data: options.data || "",
    timeout: options.timeout || 5000,
    onComplete: options.onComplete || function() {},
    onError: options.onError || function() {},
    onSuccess: options.onSuccess || function() {}
  };

  var xml = options.xhr();
  xml.open(options.type, options.url, true);
  var timeoutLength = options.timeout;

  var requestDone = false;

  // 初始化一个5秒后执行的回调函数,用于取消请求
  setTimeout(function() {
      requestDone = true;
    },
    timeoutLength);

  // 监听文档更新状态
  xml.onreadystatechange = function() {
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
        (r.status >= 200 && r.status <= 300) ||
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
Uploader.prototype.setup = function() {
  var self = this;
  var timestamp = (new Date()).valueOf();
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
Uploader.prototype.bind = function() {
  var self = this;
  var $trigger = self.settings.trigger;
  mouseEnter($trigger,
    function() {
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

Uploader.prototype.bindInput = function() {
  var self = this;
  addEventListener(this.input, "change", function(e) {
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
Uploader.prototype.submit = function() {
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
      optionXhr = function() {

        function updateProgress(event) {
          // event.total是需要传输的总字节, event.loaded是已经传输的字节.
          // 如果event.lengthComputable不为真，则event.total等于0
          var percent = 0;
          var position = event.loaded || event.position; /*event.position is deprecated*/
          var total = event.total;
          console.log(event.total)
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
 
    this.iframe.onreadystatechange = function() {
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

Uploader.prototype.refreshInput = function() {
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
Uploader.prototype.change = function(callback) {
  if (!callback) {
    return this;
  }
  this.settings.change = callback;
  return this;
};

// handle when upload success
Uploader.prototype.success = function(callback) {
  var self = this;
  // response 就是返回的数据
  this.settings.success = function(response) {
    self.refreshInput();
    if (callback) {
      callback(response);
    }
  };
  return this;
};

// handle when upload error
Uploader.prototype.error = function(callback) {
  var me = this;
  this.settings.error = function(response) {
    if (callback) {
      me.refreshInput();
      callback(response);
    }
  };
  return this;
};

// enable
Uploader.prototype.enable = function() {
  this.input.disabled = false;
  setStyle(this.input, {
    cursor: 'pointer'
  });
};

// disable
Uploader.prototype.disable = function() {
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
    i, html = '';
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
  var unescape = function(s) {
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
  iframe.setAttribute("id",iframeName);  
  iframe.setAttribute("name",iframeName);  
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

MultipleUploader.prototype.submit = function() {
  each(this._uploaders, function(item) {
    item.submit();
  });
  return this;
};

MultipleUploader.prototype.change = function(callback) {
  each(this._uploaders, function(item) {
    item.change(callback);
  });
  return this;
};

MultipleUploader.prototype.success = function(callback) {
  each(this._uploaders, function(item) {
    item.success(callback);
  });
  return this;
};

MultipleUploader.prototype.error = function(callback) {
  each(this._uploaders, function(item) {
    item.error(callback);
  });
  return this;
};

MultipleUploader.prototype.enable = function() {
  each(this._uploaders, function(item) {
    item.enable();
  });
  return this;
};

MultipleUploader.prototype.disable = function() {
  each(this._uploaders, function(item) {
    item.disable();
  });
  return this;
};

MultipleUploader.Uploader = Uploader;

module.exports = MultipleUploader;