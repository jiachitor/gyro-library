/**
 *     __  ___
 *    /  |/  /___   _____ _____ ___   ____   ____ _ ___   _____
 *   / /|_/ // _ \ / ___// ___// _ \ / __ \ / __ `// _ \ / ___/
 *  / /  / //  __/(__  )(__  )/  __// / / // /_/ //  __// /
 * /_/  /_/ \___//____//____/ \___//_/ /_/ \__, / \___//_/
 *                                        /____/
 *
 * @description MessengerJS, a common cross-document communicate solution.
 * @author biqing kwok
 * @version 2.0
 * @license release under MIT license
 */

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

  // 消息前缀, 建议使用自己的项目名, 避免多项目之间的冲突
  var prefix = "arale-messenger",
    supportPostMessage = 'postMessage' in window;

  // Target 类, 消息对象
  function Target(target, name) {
    var errMsg = '';
    if (arguments.length < 2) {
      errMsg = 'target error - target and name are both required';
    } else if (typeof target != 'object') {
      errMsg = 'target error - target itself must be window object';
    } else if (typeof name != 'string') {
      errMsg = 'target error - target name must be string type';
    }
    if (errMsg) {
      throw new Error(errMsg);
    }
    this.target = target;
    this.name = name;
  }

  // 往 target 发送消息, 出于安全考虑, 发送消息会带上前缀
  if (supportPostMessage) {
    // IE8+ 以及现代浏览器支持
    Target.prototype.send = function(msg) {
      this.target.postMessage(prefix + msg, '*');
    };
  } else {
    // 兼容IE 6/7
    Target.prototype.send = function(msg) {
      var targetFunc = window.navigator[prefix + this.name];
      if (typeof targetFunc == 'function') {
        targetFunc(prefix + msg, window);
      } else {
        throw new Error("target callback function is not defined");
      }
    };
  }

  // 信使类
  // 创建Messenger实例时指定, 必须指定Messenger的名字, (可选)指定项目名, 以避免Mashup类应用中的冲突
  // !注意: 父子页面中projectName必须保持一致, 否则无法匹配
  function Messenger(messengerName, projectName) {
    this.targets = {};
    this.name = messengerName;
    this.listenFunc = [];
    prefix = projectName || prefix;
    this.initListen();
  }

  // 添加一个消息对象
  Messenger.prototype.addTarget = function(target, name) {
    var targetObj = new Target(target, name);
    this.targets[name] = targetObj;
  };

  // 初始化消息监听
  Messenger.prototype.initListen = function() {
    var self = this;
    var generalCallback = function(msg) {
      if (typeof msg == 'object' && msg.data) {
        msg = msg.data;
      }
      // 剥离消息前缀
      msg = msg.slice(prefix.length);
      for (var i = 0; i < self.listenFunc.length; i++) {
        self.listenFunc[i](msg);
      }
    };

    if (supportPostMessage) {
      if ('addEventListener' in document) {
        window.addEventListener('message', generalCallback, false);
      } else if ('attachEvent' in document) {
        window.attachEvent('onmessage', generalCallback);
      }
    } else {
      // 兼容IE 6/7
      window.navigator[prefix + this.name] = generalCallback;
    }
  };

  // 监听消息
  Messenger.prototype.listen = function(callback) {
    this.listenFunc.push(callback);
  };
  // 注销监听
  Messenger.prototype.clear = function() {
    this.listenFunc = [];
  };
  // 广播消息
  Messenger.prototype.send = function(msg) {
    var targets = this.targets,
      target;
    for (target in targets) {
      if (targets.hasOwnProperty(target)) {
        targets[target].send(msg);
      }
    }
  };

  if (typeof define === 'function' && define['amd'])
    define("Messenger", [], function() {
      return Messenger;
    });
  /* Global */
  else
    window['Messenger'] = Messenger;

}));