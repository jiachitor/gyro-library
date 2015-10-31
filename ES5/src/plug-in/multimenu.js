/*    multimenu插件-有特效的下拉菜单 */
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

	var Multimenu = function(object) {
		this.menuid = object.id; //菜单ID
		this.thisclass = object.thisclass; //设置当前算中的class
		this.h = []; //h为包含UL的父节点元素，该元素含有一个a 与 ul 元素
		this.c = []; //c为含有所有UL 的数组
		this.init();
	}

	Multimenu.prototype = {
		init: function() {
			var elem = document.getElementById(this.menuid),
				elem_uls = elem.getElementsByTagName('ul'),
				l = elem_uls.length,
				i = 0,
				self = this;

			forEach(elem_uls, function(o, i) {
				var whohover = o.parentNode;
				self.h[i] = whohover;
				self.c[i] = elem_uls[i];
				addEventListener(whohover, "mouseover", function(event) {
					self.ulmenu(i, true);
				});

				if (Browser.chrome) {
					mouseLeave(whohover, function() {
						self.ulmenu(i, false);
					});
				} else {
					addEventListener(whohover, "mouseleave", function(e) {
						self.ulmenu(i, false);
					});
				}
			});
		},
		ulmenu: function(x, f) {
			var self = this,
				t = 15,
				zindex = 50; //	
			var thisUL = this.c[x],
				whohover = this.h[x],
				p = whohover.getElementsByTagName('a')[0];
			clearInterval(thisUL.show);
			thisUL.style.overflow = 'hidden';
			if (f) {
				p.className += ' ' + self.thisclass;
				if (!thisUL.mh) {
					thisUL.style.display = 'block';
					thisUL.style.height = '';
					thisUL.mh = thisUL.offsetHeight; //与if(!thisUL.mh){  相互配合 
					thisUL.style.height = 0;
				}
				if (thisUL.mh == thisUL.offsetHeight) {
					thisUL.style.overflow = 'visible'
				} else {
					thisUL.style.zIndex = zindex;
					zindex++;
					thisUL.show = setInterval(function() {
						self.slowdown(thisUL, 1)
					}, t);
				}
			} else {
				p.className = p.className.replace(self.thisclass, '');
				thisUL.show = setInterval(function() {
					self.slowdown(thisUL, -1)
				}, t);
			}
		},
		slowdown: function(c, f) { //动画效果
			var h = c.offsetHeight,
				s = 6;
			if ((h <= 0 && f != 1) || (h >= c.mh && f == 1)) {
				if (f == 1) {
					c.style.filter = '';
					c.style.opacity = 1;
					c.style.overflow = 'visible';
				}
				clearInterval(c.show);
				return;
			}
			var d = (f == 1) ? Math.ceil((c.mh - h) / s) : Math.ceil(h / s),
				o = h / c.mh; ///三目判断
			c.style.opacity = o;
			c.style.filter = 'alpha(opacity=' + (o * 100) + ')';
			c.style.height = h + (d * f) + 'px';
		}
	}

	if (typeof define === 'function' && define['amd'])
		define("Multimenu", [], function() {
			return Multimenu;
		});
	/* Global */
	else
		window['Multimenu'] = Multimenu;

}));