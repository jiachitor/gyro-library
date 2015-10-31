/*缩放            "图片切割\Resize插件.html"*/

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
			if (fnHandler) {
				oTarget.detachEvent("on" + sEventType, fnHandler);
			} else {
				oTarget.detachEvent("on" + sEventType);
			}
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

	//缩放程序
	var Resize = function(obj, options) {
		this._initialize.apply(this, arguments);
	};

	Resize.prototype = {
		//缩放对象
		_initialize: function(obj, options) {
			typeof(obj) == "object" ? this._obj = obj: this._obj = document.getElementById(obj); //缩放对象
			this._styleWidth = this._styleHeight = this._styleLeft = this._styleTop = 0; //样式参数
			this._sideRight = this._sideDown = this._sideLeft = this._sideUp = 0; //坐标参数
			this._fixLeft = this._fixTop = 0; //定位参数
			this._scaleLeft = this._scaleTop = 0; //定位坐标
			this._mxSet = function() {}; //范围设置程序
			this._mxRightWidth = this._mxDownHeight = this._mxUpHeight = this._mxLeftWidth = 0; //范围参数
			this._mxScaleWidth = this._mxScaleHeight = 0; //比例范围参数
			this._fun = function() {}; //缩放执行程序
			//获取边框宽度
			var _style = curStyle(this._obj);
			this._borderX = (parseInt(_style.borderLeftWidth) || 0) + (parseInt(_style.borderRightWidth) || 0);
			this._borderY = (parseInt(_style.borderTopWidth) || 0) + (parseInt(_style.borderBottomWidth) || 0);
			//事件对象(用于绑定移除事件)
			this._fR = bindAsEventListener(this, this._Resize);
			this._fS = bindFunction(this, this._Stop);

			this._SetOptions(options);
			//范围限制
			this.Max = !!this.options.Max;
			this._mxContainer = document.getElementById(this.options.mxContainer) || null;
			this.mxLeft = Math.round(this.options.mxLeft);
			this.mxRight = Math.round(this.options.mxRight);
			this.mxTop = Math.round(this.options.mxTop);
			this.mxBottom = Math.round(this.options.mxBottom);
			//宽高限制
			this.Min = !!this.options.Min;
			this.minWidth = Math.round(this.options.minWidth);
			this.minHeight = Math.round(this.options.minHeight);
			//按比例缩放
			this.Scale = !!this.options.Scale;
			this.Ratio = Math.max(this.options.Ratio, 0);

			this.onResize = this.options.onResize;

			this._obj.style.position = "absolute";
			!this._mxContainer || curStyle(this._mxContainer).position == "relative" || (this._mxContainer.style.position = "relative");
		},
		//设置默认属性
		_SetOptions: function(options) {
			this.options = { //默认值
				Max: false, //是否设置范围限制(为true时下面mx参数有用)
				mxContainer: "", //指定限制在容器内
				mxLeft: 0, //左边限制
				mxRight: 9999, //右边限制
				mxTop: 0, //上边限制
				mxBottom: 9999, //下边限制
				Min: false, //是否最小宽高限制(为true时下面min参数有用)
				minWidth: 50, //最小宽度
				minHeight: 50, //最小高度
				Scale: false, //是否按比例缩放
				Ratio: 0, //缩放比例(宽/高)
				onResize: function() {} //缩放时执行
			};
			extend(this.options, options || {});
		},
		//设置触发对象
		_Set: function(resize, side) {
			var resize = document.getElementById(resize),
				fun;
			if (!resize) return;
			//根据方向设置
			switch (side.toLowerCase()) { //toLowerCase 方法 返回一个字符串，该字符串中的字母被转换为小写字母。
				case "up":
					fun = this.Up;
					break;
				case "down":
					fun = this.Down;
					break;
				case "left":
					fun = this.Left;
					break;
				case "right":
					fun = this.Right;
					break;
				case "left-up":
					fun = this.LeftUp;
					break;
				case "right-up":
					fun = this.RightUp;
					break;
				case "left-down":
					fun = this.LeftDown;
					break;
				case "right-down":
				default:
					fun = this.RightDown;
			};
			//设置触发对象
			//利用bindAsEventListener将 fun变量的值 添加到this._Start的arguments中，使该参数具有动态性
			addEventListener(resize, "mousedown", bindAsEventListener(this, this._Start, fun));
		},
		//准备缩放
		_Start: function(e, fun, touch) {
			//防止冒泡(跟拖放配合时设置)
			e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
			//设置执行程序
			this._fun = fun;
			//样式参数值
			this._styleWidth = this._obj.clientWidth;
			this._styleHeight = this._obj.clientHeight;
			this._styleLeft = this._obj.offsetLeft;
			this._styleTop = this._obj.offsetTop;
			//四条边定位坐标
			this._sideLeft = e.clientX - this._styleWidth;
			this._sideRight = e.clientX + this._styleWidth;
			this._sideUp = e.clientY - this._styleHeight;
			this._sideDown = e.clientY + this._styleHeight;
			//top和left定位参数
			this._fixLeft = this._styleLeft + this._styleWidth;
			this._fixTop = this._styleTop + this._styleHeight;
			//缩放比例
			if (this.Scale) {
				//设置比例
				this.Ratio = Math.max(this.Ratio, 0) || this._styleWidth / this._styleHeight;
				//left和top的定位坐标
				this._scaleLeft = this._styleLeft + this._styleWidth / 2;
				this._scaleTop = this._styleTop + this._styleHeight / 2;
			};
			//范围限制
			if (this.Max) {
				//设置范围参数,默认数值
				var mxLeft = this.mxLeft,
					mxRight = this.mxRight,
					mxTop = this.mxTop,
					mxBottom = this.mxBottom;
				//如果设置了容器，再修正范围参数
				if (!!this._mxContainer) {
					mxLeft = Math.max(mxLeft, 0);
					mxTop = Math.max(mxTop, 0);
					mxRight = Math.min(mxRight, this._mxContainer.clientWidth);
					mxBottom = Math.min(mxBottom, this._mxContainer.clientHeight);
				};
				//根据最小值再修正
				mxRight = Math.max(mxRight, mxLeft + (this.Min ? this.minWidth : 0) + this._borderX);
				mxBottom = Math.max(mxBottom, mxTop + (this.Min ? this.minHeight : 0) + this._borderY);
				//由于转向时要重新设置所以写成function形式
				this._mxSet = function() {
					this._mxRightWidth = mxRight - this._styleLeft - this._borderX;
					this._mxDownHeight = mxBottom - this._styleTop - this._borderY;
					this._mxUpHeight = Math.max(this._fixTop - mxTop, this.Min ? this.minHeight : 0);
					this._mxLeftWidth = Math.max(this._fixLeft - mxLeft, this.Min ? this.minWidth : 0);
				};
				this._mxSet();
				//有缩放比例下的范围限制
				if (this.Scale) {
					this._mxScaleWidth = Math.min(this._scaleLeft - mxLeft, mxRight - this._scaleLeft - this._borderX) * 2;
					this._mxScaleHeight = Math.min(this._scaleTop - mxTop, mxBottom - this._scaleTop - this._borderY) * 2;
				};
			};
			//mousemove时缩放 mouseup时停止
			addEventListener(document, "mousemove", this._fR); //执行_Resize
			addEventListener(document, "mouseup", this._fS);
			if (Browser.ie) {
				addEventListener(this._obj, "losecapture", this._fS);
				this._obj.setCapture();
			} else {
				addEventListener(window, "blur", this._fS);
				e.preventDefault();
			};
		},
		//缩放
		_Resize: function(e) {
			//清除选择
			window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
			//执行缩放程序
			this._fun(e);
			//设置样式，变量必须大于等于0否则ie出错
			setStyle(this._obj, {
				width: this._styleWidth + "px",
				height: this._styleHeight + "px",
				top: this._styleTop + "px",
				left: this._styleLeft + "px"
			});
			//附加程序
			this.onResize();
		},
		//缩放程序
		//上
		Up: function(e) {
			this.RepairY(this._sideDown - e.clientY, this._mxUpHeight);
			this.RepairTop();
			this.TurnDown(this.Down);
		},
		//下
		Down: function(e) {
			this.RepairY(e.clientY - this._sideUp, this._mxDownHeight);
			this.TurnUp(this.Up);
		},
		//右
		Right: function(e) {
			this.RepairX(e.clientX - this._sideLeft, this._mxRightWidth);
			this.TurnLeft(this.Left);
		},
		//左
		Left: function(e) {
			this.RepairX(this._sideRight - e.clientX, this._mxLeftWidth);
			this.RepairLeft();
			this.TurnRight(this.Right);
		},
		//右下
		RightDown: function(e) {
			this.RepairAngle(
				e.clientX - this._sideLeft, this._mxRightWidth, e.clientY - this._sideUp, this._mxDownHeight);
			this.TurnLeft(this.LeftDown) || this.Scale || this.TurnUp(this.RightUp);
		},
		//右上
		RightUp: function(e) {
			this.RepairAngle(
				e.clientX - this._sideLeft, this._mxRightWidth, this._sideDown - e.clientY, this._mxUpHeight);
			this.RepairTop();
			this.TurnLeft(this.LeftUp) || this.Scale || this.TurnDown(this.RightDown);
		},
		//左下
		LeftDown: function(e) {
			this.RepairAngle(
				this._sideRight - e.clientX, this._mxLeftWidth, e.clientY - this._sideUp, this._mxDownHeight);
			this.RepairLeft();
			this.TurnRight(this.RightDown) || this.Scale || this.TurnUp(this.LeftUp);
		},
		//左上
		LeftUp: function(e) {
			this.RepairAngle(
				this._sideRight - e.clientX, this._mxLeftWidth, this._sideDown - e.clientY, this._mxUpHeight);
			this.RepairTop();
			this.RepairLeft();
			this.TurnRight(this.RightUp) || this.Scale || this.TurnDown(this.LeftDown);
		},
		//修正程序
		//水平方向
		RepairX: function(iWidth, mxWidth) {
			iWidth = this.RepairWidth(iWidth, mxWidth);
			if (this.Scale) {
				var iHeight = this.RepairScaleHeight(iWidth);
				if (this.Max && iHeight > this._mxScaleHeight) {
					iHeight = this._mxScaleHeight;
					iWidth = this.RepairScaleWidth(iHeight);
				} else if (this.Min && iHeight < this.minHeight) {
					var tWidth = this.RepairScaleWidth(this.minHeight);
					if (tWidth < mxWidth) {
						iHeight = this.minHeight;
						iWidth = tWidth;
					}
				};
				this._styleHeight = iHeight;
				this._styleTop = this._scaleTop - iHeight / 2;
			}
			this._styleWidth = iWidth;
		},
		//垂直方向
		RepairY: function(iHeight, mxHeight) {
			iHeight = this.RepairHeight(iHeight, mxHeight);
			if (this.Scale) {
				var iWidth = this.RepairScaleWidth(iHeight);
				if (this.Max && iWidth > this._mxScaleWidth) {
					iWidth = this._mxScaleWidth;
					iHeight = this.RepairScaleHeight(iWidth);
				} else if (this.Min && iWidth < this.minWidth) {
					var tHeight = this.RepairScaleHeight(this.minWidth);
					if (tHeight < mxHeight) {
						iWidth = this.minWidth;
						iHeight = tHeight;
					}
				};
				this._styleWidth = iWidth;
				this._styleLeft = this._scaleLeft - iWidth / 2;
			}
			this._styleHeight = iHeight;
		},
		//对角方向
		RepairAngle: function(iWidth, mxWidth, iHeight, mxHeight) {
			iWidth = this.RepairWidth(iWidth, mxWidth);
			if (this.Scale) {
				iHeight = this.RepairScaleHeight(iWidth);
				if (this.Max && iHeight > mxHeight) {
					iHeight = mxHeight;
					iWidth = this.RepairScaleWidth(iHeight);
				} else if (this.Min && iHeight < this.minHeight) {
					var tWidth = this.RepairScaleWidth(this.minHeight);
					if (tWidth < mxWidth) {
						iHeight = this.minHeight;
						iWidth = tWidth;
					}
				};
			} else {
				iHeight = this.RepairHeight(iHeight, mxHeight);
			};
			this._styleWidth = iWidth;
			this._styleHeight = iHeight;
		},
		//top
		RepairTop: function() {
			this._styleTop = this._fixTop - this._styleHeight;
		},
		//left
		RepairLeft: function() {
			this._styleLeft = this._fixLeft - this._styleWidth;
		},
		//height
		RepairHeight: function(iHeight, mxHeight) {
			iHeight = Math.min(this.Max ? mxHeight : iHeight, iHeight);
			iHeight = Math.max(this.Min ? this.minHeight : iHeight, iHeight, 0);
			return iHeight;
		},
		//width
		RepairWidth: function(iWidth, mxWidth) {
			iWidth = Math.min(this.Max ? mxWidth : iWidth, iWidth);
			iWidth = Math.max(this.Min ? this.minWidth : iWidth, iWidth, 0);
			return iWidth;
		},
		//比例高度
		RepairScaleHeight: function(iWidth) {
			return Math.max(Math.round((iWidth + this._borderX) / this.Ratio - this._borderY), 0);
		},
		//比例宽度
		RepairScaleWidth: function(iHeight) {
			return Math.max(Math.round((iHeight + this._borderY) * this.Ratio - this._borderX), 0);
		},
		//转向程序
		//转右
		TurnRight: function(fun) {
			if (!(this.Min || this._styleWidth)) {
				this._fun = fun;
				this._sideLeft = this._sideRight;
				this.Max && this._mxSet();
				return true;
			}
		},
		//转左
		TurnLeft: function(fun) {
			if (!(this.Min || this._styleWidth)) {
				this._fun = fun;
				this._sideRight = this._sideLeft;
				this._fixLeft = this._styleLeft;
				this.Max && this._mxSet();
				return true;
			}
		},
		//转上
		TurnUp: function(fun) {
			if (!(this.Min || this._styleHeight)) {
				this._fun = fun;
				this._sideDown = this._sideUp;
				this._fixTop = this._styleTop;
				this.Max && this._mxSet();
				return true;
			}
		},
		//转下
		TurnDown: function(fun) {
			if (!(this.Min || this._styleHeight)) {
				this._fun = fun;
				this._sideUp = this._sideDown;
				this.Max && this._mxSet();
				return true;
			}
		},
		//停止缩放
		_Stop: function() {
			removeEventListener(document, "mousemove", this._fR);
			removeEventListener(document, "mouseup", this._fS);
			if (Browser.ie) {
				removeEventListener(this._obj, "losecapture", this._fS);
				this._obj.releaseCapture();
			} else {
				removeEventListener(window, "blur", this._fS);
			}
		}
	};

	if (typeof define === 'function' && define['amd'])
		define("Resize", [], function() {
			return Resize;
		});
	/* Global */
	else
		window['Resize'] = Resize;

}));