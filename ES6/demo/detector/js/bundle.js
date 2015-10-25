(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcDetectorIndexJs = require('../../../src/detector/index.js');

var _srcDetectorIndexJs2 = _interopRequireDefault(_srcDetectorIndexJs);

console.log(_srcDetectorIndexJs2['default']);
console.log(_srcDetectorIndexJs2['default'].browser.name);

},{"../../../src/detector/index.js":2}],2:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _mainWebDetectorJs = require('./main/web-detector.js');

var _mainWebDetectorJs2 = _interopRequireDefault(_mainWebDetectorJs);

module.exports = _mainWebDetectorJs2["default"];

},{"./main/web-detector.js":4}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NA_VERSION = "-1";
var NA = {
  name: "na",
  version: NA_VERSION
};

function typeOf(type) {
  return function (object) {
    return Object.prototype.toString.call(object) === "[object " + type + "]";
  };
}
var isString = typeOf("String");
var isRegExp = typeOf("RegExp");
var isObject = typeOf("Object");
var isFunction = typeOf("Function");

function each(object, factory) {
  for (var i = 0, l = object.length; i < l; i++) {
    if (factory.call(object, object[i], i) === false) {
      break;
    }
  }
}

// UserAgent Detector.
// @param {String} ua, userAgent.
// @param {Object} expression
// @return {Object}
//    返回 null 表示当前表达式未匹配成功。
function detect(name, expression, ua) {
  var expr = isFunction(expression) ? expression.call(null, ua) : expression;
  if (!expr) {
    return null;
  }
  var info = {
    name: name,
    version: NA_VERSION,
    codename: ""
  };
  if (expr === true) {
    return info;
  } else if (isString(expr)) {
    if (ua.indexOf(expr) !== -1) {
      return info;
    }
  } else if (isObject(expr)) {
    if (expr.hasOwnProperty("version")) {
      info.version = expr.version;
    }
    return info;
  } else if (isRegExp(expr)) {
    var m = expr.exec(ua);
    if (m) {
      if (m.length >= 2 && m[1]) {
        info.version = m[1].replace(/_/g, ".");
      } else {
        info.version = NA_VERSION;
      }
      return info;
    }
  }
}

// 初始化识别。
function init(ua, patterns, factory, detector) {
  var detected = NA;
  each(patterns, function (pattern) {
    var d = detect(pattern[0], pattern[1], ua);
    if (d) {
      detected = d;
      return false;
    }
  });
  factory.call(detector, detected.name, detected.version);
}

var Detector = (function () {
  function Detector(rules) {
    _classCallCheck(this, Detector);

    this._rules = rules;
  }

  // 解析 UserAgent 字符串
  // @param {String} ua, userAgent string.
  // @return {Object}

  _createClass(Detector, [{
    key: "parse",
    value: function parse(ua) {
      ua = (ua || "").toLowerCase();
      var d = {};

      init(ua, this._rules.device, function (name, version) {
        var v = parseFloat(version);
        d.device = {
          name: name,
          version: v,
          fullVersion: version
        };
        d.device[name] = v;
      }, d);

      init(ua, this._rules.os, function (name, version) {
        var v = parseFloat(version);
        d.os = {
          name: name,
          version: v,
          fullVersion: version
        };
        d.os[name] = v;
      }, d);

      var ieCore = this.IEMode(ua);

      init(ua, this._rules.engine, function (name, version) {
        var mode = version;
        // IE 内核的浏览器，修复版本号及兼容模式。
        if (ieCore) {
          version = ieCore.engineVersion || ieCore.engineMode;
          mode = ieCore.engineMode;
        }
        var v = parseFloat(version);
        d.engine = {
          name: name,
          version: v,
          fullVersion: version,
          mode: parseFloat(mode),
          fullMode: mode,
          compatible: ieCore ? ieCore.compatible : false
        };
        d.engine[name] = v;
      }, d);

      init(ua, this._rules.browser, function (name, version) {
        var mode = version;
        // IE 内核的浏览器，修复浏览器版本及兼容模式。
        if (ieCore) {
          // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
          if (name === "ie") {
            version = ieCore.browserVersion;
          }
          mode = ieCore.browserMode;
        }
        var v = parseFloat(version);
        d.browser = {
          name: name,
          version: v,
          fullVersion: version,
          mode: parseFloat(mode),
          fullMode: mode,
          compatible: ieCore ? ieCore.compatible : false
        };
        d.browser[name] = v;
      }, d);
      return d;
    }

    // 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
    // @param {String} ua, userAgent string.
    // @return {Object}
  }, {
    key: "IEMode",
    value: function IEMode(ua) {
      if (!this._rules.re_msie.test(ua)) {
        return null;
      }

      var m = undefined;
      var engineMode = undefined;
      var engineVersion = undefined;
      var browserMode = undefined;
      var browserVersion = undefined;

      // IE8 及其以上提供有 Trident 信息，
      // 默认的兼容模式，UA 中 Trident 版本不发生变化。
      if (ua.indexOf("trident/") !== -1) {
        m = /\btrident\/([0-9.]+)/.exec(ua);
        if (m && m.length >= 2) {
          // 真实引擎版本。
          engineVersion = m[1];
          var v_version = m[1].split(".");
          v_version[0] = parseInt(v_version[0], 10) + 4;
          browserVersion = v_version.join(".");
        }
      }

      m = this._rules.re_msie.exec(ua);
      browserMode = m[1];
      var v_mode = m[1].split(".");
      if (typeof browserVersion === "undefined") {
        browserVersion = browserMode;
      }
      v_mode[0] = parseInt(v_mode[0], 10) - 4;
      engineMode = v_mode.join(".");
      if (typeof engineVersion === "undefined") {
        engineVersion = engineMode;
      }

      return {
        browserVersion: browserVersion,
        browserMode: browserMode,
        engineVersion: engineVersion,
        engineMode: engineMode,
        compatible: engineVersion !== engineMode
      };
    }
  }]);

  return Detector;
})();

