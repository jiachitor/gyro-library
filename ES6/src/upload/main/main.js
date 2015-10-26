var iframeCount = 0;
var $ = require('jquery');

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
    oTarget.detachEvent("on" + sEventType, fnHandler);
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

  settings.action = settings.action || $trigger.dataset.action || '/upload';
  settings.name = settings.name || $trigger.getAttribute('name') || $trigger.dataset.name || 'file';
  settings.data = settings.data || parse($trigger.dataset.data);
  settings.accept = settings.accept || $trigger.dataset.accept;
  settings.success = settings.success || $trigger.dataset.success;
  this.settings = settings;

  this.setup();
  this.bind();
}

// initialize
// create input, form, iframe
Uploader.prototype.setup = function() {
  var timestamp = (new Date()).valueOf();
  this.id = "upload_" + timestamp;
  this.form = document.createElement('form');
  this.form.id = this.id;
  this.form.action = this.settings.action;
  this.form.method = "post";
  this.form.enctype = "multipart/form-data";
  this.form.target = "";
  document.body.appendChild(this.form);

  this.iframe = newIframe();
  //setAttribute
  this.form.setAttribute('target', this.iframe.getAttribute('name'));
  //var $uploadForm = document.getElementById(form_id);

  var data = this.settings.data;

  this.form.innerHTML = createInputs(data);
  if (window.FormData) {
    this.form.innerHTML = createInputs({
      '_uploader_': 'formdata'
    });
  } else {
    this.form.innerHTML = createInputs({
      '_uploader_': 'iframe'
    });
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
  console.log(this.outerWidth)
  console.log(this.outerHeight)
  this.input.setAttribute('hidefocus', true);
  setStyle(this.input, {
    position: 'absolute',
    top: 0,
    right: 0,
    opacity: 0,
    outline: 0,
    cursor: 'pointer',
    height: this.outerHeight,
    fontSize: Math.max(64, $trigger.outerHeight * 5)
  });

  this.form.innerHTML = this.input;
  setStyle(this.form, {
    position: 'absolute',
    top: parseInt(triggerCss.offsetTop),
    left: parseInt(triggerCss.offsetLeft),
    overflow: 'hidden',
    width: this.outerWidth,
    height: this.outerHeight,
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
        top: $trigger.style.offsetTop,
        left: $trigger.style.offsetLeft,
        overflow: 'hidden',
        width: self.outerWidth,
        height: self.outerHeight
      });
    });
  self.bindInput();
};

Uploader.prototype.bindInput = function() {
  var self = this;
  self.input.onchange = function(e) {
    // ie9 don't support FileList Object
    // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
    self._files = this.files || [{
      name: e.target.value
    }];
    var file = self.input.val();
    if (self.settings.change) {
      self.settings.change.call(self, self._files);
    } else if (file) {
      return self.submit();
    }
  };
};

// handle submit event
// prepare for submiting form
Uploader.prototype.submit = function() {
  var self = this;
  if (window.FormData && self._files) {
    // build a FormData
    var form = new FormData(self.form.get(0));
    // use FormData to upload
    form.append(self.settings.name, self._files);

    var optionXhr;
    if (self.settings.progress) {
      // fix the progress target file
      var files = self._files;
      optionXhr = function() {
        var xhr = $.ajaxSettings.xhr();
        if (xhr.upload) {
          xhr.upload.addEventListener('progress', function(event) {
            var percent = 0;
            var position = event.loaded || event.position; /*event.position is deprecated*/
            var total = event.total;
            if (event.lengthComputable) {
              percent = Math.ceil(position / total * 100);
            }
            self.settings.progress(event, position, total, percent, files);
          }, false);
        }
        return xhr;
      };
    }
    $.ajax({
      url: self.settings.action,
      type: 'post',
      processData: false,
      contentType: false,
      data: form,
      xhr: optionXhr,
      context: this,
      success: self.settings.success,
      error: self.settings.error
    });
    return this;
  } else {
    // iframe upload
    self.iframe = newIframe();
    self.form.attr('target', self.iframe.attr('name'));
    $('body').append(self.iframe);
    self.iframe.one('load', function() {
      // https://github.com/blueimp/jQuery-File-Upload/blob/9.5.6/js/jquery.iframe-transport.js#L102
      // Fix for IE endless progress bar activity bug
      // (happens on form submits to iframe targets):
      $('<iframe src="javascript:false;"></iframe>')
        .appendTo(self.form)
        .remove();
      var response;
      try {
        response = $(this).contents().find("body").html();
      } catch (e) {
        response = "cross-domain";
      }
      $(this).remove();
      if (!response) {
        if (self.settings.error) {
          self.settings.error(self.input.val());
        }
      } else {
        if (self.settings.success) {
          self.settings.success(response);
        }
      }
    });
    self.form.submit();
  }
  return this;
};

Uploader.prototype.refreshInput = function() {
  //replace the input element, or the same file can not to be uploaded
  var newInput = this.input.clone();
  this.input.before(newInput);
  this.input.off('change');
  this.input.remove();
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
  var me = this;
  this.settings.success = function(response) {
    me.refreshInput();
    if (callback) {
      callback(response);
    }
  };

  return this;
};

// handle when upload success
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
  this.input.prop('disabled', false);
  this.input.css('cursor', 'pointer');
};

// disable
Uploader.prototype.disable = function() {
  this.input.prop('disabled', true);
  this.input.css('cursor', 'not-allowed');
};

// Helpers
// -------------

function isString(val) {
  return Object.prototype.toString.call(val) === '[object String]';
}

function createInputs(data) {
  if (!data) return [];

  var inputs = [],
    i;
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
  iframe.name = iframeName;
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
  var $trigger = $(options.trigger);

  var uploaders = [];
  $trigger.each(function(i, item) {
    options.trigger = item;
    uploaders.push(new Uploader(options));
  });
  this._uploaders = uploaders;
}
MultipleUploader.prototype.submit = function() {
  $.each(this._uploaders, function(i, item) {
    item.submit();
  });
  return this;
};
MultipleUploader.prototype.change = function(callback) {
  $.each(this._uploaders, function(i, item) {
    item.change(callback);
  });
  return this;
};
MultipleUploader.prototype.success = function(callback) {
  $.each(this._uploaders, function(i, item) {
    item.success(callback);
  });
  return this;
};
MultipleUploader.prototype.error = function(callback) {
  $.each(this._uploaders, function(i, item) {
    item.error(callback);
  });
  return this;
};
MultipleUploader.prototype.enable = function() {
  $.each(this._uploaders, function(i, item) {
    item.enable();
  });
  return this;
};
MultipleUploader.prototype.disable = function() {
  $.each(this._uploaders, function(i, item) {
    item.disable();
  });
  return this;
};
MultipleUploader.Uploader = Uploader;

module.exports = MultipleUploader;