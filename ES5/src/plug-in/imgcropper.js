/*图片切割                 "图片切割\ImgCropper插件.html"*/

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

	function setOpacity(elem, num) {
		if (elem.filters) {
			elem.style.filter = "alpha(opacity=" + num + ")";
		} else {
			elem.style.opacity = num / 100;
		};
	};

	//图片切割
	var ImgCropper = function() {
		this._initialize.apply(this, arguments);
	};

	ImgCropper.prototype = {
		//容器对象,控制层,图片地址
		_initialize: function(container, handle, url, options) {
			this._Container = document.getElementById(container); //容器对象
			this._layHandle = document.getElementById(handle); //控制层
			this.Url = url; //图片地址
			this._layBase = this._Container.appendChild(document.createElement("img")); //底层
			this._layCropper = this._Container.appendChild(document.createElement("img")); //切割层
			this._layCropper.onload = bindFunction(this, this._SetPos);
			//用来设置大小
			this._tempImg = document.createElement("img");
			this._tempImg.onload = bindFunction(this, this._SetSize);

			this._SetOptions(options);
			this.Opacity = Math.round(this.options.Opacity);
			this.layHandleOpacity = this.options.layHandleOpacity;
			this.Color = this.options.Color;
			this.Scale = !!this.options.Scale;
			this.Ratio = Math.max(this.options.Ratio, 0);
			this.Width = Math.round(this.options.Width);
			this.Height = Math.round(this.options.Height);

			//设置预览对象
			var oPreview = document.getElementById(this.options.Preview); //预览对象
			if (oPreview) {
				oPreview.style.position = "relative";
				oPreview.style.overflow = "hidden";
				this.viewWidth = Math.round(this.options.viewWidth);
				this.viewHeight = Math.round(this.options.viewHeight);
				//预览图片对象
				this._view = oPreview.appendChild(document.createElement("img"));
				this._view.style.position = "absolute";
				this._view.onload = bindFunction(this, this._SetPreview);
			};
			//设置拖放
			this._drag = new Drag(this._layHandle, {
				Limit: true,
				mxContainer: container,
				Handle: this._layHandle,
				onMove: bindFunction(this, this._SetPos),
				Transparent: true
			});
			//设置缩放
			this.Resize = !!this.options.Resize;
			if (this.Resize) {
				var op = this.options,
					_resize = new Resize(this._layHandle, {
						mxContainer: this._Container,
						Max: true,
						onResize: bindFunction(this, this._SetPos)
					});
				//设置缩放触发对象
				op.RightDown && (_resize._Set(op.RightDown, "right-down"));
				op.LeftDown && (_resize._Set(op.LeftDown, "left-down"));
				op.RightUp && (_resize._Set(op.RightUp, "right-up"));
				op.LeftUp && (_resize._Set(op.LeftUp, "left-up"));
				op.Right && (_resize._Set(op.Right, "right"));
				op.Left && (_resize._Set(op.Left, "left"));
				op.Down && (_resize._Set(op.Down, "down"));
				op.Up && (_resize._Set(op.Up, "up"));
				//最小范围限制
				this.Min = !!this.options.Min;
				this.minWidth = Math.round(this.options.minWidth);
				this.minHeight = Math.round(this.options.minHeight);
				//设置缩放对象
				this._resize = _resize;
			};
			//设置样式
			this._Container.style.position = "relative";
			this._Container.style.overflow = "hidden";
			this._layHandle.style.zIndex = 200;
			this._layCropper.style.zIndex = 100;
			this._layBase.style.position = this._layCropper.style.position = "absolute";
			this._layBase.style.top = this._layBase.style.left = this._layCropper.style.top = this._layCropper.style.left = 0; //对齐
			setOpacity(this._layHandle, this.layHandleOpacity);
			//初始化设置
			this._Init();
		},
		//设置默认属性
		_SetOptions: function(options) {
			this.options = { //默认值
				Opacity: 50, //透明度(0到100)
				layHandleOpacity: 50, //拖动层透明度(0到100)
				Color: "", //背景色
				Width: 0, //图片高度
				Height: 0, //图片高度
				//缩放触发对象
				Resize: false, //是否设置缩放
				Right: "", //右边缩放对象
				Left: "", //左边缩放对象
				Up: "", //上边缩放对象
				Down: "", //下边缩放对象
				RightDown: "", //右下缩放对象
				LeftDown: "", //左下缩放对象
				RightUp: "", //右上缩放对象
				LeftUp: "", //左上缩放对象
				Min: false, //是否最小宽高限制(为true时下面min参数有用)
				minWidth: 50, //最小宽度
				minHeight: 50, //最小高度
				Scale: false, //是否按比例缩放
				Ratio: 0, //缩放比例(宽/高)
				//预览对象设置
				Preview: "", //预览对象
				viewWidth: 0, //预览宽度
				viewHeight: 0 //预览高度
			};
			extend(this.options, options || {});
		},
		//初始化对象
		_Init: function() {
			//设置背景色
			this.Color && (this._Container.style.backgroundColor = this.Color);
			//设置图片
			this._tempImg.src = this._layBase.src = this._layCropper.src = this.Url;
			//设置透明
			if (Browser.ie) {
				this._layBase.style.filter = "alpha(opacity:" + this.Opacity + ")";
			} else {
				this._layBase.style.opacity = this.Opacity / 100;
			};
			//设置预览对象
			this._view && (this._view.src = this.Url);
			//设置缩放
			if (this.Resize) {
				this._resize.Scale = this.Scale;
				this._resize.Ratio = this.Ratio;
				this._resize.Min = this.Min;
				this._resize.minWidth = this.minWidth;
				this._resize.minHeight = this.minHeight;
			};
		},
		//设置切割样式
		_SetPos: function() {
			//ie6渲染bug
			if (Browser.ie6) {
				this._layHandle.style.zoom = .9;
				this._layHandle.style.zoom = 1;
			};
			//获取位置参数
			var p = this._GetPos();
			//按拖放对象的参数进行切割
			this._layCropper.style.clip = "rect(" + p.Top + "px " + (p.Left + p.Width) + "px " + (p.Top + p.Height) + "px " + p.Left + "px)";
			//设置预览
			this._SetPreview();
		},
		//设置预览效果
		_SetPreview: function() {
			if (this._view) {
				//预览显示的宽和高
				var p = this._GetPos(),
					s = this._GetSize(p.Width, p.Height, this.viewWidth, this.viewHeight),
					scale = s.Height / p.Height;
				//按比例设置参数
				var pHeight = this._layBase.height * scale,
					pWidth = this._layBase.width * scale,
					pTop = p.Top * scale,
					pLeft = p.Left * scale;
				//设置预览对象
				//设置样式
				this._view.style.width = pWidth + "px";
				this._view.style.height = pHeight + "px";
				this._view.style.top = -pTop + "px ";
				this._view.style.left = -pLeft + "px";
				//切割预览图
				this._view.style.clip = "rect(" + pTop + "px " + (pLeft + s.Width) + "px " + (pTop + s.Height) + "px " + pLeft + "px)";
			};
		},
		//设置图片大小
		_SetSize: function() {
			var s = this._GetSize(this._tempImg.width, this._tempImg.height, this.Width, this.Height);
			//设置底图和切割图
			this._layBase.style.width = this._layCropper.style.width = s.Width + "px";
			this._layBase.style.height = this._layCropper.style.height = s.Height + "px";
			//设置拖放范围
			this._drag.mxRight = s.Width;
			this._drag.mxBottom = s.Height;
			//设置缩放范围
			if (this.Resize) {
				this._resize.mxRight = s.Width;
				this._resize.mxBottom = s.Height;
			};
		},
		//获取当前样式
		_GetPos: function() {
			return {
				Top: this._layHandle.offsetTop,
				Left: this._layHandle.offsetLeft,
				Width: this._layHandle.offsetWidth,
				Height: this._layHandle.offsetHeight
			}
		},
		//获取尺寸
		_GetSize: function(nowWidth, nowHeight, fixWidth, fixHeight) {
			var iWidth = nowWidth,
				iHeight = nowHeight,
				scale = iWidth / iHeight;
			//按比例设置
			if (fixHeight) {
				iWidth = (iHeight = fixHeight) * scale;
			};
			if (fixWidth && (!fixHeight || iWidth > fixWidth)) {
				iHeight = (iWidth = fixWidth) / scale;
			};
			//返回尺寸对象
			return {
				Width: iWidth,
				Height: iHeight
			};
		}
	}

	if (typeof define === 'function' && define['amd'])
		define("ImgCropper", [], function() {
			return ImgCropper;
		});
	/* Global */
	else
		window['ImgCropper'] = ImgCropper;

}));