/*           "弹出与拖拽\#drag拖动插件修改版.html"*/
//用法
/*
var mydrag1 = new Drag("J_gamelist", {
    mxContainer: "J_popping",
    Handle: "J_dragTitle1",
    Limit: true,
    View:true  //限制在可视区域移动
});
*/


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

}(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    "use strict";

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

    function curStyle(elem) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
            return document.defaultView.getComputedStyle(elem, null); //这是w3c标准方法，取得元素的样式信息，因为有些样式是在外部css文件定义的，所以用elem.style是取不到的
        } else {
            return elem.currentStyle; //如果是ie,可以用 elem.currentStyle["name"]
        };
    };

    function getScrollTop(node) {
        var doc = node ? node.ownerDocument : document;
        return doc.documentElement.scrollTop || doc.body.scrollTop;
    };

    function getScrollLeft(node) {
        var doc = node ? node.ownerDocument : document;
        return doc.documentElement.scrollLeft || doc.body.scrollLeft;
    };

    //rect是相对浏览器文档的位置
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

    //拖放程序
    var Drag = function(obj, options) {
        this._initialize.apply(this, arguments);
    };

    Drag.prototype = {
        //拖放对象
        _initialize: function(obj, options) {
            typeof(obj) == "object" ? this.Drag = obj: this.Drag = document.getElementById(obj); //拖放对象
            this._x = this._y = 0; //记录鼠标相对拖放对象的位置
            this._marginLeft = this._marginTop = 0; //记录margin
            //事件对象(用于绑定可移除事件)
            this._fM = bindAsEventListener(this, this._Move);
            this._fS = bindFunction(this, this._Stop);

            this._SetOptions(options);

            this.Limit = !!this.options.Limit;
            this.View = this.options.View;
            this.mxLeft = parseInt(this.options.mxLeft);
            this.mxRight = parseInt(this.options.mxRight);
            this.mxTop = parseInt(this.options.mxTop);
            this.mxBottom = parseInt(this.options.mxBottom);

            this.LockX = !!this.options.LockX;
            this.LockY = !!this.options.LockY;
            this.Lock = !!this.options.Lock;

            this.onStart = this.options.onStart;
            this.onMove = this.options.onMove;
            this.onStop = this.options.onStop;

            this._Handle = document.getElementById(this.options.Handle) || this.Drag;
            this._mxContainer = document.getElementById(this.options.mxContainer) || null;

            //拖放对象的position必须是absolute绝对定位
            this.Drag.style.position = "absolute";
            //透明,能保证触发点直接在body或非背景上也可以
            if (Browser.ie && !!this.options.Transparent) {
                //填充拖放对象
                //当你有一个对象的多个属性或者方法需要操作时，就可以使用with,用于简化 代码 操作
                // with(.style) {
                //     width = height = "100%";
                //     backgroundColor = "#fff";
                //     filter = "alpha(opacity:0)";
                //     fontSize = 0; //不要忘了设置fontSize，否则就有一个默认最小高度。
                // }
                this._Handle.appendChild(document.createElement("div"));

                setStyle(this._Handle, {
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#fff",
                    filter: "alpha(opacity:0)",
                    fontSize: 0 //不要忘了设置fontSize，否则就有一个默认最小高度。
                });
            };
            //修正范围
            //注意如果在程序执行之前设置过拖放对象的left和top而容器没有设置relative，在自动设置relative时会发生移位现象，所以程序在初始化时就执行一次Repair程序防止这种情况。因为offsetLeft和offsetTop要在设置relative之前获取才能正确获取值，所以在Start程序中Repair要在设置_x和_y之前执行
            this._Repair();
            addEventListener(this._Handle, "mousedown", bindAsEventListener(this, this._Start));
        },
        //设置默认属性
        _SetOptions: function(options) {
            this.options = { //默认值
                Handle: "", //设置触发对象（不设置则使用拖放对象）
                mxContainer: "", //指定限制在容器内
                Limit: false, //是否设置范围限制(为true时下面参数有用,可以是负数)
                mxLeft: 0, //左边限制
                mxRight: 9999, //右边限制
                mxTop: 0, //上边限制
                mxBottom: 9999, //下边限制
                LockX: false, //是否锁定水平方向拖放
                LockY: false, //是否锁定垂直方向拖放
                Lock: false, //是否锁定
                Transparent: false, //是否透明
                onStart: function() {}, //开始移动时执行
                onMove: function() {}, //移动时执行
                onStop: function() {} //结束移动时执行
            };
            extend(this.options, options || {});
        },
        //准备拖动
        _Start: function(oEvent) {
            if (this.Lock) {
                return;
            };
            this._Repair();
            //记录鼠标相对拖放对象的位置
            this._x = oEvent.clientX - this.Drag.offsetLeft;
            this._y = oEvent.clientY - this.Drag.offsetTop;
            //记录margin
            this._marginLeft = parseInt(curStyle(this.Drag).marginLeft) || 0;
            this._marginTop = parseInt(curStyle(this.Drag).marginTop) || 0;
            //mousemove时移动 mouseup时停止
            //把_fM拖动程序和_fS停止拖动程序分别绑定到document的mousemove和mouseup事件
            //注意要绑定到document才可以保证事件在整个窗口文档中都有效，如果只绑定到拖放对象就很容易出现拖太快就脱节的现象
            addEventListener(document, "mousemove", this._fM);
            addEventListener(document, "mouseup", this._fS);
            //即使鼠标移动到浏览器外面，拖放程序依然能够执行，仔细查看后发现是用了setCapture
            if (Browser.ie) {
                //焦点丢失
                addEventListener(this._Handle, "losecapture", this._fS);
                //设置鼠标捕获。即使鼠标移动到浏览器外面，拖放程序依然能够执行
                this._Handle.setCapture();
            } else {
                //焦点丢失
                addEventListener(window, "blur", this._fS);
                //阻止默认动作
                oEvent.preventDefault();
            };
            //附加程序
            this.onStart();
        },
        //修正范围
        //如果范围设置不正确，可能导致上下或左右同时超过范围的情况，程序中有一个Repair程序用来修正范围参数
        _Repair: function() {
            if (this.Limit) {
                //修正错误范围参数
                //对于左边上边要取更大的值，对于右边下面就要取更小的值
                this.mxRight = Math.max(this.mxRight, this.mxLeft + this.Drag.offsetWidth);
                this.mxBottom = Math.max(this.mxBottom, this.mxTop + this.Drag.offsetHeight);
                //如果有容器必须设置position为relative或absolute来相对或绝对定位，并在获取offset之前设置
                //当设置了容器，在Repair程序如果容器的position不是relative或absolute，会自动把position设为relative来相对定位
                if (!this.options.View) {
                    !this._mxContainer || curStyle(this._mxContainer).position == "relative" || curStyle(this._mxContainer).position == "absolute" || (this._mxContainer.style.position = "relative");
                }
            }
        },
        //可视范围拖动
        _Visible: function() {
            var topScroll = document.documentElement.scrollTop + document.body.scrollTop;
            var leftScroll = document.documentElement.scrollLeft + document.body.scrollLeft;
            this.mxLeft = Math.max(leftScroll, 0);
            this.mxRight = document.documentElement.clientWidth + leftScroll;
            this.mxTop = Math.max(topScroll, 0);
            this.mxBottom = document.documentElement.clientHeight + topScroll;
        },
        //拖动
        _Move: function(oEvent) {
            //判断是否锁定,完全锁定就直接返回
            if (this.Lock) {
                this._Stop();
                return;
            };
            //清除选择
            //好的方法清除选择，不但不影响拖放对象的选择效果，还能对整个文档进行清除
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            //设置移动参数
            //通过现在鼠标的坐标值跟开始拖动时鼠标相对的坐标值的差就可以得到拖放对象应该设置的left和top了
            var iLeft = oEvent.clientX - this._x,
                iTop = oEvent.clientY - this._y;
            //设置范围限制
            this._SetPos(iLeft, iTop);
        },
        //设置范围限制
        _SetPos: function(iLeft, iTop) {
            if (this.Limit) {
                //设置范围参数
                //容器范围限制就是指定上下左右的拖放范围。
                //各个属性的意思是：
                //上(mxTop)：top限制；
                //下(mxBottom)：top+offsetHeight限制；
                //左(mxLeft)：left限制；
                //右(mxRight)：left+offsetWidth限制
                var rectContainer = rect(this._mxContainer);
                var mxLeft = this.mxLeft,
                    mxRight = this.mxRight,
                    mxTop = this.mxTop,
                    mxBottom = this.mxBottom;
                    //如果设置了容器，再修正范围参数
                if (this.View) { //限制在可视区域移动
                    this._Visible();
                } else if (!!this._mxContainer) {
                    //对于左边上边要取更大的值，对于右边下面就要取更小的值
                    //由于是相对定位，对于容器范围来说范围参数上下左右的值分别是0、clientHeight、0、clientWidth。 clientWidth和clientHeight是容器可视部分的宽度和高度
                    console.log(mxRight)
                    mxLeft = Math.max(mxLeft, rectContainer.left);
                    mxTop = Math.max(mxTop, rectContainer.top);
                    mxRight = Math.min(mxRight, rectContainer.right);
                    mxBottom = Math.min(mxBottom, rectContainer.bottom);
                };
                //修正移动参数,这里可以限制在一定范围里拖动
                iLeft = Math.max(Math.min(iLeft, mxRight - this.Drag.offsetWidth), mxLeft);
                iTop = Math.max(Math.min(iTop, mxBottom - this.Drag.offsetHeight), mxTop);
            }
            //设置位置，并修正margin
            //水平和垂直方向的锁定只要在Move判断是否锁定再设置left和top就行
            if (!this.LockX) {
                this.Drag.style.left = iLeft - this._marginLeft + "px";
            }
            if (!this.LockY) {
                this.Drag.style.top = iTop - this._marginTop + "px";
            }
            //附加程序
            this.onMove();
        },
        //停止拖动
        _Stop: function() {
            //移除事件
            removeEventListener(document, "mousemove", this._fM);
            removeEventListener(document, "mouseup", this._fS);
            if (Browser.ie) {
                removeEventListener(this._Handle, "losecapture", this._fS);
                this._Handle.releaseCapture();
            } else {
                removeEventListener(window, "blur", this._fS);
            };
            //附加程序
            this.onStop();
        }
    };

    if (typeof define === 'function' && define['amd'])
        define("Drag", [], function() {
            return Drag;
        });
    /* Global */
    else
        window['Drag'] = Drag;

}));