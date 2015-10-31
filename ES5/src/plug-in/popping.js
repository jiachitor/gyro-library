//弹出插件
// 说明：该款插件功能比较简单，只提供居中、定位、遮罩等功能，没有提供现实和关闭事件
//使用方法
/*
var popping1 = new popping({
     allchooseid  : "js-popping",       */
/*使用这个id是为了保证一个页面里只有一个弹出框显示,所有弹出框都放在这个id 里面*/
/*
     alldragclass  : "js-ui-dragboxs",  */
/*配合上面，需要唯一显示的弹出框都配置相同的class,用来控制唯一显示*/
/*
     displayusage  : "fixDrag",  */
/*“middleDrag”为剧中显示，“fixDrag”为定位显示*/
/*
     closeBtn : "js-store-dialog-close",  */
/*关闭按钮id*/
/*
     showshade : false,              //是否显示遮罩
     shadeName :"js-popup-shade",    //遮罩的id
     onresize : true,                 // 窗口大小变化时是否触发事件
     background : "#000",             //遮罩的背景颜色
     opacity : "0.7",                 //遮罩的透明度
     tanBox : "js-inventory-dialog",                  //通过id来选择弹出框
     showBtn : "js-store-selector",                //通过具体id 值来选择弹出事件触发对象
     fixDrag_X : 0,               //固定位置弹出时设置X轴 方向的偏移量
     fixDrag_Y : 25                //固定位置弹出时设置Y轴 方向的偏移量
 });
 */

