/* 手风琴插件                 "手风琴\SlideView 插件.html" */

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

    function addEvent(object, type, handler) {
        if (!handler.guid) handler.guid = jc++;
        if (!object.cusevents) object.cusevents = {};
        if (!object.cusevents[type]) object.cusevents[type] = {};
        object.cusevents[type][handler.guid] = handler;
    };


    function bindFunction(object, fun) {
        var args = Array.prototype.slice.call(arguments, 2);
        return function() {
            return fun.apply(object, args.concat(Array.prototype.slice.call(arguments)));
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

    function clearEvent(object) {
        if (!object.cusevents) return;
        for (var type in object.cusevents) {
            var handlers = object.cusevents[type];
            for (var i in handlers) {
                handlers[i] = null;
            };
            object.cusevents[type] = null;
        };
        object.cusevents = null;
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

    function map(object, callback, thisp) {
        var ret = [];
        each(object,
            function() {
                ret.push(callback.apply(thisp, arguments));
            });
        return ret;
    };

    function filter(object, callback, thisp) {
        var ret = [];
        each(object,
            function(item) {
                callback.apply(thisp, arguments) && ret.push(item);
            });
        return ret;
    };



    //通过设置滑动元素的位置坐标(left/right/top/bottom)，实现鼠标进入的目标元素滑动展示，其他元素滑动收缩的效果。
    //难点是如何控制多个滑动元素同时进行不同的滑动，这里关键就在于把整体滑动分解成各个滑动元素进行各自的滑动。
    //方法是给各个滑动元素设置目标值，然后各自向自己的目标值滑动，当全部都到达目标值就完成了

    var SlideView = function(container, options) {
        this._initialize(container, options);
        //在_initContainer方法中进行容器设置，由于后面滑动参数的计算要用到容器，所以要先设置容器
        this._initContainer();
        this._initNodes();
        this.reset(this.options.defaultIndex);
    };

    SlideView.prototype = {
        //初始化程序
        _initialize: function(container, options) {
            var container = this._container = document.getElementById(container); //容器对象
            this._timerDelay = null; //延迟计时器
            this._timerMove = null; //移动计时器
            this._time = 0; //时间
            this._index = 0; //索引
            var opt = this._setOptions(options);

            this.interval = opt.interval | 0;
            this.delay = opt.delay | 0;
            this.duration = opt.duration | 0;
            this.tween = opt.tween;
            this.autoClose = !!opt.autoClose;
            this.onShow = opt.onShow;
            this.onClose = opt.onClose;

            //设置参数
            //初始化程序中设置的_pos属性就是用来记录当前模式要使用的坐标样式的
            //然后在_setPos方法中使用_pos指定的坐标样式来设置坐标值
            //toLowerCase 方法 返回一个字符串，该字符串中的字母被转换为小写字母
            var pos = this._pos = /^(bottom|top|right|left)$/.test(opt.mode.toLowerCase()) ? RegExp.$1 : "left";
            this._horizontal = /right|left/.test(this._pos); //_horizontal属性就记录了是否水平方向滑动，即是否right或left
            this._reverse = /bottom|right/.test(this._pos); //_reverse属性，判断是否bottom或right模式

            //获取滑动元素,如果没有自定义nodes滑动元素，就从容器获取childNodes作为滑动元素
            var nodes = opt.nodes ?
                //如果没有自定义nodes滑动元素，就从容器获取childNodes作为滑动元素
                //用map是将返回的元素转换为数组nodes
                map(opt.nodes, function(n) {
                    return n;
                }) :
                filter(container.childNodes, function(n) {
                    return n.nodeType == 1; //还要用nodeType筛选一下，因为ie外的浏览器都会把空格作为childNodes的一部分，nodeType == 1表示对象是元素element，属性attr为2，文本text为3，注释comments为8	，文档document为9
                });
            //程序初始化时会根据滑动元素创建滑动对象集合，用获取的滑动元素生成程序所需要的_nodes滑动对象集合
            this._nodes = map(nodes, function(node) {
                var style = node.style;
                return {
                    "node": node, //滑动对象用"node"属性记录滑动元素
                    "style": style[pos],
                    "position": style.position,
                    "zIndex": style.zIndex
                };
            });

            //设置程序
            this._MOVE = bindFunction(this, this._move);

            var CLOSE = bindFunction(this, this.close);
            this._LEAVE = bindFunction(this, function() {
                clearTimeout(this._timerDelay);
                fireEvent(this, "leave");
                if (this.autoClose) {
                    this._timerDelay = setTimeout(CLOSE, this.delay);
                };
            });

            fireEvent(this, "init");
        },
        //设置默认属性
        _setOptions: function(options) {
            this.options = { //默认值
                nodes: null, //自定义展示元素集合
                mode: "left", //方向
                max: 0, //展示尺寸(像素或百分比)
                min: 0, //收缩尺寸(像素或百分比)
                delay: 100, //触发延时
                interval: 20, //滑动间隔
                duration: 20, //滑动持续时间
                defaultIndex: null, //默认展示索引
                autoClose: true, //是否自动恢复
                tween: function(t, b, c, d) {
                    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                }, //tween算子
                onShow: function(index) {}, //滑动展示时执行
                onClose: function() {} //滑动关闭执行
            };
            return extend(this.options, options || {});
        },
        //设置容器
        _initContainer: function() {
            //容器样式设置
            //先设置容器样式，要实现滑动需要设置容器相对或绝对定位，并且设置overflow为"hidden"来固定容器大小，而滑动元素也要设置绝对定位
            var container = this._container,
                style = container.style,
                position = getStyle(container, "position");
            this._style = {
                "position": style.position,
                "overflow": style.overflow
            }; //备份样式
            if (position != "relative" && position != "absolute") {
                style.position = "relative";
            };
            style.overflow = "hidden";
            //移出容器时
            addEventListener(container, "mouseleave", this._LEAVE);
            //设置滑动元素
            //根据_reverse重新设置zIndex
            var zIndex = 100,
                gradient = this._reverse ? -1 : 1;
            this._each(function(o) {
                var style = o.node.style;
                style.position = "absolute";
                style.zIndex = zIndex += gradient;
            });
            fireEvent(this, "initContainer");
        },
        //初始化滑动对象
        //每个滑动对象都有3个用来计算滑动目标值的属性：defaultTarget默认目标值，max展示尺寸，min收缩尺寸
        _initNodes: function() {
            var len = this._nodes.length,
                maxIndex = len - 1,
                type = this._horizontal ? "Width" : "Height",
                offset = "offset" + type,
                clientSize = this._container["client" + type],
                defaultSize = Math.round(clientSize / len),
                //计算默认目标值的函数
                //当_reverse为true时，由于定点位置是在索引的反方向，设置元素时也应该倒过来设的，所以要用maxIndex减一下
                getDefaultTarget = this._reverse ?
                function(i) {
                    return defaultSize * (maxIndex - i);
                } : function(i) {
                    return defaultSize * i;
                },
                max = this.options.max,
                min = this.options.min,
                getMax,
                getMin;

            //设置参数函数
            if (max > 0 || min > 0) { //自定义参数值
                //小数按百分比设置,其中clientSize是容器的可见区域尺寸，defaultSize是平均分配尺寸
                if (max > 0) {
                    //如果max是小数或1就按百分比计算，再把尺寸限制在defaultSize到clientSize的范围内,再计算减去max后其他收缩元素的平均尺寸，就可以得到min了
                    max = Math.max(max <= 1 ? max * clientSize : Math.min(max, clientSize), defaultSize);
                    min = (clientSize - max) / maxIndex;
                } else {
                    min = Math.min(min < 1 ? min * clientSize : min, defaultSize);
                    max = clientSize - maxIndex * min;
                };
                //自定义尺寸计算函数
                getMax = function() {
                    return max;
                };
                getMin = function() {
                    return min;
                };
            } else { //如果没有自定义max或min，根据元素尺寸设置参数值
                getMax = function(o) {
                    return Math.max(Math.min(o.node[offset], clientSize), defaultSize);
                };
                getMin = function(o) {
                    return (clientSize - o.max) / maxIndex;
                };
            };

            //得到尺寸计算函数后，再用_each方法历遍并设置滑动对象
            //其中current是当前坐标值，在移动计算时作为开始值的
            //而defaultTarget是默认目标值，即默认状态时移动的目标值，根据defaultSize和索引得到
            //传递当前滑动对象的索引，再加上延时设置
            //这里的o为this._nodes,在forEach中已经将对象传入回调函数中
            //i为this的索引值,注意这里的i在GLOBAL.Arrays.each方法中已经定义了，所以可以直接引用
            this._each(function(o, i) {
                //移入滑动元素时执行程序
                var node = o.node,
                    SHOW = bindFunction(this, this.show, i); //将i值传入this.show
                o.SHOWS = bindFunction(this, function() {
                    clearTimeout(this._timerDelay);
                    this._timerDelay = setTimeout(SHOW, this.delay);
                    fireEvent(this, "enter", i);
                });
                //设置当鼠标进入滑动元素时触发SHOWS展示函数
                addEventListener(node, "mouseenter", o.SHOWS);
                //计算尺寸
                o.current = o.defaultTarget = getDefaultTarget(i); //默认目标值
                o.max = getMax(o);
                o.min = getMin(o);
            });

            fireEvent(this, "initNodes");
        },
        //根据索引滑动展示
        show: function(index) {
            this._setMove(index | 0);
            this.onShow(this._index);
            this._easeMove();
        },
        //滑动到默认状态,默认在移出容器时就会执行,默认状态是指全部滑动元素位于defaultTarget默认目标值的状态
        close: function() {
            //先用_setMove设置移动参数，当_setMove没有索引参数时，就会设置目标值为默认目标值
            this._setMove();
            this.onClose();
            this._easeMove();
        },
        //重置为默认状态或展开索引对应滑动对象
        reset: function(index) {
            clearTimeout(this._timerDelay);
            if (index == undefined) {
                this._defaultMove();
            } else {
                this._setMove(index);
                this.onShow(this._index);
                this._targetMove();
            };
        },
        //设置滑动参数,并以索引作为参数，主要是设置计算移动值时需要的目标值、开始值和变化值
        _setMove: function(index) {
            //var setTarget = new Object();  //设置目标值函数
            if (index == undefined) { //设置默认状态目标值,当_setMove没有索引参数时，就会设置目标值为默认目标值
                var getTarget = function(o) {
                    return o.defaultTarget;
                };
            } else { //根据索引设置滑动目标值
                var nodes = this._nodes,
                    maxIndex = nodes.length - 1;
                //设置索引,先修正索引，错误的索引值会设置为0
                this._index = index = index < 0 || index > maxIndex ? 0 : index | 0;
                //设置展示参数
                var nodeShow = nodes[index],
                    min = nodeShow.min,
                    max = nodeShow.max;
                //如果滑动对象就是展示对象或者在展示对象前面，目标值就是min * i，因为第i+1个滑动对象的目标值就是i个min的大小。
                //否则，目标值就是min * ( i - 1 ) + max，其实就是把展示对象的位置换成max
                var getTarget = function(o, i) {
                    return i <= index ? min * i : min * (i - 1) + max;
                };
                //根据索引设置滑动目标值
                //不但滑动对象集合的索引要修正，展示对象的索引也要修正
                if (this._reverse) {
                    var get = getTarget;
                    index = maxIndex - index;
                    getTarget = function(o, i) {
                        return get(o, maxIndex - i);
                    };
                };
            };
            this._each(function(o, i) {
                o.target = getTarget(o, i); //设置目标值
                o.begin = o.current; //设置开始值
                o.change = o.target - o.begin; //设置变化值
            });
            fireEvent(this, "setMove", index);
        },
        //滑移程序
        _easeMove: function() {
            this._time = 0;
            this._move();
        },
        //移动程序
        _move: function() {
            //判断_time是否到达duration持续时间，没有到达的话，就继续移动
            if (this._time < this.duration) { //未到达
                this._tweenMove();
                this._time++;
                this._timerMove = setTimeout(this._MOVE, this.interval);
            } else { //完成
                //再执行一次_targetMove目标值移动函数,直接移动到目标值，可以防止可能出现的计算误差导致移位不准确
                this._targetMove(); //防止计算误差
                fireEvent(this, "finish");
            };
        },

        //tween移动函数
        _tweenMove: function() {
            this._setPos(function(o) {
                return this.tween(this._time, o.begin, o.change, this.duration);
            });
            fireEvent(this, "tweenMove");
        },
        //目标值移动函数
        _targetMove: function() {
            this._setPos(function(o) {
                return o.target;
            });
            fireEvent(this, "targetMove");
        },
        //默认值移动函数
        _defaultMove: function() {
            this._setPos(function(o) {
                return o.defaultTarget;
            });
            fireEvent(this, "defaultMove");
        },
        //设置坐标值
        _setPos: function(method) {
            clearTimeout(this._timerMove);
            var pos = this._pos;
            this._each(function(o, i) {
                o.node.style[pos] = (o.current = Math.round(method.call(this, o))) + "px";
            });
        },
        //历遍滑动对象集合
        _each: function(callback) {
            forEach(this._nodes, callback, this); //将this指针传入回调函数
        },
        //销毁程序
        dispose: function() {
            clearTimeout(this._timerDelay);
            clearTimeout(this._timerMove);
            fireEvent(this, "dispose");
            var pos = this._pos;
            this._each(function(o) {
                var style = o.node.style;
                style[pos] = o.style;
                style.zIndex = o.zIndex;
                style.position = o.position; //恢复样式
                removeEventListener(o.node, "mouseenter", o.SHOWS);
                o.SHOWS = o.node = null;
            });
            removeEventListener(this._container, "mouseleave", this._LEAVE);
            setStyle(this._container, this._style);
            this._container = this._nodes = this._MOVE = this._LEAVE = null;
            clearEvent(this);
        }
    };

    //自动展示扩展
    SlideView.prototype._initialize = (function() {
        var init = SlideView.prototype._initialize,
            reset = SlideView.prototype.reset, //重写reset
            methods = {
                "init": function() {
                    this.autoDelay = this.options.autoDelay | 0;

                    this._autoTimer = null; //定时器
                    this._autoPause = false; //暂停自动展示
                    //展示下一个滑动对象
                    this._NEXT = bindFunction(this, function() {
                        this.show(this._index + 1);
                    });
                },
                "leave": function() {
                    this.autoClose = this._autoPause = false;
                    this._autoNext();
                },
                "enter": function() {
                    clearTimeout(this._autoTimer);
                    this._autoPause = true;
                },
                "finish": function() {
                    this._autoNext();
                },
                "dispose": function() {
                    clearTimeout(this._autoTimer);
                }
            },
            prototype = {
                _autoNext: function() {
                    if (!this._autoPause) {
                        clearTimeout(this._autoTimer);
                        this._autoTimer = setTimeout(this._NEXT, this.autoDelay);
                    }
                },
                //重写reset,重写后的reset会强制设置索引来展示，并执行_autoNext进行下一次滑动
                reset: function(index) {
                    reset.call(this, index == undefined ? this._index : index);
                    this._autoNext();
                }
            };
        return function() {
            var options = arguments[1]; //这里的1 对应的是SlideView参数里对应的options的索引值
            //options.auto为真时，表明可以应用扩展功能
            if (options && options.auto) {
                //扩展options属性
                extend(options, {
                        autoDelay: 5000 //展示时间
                    },
                    false);
                //添加扩展方法,注意不能添加到SlideView.prototype，这样会影响到SlideView的结构
                extend(this, prototype);
                //扩展钩子
                forEach(methods, function(method, name) {
                        addEvent(this, name, method);
                    },
                    this);
            }
            init.apply(this, arguments);
        }
    })();

    //提示信息扩展
    SlideView.prototype._initialize = (function() {
        var init = SlideView.prototype._initialize,
            methods = {
                "init": function() {
                    //坐标样式
                    this._tipPos = /^(bottom|top|right|left)$/.test(this.options.tipPos.toLowerCase()) ? RegExp.$1 : "bottom";
                },
                "initNodes": function() {
                    var opt = this.options,
                        tipTag = opt.tipTag,
                        tipClass = opt.tipClass,
                        re = tipClass && new RegExp("(^|\\s)" + tipClass + "(\\s|$)"),
                        getTipNode = function(node) {
                            var nodes = node.getElementsByTagName(tipTag);
                            if (tipClass) {
                                nodes = filter(nodes,
                                    function(n) {
                                        return re.test(n.className);
                                    });
                            }
                            return nodes[0];
                        };
                    //设置提示对象
                    var tipShow = opt.tipShow,
                        tipClose = opt.tipClose,
                        offset = /right|left/.test(this._tipPos) ? "offsetWidth" : "offsetHeight";
                    this._each(function(o) {
                        var node = o.node,
                            tipNode = getTipNode(node);
                        node.style.overflow = "hidden";
                        tipNode.style.position = "absolute";
                        //创建提示对象
                        o.tip = {
                            "node": tipNode,
                            "show": tipShow != undefined ? tipShow : 0,
                            "close": tipClose != undefined ? tipClose : -tipNode[offset]
                        };
                    });
                },
                "setMove": function(index) {
                    var maxIndex = this._nodes.length - 1;
                    this._each(function(o, i) {
                        var tip = o.tip;
                        if (this._reverse) {
                            i = maxIndex - i;
                        }
                        tip.target = index == undefined || index != i ? tip.close : tip.show;
                        tip.begin = tip.current;
                        tip.change = tip.target - tip.begin;
                    });
                },
                "tweenMove": function() {
                    this._setTipPos(function(tip) {
                        return this.tween(this._time, tip.begin, tip.change, this.duration);
                    });
                },
                "targetMove": function() {
                    this._setTipPos(function(tip) {
                        return tip.target;
                    });
                },
                "defaultMove": function() {
                    this._setTipPos(function(tip) {
                        return tip.close;
                    });
                },
                "dispose": function() {
                    this._each(function(o) {
                        o.tip = null;
                    });
                }
            },
            prototype = {
                //设置坐标值函数
                _setTipPos: function(method) {
                    var pos = this._tipPos;
                    this._each(function(o, i) {
                        var tip = o.tip;
                        tip.node.style[pos] = (tip.current = Math.round(method.call(this, tip))) + "px";
                    });
                }
            };
        return function() {
            var options = arguments[1];
            if (options && options.tip == true) {
                //扩展options
                extend(options, {
                        tipPos: "bottom", //提示位置
                        tipTag: "*", //提示元素标签
                        tipClass: "", //提示元素样式
                        tipShow: null, //展示时目标坐标
                        tipClose: null //关闭时目标坐标
                    },
                    false);
                //扩展属性
                extend(this, prototype);
                //扩展钩子
                forEach(methods, function(method, name) {
                        addEvent(this, name, method);
                    },
                    this);
            }
            init.apply(this, arguments);
        }
    })();


    if (typeof define === 'function' && define['amd'])
        define("SlideView", [], function() {
            return SlideView;
        });
    /* Global */
    else
        window['SlideView'] = SlideView;

}));