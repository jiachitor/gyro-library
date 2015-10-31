/* 日历插件            "日期时间\iCalendar 日历插件" */

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

	var tmpContextMenuOn = false;



	var animateID = {};

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

	function stopPropagation(e) {
		if (e && e.stopPropagation && e.preventDefault) { // 非IE
			e.stopPropagation(); // 标准W3C的取消冒泡
			e.preventDefault(); // 取消默认行为
		} else {
			window.event.cancelBubble = true; // IE的取消冒泡方式
			window.event.returnValue = false; // IE的取消默认行为
		};
	};

	function addClass(node, str) {
		if (!new RegExp("(^|\\s+)" + str).test(node.className)) {
			node.className = node.className + " " + str;
		};
	};

	function removeClass(node, str) {
		node.className = node.className.replace(new RegExp("(^|\\s+)" + str), "");
	};

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

	function getScrollTop(node) {
		var doc = node ? node.ownerDocument : document;
		return doc.documentElement.scrollTop || doc.body.scrollTop;
	};

	function getScrollLeft(node) {
		var doc = node ? node.ownerDocument : document;
		return doc.documentElement.scrollLeft || doc.body.scrollLeft;
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



	var Calendar = function(inputid, options) {
		this._initialize(inputid, options);
	};

	Calendar.prototype = {
		_initialize: function(inputid, options) {
			this.SetOptions(options);
			this.con = this.options.calendar;
			this.Cont = document.getElementById(this.con); //主容器
			this.Container = this.Cont.getElementsByTagName("tbody")[0]; //容器(table结构)
			this.input = document.getElementById(inputid);
			this.Days = []; //日期对象列表

			this.Year = this.options.Year || new Date().getFullYear();
			this.Month = this.options.Month || new Date().getMonth() + 1;
			this.Day = this.options.Month || new Date().getDate();

			this.SelectDay = this.options.SelectDay ? new Date(this.options.SelectDay) : null;
			this.onSelectDay = this.options.onSelectDay;
			this.onToday = this.options.onToday;
			this.onFinish = this.options.onFinish;
			this.position = this.options.position;

			this.Draw();
			this._bind();
			if (this.position) {
				this._poprect();
				this._documentClick();
			} else { //当页面上不隐藏日历控件时
				var isWho = getElementsByClassName(this.con, "input", "isWho")[0];
				isWho.value = inputid;
				setStyle(this.input, {
					"display": "none"
				});
			};
			this._bandData();
		},
		//设置默认属性
		SetOptions: function(options) {
			this.options = { //默认值
				calendar: "Calendar", //日历盒子
				position: true, //是否使用弹出定位
				Year: 0, //显示年
				Month: 0, //显示月
				SelectDay: new Date().setDate(10), //选择日期
				onSelectDay: function(o) {
					o.className = "onSelect";
				}, //在选择日期触发
				onToday: function(o) {
					o.className = "onToday";
				}, //在当天日期触发
				onFinish: function() { //日历画完后触发
					this.Hour = this.options.Hour || new Date().getHours();
					this.Minute = this.options.Minute || new Date().getMinutes();
					this.Yearspan = getElementsByClassName(this.con, "span", "CalendarYear")[0];
					this.Monthspan = getElementsByClassName(this.con, "span", "CalendarMonth")[0];
					this.Hourinput = getElementsByClassName(this.con, "input", "CalendarHour")[0];
					this.Minuteinput = getElementsByClassName(this.con, "input", "CalendarMinute")[0];
					this.Yearspan.innerHTML = this.Year;
					this.Monthspan.innerHTML = this.Month;
					this.Hourinput.value = this.Hour;
					this.Minuteinput.value = this.Minute;
					var flag = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
					for (var i = 0, len = flag.length; i < len; i++) {
						if (!this.Days[flag[i]]) break;
						this.Days[flag[i]].innerHTML = "<a href='javascript:void(0);' class='data_a' >" + flag[i] + "</a>";
					};
				}
			};
			extend(this.options, options || {});
		},
		//当前月
		NowMonth: function() {
			this.PreDraw(new Date());
		},
		//上一月
		PreMonth: function() {
			this.PreDraw(new Date(this.Year, this.Month - 2, 1));
		},
		//下一月
		NextMonth: function() {
			this.PreDraw(new Date(this.Year, this.Month, 1));
		},
		//上一年
		PreYear: function() {
			this.PreDraw(new Date(this.Year - 1, this.Month - 1, 1));
		},
		//下一年
		NextYear: function() {
			this.PreDraw(new Date(this.Year + 1, this.Month - 1, 1));
		},
		Queding: function() {
			var queding = getElementsByClassName(this.con, "input", "CalendarQd")[0];
			addEventListener(queding, "click", bindAsEventListener(this, function(event) {
				var isWho = getElementsByClassName(this.con, "input", "isWho")[0];
				var data = this.Yearspan.innerHTML + "-" + this.Monthspan.innerHTML + "-" + this.Day + " " + this.Hourinput.value + ":" + this.Minuteinput.value;
				document.getElementById(isWho.value).value = data;
				this._hide();
			}));
		},
		//根据日期画日历
		PreDraw: function(date) {
			//再设置属性
			this.Year = date.getFullYear();
			this.Month = date.getMonth() + 1;
			//重新画日历
			this.Draw();
		},
		//画日历
		Draw: function() {
			//用来保存日期列表
			var arr = [];
			//用当月第一天在一周中的日期值作为当月离第一天的天数
			for (var i = 1, firstDay = new Date(this.Year, this.Month - 1, 1).getDay(); i <= firstDay; i++) {
				arr.push(0);
			}
			//用当月最后一天在一个月中的日期值作为当月的天数
			for (var i = 1, monthDay = new Date(this.Year, this.Month, 0).getDate(); i <= monthDay; i++) {
				arr.push(i);
			}
			//清空原来的日期对象列表
			this.Days = [];
			//插入日期
			var frag = document.createDocumentFragment();
			while (arr.length) {
				//每个星期插入一个tr
				var row = document.createElement("tr");
				//每个星期有7天
				for (var i = 1; i <= 7; i++) {
					var cell = document.createElement("td");
					cell.innerHTML = "&nbsp;";
					if (arr.length) {
						var d = arr.shift();
						if (d) {
							cell.innerHTML = d;
							this.Days[d] = cell;
							var on = new Date(this.Year, this.Month - 1, d);
							//判断是否今日
							this.IsSame(on, new Date()) && this.onToday(cell);
							//判断是否选择日期
							this.SelectDay && this.IsSame(on, this.SelectDay) && this.onSelectDay(cell);
						}
					}
					row.appendChild(cell);
				}
				frag.appendChild(row);
			}
			//先清空内容再插入(ie的table不能用innerHTML)
			while (this.Container.hasChildNodes()) {
				this.Container.removeChild(this.Container.firstChild);
			}
			this.Container.appendChild(frag);
			//附加程序
			this.onFinish();

		},
		//判断是否同一日
		IsSame: function(d1, d2) {
			return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
		},
		//绑定事件
		_bind: function() {
			var that = this;
			this.CalendarPre = getElementsByClassName(this.con, "div", "CalendarPre")[0];
			this.CalendarNext = getElementsByClassName(this.con, "div", "CalendarNext")[0];
			this.CalendarPreYear = getElementsByClassName(this.con, "input", "CalendarPreYear")[0];
			this.CalendarNextYear = getElementsByClassName(this.con, "input", "CalendarNextYear")[0];
			this.CalendarNow = getElementsByClassName(this.con, "input", "CalendarNow")[0];
			addEventListener(this.CalendarPre, "click", function() {
				that.PreMonth();
				that._bandData();
			});
			addEventListener(this.CalendarNext, "click", function() {
				that.NextMonth();
				that._bandData();
			});
			addEventListener(this.CalendarPreYear, "click", function() {
				that.PreYear();
				that._bandData();
			});
			addEventListener(this.CalendarNextYear, "click", function() {
				that.NextYear();
				that._bandData();
			});
			addEventListener(this.CalendarNow, "click", function() {
				that.NowMonth();
				that._bandData();
			});
			this.Queding();
		},
		//给 天 添加事件
		_bandData: function() {
			var selected_item = getElementsByClassName(this.con, "a", "data_a");
			forEach(selected_item, function(o, index) {
				addEventListener(o, "click", bindAsEventListener(this, function(event) {
					stopPropagation(event);
					var onSelect = getElementsByClassName(this.con, "td", "onSelect");
					var isWho = getElementsByClassName(this.con, "input", "isWho")[0];
					each(onSelect, function(s) {
						removeClass(s, "onSelect");
					});
					addClass(o.parentNode, "onSelect");
					var flag = index + 1;
					var data = this.Year + "-" + this.Month + "-" + flag + " " + this.Hourinput.value + ":" + this.Minuteinput.value;
					document.getElementById(isWho.value).value = data;
					this._hide();
					flag = onSelect = data = null;
					return false;
				}));
			}, this);
		},
		//弹出日历控件
		_poprect: function() {
			var _rect = rect(this.input);
			var height = getStyle(this.input, "height");
			var width = getStyle(this.input, "width");
			var isWho = getElementsByClassName(this.con, "input", "isWho")[0];
			addEventListener(this.input, "click", bindAsEventListener(this, function(event) {
				var top = parseInt(getStyle(this.Cont, "top")) - parseInt(height) - 2;
				var left = parseInt(getStyle(this.Cont, "left"));
				if (top != _rect.top || left != _rect.left) {
					this._show(_rect.top, _rect.left, height);
					isWho.value = this.input.id;
				} else {
					this._hide();
				};
			}));
		},
		_show: function(top, left, height) {
			setStyle(this.Cont, {
				"top": top + parseInt(height) + 2 + "px",
				"left": left + "px"
			});
		},
		_hide: function() {
			setStyle(this.Cont, {
				"top": "0px",
				"left": "-9999px"
			});
		},
		//点击日历以外的地方隐藏
		_documentClick: function() {
			var that = this;
			addEventListener(this.input, "mouseover", function() {
				tmpContextMenuOn = true;
			});
			addEventListener(this.Cont, "mouseover", function() {
				tmpContextMenuOn = true;
			});
			addEventListener(this.input, "mouseout", function() {
				tmpContextMenuOn = false;
			});
			addEventListener(this.Cont, "mouseout", function() {
				tmpContextMenuOn = false;
			});
			addEventListener(document, "mousedown", bindAsEventListener(this, function(event) {
				if (!tmpContextMenuOn) {
					this._hide();
				};
			}));
		}
	}


	if (typeof define === 'function' && define['amd'])
		define("Calendar", [], function() {
			return Calendar;
		});
	/* Global */
	else
		window['Calendar'] = Calendar;

}));