module.exports = Detector;

},{}],4:[function(require,module,exports){
"use strict";

var Detector = require("./detector");
var WebRules = require("./web-rules");

var userAgent = navigator.userAgent || "";
//const platform = navigator.platform || "";
var appVersion = navigator.appVersion || "";
var vendor = navigator.vendor || "";
var ua = userAgent + " " + appVersion + " " + vendor;

var detector = new Detector(WebRules);

// 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
// @param {String} ua, userAgent string.
// @return {Object}
function IEMode(ua) {
  if (!WebRules.re_msie.test(ua)) {
    return null;
  }

  var m = undefined;
  var engineMode = undefined;
  var engineVersion = undefined;
  var browserMode = undefined;
  var browserVersion = undefined;

  // IE8 及其以上提供有 Trident 信息，
  // 默认的兼容模式，UA 中 Trident 版本不发生变化。
  if (ua.indexOf("trident/") !== -1) {
    m = /\btrident\/([0-9.]+)/.exec(ua);
    if (m && m.length >= 2) {
      // 真实引擎版本。
      engineVersion = m[1];
      var v_version = m[1].split(".");
      v_version[0] = parseInt(v_version[0], 10) + 4;
      browserVersion = v_version.join(".");
    }
  }

  m = WebRules.re_msie.exec(ua);
  browserMode = m[1];
  var v_mode = m[1].split(".");
  if (typeof browserVersion === "undefined") {
    browserVersion = browserMode;
  }
  v_mode[0] = parseInt(v_mode[0], 10) - 4;
  engineMode = v_mode.join(".");
  if (typeof engineVersion === "undefined") {
    engineVersion = engineMode;
  }

  return {
    browserVersion: browserVersion,
    browserMode: browserMode,
    engineVersion: engineVersion,
    engineMode: engineMode,
    compatible: engineVersion !== engineMode
  };
}

function WebParse(ua) {
  var d = detector.parse(ua);

  var ieCore = IEMode(ua);

  // IE 内核的浏览器，修复版本号及兼容模式。
  if (ieCore) {
    var engineVersion = ieCore.engineVersion || ieCore.engineMode;
    var ve = parseFloat(engineVersion);
    var mode = ieCore.engineMode;

    d.engine = {
      name: name,
      version: ve,
      fullVersion: engineVersion,
      mode: parseFloat(mode),
      fullMode: mode,
      compatible: ieCore ? ieCore.compatible : false
    };
    d.engine[d.engine.name] = ve;

    // IE 内核的浏览器，修复浏览器版本及兼容模式。
    // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
    var browserVersion = d.browser.fullVersion;
    if (d.browser.name === "ie") {
      browserVersion = ieCore.browserVersion;
    }
    var browserMode = ieCore.browserMode;
    var vb = parseFloat(browserVersion);
    d.browser = {
      name: name,
      version: vb,
      fullVersion: browserVersion,
      mode: parseFloat(browserMode),
      fullMode: browserMode,
      compatible: ieCore ? ieCore.compatible : false
    };
    d.browser[d.browser.name] = vb;
  }
  return d;
}

var Tan = WebParse(ua);
Tan.parse = WebParse;
module.exports = Tan;

},{"./detector":3,"./web-rules":5}],5:[function(require,module,exports){
(function (global){
"use strict";

var win = typeof window === "undefined" ? global : window;
var external = win.external;
var re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;
var re_blackberry_10 = /\bbb10\b.+?\bversion\/([\d.]+)/;
var re_blackberry_6_7 = /\bblackberry\b.+\bversion\/([\d.]+)/;
var re_blackberry_4_5 = /\bblackberry\d+\/([\d.]+)/;

var NA_VERSION = "-1";

// 硬件设备信息识别表达式。
// 使用数组可以按优先级排序。
var DEVICES = [["nokia", function (ua) {
  // 不能将两个表达式合并，因为可能出现 "nokia; nokia 960"
  // 这种情况下会优先识别出 nokia/-1
  if (ua.indexOf("nokia ") !== -1) {
    return (/\bnokia ([0-9]+)?/
    );
  } else {
    return (/\bnokia([a-z0-9]+)?/
    );
  }
}],
// 三星有 Android 和 WP 设备。
["samsung", function (ua) {
  if (ua.indexOf("samsung") !== -1) {
    return (/\bsamsung(?:[ \-](?:sgh|gt|sm))?-([a-z0-9]+)/
    );
  } else {
    return (/\b(?:sgh|sch|gt|sm)-([a-z0-9]+)/
    );
  }
}], ["wp", function (ua) {
  return ua.indexOf("windows phone ") !== -1 || ua.indexOf("xblwp") !== -1 || ua.indexOf("zunewp") !== -1 || ua.indexOf("windows ce") !== -1;
}], ["pc", "windows"], ["ipad", "ipad"],
// ipod 规则应置于 iphone 之前。
["ipod", "ipod"], ["iphone", /\biphone\b|\biph(\d)/], ["mac", "macintosh"],
// 小米
["mi", /\bmi[ \-]?([a-z0-9 ]+(?= build|\)))/],
// 红米
["hongmi", /\bhm[ \-]?([a-z0-9]+)/], ["aliyun", /\baliyunos\b(?:[\-](\d+))?/], ["meizu", function (ua) {
  return ua.indexOf("meizu") >= 0 ? /\bmeizu[\/ ]([a-z0-9]+)\b/ : /\bm([0-9cx]{1,4})\b/;
}], ["nexus", /\bnexus ([0-9s.]+)/], ["huawei", function (ua) {
  var re_mediapad = /\bmediapad (.+?)(?= build\/huaweimediapad\b)/;
  if (ua.indexOf("huawei-huawei") !== -1) {
    return (/\bhuawei\-huawei\-([a-z0-9\-]+)/
    );
  } else if (re_mediapad.test(ua)) {
    return re_mediapad;
  } else {
    return (/\bhuawei[ _\-]?([a-z0-9]+)/
    );
  }
}], ["lenovo", function (ua) {
  if (ua.indexOf("lenovo-lenovo") !== -1) {
    return (/\blenovo\-lenovo[ \-]([a-z0-9]+)/
    );
  } else {
    return (/\blenovo[ \-]?([a-z0-9]+)/
    );
  }
}],
// 中兴
["zte", function (ua) {
  if (/\bzte\-[tu]/.test(ua)) {
    return (/\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/
    );
  } else {
    return (/\bzte[ _\-]?([a-su-z0-9\+]+)/
    );
  }
}],
// 步步高
["vivo", /\bvivo(?: ([a-z0-9]+))?/], ["htc", function (ua) {
  if (/\bhtc[a-z0-9 _\-]+(?= build\b)/.test(ua)) {
    return (/\bhtc[ _\-]?([a-z0-9 ]+(?= build))/
    );
  } else {
    return (/\bhtc[ _\-]?([a-z0-9 ]+)/
    );
  }
}], ["oppo", /\boppo[_]([a-z0-9]+)/], ["konka", /\bkonka[_\-]([a-z0-9]+)/], ["sonyericsson", /\bmt([a-z0-9]+)/], ["coolpad", /\bcoolpad[_ ]?([a-z0-9]+)/], ["lg", /\blg[\-]([a-z0-9]+)/], ["android", /\bandroid\b|\badr\b/], ["blackberry", function (ua) {
  if (ua.indexOf("blackberry") >= 0) {
    return (/\bblackberry\s?(\d+)/
    );
  }
  return "bb10";
}]];

// 操作系统信息识别表达式
var OS = [["wp", function (ua) {
  if (ua.indexOf("windows phone ") !== -1) {
    return (/\bwindows phone (?:os )?([0-9.]+)/
    );
  } else if (ua.indexOf("xblwp") !== -1) {
    return (/\bxblwp([0-9.]+)/
    );
  } else if (ua.indexOf("zunewp") !== -1) {
    return (/\bzunewp([0-9.]+)/
    );
  }
  return "windows phone";
}], ["windows", /\bwindows nt ([0-9.]+)/], ["macosx", /\bmac os x ([0-9._]+)/], ["ios", function (ua) {
  if (/\bcpu(?: iphone)? os /.test(ua)) {
    return (/\bcpu(?: iphone)? os ([0-9._]+)/
    );
  } else if (ua.indexOf("iph os ") !== -1) {
    return (/\biph os ([0-9_]+)/
    );
  } else {
    return (/\bios\b/
    );
  }
}], ["yunos", /\baliyunos ([0-9.]+)/], ["android", function (ua) {
  if (ua.indexOf("android") >= 0) {
    return (/\bandroid[ \/-]?([0-9.x]+)?/
    );
  } else if (ua.indexOf("adr") >= 0) {
    if (ua.indexOf("mqqbrowser") >= 0) {
      return (/\badr[ ]\(linux; u; ([0-9.]+)?/
      );
    } else {
      return (/\badr(?:[ ]([0-9.]+))?/
      );
    }
  }
  return "android";
  //return /\b(?:android|\badr)(?:[\/\- ](?:\(linux; u; )?)?([0-9.x]+)?/;
}], ["chromeos", /\bcros i686 ([0-9.]+)/], ["linux", "linux"], ["windowsce", /\bwindows ce(?: ([0-9.]+))?/], ["symbian", /\bsymbian(?:os)?\/([0-9.]+)/], ["blackberry", function (ua) {
  var m = ua.match(re_blackberry_10) || ua.match(re_blackberry_6_7) || ua.match(re_blackberry_4_5);
  return m ? { version: m[1] } : "blackberry";
}]];

// 针对同源的 TheWorld 和 360 的 external 对象进行检测。
// @param {String} key, 关键字，用于检测浏览器的安装路径中出现的关键字。
// @return {Undefined,Boolean,Object} 返回 undefined 或 false 表示检测未命中。
function checkTW360External(key) {
  if (!external) {
    return;
  } // return undefined.
  try {
    //        360安装路径：
    //        C:%5CPROGRA~1%5C360%5C360se3%5C360SE.exe
    var runpath = external.twGetRunPath.toLowerCase();
    // 360SE 3.x ~ 5.x support.
    // 暴露的 external.twGetVersion 和 external.twGetSecurityID 均为 undefined。
    // 因此只能用 try/catch 而无法使用特性判断。
    var security = external.twGetSecurityID(win);
    var version = external.twGetVersion(security);

    if (runpath && runpath.indexOf(key) === -1) {
      return false;
    }
    if (version) {
      return { version: version };
    }
  } catch (ex) {/* */}
}

var ENGINE = [["edgehtml", /edge\/([0-9.]+)/], ["trident", re_msie], ["blink", function () {
  return "chrome" in win && "CSS" in win && /\bapplewebkit[\/]?([0-9.+]+)/;
}], ["webkit", /\bapplewebkit[\/]?([0-9.+]+)/], ["gecko", function (ua) {
  var match = ua.match(/\brv:([\d\w.]+).*\bgecko\/(\d+)/);
  if (match) {
    return {
      version: match[1] + "." + match[2]
    };
  }
}], ["presto", /\bpresto\/([0-9.]+)/], ["androidwebkit", /\bandroidwebkit\/([0-9.]+)/], ["coolpadwebkit", /\bcoolpadwebkit\/([0-9.]+)/], ["u2", /\bu2\/([0-9.]+)/], ["u3", /\bu3\/([0-9.]+)/]];
var BROWSER = [
// Microsoft Edge Browser, Default browser in Windows 10.
["edge", /edge\/([0-9.]+)/],
// Sogou.
["sogou", function (ua) {
  if (ua.indexOf("sogoumobilebrowser") >= 0) {
    return (/sogoumobilebrowser\/([0-9.]+)/
    );
  } else if (ua.indexOf("sogoumse") >= 0) {
    return true;
  }
  return (/ se ([0-9.x]+)/
  );
}],
// TheWorld (世界之窗)
// 由于裙带关系，TheWorld API 与 360 高度重合。
// 只能通过 UA 和程序安装路径中的应用程序名来区分。
// TheWorld 的 UA 比 360 更靠谱，所有将 TheWorld 的规则放置到 360 之前。
["theworld", function () {
  var x = checkTW360External("theworld");
  if (typeof x !== "undefined") {
    return x;
  }
  return "theworld";
}],
// 360SE, 360EE.
["360", function (ua) {
  var x = checkTW360External("360se");
  if (typeof x !== "undefined") {
    return x;
  }
  if (ua.indexOf("360 aphone browser") !== -1) {
    return (/\b360 aphone browser \(([^\)]+)\)/
    );
  }
  return (/\b360(?:se|ee|chrome|browser)\b/
  );
}],
// Maxthon
["maxthon", function () {
  try {
    if (external && (external.mxVersion || external.max_version)) {
      return {
        version: external.mxVersion || external.max_version
      };
    }
  } catch (ex) {/* */}
  return (/\b(?:maxthon|mxbrowser)(?:[ \/]([0-9.]+))?/
  );
}], ["micromessenger", /\bmicromessenger\/([\d.]+)/], ["qq", /\bm?qqbrowser\/([0-9.]+)/], ["green", "greenbrowser"], ["tt", /\btencenttraveler ([0-9.]+)/], ["liebao", function (ua) {
  if (ua.indexOf("liebaofast") >= 0) {
    return (/\bliebaofast\/([0-9.]+)/
    );
  }
  if (ua.indexOf("lbbrowser") === -1) {
    return false;
  }
  var version = undefined;
  try {
    if (external && external.LiebaoGetVersion) {
      version = external.LiebaoGetVersion();
    }
  } catch (ex) {/* */}
  return {
    version: version || NA_VERSION
  };
}], ["tao", /\btaobrowser\/([0-9.]+)/], ["coolnovo", /\bcoolnovo\/([0-9.]+)/], ["saayaa", "saayaa"],
// 有基于 Chromniun 的急速模式和基于 IE 的兼容模式。必须在 IE 的规则之前。
["baidu", /\b(?:ba?idubrowser|baiduhd)[ \/]([0-9.x]+)/],
// 后面会做修复版本号，这里只要能识别是 IE 即可。
["ie", re_msie], ["mi", /\bmiuibrowser\/([0-9.]+)/],
// Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
["opera", function (ua) {
  var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
  var re_opera_new = /\bopr\/([0-9.]+)/;
  return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
}], ["oupeng", /\boupeng\/([0-9.]+)/], ["yandex", /yabrowser\/([0-9.]+)/],
// 支付宝手机客户端
["ali-ap", function (ua) {
  if (ua.indexOf("aliapp") > 0) {
    return (/\baliapp\(ap\/([0-9.]+)\)/
    );
  } else {
    return (/\balipayclient\/([0-9.]+)\b/
    );
  }
}],
// 支付宝平板客户端
["ali-ap-pd", /\baliapp\(ap-pd\/([0-9.]+)\)/],
// 支付宝商户客户端
["ali-am", /\baliapp\(am\/([0-9.]+)\)/],
// 淘宝手机客户端
["ali-tb", /\baliapp\(tb\/([0-9.]+)\)/],
// 淘宝平板客户端
["ali-tb-pd", /\baliapp\(tb-pd\/([0-9.]+)\)/],
// 天猫手机客户端
["ali-tm", /\baliapp\(tm\/([0-9.]+)\)/],
// 天猫平板客户端
["ali-tm-pd", /\baliapp\(tm-pd\/([0-9.]+)\)/],
// UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
// UC 桌面版浏览器携带 Chrome 信息，需要放在 Chrome 之前。
["uc", function (ua) {
  if (ua.indexOf("ucbrowser/") >= 0) {
    return (/\bucbrowser\/([0-9.]+)/
    );
  } else if (ua.indexOf("ubrowser/") >= 0) {
    return (/\bubrowser\/([0-9.]+)/
    );
  } else if (/\buc\/[0-9]/.test(ua)) {
    return (/\buc\/([0-9.]+)/
    );
  } else if (ua.indexOf("ucweb") >= 0) {
    // `ucweb/2.0` is compony info.
    // `UCWEB8.7.2.214/145/800` is browser info.
    return (/\bucweb([0-9.]+)?/
    );
  } else {
    return (/\b(?:ucbrowser|uc)\b/
    );
  }
}], ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
// Android 默认浏览器。该规则需要在 safari 之前。
["android", function (ua) {
  if (ua.indexOf("android") === -1) {
    return;
  }
  return (/\bversion\/([0-9.]+(?: beta)?)/
  );
}], ["blackberry", function (ua) {
  var m = ua.match(re_blackberry_10) || ua.match(re_blackberry_6_7) || ua.match(re_blackberry_4_5);
  return m ? { version: m[1] } : "blackberry";
}], ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
// 如果不能被识别为 Safari，则猜测是 WebView。
["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/], ["firefox", /\bfirefox\/([0-9.ab]+)/], ["nokia", /\bnokiabrowser\/([0-9.]+)/]];

module.exports = {
  device: DEVICES,
  os: OS,
  browser: BROWSER,
  engine: ENGINE,
  re_msie: re_msie
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkOi9naXRodWJEZXZlbG9wbWVudC9neXJvLWxpYnJhcnkvRVM2L2RlbW8vZGV0ZWN0b3IvanMvYXBwLmpzIiwiZDovZ2l0aHViRGV2ZWxvcG1lbnQvZ3lyby1saWJyYXJ5L0VTNi9zcmMvZGV0ZWN0b3IvaW5kZXguanMiLCJkOi9naXRodWJEZXZlbG9wbWVudC9neXJvLWxpYnJhcnkvRVM2L3NyYy9kZXRlY3Rvci9tYWluL2RldGVjdG9yLmpzIiwiZDovZ2l0aHViRGV2ZWxvcG1lbnQvZ3lyby1saWJyYXJ5L0VTNi9zcmMvZGV0ZWN0b3IvbWFpbi93ZWItZGV0ZWN0b3IuanMiLCJkOi9naXRodWJEZXZlbG9wbWVudC9neXJvLWxpYnJhcnkvRVM2L3NyYy9kZXRlY3Rvci9tYWluL3dlYi1ydWxlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7a0NDQXFCLGdDQUFnQzs7OztBQUVyRCxPQUFPLENBQUMsR0FBRyxpQ0FBVSxDQUFDO0FBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQVMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7QUNIbkMsWUFBWSxDQUFDOzs7O2lDQUVRLHdCQUF3Qjs7OztBQUU3QyxNQUFNLENBQUMsT0FBTyxpQ0FBVyxDQUFDOzs7QUNKMUIsWUFBWSxDQUFDOzs7Ozs7QUFFYixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDeEIsSUFBTSxFQUFFLEdBQUc7QUFDVCxNQUFJLEVBQUUsSUFBSTtBQUNWLFNBQU8sRUFBRSxVQUFVO0NBQ3BCLENBQUM7O0FBRUYsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFDO0FBQ25CLFNBQU8sVUFBUyxNQUFNLEVBQUU7QUFDdEIsV0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssVUFBVSxHQUFHLElBQUks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QkFBaUIsQ0FBQyxJQUMzQixFQUFFLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDOUIsU0FBTyxDQUFDLEdBQUcsRUFBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsWUFBWSxDQUFDO0NBQzNDLENBQUMsRUFDRixDQUFDLFFBQVEsRUFBRSxxRUFBcUUsQ0FBQzs7QUFFakYsQ0FBQyxTQUFTLEVBQUUsb0RBQW9ELENBQUMsRUFDakUsQ0FBQyxTQUFTLEVBQUUsd0JBQXdCLENBQUMsRUFDckMsQ0FBQyxPQUFPLEVBQUUsMkJBQTJCLENBQUMsQ0FDdkMsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsUUFBTSxFQUFFLE9BQU87QUFDZixJQUFFLEVBQUUsRUFBRTtBQUNOLFNBQU8sRUFBRSxPQUFPO0FBQ2hCLFFBQU0sRUFBRSxNQUFNO0FBQ2QsU0FBTyxFQUFFLE9BQU87Q0FDakIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgZGV0ZWN0b3IgZnJvbSAnLi4vLi4vLi4vc3JjL2RldGVjdG9yL2luZGV4LmpzJztcclxuXHJcbmNvbnNvbGUubG9nKGRldGVjdG9yKTtcclxuY29uc29sZS5sb2coZGV0ZWN0b3IuYnJvd3Nlci5uYW1lKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBkZXRlY3RvciBmcm9tICcuL21haW4vd2ViLWRldGVjdG9yLmpzJztcblxubW9kdWxlLmV4cG9ydHMgPSBkZXRlY3RvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBOQV9WRVJTSU9OID0gXCItMVwiO1xuY29uc3QgTkEgPSB7XG4gIG5hbWU6IFwibmFcIixcbiAgdmVyc2lvbjogTkFfVkVSU0lPTixcbn07XG5cbmZ1bmN0aW9uIHR5cGVPZih0eXBlKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gXCJbb2JqZWN0IFwiICsgdHlwZSArIFwiXVwiO1xuICB9O1xufVxuY29uc3QgaXNTdHJpbmcgPSB0eXBlT2YoXCJTdHJpbmdcIik7XG5jb25zdCBpc1JlZ0V4cCA9IHR5cGVPZihcIlJlZ0V4cFwiKTtcbmNvbnN0IGlzT2JqZWN0ID0gdHlwZU9mKFwiT2JqZWN0XCIpO1xuY29uc3QgaXNGdW5jdGlvbiA9IHR5cGVPZihcIkZ1bmN0aW9uXCIpO1xuXG5mdW5jdGlvbiBlYWNoKG9iamVjdCwgZmFjdG9yeSl7XG4gIGZvcihsZXQgaSA9IDAsIGwgPSBvYmplY3QubGVuZ3RoOyBpIDwgbDsgaSsrKXtcbiAgICBpZihmYWN0b3J5LmNhbGwob2JqZWN0LCBvYmplY3RbaV0sIGkpID09PSBmYWxzZSl7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cblxuLy8gVXNlckFnZW50IERldGVjdG9yLlxuLy8gQHBhcmFtIHtTdHJpbmd9IHVhLCB1c2VyQWdlbnQuXG4vLyBAcGFyYW0ge09iamVjdH0gZXhwcmVzc2lvblxuLy8gQHJldHVybiB7T2JqZWN0fVxuLy8gICAg6L+U5ZueIG51bGwg6KGo56S65b2T5YmN6KGo6L6+5byP5pyq5Yy56YWN5oiQ5Yqf44CCXG5mdW5jdGlvbiBkZXRlY3QobmFtZSwgZXhwcmVzc2lvbiwgdWEpIHtcbiAgY29uc3QgZXhwciA9IGlzRnVuY3Rpb24oZXhwcmVzc2lvbikgPyBleHByZXNzaW9uLmNhbGwobnVsbCwgdWEpIDogZXhwcmVzc2lvbjtcbiAgaWYgKCFleHByKSB7IHJldHVybiBudWxsOyB9XG4gIGNvbnN0IGluZm8gPSB7XG4gICAgbmFtZTogbmFtZSxcbiAgICB2ZXJzaW9uOiBOQV9WRVJTSU9OLFxuICAgIGNvZGVuYW1lOiBcIlwiLFxuICB9O1xuICBpZiAoZXhwciA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBpbmZvO1xuICB9ZWxzZSBpZihpc1N0cmluZyhleHByKSkge1xuICAgIGlmKHVhLmluZGV4T2YoZXhwcikgIT09IC0xKXtcbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChleHByKSkge1xuICAgIGlmKGV4cHIuaGFzT3duUHJvcGVydHkoXCJ2ZXJzaW9uXCIpKXtcbiAgICAgIGluZm8udmVyc2lvbiA9IGV4cHIudmVyc2lvbjtcbiAgICB9XG4gICAgcmV0dXJuIGluZm87XG4gIH0gZWxzZSBpZiAoaXNSZWdFeHAoZXhwcikpIHtcbiAgICBjb25zdCBtID0gZXhwci5leGVjKHVhKTtcbiAgICBpZiAobSkge1xuICAgICAgaWYobS5sZW5ndGggPj0gMiAmJiBtWzFdKSB7XG4gICAgICAgIGluZm8udmVyc2lvbiA9IG1bMV0ucmVwbGFjZSgvXy9nLCBcIi5cIik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaW5mby52ZXJzaW9uID0gTkFfVkVSU0lPTjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cbiAgfVxufVxuXG4vLyDliJ3lp4vljJbor4bliKvjgIJcbmZ1bmN0aW9uIGluaXQodWEsIHBhdHRlcm5zLCBmYWN0b3J5LCBkZXRlY3Rvcil7XG4gIGxldCBkZXRlY3RlZCA9IE5BO1xuICBlYWNoKHBhdHRlcm5zLCBmdW5jdGlvbihwYXR0ZXJuKSB7XG4gICAgY29uc3QgZCA9IGRldGVjdChwYXR0ZXJuWzBdLCBwYXR0ZXJuWzFdLCB1YSk7XG4gICAgaWYgKGQpIHtcbiAgICAgIGRldGVjdGVkID0gZDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuICBmYWN0b3J5LmNhbGwoZGV0ZWN0b3IsIGRldGVjdGVkLm5hbWUsIGRldGVjdGVkLnZlcnNpb24pO1xufVxuXG5cbmNsYXNzIERldGVjdG9yIHtcbiAgY29uc3RydWN0b3IgKHJ1bGVzKSB7XG4gICAgdGhpcy5fcnVsZXMgPSBydWxlcztcbiAgfVxuXG4gIC8vIOino+aekCBVc2VyQWdlbnQg5a2X56ym5LiyXG4gIC8vIEBwYXJhbSB7U3RyaW5nfSB1YSwgdXNlckFnZW50IHN0cmluZy5cbiAgLy8gQHJldHVybiB7T2JqZWN0fVxuICBwYXJzZSAodWEpIHtcbiAgICB1YSA9ICh1YSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IGQgPSB7fTtcblxuICAgIGluaXQodWEsIHRoaXMuX3J1bGVzLmRldmljZSwgZnVuY3Rpb24obmFtZSwgdmVyc2lvbikge1xuICAgICAgY29uc3QgdiA9IHBhcnNlRmxvYXQodmVyc2lvbik7XG4gICAgICBkLmRldmljZSA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgdmVyc2lvbjogdixcbiAgICAgICAgZnVsbFZlcnNpb246IHZlcnNpb24sXG4gICAgICB9O1xuICAgICAgZC5kZXZpY2VbbmFtZV0gPSB2O1xuICAgIH0sIGQpO1xuXG4gICAgaW5pdCh1YSwgdGhpcy5fcnVsZXMub3MsIGZ1bmN0aW9uKG5hbWUsIHZlcnNpb24pe1xuICAgICAgY29uc3QgdiA9IHBhcnNlRmxvYXQodmVyc2lvbik7XG4gICAgICBkLm9zID0ge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICB2ZXJzaW9uOiB2LFxuICAgICAgICBmdWxsVmVyc2lvbjogdmVyc2lvbixcbiAgICAgIH07XG4gICAgICBkLm9zW25hbWVdID0gdjtcbiAgICB9LCBkKTtcblxuICAgIGNvbnN0IGllQ29yZSA9IHRoaXMuSUVNb2RlKHVhKTtcblxuICAgIGluaXQodWEsIHRoaXMuX3J1bGVzLmVuZ2luZSwgZnVuY3Rpb24obmFtZSwgdmVyc2lvbikge1xuICAgICAgbGV0IG1vZGUgPSB2ZXJzaW9uO1xuICAgICAgLy8gSUUg5YaF5qC455qE5rWP6KeI5Zmo77yM5L+u5aSN54mI5pys5Y+35Y+K5YW85a655qih5byP44CCXG4gICAgICBpZihpZUNvcmUpe1xuICAgICAgICB2ZXJzaW9uID0gaWVDb3JlLmVuZ2luZVZlcnNpb24gfHwgaWVDb3JlLmVuZ2luZU1vZGU7XG4gICAgICAgIG1vZGUgPSBpZUNvcmUuZW5naW5lTW9kZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHYgPSBwYXJzZUZsb2F0KHZlcnNpb24pO1xuICAgICAgZC5lbmdpbmUgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIHZlcnNpb246IHYsXG4gICAgICAgIGZ1bGxWZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICBtb2RlOiBwYXJzZUZsb2F0KG1vZGUpLFxuICAgICAgICBmdWxsTW9kZTogbW9kZSxcbiAgICAgICAgY29tcGF0aWJsZTogaWVDb3JlID8gaWVDb3JlLmNvbXBhdGlibGUgOiBmYWxzZSxcbiAgICAgIH07XG4gICAgICBkLmVuZ2luZVtuYW1lXSA9IHY7XG4gICAgfSwgZCk7XG5cbiAgICBpbml0KHVhLCB0aGlzLl9ydWxlcy5icm93c2VyLCBmdW5jdGlvbihuYW1lLCB2ZXJzaW9uKSB7XG4gICAgICBsZXQgbW9kZSA9IHZlcnNpb247XG4gICAgICAvLyBJRSDlhoXmoLjnmoTmtY/op4jlmajvvIzkv67lpI3mtY/op4jlmajniYjmnKzlj4rlhbzlrrnmqKHlvI/jgIJcbiAgICAgIGlmKGllQ29yZSl7XG4gICAgICAgIC8vIOS7heS/ruaUuSBJRSDmtY/op4jlmajnmoTniYjmnKzvvIzlhbbku5YgSUUg5YaF5qC455qE54mI5pys5LiN5L+u5pS544CCXG4gICAgICAgIGlmKG5hbWUgPT09IFwiaWVcIil7XG4gICAgICAgICAgdmVyc2lvbiA9IGllQ29yZS5icm93c2VyVmVyc2lvbjtcbiAgICAgICAgfVxuICAgICAgICBtb2RlID0gaWVDb3JlLmJyb3dzZXJNb2RlO1xuICAgICAgfVxuICAgICAgY29uc3QgdiA9IHBhcnNlRmxvYXQodmVyc2lvbik7XG4gICAgICBkLmJyb3dzZXIgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIHZlcnNpb246IHYsXG4gICAgICAgIGZ1bGxWZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICBtb2RlOiBwYXJzZUZsb2F0KG1vZGUpLFxuICAgICAgICBmdWxsTW9kZTogbW9kZSxcbiAgICAgICAgY29tcGF0aWJsZTogaWVDb3JlID8gaWVDb3JlLmNvbXBhdGlibGUgOiBmYWxzZSxcbiAgICAgIH07XG4gICAgICBkLmJyb3dzZXJbbmFtZV0gPSB2O1xuICAgIH0sIGQpO1xuICAgIHJldHVybiBkO1xuICB9XG5cbiAgLy8g6Kej5p6Q5L2/55SoIFRyaWRlbnQg5YaF5qC455qE5rWP6KeI5Zmo55qEIGDmtY/op4jlmajmqKHlvI9gIOWSjCBg5paH5qGj5qih5byPYCDkv6Hmga/jgIJcbiAgLy8gQHBhcmFtIHtTdHJpbmd9IHVhLCB1c2VyQWdlbnQgc3RyaW5nLlxuICAvLyBAcmV0dXJuIHtPYmplY3R9XG4gIElFTW9kZSAodWEpIHtcbiAgICBpZighdGhpcy5fcnVsZXMucmVfbXNpZS50ZXN0KHVhKSl7IHJldHVybiBudWxsOyB9XG5cbiAgICBsZXQgbTtcbiAgICBsZXQgZW5naW5lTW9kZTtcbiAgICBsZXQgZW5naW5lVmVyc2lvbjtcbiAgICBsZXQgYnJvd3Nlck1vZGU7XG4gICAgbGV0IGJyb3dzZXJWZXJzaW9uO1xuXG4gICAgLy8gSUU4IOWPiuWFtuS7peS4iuaPkOS+m+aciSBUcmlkZW50IOS/oeaBr++8jFxuICAgIC8vIOm7mOiupOeahOWFvOWuueaooeW8j++8jFVBIOS4rSBUcmlkZW50IOeJiOacrOS4jeWPkeeUn+WPmOWMluOAglxuICAgIGlmKHVhLmluZGV4T2YoXCJ0cmlkZW50L1wiKSAhPT0gLTEpIHtcbiAgICAgIG0gPSAvXFxidHJpZGVudFxcLyhbMC05Ll0rKS8uZXhlYyh1YSk7XG4gICAgICBpZiAobSAmJiBtLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIC8vIOecn+WunuW8leaTjueJiOacrOOAglxuICAgICAgICBlbmdpbmVWZXJzaW9uID0gbVsxXTtcbiAgICAgICAgY29uc3Qgdl92ZXJzaW9uID0gbVsxXS5zcGxpdChcIi5cIik7XG4gICAgICAgIHZfdmVyc2lvblswXSA9IHBhcnNlSW50KHZfdmVyc2lvblswXSwgMTApICsgNDtcbiAgICAgICAgYnJvd3NlclZlcnNpb24gPSB2X3ZlcnNpb24uam9pbihcIi5cIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbSA9IHRoaXMuX3J1bGVzLnJlX21zaWUuZXhlYyh1YSk7XG4gICAgYnJvd3Nlck1vZGUgPSBtWzFdO1xuICAgIGNvbnN0IHZfbW9kZSA9IG1bMV0uc3BsaXQoXCIuXCIpO1xuICAgIGlmICh0eXBlb2YgYnJvd3NlclZlcnNpb24gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGJyb3dzZXJWZXJzaW9uID0gYnJvd3Nlck1vZGU7XG4gICAgfVxuICAgIHZfbW9kZVswXSA9IHBhcnNlSW50KHZfbW9kZVswXSwgMTApIC0gNDtcbiAgICBlbmdpbmVNb2RlID0gdl9tb2RlLmpvaW4oXCIuXCIpO1xuICAgIGlmICh0eXBlb2YgZW5naW5lVmVyc2lvbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZW5naW5lVmVyc2lvbiA9IGVuZ2luZU1vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJyb3dzZXJWZXJzaW9uOiBicm93c2VyVmVyc2lvbixcbiAgICAgIGJyb3dzZXJNb2RlOiBicm93c2VyTW9kZSxcbiAgICAgIGVuZ2luZVZlcnNpb246IGVuZ2luZVZlcnNpb24sXG4gICAgICBlbmdpbmVNb2RlOiBlbmdpbmVNb2RlLFxuICAgICAgY29tcGF0aWJsZTogZW5naW5lVmVyc2lvbiAhPT0gZW5naW5lTW9kZSxcbiAgICB9O1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZXRlY3RvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXRlY3RvciA9IHJlcXVpcmUoXCIuL2RldGVjdG9yXCIpO1xuY29uc3QgV2ViUnVsZXMgPSByZXF1aXJlKFwiLi93ZWItcnVsZXNcIik7XG5cbmNvbnN0IHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQgfHwgXCJcIjtcbi8vY29uc3QgcGxhdGZvcm0gPSBuYXZpZ2F0b3IucGxhdGZvcm0gfHwgXCJcIjtcbmNvbnN0IGFwcFZlcnNpb24gPSBuYXZpZ2F0b3IuYXBwVmVyc2lvbiB8fCBcIlwiO1xuY29uc3QgdmVuZG9yID0gbmF2aWdhdG9yLnZlbmRvciB8fCBcIlwiO1xuY29uc3QgdWEgPSB1c2VyQWdlbnQgKyBcIiBcIiArIGFwcFZlcnNpb24gKyBcIiBcIiArIHZlbmRvcjtcblxuY29uc3QgZGV0ZWN0b3IgPSBuZXcgRGV0ZWN0b3IoV2ViUnVsZXMpO1xuXG4vLyDop6PmnpDkvb/nlKggVHJpZGVudCDlhoXmoLjnmoTmtY/op4jlmajnmoQgYOa1j+iniOWZqOaooeW8j2Ag5ZKMIGDmlofmoaPmqKHlvI9gIOS/oeaBr+OAglxuLy8gQHBhcmFtIHtTdHJpbmd9IHVhLCB1c2VyQWdlbnQgc3RyaW5nLlxuLy8gQHJldHVybiB7T2JqZWN0fVxuZnVuY3Rpb24gSUVNb2RlKHVhKXtcbiAgaWYoIVdlYlJ1bGVzLnJlX21zaWUudGVzdCh1YSkpeyByZXR1cm4gbnVsbDsgfVxuXG4gIGxldCBtO1xuICBsZXQgZW5naW5lTW9kZTtcbiAgbGV0IGVuZ2luZVZlcnNpb247XG4gIGxldCBicm93c2VyTW9kZTtcbiAgbGV0IGJyb3dzZXJWZXJzaW9uO1xuXG4gIC8vIElFOCDlj4rlhbbku6XkuIrmj5DkvpvmnIkgVHJpZGVudCDkv6Hmga/vvIxcbiAgLy8g6buY6K6k55qE5YW85a655qih5byP77yMVUEg5LitIFRyaWRlbnQg54mI5pys5LiN5Y+R55Sf5Y+Y5YyW44CCXG4gIGlmKHVhLmluZGV4T2YoXCJ0cmlkZW50L1wiKSAhPT0gLTEpe1xuICAgIG0gPSAvXFxidHJpZGVudFxcLyhbMC05Ll0rKS8uZXhlYyh1YSk7XG4gICAgaWYgKG0gJiYgbS5sZW5ndGggPj0gMikge1xuICAgICAgLy8g55yf5a6e5byV5pOO54mI5pys44CCXG4gICAgICBlbmdpbmVWZXJzaW9uID0gbVsxXTtcbiAgICAgIGNvbnN0IHZfdmVyc2lvbiA9IG1bMV0uc3BsaXQoXCIuXCIpO1xuICAgICAgdl92ZXJzaW9uWzBdID0gcGFyc2VJbnQodl92ZXJzaW9uWzBdLCAxMCkgKyA0O1xuICAgICAgYnJvd3NlclZlcnNpb24gPSB2X3ZlcnNpb24uam9pbihcIi5cIik7XG4gICAgfVxuICB9XG5cbiAgbSA9IFdlYlJ1bGVzLnJlX21zaWUuZXhlYyh1YSk7XG4gIGJyb3dzZXJNb2RlID0gbVsxXTtcbiAgY29uc3Qgdl9tb2RlID0gbVsxXS5zcGxpdChcIi5cIik7XG4gIGlmICh0eXBlb2YgYnJvd3NlclZlcnNpb24gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBicm93c2VyVmVyc2lvbiA9IGJyb3dzZXJNb2RlO1xuICB9XG4gIHZfbW9kZVswXSA9IHBhcnNlSW50KHZfbW9kZVswXSwgMTApIC0gNDtcbiAgZW5naW5lTW9kZSA9IHZfbW9kZS5qb2luKFwiLlwiKTtcbiAgaWYgKHR5cGVvZiBlbmdpbmVWZXJzaW9uID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgZW5naW5lVmVyc2lvbiA9IGVuZ2luZU1vZGU7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJyb3dzZXJWZXJzaW9uOiBicm93c2VyVmVyc2lvbixcbiAgICBicm93c2VyTW9kZTogYnJvd3Nlck1vZGUsXG4gICAgZW5naW5lVmVyc2lvbjogZW5naW5lVmVyc2lvbixcbiAgICBlbmdpbmVNb2RlOiBlbmdpbmVNb2RlLFxuICAgIGNvbXBhdGlibGU6IGVuZ2luZVZlcnNpb24gIT09IGVuZ2luZU1vZGUsXG4gIH07XG59XG5cbmZ1bmN0aW9uIFdlYlBhcnNlICh1YSkge1xuICBjb25zdCBkID0gZGV0ZWN0b3IucGFyc2UodWEpO1xuXG4gIGNvbnN0IGllQ29yZSA9IElFTW9kZSh1YSk7XG5cbiAgLy8gSUUg5YaF5qC455qE5rWP6KeI5Zmo77yM5L+u5aSN54mI5pys5Y+35Y+K5YW85a655qih5byP44CCXG4gIGlmKGllQ29yZSkge1xuICAgIGNvbnN0IGVuZ2luZVZlcnNpb24gPSBpZUNvcmUuZW5naW5lVmVyc2lvbiB8fCBpZUNvcmUuZW5naW5lTW9kZTtcbiAgICBjb25zdCB2ZSA9IHBhcnNlRmxvYXQoZW5naW5lVmVyc2lvbik7XG4gICAgY29uc3QgbW9kZSA9IGllQ29yZS5lbmdpbmVNb2RlO1xuXG4gICAgZC5lbmdpbmUgPSB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgdmVyc2lvbjogdmUsXG4gICAgICBmdWxsVmVyc2lvbjogZW5naW5lVmVyc2lvbixcbiAgICAgIG1vZGU6IHBhcnNlRmxvYXQobW9kZSksXG4gICAgICBmdWxsTW9kZTogbW9kZSxcbiAgICAgIGNvbXBhdGlibGU6IGllQ29yZSA/IGllQ29yZS5jb21wYXRpYmxlIDogZmFsc2UsXG4gICAgfTtcbiAgICBkLmVuZ2luZVtkLmVuZ2luZS5uYW1lXSA9IHZlO1xuXG4gICAgLy8gSUUg5YaF5qC455qE5rWP6KeI5Zmo77yM5L+u5aSN5rWP6KeI5Zmo54mI5pys5Y+K5YW85a655qih5byP44CCXG4gICAgLy8g5LuF5L+u5pS5IElFIOa1j+iniOWZqOeahOeJiOacrO+8jOWFtuS7liBJRSDlhoXmoLjnmoTniYjmnKzkuI3kv67mlLnjgIJcbiAgICBsZXQgYnJvd3NlclZlcnNpb24gPSBkLmJyb3dzZXIuZnVsbFZlcnNpb247XG4gICAgaWYoZC5icm93c2VyLm5hbWUgPT09IFwiaWVcIil7XG4gICAgICBicm93c2VyVmVyc2lvbiA9IGllQ29yZS5icm93c2VyVmVyc2lvbjtcbiAgICB9XG4gICAgY29uc3QgYnJvd3Nlck1vZGUgPSBpZUNvcmUuYnJvd3Nlck1vZGU7XG4gICAgY29uc3QgdmIgPSBwYXJzZUZsb2F0KGJyb3dzZXJWZXJzaW9uKTtcbiAgICBkLmJyb3dzZXIgPSB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgdmVyc2lvbjogdmIsXG4gICAgICBmdWxsVmVyc2lvbjogYnJvd3NlclZlcnNpb24sXG4gICAgICBtb2RlOiBwYXJzZUZsb2F0KGJyb3dzZXJNb2RlKSxcbiAgICAgIGZ1bGxNb2RlOiBicm93c2VyTW9kZSxcbiAgICAgIGNvbXBhdGlibGU6IGllQ29yZSA/IGllQ29yZS5jb21wYXRpYmxlIDogZmFsc2UsXG4gICAgfTtcbiAgICBkLmJyb3dzZXJbZC5icm93c2VyLm5hbWVdID0gdmI7XG4gIH1cbiAgcmV0dXJuIGQ7XG59XG5cbmNvbnN0IFRhbiA9IFdlYlBhcnNlKHVhKTtcblRhbi5wYXJzZSA9IFdlYlBhcnNlO1xubW9kdWxlLmV4cG9ydHMgPSBUYW47XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3Qgd2luID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcbmNvbnN0IGV4dGVybmFsID0gd2luLmV4dGVybmFsO1xuY29uc3QgcmVfbXNpZSA9IC9cXGIoPzptc2llIHxpZSB8dHJpZGVudFxcL1swLTldLipydlsgOl0pKFswLTkuXSspLztcbmNvbnN0IHJlX2JsYWNrYmVycnlfMTAgPSAvXFxiYmIxMFxcYi4rP1xcYnZlcnNpb25cXC8oW1xcZC5dKykvO1xuY29uc3QgcmVfYmxhY2tiZXJyeV82XzcgPSAvXFxiYmxhY2tiZXJyeVxcYi4rXFxidmVyc2lvblxcLyhbXFxkLl0rKS87XG5jb25zdCByZV9ibGFja2JlcnJ5XzRfNSA9IC9cXGJibGFja2JlcnJ5XFxkK1xcLyhbXFxkLl0rKS87XG5cbmNvbnN0IE5BX1ZFUlNJT04gPSBcIi0xXCI7XG5cbi8vIOehrOS7tuiuvuWkh+S/oeaBr+ivhuWIq+ihqOi+vuW8j+OAglxuLy8g5L2/55So5pWw57uE5Y+v5Lul5oyJ5LyY5YWI57qn5o6S5bqP44CCXG5jb25zdCBERVZJQ0VTID0gW1xuICBbXCJub2tpYVwiLCBmdW5jdGlvbih1YSl7XG4gICAgLy8g5LiN6IO95bCG5Lik5Liq6KGo6L6+5byP5ZCI5bm277yM5Zug5Li65Y+v6IO95Ye6546wIFwibm9raWE7IG5va2lhIDk2MFwiXG4gICAgLy8g6L+Z56eN5oOF5Ya15LiL5Lya5LyY5YWI6K+G5Yir5Ye6IG5va2lhLy0xXG4gICAgaWYodWEuaW5kZXhPZihcIm5va2lhIFwiKSAhPT0gLTEpe1xuICAgICAgcmV0dXJuIC9cXGJub2tpYSAoWzAtOV0rKT8vO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIC9cXGJub2tpYShbYS16MC05XSspPy87XG4gICAgfVxuICB9XSxcbiAgLy8g5LiJ5pif5pyJIEFuZHJvaWQg5ZKMIFdQIOiuvuWkh+OAglxuICBbXCJzYW1zdW5nXCIsIGZ1bmN0aW9uKHVhKXtcbiAgICBpZih1YS5pbmRleE9mKFwic2Ftc3VuZ1wiKSAhPT0gLTEpe1xuICAgICAgcmV0dXJuIC9cXGJzYW1zdW5nKD86WyBcXC1dKD86c2dofGd0fHNtKSk/LShbYS16MC05XSspLztcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiAvXFxiKD86c2dofHNjaHxndHxzbSktKFthLXowLTldKykvO1xuICAgIH1cbiAgfV0sXG4gIFtcIndwXCIsIGZ1bmN0aW9uKHVhKXtcbiAgICByZXR1cm4gdWEuaW5kZXhPZihcIndpbmRvd3MgcGhvbmUgXCIpICE9PSAtMSB8fFxuICAgICAgdWEuaW5kZXhPZihcInhibHdwXCIpICE9PSAtMSB8fFxuICAgICAgdWEuaW5kZXhPZihcInp1bmV3cFwiKSAhPT0gLTEgfHxcbiAgICAgIHVhLmluZGV4T2YoXCJ3aW5kb3dzIGNlXCIpICE9PSAtMTtcbiAgfV0sXG4gIFtcInBjXCIsIFwid2luZG93c1wiXSxcbiAgW1wiaXBhZFwiLCBcImlwYWRcIl0sXG4gIC8vIGlwb2Qg6KeE5YiZ5bqU572u5LqOIGlwaG9uZSDkuYvliY3jgIJcbiAgW1wiaXBvZFwiLCBcImlwb2RcIl0sXG4gIFtcImlwaG9uZVwiLCAvXFxiaXBob25lXFxifFxcYmlwaChcXGQpL10sXG4gIFtcIm1hY1wiLCBcIm1hY2ludG9zaFwiXSxcbiAgLy8g5bCP57GzXG4gIFtcIm1pXCIsIC9cXGJtaVsgXFwtXT8oW2EtejAtOSBdKyg/PSBidWlsZHxcXCkpKS9dLFxuICAvLyDnuqLnsbNcbiAgW1wiaG9uZ21pXCIsIC9cXGJobVsgXFwtXT8oW2EtejAtOV0rKS9dLFxuICBbXCJhbGl5dW5cIiwgL1xcYmFsaXl1bm9zXFxiKD86W1xcLV0oXFxkKykpPy9dLFxuICBbXCJtZWl6dVwiLCBmdW5jdGlvbih1YSkge1xuICAgIHJldHVybiB1YS5pbmRleE9mKFwibWVpenVcIikgPj0gMCA/XG4gICAgICAvXFxibWVpenVbXFwvIF0oW2EtejAtOV0rKVxcYi9cbiAgICAgIDpcbiAgICAgIC9cXGJtKFswLTljeF17MSw0fSlcXGIvO1xuICB9XSxcbiAgW1wibmV4dXNcIiwgL1xcYm5leHVzIChbMC05cy5dKykvXSxcbiAgW1wiaHVhd2VpXCIsIGZ1bmN0aW9uKHVhKSB7XG4gICAgY29uc3QgcmVfbWVkaWFwYWQgPSAvXFxibWVkaWFwYWQgKC4rPykoPz0gYnVpbGRcXC9odWF3ZWltZWRpYXBhZFxcYikvO1xuICAgIGlmKHVhLmluZGV4T2YoXCJodWF3ZWktaHVhd2VpXCIpICE9PSAtMSl7XG4gICAgICByZXR1cm4gL1xcYmh1YXdlaVxcLWh1YXdlaVxcLShbYS16MC05XFwtXSspLztcbiAgICB9ZWxzZSBpZihyZV9tZWRpYXBhZC50ZXN0KHVhKSl7XG4gICAgICByZXR1cm4gcmVfbWVkaWFwYWQ7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gL1xcYmh1YXdlaVsgX1xcLV0/KFthLXowLTldKykvO1xuICAgIH1cbiAgfV0sXG4gIFtcImxlbm92b1wiLCBmdW5jdGlvbih1YSl7XG4gICAgaWYodWEuaW5kZXhPZihcImxlbm92by1sZW5vdm9cIikgIT09IC0xKXtcbiAgICAgIHJldHVybiAvXFxibGVub3ZvXFwtbGVub3ZvWyBcXC1dKFthLXowLTldKykvO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIC9cXGJsZW5vdm9bIFxcLV0/KFthLXowLTldKykvO1xuICAgIH1cbiAgfV0sXG4gIC8vIOS4reWFtFxuICBbXCJ6dGVcIiwgZnVuY3Rpb24odWEpe1xuICAgIGlmKC9cXGJ6dGVcXC1bdHVdLy50ZXN0KHVhKSl7XG4gICAgICByZXR1cm4gL1xcYnp0ZS1bdHVdWyBfXFwtXT8oW2Etc3UtejAtOVxcK10rKS87XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gL1xcYnp0ZVsgX1xcLV0/KFthLXN1LXowLTlcXCtdKykvO1xuICAgIH1cbiAgfV0sXG4gIC8vIOatpeatpemrmFxuICBbXCJ2aXZvXCIsIC9cXGJ2aXZvKD86IChbYS16MC05XSspKT8vXSxcbiAgW1wiaHRjXCIsIGZ1bmN0aW9uKHVhKXtcbiAgICBpZigvXFxiaHRjW2EtejAtOSBfXFwtXSsoPz0gYnVpbGRcXGIpLy50ZXN0KHVhKSl7XG4gICAgICByZXR1cm4gL1xcYmh0Y1sgX1xcLV0/KFthLXowLTkgXSsoPz0gYnVpbGQpKS87XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gL1xcYmh0Y1sgX1xcLV0/KFthLXowLTkgXSspLztcbiAgICB9XG4gIH1dLFxuICBbXCJvcHBvXCIsIC9cXGJvcHBvW19dKFthLXowLTldKykvXSxcbiAgW1wia29ua2FcIiwgL1xcYmtvbmthW19cXC1dKFthLXowLTldKykvXSxcbiAgW1wic29ueWVyaWNzc29uXCIsIC9cXGJtdChbYS16MC05XSspL10sXG4gIFtcImNvb2xwYWRcIiwgL1xcYmNvb2xwYWRbXyBdPyhbYS16MC05XSspL10sXG4gIFtcImxnXCIsIC9cXGJsZ1tcXC1dKFthLXowLTldKykvXSxcbiAgW1wiYW5kcm9pZFwiLCAvXFxiYW5kcm9pZFxcYnxcXGJhZHJcXGIvXSxcbiAgW1wiYmxhY2tiZXJyeVwiLCBmdW5jdGlvbih1YSl7XG4gICAgaWYgKHVhLmluZGV4T2YoXCJibGFja2JlcnJ5XCIpID49IDApIHtcbiAgICAgIHJldHVybiAvXFxiYmxhY2tiZXJyeVxccz8oXFxkKykvO1xuICAgIH1cbiAgICByZXR1cm4gXCJiYjEwXCI7XG4gIH1dLFxuXTtcblxuLy8g5pON5L2c57O757uf5L+h5oGv6K+G5Yir6KGo6L6+5byPXG5jb25zdCBPUyA9IFtcbiAgW1wid3BcIiwgZnVuY3Rpb24odWEpe1xuICAgIGlmKHVhLmluZGV4T2YoXCJ3aW5kb3dzIHBob25lIFwiKSAhPT0gLTEpe1xuICAgICAgcmV0dXJuIC9cXGJ3aW5kb3dzIHBob25lICg/Om9zICk/KFswLTkuXSspLztcbiAgICB9ZWxzZSBpZih1YS5pbmRleE9mKFwieGJsd3BcIikgIT09IC0xKXtcbiAgICAgIHJldHVybiAvXFxieGJsd3AoWzAtOS5dKykvO1xuICAgIH1lbHNlIGlmKHVhLmluZGV4T2YoXCJ6dW5ld3BcIikgIT09IC0xKXtcbiAgICAgIHJldHVybiAvXFxienVuZXdwKFswLTkuXSspLztcbiAgICB9XG4gICAgcmV0dXJuIFwid2luZG93cyBwaG9uZVwiO1xuICB9XSxcbiAgW1wid2luZG93c1wiLCAvXFxid2luZG93cyBudCAoWzAtOS5dKykvXSxcbiAgW1wibWFjb3N4XCIsIC9cXGJtYWMgb3MgeCAoWzAtOS5fXSspL10sXG4gIFtcImlvc1wiLCBmdW5jdGlvbih1YSl7XG4gICAgaWYoL1xcYmNwdSg/OiBpcGhvbmUpPyBvcyAvLnRlc3QodWEpKXtcbiAgICAgIHJldHVybiAvXFxiY3B1KD86IGlwaG9uZSk/IG9zIChbMC05Ll9dKykvO1xuICAgIH1lbHNlIGlmKHVhLmluZGV4T2YoXCJpcGggb3MgXCIpICE9PSAtMSl7XG4gICAgICByZXR1cm4gL1xcYmlwaCBvcyAoWzAtOV9dKykvO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIC9cXGJpb3NcXGIvO1xuICAgIH1cbiAgfV0sXG4gIFtcInl1bm9zXCIsIC9cXGJhbGl5dW5vcyAoWzAtOS5dKykvXSxcbiAgW1wiYW5kcm9pZFwiLCBmdW5jdGlvbih1YSl7XG4gICAgaWYodWEuaW5kZXhPZihcImFuZHJvaWRcIikgPj0gMCl7XG4gICAgICByZXR1cm4gL1xcYmFuZHJvaWRbIFxcLy1dPyhbMC05LnhdKyk/LztcbiAgICB9ZWxzZSBpZih1YS5pbmRleE9mKFwiYWRyXCIpID49IDApe1xuICAgICAgaWYodWEuaW5kZXhPZihcIm1xcWJyb3dzZXJcIikgPj0gMCl7XG4gICAgICAgIHJldHVybiAvXFxiYWRyWyBdXFwobGludXg7IHU7IChbMC05Ll0rKT8vO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiAvXFxiYWRyKD86WyBdKFswLTkuXSspKT8vO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gXCJhbmRyb2lkXCI7XG4gICAgLy9yZXR1cm4gL1xcYig/OmFuZHJvaWR8XFxiYWRyKSg/OltcXC9cXC0gXSg/OlxcKGxpbnV4OyB1OyApPyk/KFswLTkueF0rKT8vO1xuICB9XSxcbiAgW1wiY2hyb21lb3NcIiwgL1xcYmNyb3MgaTY4NiAoWzAtOS5dKykvXSxcbiAgW1wibGludXhcIiwgXCJsaW51eFwiXSxcbiAgW1wid2luZG93c2NlXCIsIC9cXGJ3aW5kb3dzIGNlKD86IChbMC05Ll0rKSk/L10sXG4gIFtcInN5bWJpYW5cIiwgL1xcYnN5bWJpYW4oPzpvcyk/XFwvKFswLTkuXSspL10sXG4gIFtcImJsYWNrYmVycnlcIiwgZnVuY3Rpb24odWEpe1xuICAgIGNvbnN0IG0gPSB1YS5tYXRjaChyZV9ibGFja2JlcnJ5XzEwKSB8fFxuICAgICAgdWEubWF0Y2gocmVfYmxhY2tiZXJyeV82XzcpIHx8XG4gICAgICB1YS5tYXRjaChyZV9ibGFja2JlcnJ5XzRfNSk7XG4gICAgcmV0dXJuIG0gPyB7dmVyc2lvbjogbVsxXX0gOiBcImJsYWNrYmVycnlcIjtcbiAgfV0sXG5dO1xuXG4vLyDpkojlr7nlkIzmupDnmoQgVGhlV29ybGQg5ZKMIDM2MCDnmoQgZXh0ZXJuYWwg5a+56LGh6L+b6KGM5qOA5rWL44CCXG4vLyBAcGFyYW0ge1N0cmluZ30ga2V5LCDlhbPplK7lrZfvvIznlKjkuo7mo4DmtYvmtY/op4jlmajnmoTlronoo4Xot6/lvoTkuK3lh7rnjrDnmoTlhbPplK7lrZfjgIJcbi8vIEByZXR1cm4ge1VuZGVmaW5lZCxCb29sZWFuLE9iamVjdH0g6L+U5ZueIHVuZGVmaW5lZCDmiJYgZmFsc2Ug6KGo56S65qOA5rWL5pyq5ZG95Lit44CCXG5mdW5jdGlvbiBjaGVja1RXMzYwRXh0ZXJuYWwoa2V5KXtcbiAgaWYoIWV4dGVybmFsKXsgcmV0dXJuOyB9IC8vIHJldHVybiB1bmRlZmluZWQuXG4gIHRyeXtcbiAgICAvLyAgICAgICAgMzYw5a6J6KOF6Lev5b6E77yaXG4gICAgLy8gICAgICAgIEM6JTVDUFJPR1JBfjElNUMzNjAlNUMzNjBzZTMlNUMzNjBTRS5leGVcbiAgICBjb25zdCBydW5wYXRoID0gZXh0ZXJuYWwudHdHZXRSdW5QYXRoLnRvTG93ZXJDYXNlKCk7XG4gICAgLy8gMzYwU0UgMy54IH4gNS54IHN1cHBvcnQuXG4gICAgLy8g5pq06Zyy55qEIGV4dGVybmFsLnR3R2V0VmVyc2lvbiDlkowgZXh0ZXJuYWwudHdHZXRTZWN1cml0eUlEIOWdh+S4uiB1bmRlZmluZWTjgIJcbiAgICAvLyDlm6DmraTlj6rog73nlKggdHJ5L2NhdGNoIOiAjOaXoOazleS9v+eUqOeJueaAp+WIpOaWreOAglxuICAgIGNvbnN0IHNlY3VyaXR5ID0gZXh0ZXJuYWwudHdHZXRTZWN1cml0eUlEKHdpbik7XG4gICAgY29uc3QgdmVyc2lvbiA9IGV4dGVybmFsLnR3R2V0VmVyc2lvbihzZWN1cml0eSk7XG5cbiAgICBpZiAocnVucGF0aCAmJiBydW5wYXRoLmluZGV4T2Yoa2V5KSA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgaWYgKHZlcnNpb24pe3JldHVybiB7dmVyc2lvbjogdmVyc2lvbn07IH1cbiAgfWNhdGNoKGV4KXsgLyogKi8gfVxufVxuXG5jb25zdCBFTkdJTkUgPSBbXG4gIFtcImVkZ2VodG1sXCIsIC9lZGdlXFwvKFswLTkuXSspL10sXG4gIFtcInRyaWRlbnRcIiwgcmVfbXNpZV0sXG4gIFtcImJsaW5rXCIsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFwiY2hyb21lXCIgaW4gd2luICYmIFwiQ1NTXCIgaW4gd2luICYmIC9cXGJhcHBsZXdlYmtpdFtcXC9dPyhbMC05LitdKykvO1xuICB9XSxcbiAgW1wid2Via2l0XCIsIC9cXGJhcHBsZXdlYmtpdFtcXC9dPyhbMC05LitdKykvXSxcbiAgW1wiZ2Vja29cIiwgZnVuY3Rpb24odWEpe1xuICAgIGNvbnN0IG1hdGNoID0gdWEubWF0Y2goL1xcYnJ2OihbXFxkXFx3Ll0rKS4qXFxiZ2Vja29cXC8oXFxkKykvKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZlcnNpb246IG1hdGNoWzFdICsgXCIuXCIgKyBtYXRjaFsyXSxcbiAgICAgIH07XG4gICAgfVxuICB9XSxcbiAgW1wicHJlc3RvXCIsIC9cXGJwcmVzdG9cXC8oWzAtOS5dKykvXSxcbiAgW1wiYW5kcm9pZHdlYmtpdFwiLCAvXFxiYW5kcm9pZHdlYmtpdFxcLyhbMC05Ll0rKS9dLFxuICBbXCJjb29scGFkd2Via2l0XCIsIC9cXGJjb29scGFkd2Via2l0XFwvKFswLTkuXSspL10sXG4gIFtcInUyXCIsIC9cXGJ1MlxcLyhbMC05Ll0rKS9dLFxuICBbXCJ1M1wiLCAvXFxidTNcXC8oWzAtOS5dKykvXSxcbl07XG5jb25zdCBCUk9XU0VSID0gW1xuICAvLyBNaWNyb3NvZnQgRWRnZSBCcm93c2VyLCBEZWZhdWx0IGJyb3dzZXIgaW4gV2luZG93cyAxMC5cbiAgW1wiZWRnZVwiLCAvZWRnZVxcLyhbMC05Ll0rKS9dLFxuICAvLyBTb2dvdS5cbiAgW1wic29nb3VcIiwgZnVuY3Rpb24odWEpe1xuICAgIGlmICh1YS5pbmRleE9mKFwic29nb3Vtb2JpbGVicm93c2VyXCIpID49IDApIHtcbiAgICAgIHJldHVybiAvc29nb3Vtb2JpbGVicm93c2VyXFwvKFswLTkuXSspLztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoXCJzb2dvdW1zZVwiKSA+PSAwKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gLyBzZSAoWzAtOS54XSspLztcbiAgfV0sXG4gIC8vIFRoZVdvcmxkICjkuJbnlYzkuYvnqpcpXG4gIC8vIOeUseS6juijmeW4puWFs+ezu++8jFRoZVdvcmxkIEFQSSDkuI4gMzYwIOmrmOW6pumHjeWQiOOAglxuICAvLyDlj6rog73pgJrov4cgVUEg5ZKM56iL5bqP5a6J6KOF6Lev5b6E5Lit55qE5bqU55So56iL5bqP5ZCN5p2l5Yy65YiG44CCXG4gIC8vIFRoZVdvcmxkIOeahCBVQSDmr5QgMzYwIOabtOmdoOiwse+8jOaJgOacieWwhiBUaGVXb3JsZCDnmoTop4TliJnmlL7nva7liLAgMzYwIOS5i+WJjeOAglxuICBbXCJ0aGV3b3JsZFwiLCBmdW5jdGlvbigpe1xuICAgIGNvbnN0IHggPSBjaGVja1RXMzYwRXh0ZXJuYWwoXCJ0aGV3b3JsZFwiKTtcbiAgICBpZih0eXBlb2YgeCAhPT0gXCJ1bmRlZmluZWRcIil7IHJldHVybiB4OyB9XG4gICAgcmV0dXJuIFwidGhld29ybGRcIjtcbiAgfV0sXG4gIC8vIDM2MFNFLCAzNjBFRS5cbiAgW1wiMzYwXCIsIGZ1bmN0aW9uKHVhKSB7XG4gICAgY29uc3QgeCA9IGNoZWNrVFczNjBFeHRlcm5hbChcIjM2MHNlXCIpO1xuICAgIGlmKHR5cGVvZiB4ICE9PSBcInVuZGVmaW5lZFwiKXsgcmV0dXJuIHg7IH1cbiAgICBpZih1YS5pbmRleE9mKFwiMzYwIGFwaG9uZSBicm93c2VyXCIpICE9PSAtMSl7XG4gICAgICByZXR1cm4gL1xcYjM2MCBhcGhvbmUgYnJvd3NlciBcXCgoW15cXCldKylcXCkvO1xuICAgIH1cbiAgICByZXR1cm4gL1xcYjM2MCg/OnNlfGVlfGNocm9tZXxicm93c2VyKVxcYi87XG4gIH1dLFxuICAvLyBNYXh0aG9uXG4gIFtcIm1heHRob25cIiwgZnVuY3Rpb24oKXtcbiAgICB0cnl7XG4gICAgICBpZihleHRlcm5hbCAmJiAoZXh0ZXJuYWwubXhWZXJzaW9uIHx8IGV4dGVybmFsLm1heF92ZXJzaW9uKSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmVyc2lvbjogZXh0ZXJuYWwubXhWZXJzaW9uIHx8IGV4dGVybmFsLm1heF92ZXJzaW9uLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1jYXRjaChleCl7IC8qICovIH1cbiAgICByZXR1cm4gL1xcYig/Om1heHRob258bXhicm93c2VyKSg/OlsgXFwvXShbMC05Ll0rKSk/LztcbiAgfV0sXG4gIFtcIm1pY3JvbWVzc2VuZ2VyXCIsIC9cXGJtaWNyb21lc3NlbmdlclxcLyhbXFxkLl0rKS9dLFxuICBbXCJxcVwiLCAvXFxibT9xcWJyb3dzZXJcXC8oWzAtOS5dKykvXSxcbiAgW1wiZ3JlZW5cIiwgXCJncmVlbmJyb3dzZXJcIl0sXG4gIFtcInR0XCIsIC9cXGJ0ZW5jZW50dHJhdmVsZXIgKFswLTkuXSspL10sXG4gIFtcImxpZWJhb1wiLCBmdW5jdGlvbih1YSl7XG4gICAgaWYgKHVhLmluZGV4T2YoXCJsaWViYW9mYXN0XCIpID49IDApe1xuICAgICAgcmV0dXJuIC9cXGJsaWViYW9mYXN0XFwvKFswLTkuXSspLztcbiAgICB9XG4gICAgaWYodWEuaW5kZXhPZihcImxiYnJvd3NlclwiKSA9PT0gLTEpeyByZXR1cm4gZmFsc2U7IH1cbiAgICBsZXQgdmVyc2lvbjtcbiAgICB0cnl7XG4gICAgICBpZihleHRlcm5hbCAmJiBleHRlcm5hbC5MaWViYW9HZXRWZXJzaW9uKXtcbiAgICAgICAgdmVyc2lvbiA9IGV4dGVybmFsLkxpZWJhb0dldFZlcnNpb24oKTtcbiAgICAgIH1cbiAgICB9Y2F0Y2goZXgpeyAvKiAqLyB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246IHZlcnNpb24gfHwgTkFfVkVSU0lPTixcbiAgICB9O1xuICB9XSxcbiAgW1widGFvXCIsIC9cXGJ0YW9icm93c2VyXFwvKFswLTkuXSspL10sXG4gIFtcImNvb2xub3ZvXCIsIC9cXGJjb29sbm92b1xcLyhbMC05Ll0rKS9dLFxuICBbXCJzYWF5YWFcIiwgXCJzYWF5YWFcIl0sXG4gIC8vIOacieWfuuS6jiBDaHJvbW5pdW4g55qE5oCl6YCf5qih5byP5ZKM5Z+65LqOIElFIOeahOWFvOWuueaooeW8j+OAguW/hemhu+WcqCBJRSDnmoTop4TliJnkuYvliY3jgIJcbiAgW1wiYmFpZHVcIiwgL1xcYig/OmJhP2lkdWJyb3dzZXJ8YmFpZHVoZClbIFxcL10oWzAtOS54XSspL10sXG4gIC8vIOWQjumdouS8muWBmuS/ruWkjeeJiOacrOWPt++8jOi/memHjOWPquimgeiDveivhuWIq+aYryBJRSDljbPlj6/jgIJcbiAgW1wiaWVcIiwgcmVfbXNpZV0sXG4gIFtcIm1pXCIsIC9cXGJtaXVpYnJvd3NlclxcLyhbMC05Ll0rKS9dLFxuICAvLyBPcGVyYSAxNSDkuYvlkI7lvIDlp4vkvb/nlKggQ2hyb21uaXVuIOWGheaguO+8jOmcgOimgeaUvuWcqCBDaHJvbWUg55qE6KeE5YiZ5LmL5YmN44CCXG4gIFtcIm9wZXJhXCIsIGZ1bmN0aW9uKHVhKXtcbiAgICBjb25zdCByZV9vcGVyYV9vbGQgPSAvXFxib3BlcmEuK3ZlcnNpb25cXC8oWzAtOS5hYl0rKS87XG4gICAgY29uc3QgcmVfb3BlcmFfbmV3ID0gL1xcYm9wclxcLyhbMC05Ll0rKS87XG4gICAgcmV0dXJuIHJlX29wZXJhX29sZC50ZXN0KHVhKSA/IHJlX29wZXJhX29sZCA6IHJlX29wZXJhX25ldztcbiAgfV0sXG4gIFtcIm91cGVuZ1wiLCAvXFxib3VwZW5nXFwvKFswLTkuXSspL10sXG4gIFtcInlhbmRleFwiLCAveWFicm93c2VyXFwvKFswLTkuXSspL10sXG4gIC8vIOaUr+S7mOWuneaJi+acuuWuouaIt+err1xuICBbXCJhbGktYXBcIiwgZnVuY3Rpb24odWEpe1xuICAgIGlmKHVhLmluZGV4T2YoXCJhbGlhcHBcIikgPiAwKXtcbiAgICAgIHJldHVybiAvXFxiYWxpYXBwXFwoYXBcXC8oWzAtOS5dKylcXCkvO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIC9cXGJhbGlwYXljbGllbnRcXC8oWzAtOS5dKylcXGIvO1xuICAgIH1cbiAgfV0sXG4gIC8vIOaUr+S7mOWuneW5s+adv+WuouaIt+err1xuICBbXCJhbGktYXAtcGRcIiwgL1xcYmFsaWFwcFxcKGFwLXBkXFwvKFswLTkuXSspXFwpL10sXG4gIC8vIOaUr+S7mOWuneWVhuaIt+WuouaIt+err1xuICBbXCJhbGktYW1cIiwgL1xcYmFsaWFwcFxcKGFtXFwvKFswLTkuXSspXFwpL10sXG4gIC8vIOa3mOWuneaJi+acuuWuouaIt+err1xuICBbXCJhbGktdGJcIiwgL1xcYmFsaWFwcFxcKHRiXFwvKFswLTkuXSspXFwpL10sXG4gIC8vIOa3mOWuneW5s+adv+WuouaIt+err1xuICBbXCJhbGktdGItcGRcIiwgL1xcYmFsaWFwcFxcKHRiLXBkXFwvKFswLTkuXSspXFwpL10sXG4gIC8vIOWkqeeMq+aJi+acuuWuouaIt+err1xuICBbXCJhbGktdG1cIiwgL1xcYmFsaWFwcFxcKHRtXFwvKFswLTkuXSspXFwpL10sXG4gIC8vIOWkqeeMq+W5s+adv+WuouaIt+err1xuICBbXCJhbGktdG0tcGRcIiwgL1xcYmFsaWFwcFxcKHRtLXBkXFwvKFswLTkuXSspXFwpL10sXG4gIC8vIFVDIOa1j+iniOWZqO+8jOWPr+iDveS8muiiq+ivhuWIq+S4uiBBbmRyb2lkIOa1j+iniOWZqO+8jOinhOWImemcgOimgeWJjee9ruOAglxuICAvLyBVQyDmoYzpnaLniYjmtY/op4jlmajmkLrluKYgQ2hyb21lIOS/oeaBr++8jOmcgOimgeaUvuWcqCBDaHJvbWUg5LmL5YmN44CCXG4gIFtcInVjXCIsIGZ1bmN0aW9uKHVhKXtcbiAgICBpZih1YS5pbmRleE9mKFwidWNicm93c2VyL1wiKSA+PSAwKXtcbiAgICAgIHJldHVybiAvXFxidWNicm93c2VyXFwvKFswLTkuXSspLztcbiAgICB9IGVsc2UgaWYodWEuaW5kZXhPZihcInVicm93c2VyL1wiKSA+PSAwKXtcbiAgICAgIHJldHVybiAvXFxidWJyb3dzZXJcXC8oWzAtOS5dKykvO1xuICAgIH1lbHNlIGlmKC9cXGJ1Y1xcL1swLTldLy50ZXN0KHVhKSl7XG4gICAgICByZXR1cm4gL1xcYnVjXFwvKFswLTkuXSspLztcbiAgICB9ZWxzZSBpZih1YS5pbmRleE9mKFwidWN3ZWJcIikgPj0gMCl7XG4gICAgICAvLyBgdWN3ZWIvMi4wYCBpcyBjb21wb255IGluZm8uXG4gICAgICAvLyBgVUNXRUI4LjcuMi4yMTQvMTQ1LzgwMGAgaXMgYnJvd3NlciBpbmZvLlxuICAgICAgcmV0dXJuIC9cXGJ1Y3dlYihbMC05Ll0rKT8vO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIC9cXGIoPzp1Y2Jyb3dzZXJ8dWMpXFxiLztcbiAgICB9XG4gIH1dLFxuICBbXCJjaHJvbWVcIiwgLyAoPzpjaHJvbWV8Y3Jpb3N8Y3JtbylcXC8oWzAtOS5dKykvXSxcbiAgLy8gQW5kcm9pZCDpu5jorqTmtY/op4jlmajjgILor6Xop4TliJnpnIDopoHlnKggc2FmYXJpIOS5i+WJjeOAglxuICBbXCJhbmRyb2lkXCIsIGZ1bmN0aW9uKHVhKXtcbiAgICBpZih1YS5pbmRleE9mKFwiYW5kcm9pZFwiKSA9PT0gLTEpeyByZXR1cm47IH1cbiAgICByZXR1cm4gL1xcYnZlcnNpb25cXC8oWzAtOS5dKyg/OiBiZXRhKT8pLztcbiAgfV0sXG4gIFtcImJsYWNrYmVycnlcIiwgZnVuY3Rpb24odWEpe1xuICAgIGNvbnN0IG0gPSB1YS5tYXRjaChyZV9ibGFja2JlcnJ5XzEwKSB8fFxuICAgICAgdWEubWF0Y2gocmVfYmxhY2tiZXJyeV82XzcpIHx8XG4gICAgICB1YS5tYXRjaChyZV9ibGFja2JlcnJ5XzRfNSk7XG4gICAgcmV0dXJuIG0gPyB7dmVyc2lvbjogbVsxXX0gOiBcImJsYWNrYmVycnlcIjtcbiAgfV0sXG4gIFtcInNhZmFyaVwiLCAvXFxidmVyc2lvblxcLyhbMC05Ll0rKD86IGJldGEpPykoPzogbW9iaWxlKD86XFwvW2EtejAtOV0rKT8pPyBzYWZhcmlcXC8vXSxcbiAgLy8g5aaC5p6c5LiN6IO96KKr6K+G5Yir5Li6IFNhZmFyae+8jOWImeeMnOa1i+aYryBXZWJWaWV344CCXG4gIFtcIndlYnZpZXdcIiwgL1xcYmNwdSg/OiBpcGhvbmUpPyBvcyAoPzpbMC05Ll9dKykuK1xcYmFwcGxld2Via2l0XFxiL10sXG4gIFtcImZpcmVmb3hcIiwgL1xcYmZpcmVmb3hcXC8oWzAtOS5hYl0rKS9dLFxuICBbXCJub2tpYVwiLCAvXFxibm9raWFicm93c2VyXFwvKFswLTkuXSspL10sXG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGV2aWNlOiBERVZJQ0VTLFxuICBvczogT1MsXG4gIGJyb3dzZXI6IEJST1dTRVIsXG4gIGVuZ2luZTogRU5HSU5FLFxuICByZV9tc2llOiByZV9tc2llLFxufTtcbiJdfQ==
