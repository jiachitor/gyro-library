// Position
// --------
// 定位工具组件，将一个 DOM 节点相对对另一个 DOM 节点进行定位操作。
// 代码易改，人生难得

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

    //curStyle是用来获取元素的最终样式表的
    function curStyle(elem) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
            return document.defaultView.getComputedStyle(elem, null); //这是w3c标准方法，取得元素的样式信息，因为有些样式是在外部css文件定义的，所以用elem.style是取不到的
        } else {
            return elem.currentStyle; //如果是ie,可以用 elem.currentStyle["name"]
        };
    };

    var VIEWPORT = {
            _id: 'VIEWPORT',
            nodeType: 1
        },
        isPinFixed = false,
        ua = (window.navigator.userAgent || "").toLowerCase(),
        isIE6 = ua.indexOf("msie 6") !== -1;

    var Position = function() {}

    // 将目标元素相对于基准元素进行定位
    // 这是 Position 的基础方法，接收两个参数，分别描述了目标元素和基准元素的定位点
    Position.prototype.pin = function(pinObject, baseObject) {

        // 将两个参数转换成标准定位对象 { element: a, x: 0, y: 0 }
        pinObject = normalize(pinObject);
        baseObject = normalize(baseObject);

        // if pinObject.element is not present
        // https://github.com/aralejs/position/pull/11
        if (pinObject.element === VIEWPORT || pinObject.element._id === 'VIEWPORT') {
            return;
        }

        // 设定目标元素的 position 为绝对定位
        // 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
        var pinElement = pinObject.element;

        if (baseObject.element === VIEWPORT || baseObject.element._id === 'VIEWPORT') {
            pinElement.style.position = 'fixed';
        }

        if (pinElement.style.position !== 'fixed' || isIE6) {
            pinElement.style.position = 'absolute';
            isPinFixed = false;
        } else {
            // 定位 fixed 元素的标志位，下面有特殊处理
            isPinFixed = true;
        }

        // 将位置属性归一化为数值
        // 注：必须放在上面这句 `css('position', 'absolute')` 之后，
        //    否则获取的宽高有可能不对
        posConverter(pinObject);
        posConverter(baseObject);

        var parentOffset = getParentOffset(pinElement);
        var baseOffset = baseObject.offset();

        // 计算目标元素的位置
        var top = baseOffset.top + baseObject.y - pinObject.y - parentOffset.top;

        var left = baseOffset.left + baseObject.x - pinObject.x - parentOffset.left;

        // 定位目标元素
        pinElement.style.left = left + "px";
        pinElement.style.top = top + "px";
    };


    // 将目标元素相对于基准元素进行居中定位
    // 接受两个参数，分别为目标元素和定位的基准元素，都是 DOM 节点类型
    Position.prototype.center = function(pinElement, baseElement) {
        this.pin({
            element: pinElement,
            x: '50%',
            y: '50%'
        }, {
            element: baseElement,
            x: '50%',
            y: '50%'
        });
    };


    // 这是当前可视区域的伪 DOM 节点
    // 需要相对于当前可视区域定位时，可传入此对象作为 element 参数
    Position.VIEWPORT = VIEWPORT;


    // Helpers
    // -------

    // 将参数包装成标准的定位对象，形似 { element: a, x: 0, y: 0 }
    function normalize(posObject) {

        var posObject_node = toElement(posObject) || {};
        var element = posObject_node.nodeType ? posObject_node : (posObject.element ? toElement(posObject.element) : VIEWPORT);

        if (element.nodeType !== 1) {
            throw new Error('posObject.element is invalid.');
        }

        var result = {
            element: element,
            x: posObject.x || 0,
            y: posObject.y || 0
        };

        // config 的深度克隆会替换掉 Position.VIEWPORT, 导致直接比较为 false
        // 这个 只用于判断 baseObject
        var isVIEWPORT = (element === VIEWPORT || element._id === 'VIEWPORT');

        // 归一化 offset
        result.offset = function() {
            // 若定位 fixed 元素，则父元素的 offset 没有意义
            if (isPinFixed) {
                return {
                    left: 0,
                    top: 0
                };
            } else if (isVIEWPORT) {
                return {
                    left: parseInt(document.documentElement.scrollLeft),
                    top: parseInt(document.documentElement.scrollTop + document.body.scrollTop)
                };
            } else {
                return getOffset(element);
            }
        };

        // 归一化 size, 含 padding 和 border
        result.size = function() {
            var el = isVIEWPORT ? window : element;
            var triggerCss = curStyle(el);
            return {
                width: parseInt(triggerCss.width) + parseInt(triggerCss.paddingLeft) + parseInt(triggerCss.paddingRight) + parseInt(triggerCss.borderLeftWidth) + parseInt(triggerCss.borderRightWidth) + parseInt(triggerCss.marginLeft) + parseInt(triggerCss.marginRight),
                height: parseInt(triggerCss.height) + parseInt(triggerCss.paddingTop) + parseInt(triggerCss.paddingBottom) + parseInt(triggerCss.borderTopWidth) + parseInt(triggerCss.borderBottomWidth) + parseInt(triggerCss.marginTop) + parseInt(triggerCss.marginBottom)
            };
        };

        return result;
    }

    // 对 x, y 两个参数为 left|center|right|%|px 时的处理，全部处理为纯数字
    function posConverter(pinObject) {
        pinObject.x = xyConverter(pinObject.x, pinObject, 'width');
        pinObject.y = xyConverter(pinObject.y, pinObject, 'height');
    }

    // 处理 x, y 值，都转化为数字
    function xyConverter(x, pinObject, type) {

        // 先转成字符串再说！好处理
        x = x + '';

        // 处理 px
        x = x.replace(/px/gi, '');
        // 处理 alias
        if (/\D/.test(x)) {
            x = x.replace(/(?:top|left)/gi, '0%')
                .replace(/center/gi, '50%')
                .replace(/(?:bottom|right)/gi, '100%');
        }
        // 将百分比转为像素值
        if (x.indexOf('%') !== -1) {
            //支持小数
            x = x.replace(/(\d+(?:\.\d+)?)%/gi, function(m, d) {
                return getinnterWH(pinObject.element, type) * (d / 100.0);
            });
        }
        // 处理类似 100%+20px 的情况
        if (/[+\-*\/]/.test(x)) {
            try {
                // eval 会影响压缩
                // new Function 方法效率高于 for 循环拆字符串的方法
                // 参照：http://jsperf.com/eval-newfunction-for
                x = (new Function('return ' + x))();
            } catch (e) {
                throw new Error('Invalid position value: ' + x);
            }
        }
        // 转回为数字
        return numberize(x);
    }

    function getinnterWH(obj, type) {
        var val = 0,
            triggerCss;

        if (obj === VIEWPORT || obj._id === 'VIEWPORT') {
            if (type == "width") {
                val = document.documentElement.clientWidth || document.body.clientWidth;
            } else {
                val = document.documentElement.clientHeight || document.body.clientHeight;
            }
            return val;
        } else {
            triggerCss = curStyle(obj);
        }

        if (type == "width") {
            val = parseInt(triggerCss.width) + parseInt(triggerCss.paddingLeft) + parseInt(triggerCss.paddingRight) + parseInt(triggerCss.borderLeftWidth) + parseInt(triggerCss.borderRightWidth);
        } else {
            val = parseInt(triggerCss.height) + parseInt(triggerCss.paddingTop) + parseInt(triggerCss.paddingBottom) + parseInt(triggerCss.borderTopWidth) + parseInt(triggerCss.borderBottomWidth);
        }
        return val;
    }

    // 获取 offsetParent 的位置
    function getParentOffset(element) {

        var parent = element.offsetParent ? element.offsetParent : document.documentElement;

        // IE7 下，body 子节点的 offsetParent 为 html 元素，其 offset 为
        // { top: 2, left: 2 }，会导致定位差 2 像素，所以这里将 parent
        // 转为 document.body
        if (parent === document.documentElement) {
            parent = document.body;
        }

        var parentCss = curStyle(parent);

        // 修正 ie6 下 absolute 定位不准的 bug
        if (isIE6) {
            parentCss.zoom = 1;
        }

        // 获取 offsetParent 的 offset
        var offset;

        // 当 offsetParent 为 body，
        // 而且 body 的 position 是 static 时
        // 元素并不按照 body 来定位，而是按 document 定位
        // http://jsfiddle.net/afc163/hN9Tc/2/
        // 因此这里的偏移值直接设为 0 0
        if (parent === document.body && parentCss.position === 'static') {
            offset = {
                top: 0,
                left: 0
            };
        } else {
            offset = getOffset(parent);
        }

        // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
        offset.top += numberize(parseInt(parentCss.borderTopWidth));
        offset.left += numberize(parseInt(parentCss.borderLeftWidth));

        return offset;
    }

    function numberize(s) {
        return parseFloat(s, 10) || 0;
    }

    function toElement(element) {
        return document.getElementById(element);
    }

    // fix jQuery 1.7.2 offset
    // document.body 的 position 是 absolute 或 relative 时
    // jQuery.offset 方法无法正确获取 body 的偏移值
    //   -> http://jsfiddle.net/afc163/gMAcp/
    // jQuery 1.9.1 已经修正了这个问题
    //   -> http://jsfiddle.net/afc163/gMAcp/1/
    // 这里先实现一份
    // 参照 kissy 和 jquery 1.9.1
    //   -> https://github.com/kissyteam/kissy/blob/master/src/dom/sub-modules/base/src/base/offset.js#L366
    //   -> https://github.com/jquery/jquery/blob/1.9.1/src/offset.js#L28
    function getOffset(element) {
        var box = element.getBoundingClientRect(),
            docElem = document.documentElement;

        // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
        return {
            left: box.left + (window.pageXOffset || docElem.scrollLeft) -
                (docElem.clientLeft || document.body.clientLeft || 0),
            top: box.top + (window.pageYOffset || docElem.scrollTop) -
                (docElem.clientTop || document.body.clientTop || 0)
        };
    }

    if (typeof define === 'function' && define['amd'])
        define("Position", [], function() {
            return Position;
        });
    /* Global */
    else
        window['Position'] = Position;

}));