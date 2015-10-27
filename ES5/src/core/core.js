/*获取浏览器信息*/
Browser = (function(ua) {
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

//统一帧管理、提供监听帧的API，即requestAnimationFrame,由于高性能的动画
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // name has changed in Webkit
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    };
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    };
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    };
}());
/* 使用方法
var myReq = window.requestAnimationFrame(step);   //生成动画
window.cancelAnimationFrame(myReq);        //取消动画
*/

var jc = 1,
    animateID = {};

var GLOBAL = GLOBAL || {};

//定义命名空间函数
GLOBAL.namespace = function(str) {
    var arr = str.split("."),
        i,
        o = GLOBAL;
    for (i = (arr[0] == "GLOBAL") ? 1 : 0; i < arr.length; i++) {
        o[arr[i]] = o[arr[i]] || {};
        o = o[arr[i]];
    };
};


//object相关---1------------------------------------------------------------------------------------------------------
GLOBAL.namespace("Objects");

/*用于对象的继承*/
GLOBAL.Objects.wrapper = function(childelem, parent) {
    var ins = function() {
        childelem.apply(this, arguments);
    };
    var subclass = function() {};
    subclass.prototype = parent.prototype;
    ins.prototype = new subclass;
    return ins;
};

//用来扩展对象，是用得最久的方法之一了
GLOBAL.Objects.extend = function(destination, source, override) {
    if (override === undefined) override = true;
    for (var property in source) {
        if (override || !(property in destination)) {
            destination[property] = source[property];
        };
    };
    return destination;
};
/*
 GLOBAL.Objects.extend( this.options, options || {} );
 */

//深度扩展，这里的深度跟深度复制里面的意思差不多，参考的是jQuery的extend，继承里包含对象时就需要使用深度继承
GLOBAL.Objects.deepextend = function(destination, source) {
    for (var property in source) {
        var copy = source[property];
        if (destination === copy) continue;
        if (typeof copy === "object") {
            destination[property] = arguments.callee(destination[property] || {},
                copy);
        } else {
            destination[property] = copy;
        };
    };
    return destination;
};
/*
 var menu =GLOBAL.Objects.deepextend( GLOBAL.Objects.deepextend( {}, options ), o || {} );
 */


//给对象绑定一个方法，this不变,是用来给function绑定this,其中args为后续传入的参数数组
GLOBAL.Objects.BindFunction = function(object, fun) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function() {
        return fun.apply(object, args.concat(Array.prototype.slice.call(arguments)));
    };
};

//扩展程序使用钩子时使用
GLOBAL.Objects.addEvent = function(object, type, handler) {
    if (!handler.guid) handler.guid = jc++;
    if (!object.cusevents) object.cusevents = {};
    if (!object.cusevents[type]) object.cusevents[type] = {};
    object.cusevents[type][handler.guid] = handler;
};

GLOBAL.Objects.removeEvent = function(object, type, handler) {
    if (object.cusevents && object.cusevents[type]) {
        delete object.cusevents[type][handler.guid];
    };
};

//用于手动触发事件,主要用途是给程序添加钩子（hook），能同时添加多个程序
GLOBAL.Objects.fireEvent = function(object, type) {
    if (!object.cusevents) return;
    var args = Array.prototype.slice.call(arguments, 2),
        handlers = object.cusevents[type];
    for (var i in handlers) {
        handlers[i].apply(object, args);
    };
};

