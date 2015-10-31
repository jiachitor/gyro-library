/*   "导航类\my-fixMenu\my-fixMenu.html"*/

//用法
/*
var fixMenu1=new FixMenu({
    root: "Js_module_fixMenu_box",
    menuclass:"Js_module_fixMenu_list",
    menusub:"js-ui-fixMenu-information",
    howtoshow:"four"
});
*/


/*导航类 my-fixMenu*/
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

    var animateID = {};

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

    function addClass(node, str) {
        if (!new RegExp("(^|\\s+)" + str).test(node.className)) {
            node.className = node.className + " " + str;
        };
    };

    function removeClass(node, str) {
        node.className = node.className.replace(new RegExp("(^|\\s+)" + str), "");
    };

    function setOpacity(elem, num) {
        console.log(num)
        if (elem.filters) {
            elem.style.filter = "alpha(opacity=" + num + ")";
        } else {
            elem.style.opacity = num / 100;
        };
    };

    /*设置元素的px值*/
    function setAnimateStyle(elem, value, attr, m) {
        elem.style[attr] = Math[m](value) + 'px';
    };

    /*动画执行函数*/
    function animate(elem, attr, value, time, type, funcBefore, funcAfter, ID) {
        var isOpacity = attr === 'opacity',
            diffValue = false;
        funcBefore && funcBefore.call();
        if (typeof value === 'string') {
            if (/^[+-]=\d+/.test(value)) value = value.replace('=', ''), diffValue = true;
            value = parseFloat(value);
        };
        var oriVal = parseInt(getStyle(elem, attr)), //原始属性值
            b = isNaN(oriVal) ? 0 : oriVal, //开始值,无值时为0
            c = diffValue ? value : value - b, //差值
            d = time, //总运行时间
            e = easing[type], //缓动类型
            m = c > 0 ? 'ceil' : 'floor', //取最大绝对值
            setProperty = isOpacity ? setOpacity : setAnimateStyle, //属性设置方法
            origTime = (new Date) * 1, //原始时间值
            iID = ID ? ID : "JCL"; //计数器id
        animateID[iID] && window.cancelAnimationFrame(animateID[iID]);

        function go() {
            var t = (new Date) - origTime; //已运行时间
            if (t <= d) {
                setProperty(elem, e(t, b, c, d), attr, m);
                animateID[iID] = window.requestAnimationFrame(go);
            } else {
                setProperty(elem, b + c, attr, m); //设置最终值
                window.cancelAnimationFrame(animateID[iID]);
                animateID[iID] = null;
                funcAfter && funcAfter.call();
            };
        };
        animateID[iID] = window.requestAnimationFrame(go);
    };

    /*根据给定的 iID 值，来停止相对应的动画*/
    function animateStop(iID) {
        window.cancelAnimationFrame(animateID[iID]);
    };

    /*动画扩展算法*/
    var easing = {
        linear: function(t, b, c, d) {
            return c * t / d + b;
        },
        quartIn: function(t, b, c, d) { /*easeIn*/
            return c * (t /= d) * t * t * t + b;
        },
        quartOut: function(t, b, c, d) { /*easeOut*/
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        quartInOut: function(t, b, c, d) { /*easeInOut*/
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        sineInOut: function(t, b, c, d) { /*swing*/
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
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
    /*使用方法如下*/

    /*关于mouseover和mouseout事件冒泡处理方法2---模拟mouseenter和mouseleave事件*/
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

    //目前还不能完美的实现mouseLeave，因为在鼠标离开浏览器时，由于无法获取子元素，导致该方法失效
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



    var FixMenu = function(options) {
        this._initialize(options);
    };

    FixMenu.prototype = {
        _initialize: function(options) {
            var opt = this._setOptions(options);

            this.root = document.getElementById(opt.root);
            this.menuclass = opt.menuclass;
            this.menusub = opt.menusub;
            this.howtoshow = opt.howtoshow;
            this.menu = getElementsByClassName(this.root, "", this.menuclass);
            this.container = getElementsByClassName(this.root, "", this.menusub);
            this.timerMenu = null;

            this.init();
        },
        _setOptions: function(options) {
            this.options = {
                root: null,
                menuclass: null,
                menusub: null,
                howtoshow: 'one'
            };
            return extend(this.options, options || {});
        },
        init: function() {
            var this_ = this;

            addEventListener(this.root, "mouseover", function() {
                this_.timerMenu = true;
            });

            if (Browser.chrome) { //只有chrome不支持mouseleave
                addEventListener(this.root, "mouseout", function(e) {
                    var e = window.event || e,
                        relatedTarget = e.toElement || e.relatedTarget;
                    while (relatedTarget && relatedTarget != this && !e) {
                        relatedTarget = relatedTarget.parentNode;
                        if (!relatedTarget) {
                            this_.timerMenu = false;
                        }
                    }
                });
            } else {
                addEventListener(this.root, "mouseleave", function() {
                    this_.timerMenu = false;
                });
            };

            this.menumouse();
        },
        menumouse: function() {
            var this_ = this;
            forEach(this.menu, function(o, i) {
                addEventListener(o, "mouseover", function(event) {
                    this_.showContainer(i);
                });

                if (Browser.chrome) {
                    mouseLeave(o, function() {
                        this_.hideContainer(i);
                    });
                } else {
                    addEventListener(o, "mouseleave", function(e) {
                        this_.hideContainer(i);
                    });
                }
            });
        },
        showContainer: function(i) {
            var this_ = this;
            animateStop("hide_" + i);
            clearTimeout(this_.onMenu);
            if (this_.timerMenu) {
                this_.onMenu = setTimeout(
                    function() {
                        addClass(this_.menu[i], "J_ui_menuhover");
                        var show = 'show_' + this_.howtoshow;
                        this_[show](i);
                    }, 200);
            }

        },
        hideContainer: function(i) {
            animateStop("show_" + i);
            removeClass(this.menu[i], "J_ui_menuhover");
            clearTimeout(this.onMenu);
            var hide = 'hide_' + this.howtoshow;
            this[hide](i);

        },
        show_one: function(i) {
            this.container[i].style.display = "block";
        },
        hide_one: function(i) {
            this.container[i].style.display = "none";
        },
        show_two: function(i) {
            animate(this.container[i], "top", "-170", "200", "linear", null, null, "show_" + i);
        },
        hide_two: function(i) {
            animate(this.container[i], "top", "0", "200", "linear", null, null, "hide_" + i);
        },
        show_three: function(i) {
            this.container[i].style.top = "-170px";
        },
        hide_three: function(i) {
            this.container[i].style.top = "0px";
        },
        show_four: function(i) {
            animate(this.container[i], "top", "-43", "200", "linear", null, null, "show_" + i);
        },
        hide_four: function(i) {
            animate(this.container[i], "top", "0", "200", "linear", null, null, "hide_" + i);
        }
    };

    if (typeof define === 'function' && define['amd'])
        define("FixMenu", [], function() {
            return FixMenu;
        });
    /* Global */
    else
        window['FixMenu'] = FixMenu;

}));