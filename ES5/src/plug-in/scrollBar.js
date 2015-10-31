/*滑动条       "滑动比例条\ScrollBar.html"*/

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


	//滑动条程序
	var ScrollBar = function() {
		this.initialize.apply(this, arguments);
	};

	ScrollBar.prototype = {
		//容器对象，滑块
		initialize: function(container, bar, options) {
			this.Container = document.getElementById(container); //容器对象
			this.Bar = document.getElementById(bar); //滑块
			this._timer = null; //自动滑移的定时器
			this._ondrag = false; //解决ie的click问题
			//是否最小值、最大值、中间值
			this._IsMin = this._IsMax = this._IsMid = false;
			//实例化一个拖放对象，并限定范围
			this._drag = new Drag(bar, {
				Limit: true,
				mxContainer: container,
				onStart: bindFunction(this, this.DragStart),
				onStop: bindFunction(this, this.DragStop),
				onMove: bindFunction(this, this.Move)
			});

			this.SetOptions(options);

			this.WheelSpeed = Math.max(0, this.options.WheelSpeed);
			this.KeySpeed = Math.max(0, this.options.KeySpeed);

			this.MinValue = this.options.MinValue;
			this.MaxValue = this.options.MaxValue;

			this.RunTime = Math.max(1, this.options.RunTime);
			this.RunStep = Math.max(1, this.options.RunStep);

			this.Ease = !!this.options.Ease;
			this.EaseStep = Math.max(1, this.options.EaseStep);

			this.onMin = this.options.onMin;
			this.onMax = this.options.onMax;
			this.onMid = this.options.onMid;

			this.onDragStart = this.options.onDragStart;
			this.onDragStop = this.options.onDragStop;
			this.onMove = this.options.onMove;

			this._horizontal = !!this.options.Horizontal; //一般不允许修改
			//锁定拖放方向
			this._drag[this._horizontal ? "LockY" : "LockX"] = true;

			//点击控制
			addEventListener(this.Container, "click", this._BindAsEventListener(this,
				function(e) {
					this._ondrag || this.ClickCtrl(e);
				}));
			//取消冒泡，防止跟Container的click冲突
			addEventListener(this.Bar, "click", this._BindAsEventListener(this,
				function(e) {
					e.stopPropagation();
				}));

			//设置鼠标滚轮控制
			this.WheelBind(this.Container);
			//设置方向键控制
			this.KeyBind(this.Container);
			//修正获取焦点
			var oFocus = Browser.ie ? (this.KeyBind(this.Bar), this.Bar) : this.Container;
			addEventListener(this.Bar, "mousedown",
				function() {
					oFocus.focus();
				});
			//ie鼠标捕获和ff的取消默认动作都不能获得焦点，所以要手动获取
			//如果ie把focus设置到Container，那么在出现滚动条时ie的focus可能会导致自动滚屏
		},
		//设置默认属性
		SetOptions: function(options) {
			this.options = { //默认值
				MinValue: 0, //最小值
				MaxValue: 100, //最大值
				WheelSpeed: 5, //鼠标滚轮速度,越大越快(0则取消鼠标滚轮控制)
				KeySpeed: 50, //方向键滚动速度,越大越慢(0则取消方向键控制)
				Horizontal: true, //是否水平滑动
				RunTime: 20, //自动滑移的延时时间,越大越慢
				RunStep: 2, //自动滑移每次滑动的百分比
				Ease: false, //是否缓动
				EaseStep: 5, //缓动等级,越大越慢
				onMin: function() {}, //最小值时执行
				onMax: function() {}, //最大值时执行
				onMid: function() {}, //中间值时执行
				onDragStart: function() {}, //拖动开始时执行
				onDragStop: function() {}, //拖动结束时执行
				onMove: function() {} //滑动时执行
			};
			extend(this.options, options || {});
		},
		_BindAsEventListener: function(object, fun) {
			function Event(e) {
				var oEvent = Browser.ie ? window.event : e;
				if (Browser.ie) {
					oEvent.pageX = oEvent.clientX + document.documentElement.scrollLeft;
					oEvent.pageY = oEvent.clientY + document.documentElement.scrollTop;
					oEvent.preventDefault = function() {
						this.returnValue = false;
					};
					oEvent.detail = oEvent.wheelDelta / (-40);
					oEvent.stopPropagation = function() {
						this.cancelBubble = true;
					};
				}
				return oEvent;
			};
			return function(event) {
				return fun.call(object, Event(event));
			};
		},
		//开始拖放滑动前执行的
		DragStart: function() {
			this.Stop();
			this.onDragStart(); //这里由实例化时定义
			this._ondrag = true;
		},
		//结束拖放滑动后执行的
		DragStop: function() {
			this.onDragStop(); //这里由实例化时定义
			setTimeout(bindFunction(this,
				function() {
					this._ondrag = false;
				}), 10);
		},
		//滑动中执行的
		Move: function() {
			this.onMove();

			var percent = this.GetPercent(); //获取百分比

			//最小值判断
			if (percent > 0) {
				this._IsMin = false;
			} else {
				if (!this._IsMin) {
					this.onMin();
					this._IsMin = true;
				}
			};
			//最大值判断
			if (percent < 1) {
				this._IsMax = false;
			} else {
				if (!this._IsMax) {
					this.onMax();
					this._IsMax = true;
					//然后阻止滑动条拖动
					/*do something*/
				}
			};
			//中间值判断
			if (percent > 0 && percent < 1) {
				if (!this._IsMid) {
					this.onMid();
					this._IsMid = true;
				}
			} else {
				this._IsMid = false;
			};
		},
		//鼠标点击控制
		ClickCtrl: function(e) {
			var o = this.Container,
				iLeft = o.offsetLeft,
				iTop = o.offsetTop; // offsetTop 可以获得 HTML 元素距离上方或外层元素的位置
			while (o.offsetParent) {
				o = o.offsetParent;
				iLeft += o.offsetLeft;
				iTop += o.offsetTop;
			};
			//考虑有滚动条，要用pageX和pageY
			this.EasePos(e.pageX - iLeft - this.Bar.offsetWidth / 2, e.pageY - iTop - this.Bar.offsetHeight / 2);
		},
		//鼠标滚轮控制
		WheelCtrl: function(e) {
			var i = this.WheelSpeed * e.detail;
			this.SetPos(this.Bar.offsetLeft + i, this.Bar.offsetTop + i);
			//防止触发其他滚动条
			e.preventDefault();
		},
		//绑定鼠标滚轮
		WheelBind: function(o) {
			//鼠标滚轮控制
			addEventListener(o, Browser.ie ? "mousewheel" : "DOMMouseScroll", this._BindAsEventListener(this, this.WheelCtrl));
		},
		//方向键控制
		KeyCtrl: function(e) {
			if (this.KeySpeed) {
				var iLeft = this.Bar.offsetLeft,
					iWidth = (this.Container.clientWidth - this.Bar.offsetWidth) / this.KeySpeed,
					iTop = this.Bar.offsetTop,
					iHeight = (this.Container.clientHeight - this.Bar.offsetHeight) / this.KeySpeed;
				//根据按键设置值
				switch (e.keyCode) {
					case 37: //左
						iLeft -= iWidth;
						break;
					case 38: //上
						iTop -= iHeight;
						break;
					case 39: //右
						iLeft += iWidth;
						break;
					case 40: //下
						iTop += iHeight;
						break;
					default:
						return; //不是方向按键返回
				}
				this.SetPos(iLeft, iTop);
				//防止触发其他滚动条
				e.preventDefault();
			}
		},
		//绑定方向键
		KeyBind: function(o) {
			addEventListener(o, "keydown", this._BindAsEventListener(this, this.KeyCtrl));
			//设置tabIndex使设置对象能支持focus
			o.tabIndex = -1;
			//取消focus时出现的虚线框
			Browser.ie || (o.style.outline = "none");
		},
		/*假设 obj 为某个 HTML 控件。
		offsetParent 获取定义对象 offsetTop 和 offsetLeft 属性的容器对象的引用。
		obj.offsetTop 指 obj 相对于版面或由 offsetParent 属性指定的父坐标的计算上侧位置，整型，单位像素。offsetTop 可以获得 HTML 元素距离上方或外层元素的位置
		obj.offsetLeft 指 obj 相对于版面或由 offsetParent 属性指定的父坐标的计算左侧位置，整型，单位像素。
		obj.offsetWidth 指 obj 控件自身的绝对宽度，不包括因 overflow 而未显示的部分，也就是其实际占据的宽度，整型，单位像素。
		obj.offsetHeight 指 obj 控件自身的绝对高度，不包括因 overflow 而未显示的部分，也就是其实际占据的高度，整型，单位像素。*/
		//获取百分比
		GetPercent: function() {
			//根据滑动条滑块取百分比
			return this._horizontal ? this.Bar.offsetLeft / (this.Container.clientWidth - this.Bar.offsetWidth) : this.Bar.offsetTop / (this.Container.clientHeight - this.Bar.offsetHeight);
		},
		//设置百分比位置
		SetPercent: function(value) {
			//根据百分比设置滑块位置
			this.EasePos((this.Container.clientWidth - this.Bar.offsetWidth) * value, (this.Container.clientHeight - this.Bar.offsetHeight) * value);
		},
		//获取当前值
		GetValue: function() {
			//根据最大最小值和滑动百分比取值
			return this.MinValue + this.GetPercent() * (this.MaxValue - this.MinValue);
		},
		//设置值位置
		SetValue: function(value) {
			//根据最大最小值和参数值设置滑块位置
			this.SetPercent((value - this.MinValue) / (this.MaxValue - this.MinValue));
		},
		//自动滑移(是否递增)
		Run: function(bIncrease) {
			this.Stop();
			//修正一下bIncrease
			bIncrease = !!bIncrease;
			//根据是否递增来设置值
			var percent = this.GetPercent() + (bIncrease ? 1 : -1) * this.RunStep / 100;

			this.SetPos((this.Container.clientWidth - this.Bar.offsetWidth) * percent, (this.Container.clientHeight - this.Bar.offsetHeight) * percent);
			//如果没有到极限值就继续滑移
			if (!(bIncrease ? this._IsMax : this._IsMin)) {
				this._timer = setTimeout(bindFunction(this, this.Run, bIncrease), this.RunTime);
			}
		},
		//停止滑移
		Stop: function() {
			clearTimeout(this._timer);
		},
		//缓动滑移
		EasePos: function(iLeftT, iTopT) {
			this.Stop();
			//必须是整数，否则可能死循环
			iLeftT = Math.round(iLeftT);
			iTopT = Math.round(iTopT);
			//如果没有设置缓动
			if (!this.Ease) {
				this.SetPos(iLeftT, iTopT);
				return;
			};
			//获取缓动参数
			var iLeftN = this.Bar.offsetLeft,
				iLeftS = this.GetStep(iLeftT, iLeftN),
				iTopN = this.Bar.offsetTop,
				iTopS = this.GetStep(iTopT, iTopN);
			//如果参数有值
			if (this._horizontal ? iLeftS : iTopS) {
				//设置位置
				this.SetPos(iLeftN + iLeftS, iTopN + iTopS);
				//如果没有到极限值则继续缓动
				if (this._IsMid) {
					this._timer = setTimeout(bindFunction(this, this.EasePos, iLeftT, iTopT), this.RunTime);
				};
			};
		},
		//获取步长
		GetStep: function(iTarget, iNow) {
			var iStep = (iTarget - iNow) / this.EaseStep;
			if (iStep == 0) return 0;
			if (Math.abs(iStep) < 1) return (iStep > 0 ? 1 : -1);
			return iStep;
		},
		//设置滑块位置
		SetPos: function(iLeft, iTop) {
			this.Stop();
			this._drag._SetPos(iLeft, iTop);
		}
	};

	if (typeof define === 'function' && define['amd'])
		define("ScrollBar", [], function() {
			return ScrollBar;
		});
	/* Global */
	else
		window['ScrollBar'] = ScrollBar;

}));