/*用于点击页面隐藏弹出层*/
/*
 var tmpContextMenuOn = false;
 jQuery(document).ready(function(){
     jQuery("#js-inventory-dialog").hover(function(){
         tmpContextMenuOn = true;
     },function(){
         tmpContextMenuOn = false;
         }
     );
     jQuery(document).mousedown(function(){
         if(!tmpContextMenuOn){
            jQuery("#js-inventory-dialog").hide();
         }
     });
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

    // Pass this if window is not defined yet
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

    //curStyle是用来获取元素的最终样式表的，根据支持情况返回getComputedStyle(w3c)或currentStyle(ie)。
    function curStyle(elem) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
            return document.defaultView.getComputedStyle(elem, null); //这是w3c标准方法，取得元素的样式信息，因为有些样式是在外部css文件定义的，所以用elem.style是取不到的
        } else {
            return elem.currentStyle; //如果是ie,可以用 elem.currentStyle["name"]
        };
    };

    //获取元素指定样式属性的最终样式值的 . elem指元素，name指样式名称
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

    function getScrollTop(node) {
        var doc = node ? node.ownerDocument : document;
        return doc.documentElement.scrollTop || doc.body.scrollTop;
    };

    function getScrollLeft(node) {
        var doc = node ? node.ownerDocument : document;
        return doc.documentElement.scrollLeft || doc.body.scrollLeft;
    };

    //contains方法是判断参数1元素对象是否包含了参数2元素对象。
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

    function hasClass(elem, className) {
        return elem.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    };

    function addClass(elem, className) {
        if (!hasClass(elem, className)) elem.className += " " + className;
    }

    function removeClass(elem, className) {
        if (hasClass(elem, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            elem.className = elem.className.replace(reg, ' ');
        }
    }

    function toggleClass(elem, className) {
        hasClass(elem, className) ? removeClass(elem, className) : addClass(elem, className);
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



    var Popping = function(options) {
        //var args = Array.prototype.slice.call(arguments, 0, 3);
        this._initialize(options);
    }
    Popping.prototype = {
        _initialize: function(options) {
            var opt = this._setOptions(options);
            this.showshade = opt.showshade;

            this.allchooseid = opt.allchooseid || this;
            this.alldragclass = opt.alldragclass;
            this.displayusage = opt.displayusage;
            this.onresize = opt.onresize;
            this.tanBox = document.getElementById(opt.tanBox);
            this.eventtype = opt.eventtype;
            this.shadeName = opt.shadeName;
            this.fixDrag_X = opt.fixDrag_X;
            this.fixDrag_Y = opt.fixDrag_Y;

            this.background = opt.background;
            this.opacity = opt.opacity;
            this.showBtn = document.getElementById(opt.showBtn);
            this.closeBtn = document.getElementById(opt.closeBtn);

            // 用于点击其他区域隐藏弹出层
            this.tmpContextMenuOn = false;

            this.init();
        },
        //设置默认属性
        _setOptions: function(options) {
            this.options = { //默认值
                allchooseid: "J_popping",
                /*使用这个id是为了保证一个页面里只有一个弹出框显示,所有弹出框都放在这个id 里面*/
                alldragclass: "J-ui-dragBox",
                /*配合上面，需要唯一显示的弹出框都配置相同的class,用来控制唯一显示*/
                displayusage: "middleDrag",
                closeBtn: "J_dragClose", //关闭按钮id
                eventtype: "click", //触发事件类型
                showshade: false, //是否显示遮罩
                shadeName: "J_popup_zhezhao", //遮罩的id
                onresize: true, // 窗口大小变化时是否触发事件
                background: "#000", //遮罩的背景颜色
                opacity: "0.7", //遮罩的透明度
                tanBox: null, //通过id来选择弹出框
                showBtn: null, //通过具体id 值来选择弹出事件触发对象
                fixDrag_X: null, //固定位置弹出时设置X轴 方向的偏移量
                fixDrag_Y: null //固定位置弹出时设置Y轴 方向的偏移量
            };
            return extend(this.options, options || {});
        },
        init: function() {
            var self = this;
            if (self.showBtn) {
                addEventListener(self.showBtn, self.eventtype, function(e) {
                    self[self.displayusage]();
                });
            };
            addEventListener(self.closeBtn, self.eventtype, function(e) {
                self.shadeClose();
            });
        },
        /*显示遮罩*/
        shadeShow: function() {
            //创建遮罩层
            var theShadeDiv = document.getElementById(this.shadeName);
            if (theShadeDiv == null) {
                var newMask = document.createElement("div");
                newMask.id = this.shadeName;
                document.body.appendChild(newMask);
                var theShadeDiv = document.getElementById(this.shadeName);
            };
            this.zhezhao = theShadeDiv;
            setStyle(this.zhezhao, {
                display: "block",
                overflow: "hidden",
                width: "100%",
                height: "100%",
                border: 0,
                padding: 0,
                margin: 0,
                zIndex: 98,
                position: "absolute",
                top: 0,
                left: 0
            });
            var topScroll = document.documentElement.scrollTop + document.body.scrollTop; //为了解决chrome下的bug
            var leftScroll = document.documentElement.scrollLeft + document.body.scrollLeft;
            var height1 = document.documentElement.clientHeight + topScroll;
            var width1 = document.documentElement.clientWidth + leftScroll;
            if (document.documentElement.scrollHeight >= height1) {
                this.zhezhao.style.height = document.documentElement.scrollHeight + "px";
            } else {
                this.zhezhao.style.height = height1 + "px";
            };

            if (document.documentElement.scrollWidth >= width1) {
                this.zhezhao.style.width = document.documentElement.scrollWidth + "px";
            } else {
                this.zhezhao.style.width = width1 + "px";
            };

            this.zhezhao.style.background = this.background;
            this.zhezhao.style.opacity = this.opacity;
            this.zhezhao.style.filter = "Alpha(opacity=" + this.opacity * 100 + ")";

        },
        /*关闭弹出层*/
        shadeClose: function() {
            this.tanBox.style.display = "none";
            if (this.showshade) {
                this.zhezhao.style.display = "none";
            };
            if (this.showBtn) {
                toggleClass(this.showBtn, "ui-btnShow-avtive");
            };
        },
        //弹出层居中
        middleDrag: function() {
            var self = this;
            var pop_width = getStyle(this.tanBox, "width");
            var pop_height = getStyle(this.tanBox, "height");
            var topScroll = document.documentElement.scrollTop + document.body.scrollTop; //为了解决chrome下的bug
            var leftScroll = document.documentElement.scrollLeft + document.body.scrollLeft;
            var divtop = (document.documentElement.clientHeight - parseInt(pop_height)) / 2 + topScroll;
            var divleft = (document.documentElement.clientWidth - parseInt(pop_width)) / 2 + leftScroll;
            this.tanBox.style.top = divtop + "px";
            this.tanBox.style.left = divleft + "px";
            /*以下这里是为了保证一个页面里只有一个弹出框显示*/
            var Choose = document.getElementById(this.allchooseid);
            var drags = getElementsByClassName(Choose, '', this.alldragclass);
            var dragsshow = [];
            for (var i = 0, n = drags.length; i < n; i++) {
                if (drags[i].style.display == "block") {
                    dragsshow.push(drags[i]);
                };
            };
            if (dragsshow.length == 0) {
                this.tanBox.style.display = "block";
                if (this.showshade) this.shadeShow();
            } else if (dragsshow.length > 0) {
                return;
            };

            window.onresize = function() {
                if (self.tanBox.style.display == "block") {
                    self[self.displayusage]();
                };
                if (self.zhezhao.style.display == "block") {
                    if (self.showshade) self.shadeShow();
                };
            };
        },
        /*根据元素定位弹出框*/
        fixDrag: function() {
            var position = rect(this.showBtn);
            var boxwidth = parseInt(this.tanBox.style.width);
            this.tanBox.style.top = position.top + parseInt(this.fixDrag_Y) + "px";
            this.tanBox.style.left = position.left + parseInt(this.fixDrag_X) + "px";
            var Choose = document.getElementById(this.allchooseid);
            var drags = getElementsByClassName(Choose, '', this.alldragclass);
            var dragsshow = [];
            for (var i = 0, n = drags.length; i < n; i++) {
                if (drags[i].style.display == "block") {
                    dragsshow.push(drags[i]);
                }
            };
            if (dragsshow.length == 0) {
                this.tanBox.style.display = "block";
                toggleClass(this.showBtn, "ui-btnShow-avtive");
            } else if (dragsshow.length > 0) {
                return;
            };
            this.fixDragMouse();
        },
        fixDragMouse: function() {
            var self = this;
            mouseEnter(this.tanBox, function() {
                self.tmpContextMenuOn = true;
            });
            mouseLeave(this.tanBox, function() {
                self.tmpContextMenuOn = false;
            });
            document.onmousedown = function() {
                if (!self.tmpContextMenuOn && self.tanBox.style.display == "block") {
                    self.tanBox.style.display = "none";
                    toggleClass(self.showBtn, "ui-btnShow-avtive");
                }
            }
        }
    };

    if (typeof define === 'function' && define['amd'])
        define("Popping", [], function() {
            return Popping;
        });
    /* Global */
    else
        window['Popping'] = Popping;

}));