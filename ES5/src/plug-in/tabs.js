/*           "选项卡tab\tab组件_面向对象.html"*/
//用法
/*
var mayTab2 = new Tab({
    root: "mytab_2",
    currentClass: "ui-module-tab-active"
});
addEventListener(prev, "click",
    function () {
        mayTab2._prev();
    });

addEventListener(next, "click",
    function () {
        mayTab2._autoHandler();
    });
*/

/*tab 插件*/
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
        //对于apply和call两者在作用上是相同的，但两者在参数上有区别的。 
        //对于第一个参数意义都一样，但对第二个参数： apply传入的是一个参数数组，也就是将多个参数组合成为一个数组传入，而call则作为call的参数传入（从第二个参数开始）。 
        //如 func.call(func1,var1,var2,var3)对应的apply写法为：func.apply(func1,[var1,var2,var3])
        return function(event) {
            return fun.apply(object, [fixEvent(event)].concat(args)); //concat() 方法用于连接两个或多个数组。
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

    function addClass(node, str) {
        if (!new RegExp("(^|\\s+)" + str).test(node.className)) {
            node.className = node.className + " " + str;
        };
    };

    function removeClass(node, str) {
        node.className = node.className.replace(new RegExp("(^|\\s+)" + str), "");
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



    var Tab = function(options) {
        this._initialize(options);
    };
    Tab.prototype = {
        _initialize: function(options) {
            var opt = this._setOptions(options);

            this._root = opt.root;
            this._currentClass = opt.currentClass;
            this.trigger = opt.trigger || "click";
            this._handler = opt.handler;
            this.autoPlay = opt.autoPlay;
            this.playTime = opt.playTime || 3000;
            this.init();
        },
        _setOptions: function(options) {
            this.options = {
                root: null, //_root是我们自己命名的属相      this._root表示使用命名约定来模拟私有属性，_开头表示私有
                currentClass: "ui-tab-menu-active",
                trigger: "click",
                handler: null, //tab切换完成后的执行事件
                autoPlay: null, //var autoPlay表示私有属性
                playTime: 3000
            };
            return extend(this.options, options || {});
        },
        init: function() {
            var that = this; //将指针保存在变量中

            this._tabMenus = getElementsByClassName(this._root, 'li', "js-ui-tab-menu");
            this._tabContents = getElementsByClassName(this._root, 'div', "js-ui-tab-content");
            this.currentIndex = 0; // this.currentIndex表示公有属性

            if (this.autoPlay) {
                setInterval(function() {
                        that._autoHandler()
                    },
                    this.playTime);
            };

            forEach(this._tabMenus, function(o, index) {
                    addEventListener(o, this.trigger, bindAsEventListener(this, function(event) {
                        this.showItem(index);
                        this.currentIndex = index;
                    }));
                },
                this);
        },
        showItem: function(n) {
            forEach(this._tabContents, function(o, index) {
                    setStyle(o, {
                        "display": "none"
                    });
                },
                this);
            setStyle(this._tabContents[n], {
                "display": "block"
            });

            if (this._currentClass) {
                var currentMenu = getElementsByClassName(this._root, '', this._currentClass)[0];
                if (currentMenu) {
                    removeClass(currentMenu, this._currentClass);
                }
                addClass(this._tabMenus[n], this._currentClass);
            };

            if (this._handler) {
                this._handler(n);
            };
        },
        //原型的属性，方法用","分隔
        _autoHandler: function() {
            this.currentIndex++;
            if (this.currentIndex >= this._tabMenus.length) {
                this.currentIndex = 0;
            };
            this.showItem(this.currentIndex);
        }
    };

    if (typeof define === 'function' && define['amd'])
        define("Tab", [], function() {
            return Tab;
        });
    /* Global */
    else
        window['Tab'] = Tab;

}));