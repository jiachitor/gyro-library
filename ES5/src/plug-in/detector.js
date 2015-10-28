(function (global) {
  "use strict";

  const userAgent = navigator.userAgent || "",
    platform = navigator.platform || "",
    appVersion = navigator.appVersion || "",
    vendor = navigator.vendor || "",
    ua = userAgent + " " + appVersion + " " + vendor;

  const NA_VERSION = "-1",
    NA = {
      name: "na",
      version: NA_VERSION,
    };

  // 验证规则
  const re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;
  // 操作系统信息识别表达式
  const OS = [
    ["wp", function(ua) {
      if (ua.indexOf("windows phone ") !== -1) {
        return /\bwindows phone (?:os )?([0-9.]+)/;
      } else if (ua.indexOf("xblwp") !== -1) {
        return /\bxblwp([0-9.]+)/;
      } else if (ua.indexOf("zunewp") !== -1) {
        return /\bzunewp([0-9.]+)/;
      }
      return "windows phone";
    }],
    ["windows", /\bwindows nt ([0-9.]+)/],
    ["macosx", /\bmac os x ([0-9._]+)/],
    ["ios", function(ua) {
      if (/\bcpu(?: iphone)? os /.test(ua)) {
        return /\bcpu(?: iphone)? os ([0-9._]+)/;
      } else if (ua.indexOf("iph os ") !== -1) {
        return /\biph os ([0-9_]+)/;
      } else {
        return /\bios\b/;
      }
    }],
    ["android", function(ua) {
      if (ua.indexOf("android") >= 0) {
        return /\bandroid[ \/-]?([0-9.x]+)?/;
      } else if (ua.indexOf("adr") >= 0) {
        if (ua.indexOf("mqqbrowser") >= 0) {
          return /\badr[ ]\(linux; u; ([0-9.]+)?/;
        } else {
          return /\badr(?:[ ]([0-9.]+))?/;
        }
      }
      return "android";
      //return /\b(?:android|\badr)(?:[\/\- ](?:\(linux; u; )?)?([0-9.x]+)?/;
    }],
    ["chromeos", /\bcros i686 ([0-9.]+)/],
    ["linux", "linux"],
    ["windowsce", /\bwindows ce(?: ([0-9.]+))?/],
  ];

  const BROWSER = [
    // Microsoft Edge Browser, Default browser in Windows 10.
    ["edge", /edge\/([0-9.]+)/],
    // 360SE, 360EE.
    ["360", function(ua) {
      const x = checkTW360External("360se");
      if (typeof x !== "undefined") {
        return x;
      }
      if (ua.indexOf("360 aphone browser") !== -1) {
        return /\b360 aphone browser \(([^\)]+)\)/;
      }
      return /\b360(?:se|ee|chrome|browser)\b/;
    }],
    ["ie", re_msie],
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
    ["uc", function(ua) {
      if (ua.indexOf("ucbrowser/") >= 0) {
        return /\bucbrowser\/([0-9.]+)/;
      } else if (ua.indexOf("ubrowser/") >= 0) {
        return /\bubrowser\/([0-9.]+)/;
      } else if (/\buc\/[0-9]/.test(ua)) {
        return /\buc\/([0-9.]+)/;
      } else if (ua.indexOf("ucweb") >= 0) {
        // `ucweb/2.0` is compony info.
        // `UCWEB8.7.2.214/145/800` is browser info.
        return /\bucweb([0-9.]+)?/;
      } else {
        return /\b(?:ucbrowser|uc)\b/;
      }
    }],
    ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
    // Android 默认浏览器。该规则需要在 safari 之前。
    ["android", function(ua) {
      if (ua.indexOf("android") === -1) {
        return;
      }
      return /\bversion\/([0-9.]+(?: beta)?)/;
    }],
    ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
    // 如果不能被识别为 Safari，则猜测是 WebView。
    ["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/],
    ["firefox", /\bfirefox\/([0-9.ab]+)/],
  ];

  function typeOf(type) {
    return function(object) {
      return Object.prototype.toString.call(object) === "[object " + type + "]";
    };
  }

  const isString = typeOf("String");
  const isRegExp = typeOf("RegExp");
  const isObject = typeOf("Object");
  const isFunction = typeOf("Function");

  function each(object, factory) {
    for (let i = 0, l = object.length; i < l; i++) {
      if (factory.call(object, object[i], i) === false) {
        break;
      }
    }
  }

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
      const runpath = external.twGetRunPath.toLowerCase();
      // 360SE 3.x ~ 5.x support.
      // 暴露的 external.twGetVersion 和 external.twGetSecurityID 均为 undefined。
      // 因此只能用 try/catch 而无法使用特性判断。
      const security = external.twGetSecurityID(win);
      const version = external.twGetVersion(security);

      if (runpath && runpath.indexOf(key) === -1) {
        return false;
      }
      if (version) {
        return {
          version: version
        };
      }
    } catch (ex) { /* */ }
  }

  // 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
  // @param {String} ua, userAgent string.
  // @return {Object}
  function IEMode(ua) {
    if (!re_msie.test(ua)) {
      return null;
    }

    let m;
    let engineMode;
    let engineVersion;
    let browserMode;
    let browserVersion;

    // IE8 及其以上提供有 Trident 信息，
    // 默认的兼容模式，UA 中 Trident 版本不发生变化。
    if (ua.indexOf("trident/") !== -1) {
      m = /\btrident\/([0-9.]+)/.exec(ua);
      if (m && m.length >= 2) {
        // 真实引擎版本。
        engineVersion = m[1];
        const v_version = m[1].split(".");
        v_version[0] = parseInt(v_version[0], 10) + 4;
        browserVersion = v_version.join(".");
      }
    }

    m = re_msie.exec(ua);
    browserMode = m[1];
    const v_mode = m[1].split(".");
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
      compatible: engineVersion !== engineMode,
    };
  }

  // UserAgent Detector.
  // @param {String} ua, userAgent.
  // @param {Object} expression
  // @return {Object}
  //    返回 null 表示当前表达式未匹配成功。
  function detect(name, expression, ua) {
    const expr = isFunction(expression) ? expression.call(null, ua) : expression;
    if (!expr) {
      return null;
    }
    const info = {
      name: name,
      version: NA_VERSION,
      codename: "",
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
      const m = expr.exec(ua);
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
    let detected = NA;
    each(patterns, function(pattern) {
      const d = detect(pattern[0], pattern[1], ua);
      if (d) {
        detected = d;
        return false;
      }
    });
    factory.call(detector, detected.name, detected.version);
  }

  // 解析 UserAgent 字符串
  // @param {String} ua, userAgent string.
  // @return {Object}
  function parse(ua) {
    ua = (ua || "").toLowerCase();
    const d = {};

    init(ua, OS, function(name, version) {
      const v = parseFloat(version);
      d.os = {
        name: name,
        version: v,
        fullVersion: version,
      };
      d.os[name] = v;
    }, d);

    const ieCore = IEMode(ua);

    init(ua, BROWSER, function(name, version) {
      let mode = version;
      // IE 内核的浏览器，修复浏览器版本及兼容模式。
      if (ieCore) {
        // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
        if (name === "ie") {
          version = ieCore.browserVersion;
        }
        mode = ieCore.browserMode;
      }
      const v = parseFloat(version);
      d.browser = {
        name: name,
        version: v,
        fullVersion: version,
        mode: parseFloat(mode),
        fullMode: mode,
        compatible: ieCore ? ieCore.compatible : false,
      };
      d.browser[name] = v;
    }, d);
    return d;
  }

  const Detector = parse(ua);
  Detector.parse = parse;

  /* CommonJS */
  if (typeof require === 'function' && typeof module === 'object' && module && typeof exports === 'object' && exports)
    module.exports = Detector;
  /* AMD */
  else if (typeof define === 'function' && define['amd'])
    define(function() {
      return Detector;
    });
  /* Global */
  else {
    global['Detector'] = global['Detector'] || Detector;
  }

})(this || window);