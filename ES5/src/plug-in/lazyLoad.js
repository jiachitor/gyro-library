// 懒加载

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

	function bindFunction(object, fun) {
		var args = Array.prototype.slice.call(arguments, 2);
		return function() {
			return fun.apply(object, args.concat(Array.prototype.slice.call(arguments)));
		};
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

	function getScrollTop(node) {
		var doc = node ? node.ownerDocument : document;
		return doc.documentElement.scrollTop || doc.body.scrollTop;
	};

	function getScrollLeft(node) {
		var doc = node ? node.ownerDocument : document;
		return doc.documentElement.scrollLeft || doc.body.scrollLeft;
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


	var LazyLoad = function(elems, options) {
		//初始化程序
		this._initialize(elems, options);
		//如果没有元素就退出
		if (this.isFinish()) return;
		//初始化模式设置
		this._initMode();
		//进行第一次触发
		this.resize(true);
	};

	LazyLoad.prototype = {
		//初始化程序
		_initialize: function(elems, options) {
			this._elems = elems; //加载元素集合
			this._rect = {}; //容器位置参数对象
			this._range = {}; //加载范围参数对象
			this._loadData = null; //加载程序
			this._timer = null; //定时器
			this._lock = false; //延时锁定
			//静态使用属性
			this._index = 0; //记录索引
			this._direction = 0; //记录方向
			this._lastScroll = {
				"left": 0,
				"top": 0
			}; //记录滚动值
			this._setElems = function() {}; //重置元素集合程序
			var opt = this._setOptions(options);

			this.delay = opt.delay;
			this.threshold = opt.threshold;
			this.beforeLoad = opt.beforeLoad;

			this._onLoadData = opt.onLoadData;
			this._container = this._initContainer(document.getElementById(this.options.container)); //容器
		},
		//设置默认属性
		_setOptions: function(options) {
			this.options = { //默认值
				container: window, //容器
				mode: "dynamic", //模式
				threshold: 0, //加载范围阈值
				delay: 100, //延时时间
				beforeLoad: function() {}, //加载前执行
				onLoadData: function() {} //显示加载数据
			};
			return extend(this.options, options || {});
		},
		//初始化容器设置
		_initContainer: function(container) {
			//先判断是用window（窗口）还是一般元素作为容器对象
			var doc = document,
				isWindow = container == window || container == doc || !container.tagName || (/^(?:body|html)$/i).test(container.tagName);
			//如果是window，再根据文档渲染模式选择对应的文档对象
			if (isWindow) {
				container = doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;
			};
			//定义执行方法
			var oThis = this,
				width = 0,
				height = 0;
			this.load = bindFunction(this, this._load);
			this.resize = bindFunction(this, this._resize);
			this.delayLoad = function() {
				oThis._delay(oThis.load);
			};
			this.delayResize = function() { //防止重复触发bug
				var clientWidth = container.clientWidth,
					clientHeight = container.clientHeight;
				if (clientWidth != width || clientHeight != height) {
					width = clientWidth;
					height = clientHeight;
					oThis._delay(oThis.resize);
				}
			};
			//记录绑定元素方便移除
			this._binder = isWindow ? window : container;
			//绑定scroll和resize事件,如果是window作为容器，需要绑定到window对象上，为了方便移除用了_binder属性来保存绑定对象
			addEventListener(this._binder, "scroll", this.delayLoad);
			isWindow && addEventListener(this._binder, "resize", this.delayResize);
			//获取容器位置参数函数,获取视框范围，一般元素可以通过_getRect方位参数获取程序来获取
			this._getContainerRect = isWindow && ("innerHeight" in window) ?
				function() { //ie下
					return {
						"left": 0,
						"right": window.innerWidth,
						"top": 0,
						"bottom": window.innerHeight
					}
				} : function() { //其他浏览器
					return oThis._getRect(container);
				};
			//设置获取scroll值函数
			this._getScroll = isWindow ?
				function() {
					return {
						"left": getScrollLeft(),
						"top": getScrollTop()
					}
				} : function() {
					return {
						"left": container.scrollLeft,
						"top": container.scrollTop
					}
				};
			return container;
		},
		//初始化模式设置,选择加载模式,程序会对静态加载的情况尽可能做优化，所以应该优先选择静态加载模式。
		_initMode: function() {
			switch (this.options.mode.toLowerCase()) {
				case "vertical":
					//垂直方向
					this._initStatic("vertical", "vertical");
					break;
				case "horizontal":
					//水平方向
					this._initStatic("horizontal", "horizontal");
					break;
				case "cross":
				case "cross-vertical":
					//垂直正交方向
					this._initStatic("cross", "vertical");
					break;
				case "cross-horizontal":
					//水平正交方向
					this._initStatic("cross", "horizontal");
					break;
				case "dynamic":
					//动态加载,其中"dynamic"模式是一般的加载方式，没有约束条件，但也没有任何优化。
				default:
					this._loadData = this._loadDynamic;
			}
		},
		//初始化静态加载设置,传递两个参数mode（模式）和direction（方向
		_initStatic: function(mode, direction) {
			//设置模式
			var isVertical = direction == "vertical";
			if (mode == "cross") {
				this._crossDirection = bindFunction(this, this._getCrossDirection, isVertical ? "_verticalDirection" : "_horizontalDirection", isVertical ? "_horizontalDirection" : "_verticalDirection");
			};
			//设置元素
			var pos = isVertical ? "top" : "left",
				sortFunction = function(x, y) {
					return x._rect[pos] - y._rect[pos];
				},
				getRect = function(elem) {
					elem._rect = this._getRect(elem);
					return elem;
				};
			this._setElems = function() { //转换数组并排序,一个是记录元素的坐标参数，还有是把加载集合用map转换成数组并排序
				this._elems = map(this._elems, getRect, this).sort(sortFunction);
			};
			//设置加载函数
			//在"_vertical"方向，compare可能是：
			//_verticalBeforeRange：垂直平方向上判断元素是否超过加载范围的上边；
			//_verticalAfterRange：垂直方向上判断元素是否超过加载范围的下边。
			//在"horizontal"方向，compare可能是：
			//_horizontalBeforeRange：水平方向上判断元素是否超过加载范围的左边；
			//_horizontalAfterRange：水平方向上判断元素是否超过加载范围的右边。

			this._loadData = bindFunction(this, this._loadStatic, "_" + mode + "Direction", bindFunction(this, this._outofRange, mode, "_" + direction + "BeforeRange"), bindFunction(this, this._outofRange, mode, "_" + direction + "AfterRange"));
		},
		//延时程序
		//一般情况下，触发程序会绑定到容器的scroll和resize事件中。但很多时候scroll和resize会被连续触发执行，大量连续的执行会占用很多资源。为了防止无意义的连续执行，程序设置了一个_delay方法来做延时
		_delay: function(run) {
			clearTimeout(this._timer);
			if (this.isFinish()) return;
			var oThis = this,
				delay = this.delay;
			if (this._lock) { //防止连续触发
				this._timer = setTimeout(function() {
						oThis._delay(run);
					},
					delay);
			} else {
				this._lock = true;
				run();
				setTimeout(function() {
						oThis._lock = false;
					},
					delay);
			}
		},
		//重置范围参数并加载数据
		_resize: function(change) {
			if (this.isFinish()) return;
			this._rect = this._getContainerRect();
			//位置改变的话需要重置元素位置
			if (change) {
				this._setElems();
			}
			this._load(true);
		},
		//加载程序
		_load: function(force) {
			if (this.isFinish()) return;
			//先根据位置参数、滚动值和阈值计算_range加载范围参数
			var rect = this._rect,
				scroll = this._getScroll(),
				left = scroll.left,
				top = scroll.top,
				threshold = Math.max(0, this.threshold | 0); //threshold阈值的作用是在视框范围的基础上增大加载范围，实现类似预加载的功能。
			//记录原始加载范围参数
			this._range = {
					top: rect.top + top - threshold,
					bottom: rect.bottom + top + threshold,
					left: rect.left + left - threshold,
					right: rect.right + left + threshold
				}
				//加载数据
			this.beforeLoad();
			this._loadData(force);
		},
		//动态加载程序
		_loadDynamic: function() {
			this._elems = filter(this._elems,
				function(elem) {
					return !this._insideRange(elem);
				},
				this);
		},
		//静态加载程序
		_loadStatic: function(direction, beforeRange, afterRange, force) {
			//获取方向
			direction = this[direction](force);
			if (!direction) return;
			//根据方向历遍图片对象
			var elems = this._elems,
				i = this._index,
				begin = [],
				middle = [],
				end = [];
			//回到_loadStatic程序，根据方向判断，如果是向后滚动，先根据索引，取出加载范围前面的元素，保存到begin：
			if (direction > 0) { //向后滚动
				//这一部分肯定在加载范围外，不需要再历遍，再向后历遍集合
				begin = elems.slice(0, i);
				//当afterRange判断超过加载范围后面，根据当前索引取出后面的元素，保存到end。然后修正索引，给下一次使用
				for (var len = elems.length; i < len; i++) {
					if (afterRange(middle, elems[i])) {
						end = elems.slice(i + 1);
						break;
					}
				}
				i = begin.length + middle.length - 1;
			} else { //向前滚动
				end = elems.slice(i + 1);
				for (; i >= 0; i--) {
					if (beforeRange(middle, elems[i])) {
						begin = elems.slice(0, i);
						break;
					}
				}
				middle.reverse();
			};
			//最后修正一下索引，合并begin、middle和end成为新的加载集合
			this._index = Math.max(0, i);
			this._elems = begin.concat(middle, end);
		},
		//垂直和水平滚动方向获取程序
		_verticalDirection: function(force) {
			return this._getDirection(force, "top");
		},
		_horizontalDirection: function(force) {
			return this._getDirection(force, "left");
		},
		//滚动方向获取程序
		_getDirection: function(force, scroll) {
			//原理是通过_getScroll获取当前的滚动值跟上一次的滚动值_lastScroll相差的结果来判断。如果结果是0，说明没有滚动，如果大于0，说明是向后滚动，否则就是向前滚动。然后记录当前滚动值作为下一次的参考值。
			var now = this._getScroll()[scroll],
				_scroll = this._lastScroll;
			//如果是强制执行（force为true），就重置_index属性为0，并返回1，模拟初始向后滚动的情况。强制执行适合在不能根据方向做优化的情况下使用，例如第一次加载、resize、刷新等。这时虽然不能做优化，但保证了加载的准确性。
			if (force) {
				_scroll[scroll] = now;
				this._index = 0;
				return 1;
			}
			var old = _scroll[scroll];
			_scroll[scroll] = now;
			return now - old;
		},
		//cross滚动方向获取程序
		_getCrossDirection: function(primary, secondary, force) {
			var direction;
			if (!force) {
				direction = this[primary]();
				secondary = this[secondary]();
				if (!direction && !secondary) { //无滚动
					return 0;
				} else if (!direction) { //次方向滚动
					if (this._direction) {
						direction = -this._direction; //用上一次的相反方向
					} else {
						force = true; //没有记录过方向
					}
				} else if (secondary && direction * this._direction >= 0) {
					force = true; //同时滚动并且方向跟上一次滚动相同
				}
			}
			if (force) {
				this._lastScroll = this._getScroll();
				this._index = 0;
				direction = 1;
			}
			return (this._direction = direction);
		},
		//动态加载使用，判断是否加载范围内,用_insideRange程序来判断元素是否在加载范围内，并用filter筛选出加载范围外的元素，重新设置加载集合
		_insideRange: function(elem, mode) {
			//先用元素位置和加载范围参数作比较，判断出元素是否在加载范围内
			var range = this._range,
				rect = elem._rect || this._getRect(elem), //会用_getRect程序获取加载元素的位置信息
				insideH = rect.right >= range.left && rect.left <= range.right,
				insideV = rect.bottom >= range.top && rect.top <= range.bottom,
				inside = {
					"horizontal": insideH,
					"vertical": insideV,
					"cross": insideH && insideV
				}[mode || "cross"];
			//在加载范围内加载数据
			if (inside) {
				this._onLoadData(elem);
			};
			return inside;
		},
		//判断是否超过加载范围
		//先用_insideRange判断元素是否在加载范围内，不是的话把元素保存到middle，再用compare判断是否超过加载范围。
		_outofRange: function(mode, compare, middle, elem) {
			if (!this._insideRange(elem, mode)) {
				middle.push(elem);
				return this[compare](elem._rect);
			}
		},
		_horizontalBeforeRange: function(rect) {
			return rect.right < this._range.left;
		},
		_horizontalAfterRange: function(rect) {
			return rect.left > this._range.right;
		},
		_verticalBeforeRange: function(rect) {
			return rect.bottom < this._range.top;
		},
		_verticalAfterRange: function(rect) {
			return rect.top > this._range.bottom;
		},
		//获取位置参数，获取视框范围，该获取在IE下无效
		_getRect: function(node) {
			var n = node,
				left = 0,
				top = 0;
			while (n) {
				left += n.offsetLeft;
				top += n.offsetTop;
				n = n.offsetParent;
			};
			return {
				"left": left,
				"right": left + node.offsetWidth,
				"top": top,
				"bottom": top + node.offsetHeight
			};
		},
		//是否完成加载
		isFinish: function() {
			if (!this._elems || !this._elems.length) {
				this.dispose();
				return true;
			} else {
				return false;
			}
		},
		//销毁程序
		dispose: function(load) {
			clearTimeout(this._timer);
			if (this._elems || this._binder) {
				//加载全部元素
				if (load && this._elems) {
					each(this._elems, function() {
						this._onLoadData.apply(this, arguments);
					});
				}
				//清除关联
				removeEventListener(this._binder, "scroll", this.delayLoad);
				removeEventListener(this._binder, "resize", this.delayResize);
				this._elems = this._binder = null;
			}
		}
	};

	if (typeof define === 'function' && define['amd'])
		define("LazyLoad", [], function() {
			return LazyLoad;
		});
	/* Global */
	else
		window['LazyLoad'] = LazyLoad;

}));