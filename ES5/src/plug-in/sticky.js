(function(global, factory) {

    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document ?
            factory(global, true) :
            function(w) {
                if (!w.document) {
                    throw new Error("sticky requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

    // Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    "use strict";

    // 判断指定参数是否是一个纯粹的对象,所谓"纯粹的对象"，就是该对象是通过"{}"或"new Object"创建的
    function isPlainObject(obj) {
        var key;

        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if (obj.constructor &&
                !hasOwn.call(obj, "constructor") &&
                !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Support: IE<9
        // Handle iteration over inherited properties before own properties.
        if (support.ownLast) {
            for (key in obj) {
                return hasOwn.call(obj, key);
            }
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        for (key in obj) {}

        return key === undefined || hasOwn.call(obj, key);
    }

    function type(obj) {
        if (obj == null) {
            return obj + "";
        }
        return typeof obj === "object" || typeof obj === "function" ?
            class2type[toString.call(obj)] || "object" :
            typeof obj;
    }

    function isWindow(obj) {
        /* jshint eqeqeq: false */
        return obj != null && obj == obj.window;
    }

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

    //curStyle是用来获取元素的最终样式表的
    function curStyle(elem) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
            return document.defaultView.getComputedStyle(elem, null); //这是w3c标准方法，取得元素的样式信息，因为有些样式是在外部css文件定义的，所以用elem.style是取不到的
        } else {
            return elem.currentStyle; //如果是ie,可以用 elem.currentStyle["name"]
        };
    };

    function offsetTop(elements) {
        var top = elements.offsetTop;
        var parent = elements.offsetParent;
        while (parent != null) {
            top += parent.offsetTop;
            parent = parent.offsetParent;
        };
        return top;
    };

    function offsetLeft(elements) {
        var left = elements.offsetLeft;
        var parent = elements.offsetParent;
        while (parent != null) {
            left += parent.offsetLeft;
            parent = parent.offsetParent;
        };
        return left;
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

    function getViewportHeight() {
        return document.documentElement.clientHeight || document.body.clientHeight;
    }

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

    function getDataset(elements,type){
        return elements.dataset ? elements.dataset[type] : elements.getAttribute(type);
    }

    function setDataset(elements,type,val){
        if(elements.dataset){
            elements.dataset[type] = val;
        }else{
            elements.setAttribute(type, val);
        }
    }

    var doc = window.document,
        stickyPrefix = ["-webkit-", "-ms-", "-o-", "-moz-", ""],
        guid = 0,

        ua = (window.navigator.userAgent || "").toLowerCase(),
        isIE = ua.indexOf("msie") !== -1,
        isIE6 = ua.indexOf("msie 6") !== -1;

    var isPositionStickySupported = checkPositionStickySupported(),
        isPositionFixedSupported = checkPositionFixedSupported();


    // iSticky
    // position: sticky simulator
    var iSticky = function() {

        var args = Array.prototype.slice.call(arguments, 0, 3);
        if (!args.length) {
            throw new Error('Parameters required!');
        }

        switch (args[0].length) {
            case 2:
                //args[2];
            case 1:
                //console.log(args[1])
        }
        this.options = args[0];

        this.elem = document.getElementById(this.options.element);
        this.position = this.options.position;
        this.callback = this.options.callback || function() {};
        this._stickyId = guid++;
    }

    iSticky.prototype._prepare = function() {
        // save element's origin position
        this._originTop = parseInt(offsetTop(this.elem));
        this._originLeft = parseInt(offsetLeft(this.elem));

        // if is fixed, force to call this_supportFixed
        if (this.position.top === Number.MAX_VALUE) {
            this._callFix = true;
            this.position.top = this._originTop;
        }

        // save element's origin style
        this._originStyles = {
            position: null,
            top: null,
            bottom: null,
            left: null
        };
        for (var style in this._originStyles) {
            if (this._originStyles.hasOwnProperty(style)) {
                this._originStyles[style] = this.elem.style[style];
            }
        }
    };

    iSticky.prototype.render = function() {
        var self = this;

        // only bind once
        if (!this.elem || getDataset(this.elem,"bind_sticked")) {
            return this;
        }

        this._prepare();

        // if other element change height in one page,
        // or if resize window,
        // need adjust sticky element's status
        this.adjust = function() {
            self._restore();
            self._originTop = parseInt(offsetTop(self.elem));
            self._originLeft = parseInt(offsetLeft(self.elem));

            scrollFn.call(self);
        };

        var scrollFn;
        if (Sticky.isPositionStickySupported && !this._callFix) {
            scrollFn = this._supportSticky;

            // set position: sticky directly
            var tmp = "";
            for (var i = 0; i < stickyPrefix.length; i++) {
                tmp += "position:" + stickyPrefix[i] + "sticky;";
            }
            if (this.position.top !== undefined) {
                tmp += "top: " + this.position.top + "px;";
            }
            if (this.position.bottom !== undefined) {
                tmp += "bottom: " + this.position.bottom + "px;";
            }
            this.elem.style.cssText += tmp;

            this.adjust = function() {
                scrollFn.call(self);
            };
        } else if (Sticky.isPositionFixedSupported) {
            scrollFn = this._supportFixed;
        } else { 
            scrollFn = this._supportAbsolute; // ie6
            // avoid floatImage Shake for IE6
            // see: https://github.com/lifesinger/lifesinger.
            //      github.com/blob/master/lab/2009/ie6sticked_position_v4.html
            // $("<style type='text/css'> * html" +
            //     "{ background:url(null) no-repeat fixed; } </style>").appendTo("head");
        }

        // first run after document ready
        scrollFn.call(this);

        // stickyX is event namespace
        if (this.namespace) {

        }

        addEventListener(window, 'scroll', function() {
            if (self.elem.style.display == "none") return;
            scrollFn.call(self);
        });

        addEventListener(window, 'resize', debounce(function() {
            self.adjust();
        }, 120));

        setDataset(this.elem, "bind_sticked", true)

        return this;
    };

    iSticky.prototype._getTopBottom = function(scrollTop, offsetTop) {
        var top;
        var bottom;

        var triggerCss = curStyle(this.elem);
        var outerHeight = parseInt(triggerCss.height) + parseInt(triggerCss.paddingTop) + parseInt(triggerCss.paddingBottom) + parseInt(triggerCss.borderTopWidth) + parseInt(triggerCss.borderBottomWidth) + parseInt(triggerCss.marginTop) + parseInt(triggerCss.marginBottom);

        // top is true when the distance from element to top of window <= position.top
        if (this.position.top !== undefined) {
            top = offsetTop - scrollTop <= this.position.top;
        }
        // bottom is true when the distance is from bottom of element to bottom of window <= position.bottom
        if (this.position.bottom !== undefined) {
            bottom = scrollTop + parseInt(getViewportHeight()) - offsetTop - outerHeight <= this.position.bottom;
        }

        return {
            top: top,
            bottom: bottom
        };
    };

    iSticky.prototype._supportFixed = function() {
        var scrollTop = window.document.documentElement.scrollTop + document.body.scrollTop;
        var _sticky = getDataset(this.elem, "sticked");
        var distance = this._getTopBottom(scrollTop, this._originTop);

        // 这里 _sticky 的判断有点诡异
        if ((_sticky == undefined || _sticky == 'false' )&& (distance.top !== undefined && distance.top || distance.bottom !== undefined && distance.bottom)) {
            this._addPlaceholder();

            var cssOpts = {};
            if (distance.top) {
                cssOpts = {
                    position: 'fixed',
                    left: this._originLeft + "px",
                    top: this.position.top + "px"
                }
            } else {
                cssOpts = {
                    position: 'fixed',
                    left: this._originLeft + "px",
                    bottom: this.position.bottom + "px"
                }
            }

            setStyle(this.elem, cssOpts);
            setDataset(this.elem, "sticked", true);
            this.callback.call(this, true);
        } else if (_sticky == 'true' && !distance.top && !distance.bottom) { 
            this._restore();
        }
    };

    iSticky.prototype._supportAbsolute = function() {
        var scrollTop = window.document.documentElement.scrollTop + document.body.scrollTop;
        var _sticky = getDataset(this.elem, "sticked");
        var distance = this._getTopBottom(scrollTop, offsetTop(this.elem));
        var triggerCss = curStyle(this.elem);
        var outerHeight = parseInt(triggerCss.height) + parseInt(triggerCss.paddingTop) + parseInt(triggerCss.paddingBottom) + parseInt(triggerCss.borderTopWidth) + parseInt(triggerCss.borderBottomWidth) + parseInt(triggerCss.marginTop) + parseInt(triggerCss.marginBottom);

        if (distance.top || distance.bottom || this._callFix) {
            // sticky status change only one time
            if (!_sticky) {
                this._addPlaceholder();
                setDataset(this.elem, "sticked", true);
                this.callback.call(this, true);
            }
            // update element's position

            setStyle(this.elem, {
                position: 'absolute',
                top: this._callFix ? this._originTop + scrollTop : (distance.top ? this.position.top + scrollTop :
                    scrollTop + parseInt(getViewportHeight()) - this.position.bottom - outerHeight)
            });
            
        } else if (_sticky && !distance.top && !distance.bottom) {
            this._restore();
        }
    };

    iSticky.prototype._supportSticky = function() {
        var scrollTop = window.document.documentElement.scrollTop + document.body.scrollTop;
        // sticky status change for callback
        var _sticky = getDataset(this.elem, "sticked");
        var distance = this._getTopBottom(scrollTop, offsetTop(this.elem));

        if (!_sticky &&
            (distance.top !== undefined && distance.top ||
                distance.bottom !== undefined && distance.bottom)) {
            setDataset(this.elem, "sticked", true);
            this.callback.call(this, true);
        } else if (_sticky && !distance.top && !distance.bottom) {
            // don't need restore style and remove placeholder
            setDataset(this.elem, "sticked", false);
            this.callback.call(this, false);
        }
    };

    iSticky.prototype._restore = function() {
        this._removePlaceholder();


        // set origin style
        setStyle(this.elem, this._originStyles);

        setDataset(this.elem, "sticked", false);
        this.callback.call(this, false);
    };

    // need placeholder when: 1) position: static or relative, but expect for display != block
    iSticky.prototype._addPlaceholder = function() {
        var need = false;
        var position = this.elem.style.position;

        if (position === 'static' || position === 'relative') {
            need = true;
        }
        if (this.elem.style.display !== "block") {
            need = false;
        }

        if (need) {
            var newNode = document.createElement("div");
            this.elem.parentNode.insertBefore(newNode, this.elem.nextSibling);

            var triggerCss = curStyle(this.elem);
            elem_outerWidth = parseInt(triggerCss.width) + parseInt(triggerCss.paddingLeft) + parseInt(triggerCss.paddingRight) + parseInt(triggerCss.borderLeftWidth) + parseInt(triggerCss.borderRightWidth) + parseInt(triggerCss.marginLeft) + parseInt(triggerCss.marginRight);
            elem_outerHeight = parseInt(triggerCss.height) + parseInt(triggerCss.paddingTop) + parseInt(triggerCss.paddingBottom) + parseInt(triggerCss.borderTopWidth) + parseInt(triggerCss.borderBottomWidth) + parseInt(triggerCss.marginTop) + parseInt(triggerCss.marginBottom);

            setStyle(newNode, {
                visibility: 'hidden',
                margin: '0',
                padding: '0',
                width: elem_outerWidth + "px",
                height: elem_outerHeight + "px",
                float: this.elem.style.float
            });
        }
    };

    iSticky.prototype._removePlaceholder = function() {
        // remove placeholder if has
        this._placeholder && this._placeholder.remove();
    };

    iSticky.prototype.destroy = function() {
        this._restore();
        setDataset(this.elem, "bind_sticked", false);

        removeEventListener(window, 'scroll');
        removeEventListener(window, 'resize');
    };


    function Sticky(elem, position, callback) {
        if (!isPlainObject(position)) {
            position = {
                top: position
            };
        }
        if (position.top === undefined && position.bottom === undefined) {
            position.top = 0;
        }
        return (new iSticky({
            element: elem,
            position: position,
            callback: callback
        })).render();
    }

    // Sticky.stick(elem, position, callback)
    Sticky.stick = Sticky;

    // sticky.fix(elem)
    Sticky.fix = function(elem) {
        return (new iSticky({
            element: elem,
            // position.top is Number.MAX_VALUE means fixed
            position: {
                top: Number.MAX_VALUE
            }
        })).render();
    };

    // for tc
    Sticky.isPositionStickySupported = isPositionStickySupported;
    Sticky.isPositionFixedSupported = isPositionFixedSupported;

    // Helper
    // ---
    function checkPositionFixedSupported() {
        return !isIE6;
    }

    function checkPositionStickySupported() {
        if (isIE) return false;

        var container = doc.body;

        if (doc.createElement && container && container.appendChild && container.removeChild) {
            var isSupported,
                el = doc.createElement("div"),
                getStyle = function(st) {
                    if (window.getComputedStyle) {
                        return window.getComputedStyle(el).getPropertyValue(st);
                    } else {
                        return el.currentStyle.getAttribute(st);
                    }
                };

            container.appendChild(el);

            for (var i = 0; i < stickyPrefix.length; i++) {
                el.style.cssText = "position:" + stickyPrefix[i] + "sticky;visibility:hidden;";
                if (isSupported = getStyle("position").indexOf("sticky") !== -1) break;
            }

            el.parentNode.removeChild(el);
            return isSupported;
        }
    }

    // https://github.com/jashkenas/underscore/blob/master/underscore.js#L699
    function getTime() {
        return (Date.now || function() {
            return new Date().getTime();
        })()
    }

    function debounce(func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        return function() {
            context = this;
            args = arguments;
            timestamp = getTime();
            var later = function() {
                var last = getTime() - timestamp;
                if (last < wait) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) result = func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) result = func.apply(context, args);
            return result;
        };
    }

    if (typeof define === 'function' && define['amd'])
        define("Sticky", [], function() {
            return Sticky;
        });
    /* Global */
    else
        window['Sticky'] = Sticky;

}));