GLOBAL.Objects.clearEvent = function(object) {
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

/*Objects扩展方法——*/
//给对象绑定一个方法，带Event，this不变,bindAsEventListener跟BindFunction不同的是会把第一个参数设定为event对象，专门用在事件回调函数中
//解释 ：Array.prototype.slice这句就是访问Array的内置方法 ,slice() 方法可从已有的数组中返回选定的元素。该句是要调用的是 arguments 的slice 方法，就是因为 arguments 不是真的组数，它没有slice这个方法，通过这么Array.prototype.slice.call调用，JS的内部机制应该是 把arguments对象转化为Array ，因为Array.prototype.slice.call调用后，返回的是一个组数。此时的arguments数组就如[this, this._Start, fun],那么args就为fun
GLOBAL.Objects.BindAsEventListener = function(object, fun) {
    var args = Array.prototype.slice.call(arguments).slice(2);
    //对于apply和call两者在作用上是相同的，但两者在参数上有区别的。 对于第一个参数意义都一样，但对第二个参数： apply传入的是一个参数数组，也就是将多个参数组合成为一个数组传入，而call则作为call的参数传入（从第二个参数开始）。 如 func.call(func1,var1,var2,var3)对应的apply写法为：func.apply(func1,[var1,var2,var3])
    return function(event) {
        return fun.apply(object, [GLOBAL.Event.fixEvent(event)].concat(args)); //concat() 方法用于连接两个或多个数组。
    };
};
/* 用法
GLOBAL.Arrays.forEach(aa,function(o, index) {
        GLOBAL.Event.addEventListener(o, "click", GLOBAL.Objects.BindAsEventListener(this,function(event) {
            event.stopPropagation;
            J_servers_name.value=o.title;
            serversShow3.shadeClose();
        }));
    },
    this);
*/


//DOM 相关----2-----------------------------------------------------------------------------------------------------------
GLOBAL.namespace("Dom");

/*
 * 根据元素clsssName得到元素集合
 * @param fatherId 父元素的ID，默认为document
 * @tagName 子元素的标签名
 * @className 用空格分开的className字符串
 */
GLOBAL.Dom.getElementsByClassName = function(fatherId, tagName, className) {
    node = fatherId && document.getElementById(fatherId) || document;
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
/*
 window.onload = function(){
    alert(getElementsByClassName(document,"div","aaa ccc").length);//2
    alert(getElementsByClassName("container","div","aaa ccc").length);//1
    alert(getElementsByClassName("container","span","aaa zzz").length);//1
 };

 var all_box=GLOBAL.Dom.getElementsByClassName('',"div","formxx");
 */

/*根据属性值获取元素*/
GLOBAL.Dom.getElementsByAttribute = function(attribute, attributeValue) {
    var elementArray = new Array();
    var matchedArray = new Array();
    if (document.all) {
        elementArray = document.all;
    } else {
        elementArray = document.getElementsByTagName("*");
    };
    for (var i = 0; i < elementArray.length; i++) {
        if (attribute == "class") {
            var pattern = new RegExp("(^| )" + attributeValue + "( |$)");
            if (pattern.test(elementArray[i].className)) {
                matchedArray[matchedArray.length] = elementArray[i];
            }
        } else if (attribute == "for") {
            if (elementArray[i].getAttribute("htmlFor") || elementArray[i].getAttribute("for")) {
                if (elementArray[i].htmlFor == attributeValue) {
                    matchedArray[matchedArray.length] = elementArray[i];
                }
            }
        } else if (elementArray[i].getAttribute(attribute) == attributeValue) {
            matchedArray[matchedArray.length] = elementArray[i];
        };
    };
    return matchedArray;
};

//contains方法是判断参数1元素对象是否包含了参数2元素对象。
GLOBAL.Dom.contains = function(root, elem) {
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

//此方法用来获取ele这个元素下的所有元素子节点，第二个参数可选，表示指定子元素的标签名,只能获取儿子这一层，儿子之后的就不能获取
//第一个参数为必传，如果没有传参数，则'arguments error!'提示
//不但第一个参数必传，还必须是个DOM对象，并且是元素类型的对象
GLOBAL.Dom.getChildren = function(elem, tagName) {
    if (!elem && !elem.nodeType && elem.nodeType !== 1) {
        return;
    };
    var a = [];
    var children = elem.childNodes;
    if (tagName) { //判断一下是不是传了第二个参数
        if (typeof tagName != 'string') { //判断第二个参数的类型是不是正确
            return;
        };
        for (var i = 0; i < children.length; i++) {
            //判断既是元素节点，还要标签名匹配
            if (children.item(i).nodeType === 1 && children.item(i).tagName.toLowerCase() == tagName.toLowerCase()) {
                a.push(children.item(i));
            }
        };
    } else { //没有传第二个参数，则这样做（既不用考虑标记名）
        for (var i = 0; i < children.length; i++) {
            if (children.item(i).nodeType === 1) {
                a.push(children.item(i))
            }
        };
    };
    return a; //最终返回的这个数值，就是elem的所有
};

GLOBAL.Dom.getSiblings = function(elem) { //参数o就是想取谁的兄弟节点，就把那个元素传进去
    var a = []; //定义一个数组，用来存o的兄弟元素
    var p = elem.previousSibling;
    while (p) { //先取o的哥哥们 判断有没有上一个哥哥元素，如果有则往下执行 p表示previousSibling
        if (p.nodeType === 1) {
            a.push(p);
        };
        p = p.previousSibling; //最后把上一个节点赋给p
    };
    a.reverse(); //把顺序反转一下 这样元素的顺序就是按先后的了
    var n = elem.nextSibling; //再取o的弟弟
    while (n) { //判断有没有下一个弟弟结点 n是nextSibling的意思
        if (n.nodeType === 1) {
            a.push(n);
        };
        n = n.nextSibling;
    };
    return a; //最后按从老大到老小的顺序，把这一组元素返回
};

GLOBAL.Dom.getFirstChild = function(elem) {
    var result = elem.firstChild;
    while (!result.tagName) {
        result = result.nextSibling;
    };
    return result;
};

//获取上一个兄弟元素节点的函数
GLOBAL.Dom.getPrevElement = function(node) {
    if (node.nodeType == 1) {
        return node;
    };
    if (node.previousSibling) {
        return node.previousSibling;
    };
    return null;
};

//获取下一个兄弟元素节点的函数
GLOBAL.Dom.getNextElement = function(node) {
    if (node.nodeType == 1) {
        return node;
    };
    if (node.nextSibling) {
        return node.nextSibling;
    };
    return null;
};

GLOBAL.Dom.addClass = function(node, str) {
    if (!new RegExp("(^|\\s+)" + str).test(node.className)) {
        node.className = node.className + " " + str;
    };
};

GLOBAL.Dom.removeClass = function(node, str) {
    node.className = node.className.replace(new RegExp("(^|\\s+)" + str), "");
};
/*
 例子
 GLOBAL.Dom.removeClass(currentMenu,"tab-currentMenu");
 */

GLOBAL.Dom.hasClass = function(node, className) {
    return eval('/(^|\\s)' + className + '(\\s|$)/').test(node.className);
};

/*设置元素属性*/
GLOBAL.Dom.attr = function(id, value) {
    if (arguments.length == 1) {
        return this.getAttibute.value;
    } else if (arguments.length == 2) {
        return setAtttube.value;
    } else {
        return false
    };
};


/*在element后面插入node节点*/
GLOBAL.Dom.insertAfter = function(elem, node) {
    elem.parentNode.insertBefore(node, elem.nextSibling);
    return node;
};

/*向元素的指定位置插入html */
//@param {DOMElement} 要操作的元素节点,@param {String} 要插入的位置 (beforebegin|afterbegin|beforeend|afterend),@example $.insertAdjacentHTML($.get('odiv'), 'afterend', '<div style="width:30px;height:30px;border:1px solid green"></div>'); */
GLOBAL.Dom.insertAdjacentHTML = function(element, swhere, shtml) {
    if (element.insertAdjacentHTML) {
        element.insertAdjacentHTML(swhere, shtml);
    } else {
        var df = null,
            rg = element.ownerDocument.createRange();
        switch (String(swhere).toLowerCase()) {
            case 'beforebegin':
                rg.setStartBefore(element);
                df = rg.createContextualFragment(shtml);
                element.parentNode.insertBefore(df, element);
                break;
            case 'afterbegin':
                rg.selectNodeContents(element);
                rg.collapse(true);
                df = rg.createContextualFragment(shtml);
                element.insertBefore(df, element.firstChild);
                break;
            case 'beforeend':
                rg.selectNodeContents(element);
                rg.collapse(false);
                df = rg.createContextualFragment(shtml);
                element.appendChild(df);
                break;
            case 'afterend':
                rg.setStartAfter(element);
                df = rg.createContextualFragment(shtml);
                element.parentNode.insertBefore(df, element.nextSibling);
                break;
        };
    };
};

/*获取视窗可见区域高度 */
GLOBAL.Dom.getViewportHeight = function() {
    return document.documentElement.clientHeight || document.body.clientHeight;
};

/*获取视窗可见区域宽度*/
GLOBAL.Dom.getViewportWidth = function() {
    return document.documentElement.clientWidth || document.body.clientWidth;
};

/*获取文档区域高度*/
GLOBAL.Dom.getDocumentHeight = function() {
    var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    return Math.max(scrollHeight, this.getViewportHeight());
};

/*获取文档区域宽度*/
GLOBAL.Dom.getDocumentWidth = function() {
    var scrollWidth = document.documentElement.scrollWidth || document.body.scrollWidth;
    return Math.max(scrollWidth, this.getViewportWidth());
};

//其中getScrollTop和getScrollLeft分别是获取文档滚动的scrollTop和scrollLeft。
GLOBAL.Dom.getScrollTop = function(node) {
    var doc = node ? node.ownerDocument : document;
    return doc.documentElement.scrollTop || doc.body.scrollTop;
};
GLOBAL.Dom.getScrollLeft = function(node) {
    var doc = node ? node.ownerDocument : document;
    return doc.documentElement.scrollLeft || doc.body.scrollLeft;
};

//curStyle是用来获取元素的最终样式表的，根据支持情况返回getComputedStyle(w3c)或currentStyle(ie)。
GLOBAL.Dom.curStyle = function(elem) {
    if (document.defaultView && document.defaultView.getComputedStyle) {
        return document.defaultView.getComputedStyle(elem, null); //这是w3c标准方法，取得元素的样式信息，因为有些样式是在外部css文件定义的，所以用elem.style是取不到的
    } else {
        return elem.currentStyle; //如果是ie,可以用 elem.currentStyle["name"]
    };
};
/*
 var kkk=GLOBAL.Dom.getId("touxiangbtn");
 var fff=GLOBAL.Dom.curStyle(kkk);
 alert(fff.height);
 */


//获取元素指定样式属性的最终样式值的 . elem指元素，name指样式名称
GLOBAL.Dom.getStyle = function(elem, name) {
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

//设置透明度
GLOBAL.Dom.setOpacity = function(elem, num) {
    if (elem.filters) {
        elem.style.filter = "alpha(opacity=" + num + ")";
    } else {
        elem.style.opacity = num / 100;
    };
};
/*
 例子
 GLOBAL.Dom.setOpacity("test1",20);
 */

/*DOM扩展方法———*/
GLOBAL.Dom.toggleClass = function(elem, className) {
    this.hasClass(elem, className) ? this.removeClass(elem, className) : this.addClass(elem, className);
};

GLOBAL.Dom.setClass = function(elem, className) {
    if (!this.hasClass(elem, className)) {
        elem.className = className;
    };
};

//获取元素大小值
GLOBAL.Dom.getSize = function(elem) {
    var width = elem.offsetWidth,
        height = elem.offsetHeight;
    if (!width && !height) {
        var repair = GLOBAL.Dom.contains(document.body, elem),
            parent;
        if (repair) { //如果元素不在body上
            parent = elem.parentNode;
            document.body.insertBefore(elem, document.body.childNodes[0]);
        };
        var style = elem.style,
            cssShow = {
                position: "absolute",
                visibility: "hidden",
                display: "block",
                left: "-9999px",
                top: "-9999px"
            },
            cssBack = {
                position: style.position,
                visibility: style.visibility,
                display: style.display,
                left: style.left,
                top: style.top
            };
        GLOBAL.Dom.setStyle(elem, cssShow);
        width = elem.offsetWidth;
        height = elem.offsetHeight;
        GLOBAL.Dom.setStyle(elem, cssBack);
        if (repair) {
            parent ? parent.appendChild(elem) : document.body.removeChild(elem);
        };
    };
    return {
        "width": width,
        "height": height
    };
};

//setStyle用来设置样式，主要用来批量设置样式和解决一些兼容问题。
//style变量：{"display":"block","font-size":"28px","color":"red"}
GLOBAL.Dom.setStyle = function(elems, style, value) {
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
    GLOBAL.Arrays.forEach(elems,
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

//clientRect是相对浏览器视窗的位置
GLOBAL.Dom.clientRect = function(node) {
    var rect = GLOBAL.Dom.rect(node),
        sLeft = GLOBAL.Dom.getScrollLeft(node),
        sTop = GLOBAL.Dom.getScrollTop(node);
    rect.left -= sLeft;
    rect.right -= sLeft;
    rect.top -= sTop;
    rect.bottom -= sTop;
    return rect;
};

//rect是相对浏览器文档的位置
GLOBAL.Dom.rect = function(node) {
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
        left = right = GLOBAL.Dom.getScrollLeft(node);
        top = bottom = GLOBAL.Dom.getScrollTop(node);
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

//事件 相关----3-----------------------------------------------------------------------------------------------------
GLOBAL.namespace("Event");

//addEventListener事件监听,this改变
GLOBAL.Event.addEventListener = function(oTarget, sEventType, fnHandler) {
    if (oTarget.addEventListener) {
        oTarget.addEventListener(sEventType, fnHandler, false);
    } else if (oTarget.attachEvent) {
        oTarget.attachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = fnHandler;
    };
};
/*
GLOBAL.Event.addEventListener(prev, "click",
    function() {
        mayTab2._prev();
    });
*/

//removeEventListener监听撤销
GLOBAL.Event.removeEventListener = function(oTarget, sEventType, fnHandler) {
    if (oTarget.removeEventListener) {
        oTarget.removeEventListener(sEventType, fnHandler, false);
    } else if (oTarget.detachEvent) {
        oTarget.detachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = null;
    };
};
/*
function tt(){
    alert(4)
};
 GLOBAL.Event.removeEventListener(prev, "click",tt);
 */

/*加载事件与脚本*/
GLOBAL.Event.loadEvent = function(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        }
    };
};

/*阻止事件*/
GLOBAL.Event.stopPropagation = function(e) {
    if (e && e.stopPropagation && e.preventDefault) { // 非IE
        e.stopPropagation(); // 标准W3C的取消冒泡
        e.preventDefault(); // 取消默认行为
    } else {
        window.event.cancelBubble = true; // IE的取消冒泡方式
        window.event.returnValue = false; // IE的取消默认行为
    };
};
/*
 例子
 btn.onclick = function(e){
 infoBox.innerHTML = "你惦记的是：input";
 stopPropagation(e);
 }
 */

/*取得事件源对象*/
GLOBAL.Event.getEventTarget = function(event) {
    event = event || window.event;
    var obj = event.srcElement ? event.srcElement : event.target;
    return obj;
};
/*
 例子
 document.getElementById("span").onclick = function(e){
 var node = getEventTarget(e);
 alert(node.tagName);
 }
 */

/*定义鼠标的mouseOver与mouseOut事件*/
GLOBAL.Event.mouseOverOut = function(e) {
    var oEvent = document.all ? window.event : e;
    if (document.all) {
        if (oEvent.type == "mouseout") {
            oEvent.relatedTarget = oEvent.toElement;
        } else if (oEvent.type == "mouseover") {
            oEvent.relatedTarget = oEvent.fromElement;
        };
        oEvent.stopPropagation = function() {
            this.cancelBubble = true;
        };
    };
    return oEvent;
};
/*
 GLOBAL.Event.mouseOverOut(e).relatedTarget; 返回与事件的目标节点相关的节点。
 */

/**
 * 捕获鼠标在HTML文档中的位置
 * @param event 事件对象(W3C的event或IE的window.event)
 * @return {x: , y: } 鼠标在文档中的坐标
 */
GLOBAL.Event.mousePosition = function(event) {
    if (window.pageYOffset) { //支持pageYOffset属性的浏览器
        return {
            x: event.clientX + window.pageXOffset,
            y: event.clientY + window.pageYOffset
        }
    } else if (document.documentElement) { // IE浏览器
        return {
            x: event.clientX + document.documentElement.scrollLeft,
            y: event.clientY + document.documentElement.scrollTop
        }

    } else if (document.body) { // 其它的浏览器
        return {
            x: event.clientX + document.body.scrollLeft,
            y: event.clientY + document.body.scrollTop
        }
    };
};
/*
mouseMove:function(){
    var this_=this;
    var  body=GLOBAL.Dom.getId(document.body);
    GLOBAL.Event.bindEvent(body,"mouseover",function(e){
        e = e || window.event;
        var mousePos = GLOBAL.Event.mousePosition(e);
        var menu=GLOBAL.Dom.getElementsByClassName('',"div",'i-mc');
        if(mousePos.x <= 10 || mousePos.y <= 10 ){
            for(i=menu.length-1;i>=0;i--){
                menu[i].style.display="none";
            }
        }
    });
} ,
*/

/*事件扩展方法—————*/
/*用于兼容chrome下的鼠标事件，使支持 'mouseenter' 和 'mouseleave'*/
GLOBAL.Event.fixedMouse = function(e, that) { //that 为触发该事件传递下来的this指针
    var related, type = e.type.toLowerCase(); //这里获取事件名字
    if (type == 'mouseover') {
        related = e.relatedTarget || e.fromElement; //移入目标元素
    } else if (type = 'mouseout') {
        related = e.relatedTarget || e.toElement; //移出目标元素
    } else return true;
    var contain = GLOBAL.Dom.contains(that, related);
    return 'document' && related && related.prefix != 'xul' && !contain && related !== that;
};
/*使用方法如下*/

/*关于mouseover和mouseout事件冒泡处理方法2---模拟mouseenter和mouseleave事件*/
GLOBAL.Event.mouseEnter = function(element, callback) {
    GLOBAL.Event.addEventListener(element, "mouseover",
        function(e) {
            var that = this;
            if (GLOBAL.Event.fixedMouse(e, that)) {
                callback.call(); //封装回调函数
            };
        },
        false);
};

//目前还不能完美的实现mouseLeave，因为在鼠标离开浏览器时，由于无法获取子元素，导致该方法失效
GLOBAL.Event.mouseLeave = function(element, callback) {
    GLOBAL.Event.addEventListener(element, "mouseout",
        function(e) {
            var that = this;
            if (GLOBAL.Event.fixedMouse(e, that)) {
                callback.call(); //封装回调函数
            };
        },
        false);
};

//fixEvent是用来修正event对象的兼容性的,主要是添加一些w3c的属性和方法，
GLOBAL.Event.fixEvent = function(event) {
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

//Ajax 相关 ---4-------------------------------------------------------------------------------------------------
GLOBAL.namespace("Ajax");

// 创建完整Ajax程序包 ，该包不支持跨域
GLOBAL.Ajax.ajax = function(options) {
    options = {
        // HTTP 请求类型
        type: options.type || "GET",
        // 请求的文件类型
        dataType: options.dataType,
        // 请求的URL
        url: options.url || "",
        xhr: options.xhr || function() {
            try {
                return new XMLHttpRequest();
            } catch (e) {}
        },
        // 请求的超时时间
        timeout: options.timeout || 5000,
        // 请求成功.失败或完成(无论成功失败都会调用)时执行的函数
        onComplete: options.onComplete ||
            function() {},
        onError: options.onError ||
            function() {},
        onSuccess: options.onSuccess ||
            function() {},
        // 服务器端默认返回的数据类型
        data: options.data || ""
    };

    // 创建请求对象
    var xml = options.xhr();
    // 初始化异步请求
    xml.open(options.type, options.url, true);
    // 请求5秒 如果超时则放弃
    var timeoutLength = options.timeout;

    // 记录请求是否成功完成
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

// 数据串行化 支持两种不同的对象
// - 表单输入元素的数组
// - 键/值 对应的散列表
// - 返回串行化后的字符串 形式: name=john&password=test
GLOBAL.Ajax.serialize = function(a) {
    // 串行化结果存放
    var s = [];
    // 如果是数组形式 [{name: XX, value: XX}, {name: XX, value: XX}]
    if (a.constructor == Array) {
        // 串行化表单元素
        for (var i = 0; i < a.length; i++) {
            s.push(a[i].name + "=" + encodeURIComponent(a[i].value));
        }
        // 假定是键/值对象
    } else {
        for (var j in a) {
            s.push(j + "=" + encodeURIComponent(a[j]));
        }
    };
    // 返回串行化结果
    return s.join("&");
};

/* 使用方法
 <script type="text/javascript">
var param = {
    name: "john",
    value: "Resig",
    city: "Cambridge",
    zip: 02140
}
window.onload = function(){
    GLOBAL.Ajax.ajax({                             //初始化 options 内的参数
        url: "b.html?" + GLOBAL.Ajax.serialize(param),
        type: "GET",
        dataType: "html",
        onSuccess: function( html ){
            document.getElementById('odiv').innerHTML = html;
        }
    });
}
</script> */


//数组 相关----7-----------------------------------------------------------------------------------------------------
GLOBAL.namespace("Arrays");

//根据索引调用元素
GLOBAL.Arrays.indexOf = function(array, elt, from) {
    if (array.indexOf) {
        return isNaN(from) ? array.indexOf(elt) : array.indexOf(elt, from);
    } else {
        var len = array.length;
        from = isNaN(from) ? 0 : from < 0 ? Math.ceil(from) + len : Math.floor(from);
        for (; from < len; from++) {
            if (array[from] === elt) return from;
        };
        return -1;
    }
};
//最后一个元素
GLOBAL.Arrays.lastIndexOf = function(array, elt, from) {
    if (array.lastIndexOf) {
        return isNaN(from) ? array.lastIndexOf(elt) : array.lastIndexOf(elt, from);
    } else {
        var len = array.length;
        from = isNaN(from) || from >= len - 1 ? len - 1 : from < 0 ? Math.ceil(from) + len : Math.floor(from);
        for (; from > -1; from--) {
            if (array[from] === elt) return from;
        };
        return -1;
    }
};
//遍历
GLOBAL.Arrays.each = function(object, callback) {
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
/*
 GLOBAL.Arrays.each( object, function(){ callback.apply(thisp, arguments); } );

 GLOBAL.Arrays.each(onSelect,function(s){
    s.className="";
 });

 */

//数组扩展
//以每一个匹配的元素作为上下文来执行一个函数,将object传入callback,并可在回调函数中直接引用，thisp为this指针
GLOBAL.Arrays.forEach = function(object, callback, thisp) {
    GLOBAL.Arrays.each(object,
        function() {
            callback.apply(thisp, arguments);
        });
};
/*
GLOBAL.Arrays.forEach(site_nav, function (o, index) {
        GLOBAL.Event.addEventListener(o, 'mouseover', GLOBAL.Objects.BindFunction(this, function () {
            var first = o.getElementsByTagName("span");
            var next = o.getElementsByTagName("ul");
            first[0].className = "hover";
            next[0].style.display = "block";
        }));

    },
    this);
*/

//将一组元素转换成其他数组（不论是否是元素数组）
GLOBAL.Arrays.map = function(object, callback, thisp) {
    var ret = [];
    GLOBAL.Arrays.each(object,
        function() {
            ret.push(callback.apply(thisp, arguments));
        });
    return ret;
};
//筛选出与指定表达式匹配的元素集合
GLOBAL.Arrays.filter = function(object, callback, thisp) {
    var ret = [];
    GLOBAL.Arrays.each(object,
        function(item) {
            callback.apply(thisp, arguments) && ret.push(item);
        });
    return ret;
};
GLOBAL.Arrays.every = function(object, callback, thisp) {
    var ret = true;
    GLOBAL.Arrays.each(object,
        function() {
            if (!callback.apply(thisp, arguments)) {
                ret = false;
                return false;
            };
        });
    return ret;
};
GLOBAL.Arrays.some = function(object, callback, thisp) {
    var ret = false;
    GLOBAL.Arrays.each(object,
        function() {
            if (callback.apply(thisp, arguments)) {
                ret = true;
                return false;
            };
        });
    return ret;
};

//cookie 相关----8-----------------------------------------------------------------------------------------------------
GLOBAL.namespace("Cookie");

//获得coolie 的值,读取所有保存的cookie字符串
GLOBAL.Cookie.cookie = function(name) {
    var cookieArray = document.cookie.split("; "); //得到分割的cookie名值对
    var cookie = new Object();
    for (var i = 0; i < cookieArray.length; i++) {
        var arr = cookieArray[i].split("="); //将名和值分开
        if (arr[0] == name) return unescape(arr[1]); //如果是指定的cookie，则返回它的值
    };
    return "";
};

//获取指定名称的cookie的值
GLOBAL.Cookie.getCookie = function(objName) {
    var arrStr = document.cookie.split("; ");
    for (var i = 0; i < arrStr.length; i++) {
        var temp = arrStr[i].split("=");
        if (temp[0] == objName) return unescape(temp[1]);
    }
};

//两个参数，一个是cookie的名子，一个是值
GLOBAL.Cookie.setCookie = function(name, value) {
    var Days = 30; //此 cookie 将被保存 30 天
    var exp = new Date(); //new Date("December 31, 9998");
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
};

//添加cookie
GLOBAL.Cookie.addCookie = function(objName, objValue, objHours) {
    var str = objName + "=" + escape(objValue);
    if (objHours > 0) { //为时不设定过期时间，浏览器关闭时cookie自动消失
        var date = new Date();
        var ms = objHours * 3600 * 1000;
        date.setTime(date.getTime() + ms);
        str += "; expires=" + date.toGMTString();
    };
    document.cookie = str;
};

//删除cookie
GLOBAL.Cookie.delCookie = function(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = GLOBAL.Cookie.getCookie(name);
    if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
};

//动画相关------------------------------------------------------------------------------------------------------------
GLOBAL.namespace("Animate");

/*设置透明度*/
GLOBAL.Animate.setOpacity = function(elem, value) {
    elem.style.opacity = value, elem.style.filter = 'alpha(opacity=' + value * 100 + ')';
};

/*设置元素的px值*/
GLOBAL.Animate.setAnimateStyle = function(elem, value, attr, m) {
    elem.style[attr] = Math[m](value) + 'px';
};

/*动画执行函数--方法1*/
/*GLOBAL.Animate.animate = function(elem, attr, value, time, type, funcBefore, funcAfter ,ID) {
    var isOpacity = attr === 'opacity', diffValue = false;
    funcBefore && funcBefore.call();
    if (typeof value === 'string') {
        if (/^[+-]=\d+/.test(value)) value = value.replace('=', ''),diffValue=true;
        value = parseFloat(value);
    };
    var oriVal = parseInt(GLOBAL.Dom.getStyle(elem, attr)),  //原始属性值
        b = isNaN(oriVal) ? 0 : oriVal,   //开始值,无值时为0
        c =  diffValue?value:value-b,  //差值
        d = time,  //总运行时间
        e = GLOBAL.Animate.easing[type], //缓动类型
        m=c>0?'ceil':'floor',  //取最大绝对值
        setProperty=GLOBAL.Animate[isOpacity?'setOpacity':'setAnimateStyle'], //属性设置方法
        origTime = (new Date) * 1,    //原始时间值
        iID = ID ? ID : "JCL";  //计数器id
    animateID[iID] && clearInterval(animateID[iID]);
    animateID[iID] = setInterval(function() {
            var t = (new Date) - origTime;  //已运行时间
            if (t <= d) {
                setProperty(elem,e(t,b,c,d),attr,m);
            } else {
                setProperty(elem,b+c,attr,m);   //设置最终值
                clearInterval(animateID[iID]);
                animateID[iID]=null;
                funcAfter && funcAfter.call();
            }
        },
        13);
};*/

/*根据给定的 iID 值，来停止相对应的动画*/
/*GLOBAL.Animate.animateStop = function(iID){
    clearInterval(animateID[iID]);
};*/

/*动画执行函数--方法2*/
GLOBAL.Animate.animate = function(elem, attr, value, time, type, funcBefore, funcAfter, ID) {
    var isOpacity = attr === 'opacity',
        diffValue = false;
    funcBefore && funcBefore.call();
    if (typeof value === 'string') {
        if (/^[+-]=\d+/.test(value)) value = value.replace('=', ''), diffValue = true;
        value = parseFloat(value);
    };
    var oriVal = parseInt(GLOBAL.Dom.getStyle(elem, attr)), //原始属性值
        b = isNaN(oriVal) ? 0 : oriVal, //开始值,无值时为0
        c = diffValue ? value : value - b, //差值
        d = time, //总运行时间
        e = GLOBAL.Animate.easing[type], //缓动类型
        m = c > 0 ? 'ceil' : 'floor', //取最大绝对值
        setProperty = GLOBAL.Animate[isOpacity ? 'setOpacity' : 'setAnimateStyle'], //属性设置方法
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
GLOBAL.Animate.animateStop = function(iID) {
    window.cancelAnimationFrame(animateID[iID]);
};

/*动画扩展算法*/
GLOBAL.Animate.easing = {
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