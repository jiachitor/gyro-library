/*时间选择下拉列表插件       “日期时间\###DateSelector时间选择插件.html”*/
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

	function extend(destination, source, override) {
		if (override === undefined) override = true;
		for (var property in source) {
			if (override || !(property in destination)) {
				destination[property] = source[property];
			};
		};
		return destination;
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

	/*日期时间*/
	var DateSelector = function() {
		this.initialize.apply(this, arguments);
	};

	DateSelector.prototype = {
		initialize: function(oYear, oMonth, oDay, options) {
			this.SelYear = document.getElementById(oYear); //年选择对象
			this.SelMonth = document.getElementById(oMonth); //月选择对象
			this.SelDay = document.getElementById(oDay); //日选择对象
			this.SetOptions(options);

			var dt = new Date(),
				iMonth = parseInt(this.options.Month),
				iDay = parseInt(this.options.Day),
				iMinYear = parseInt(this.options.MinYear),
				iMaxYear = parseInt(this.options.MaxYear);

			this.Year = parseInt(this.options.Year) || dt.getFullYear();
			this.Month = 1 <= iMonth && iMonth <= 12 ? iMonth : dt.getMonth() + 1;
			this.Day = iDay > 0 ? iDay : dt.getDate();
			this.MinYear = iMinYear && iMinYear < this.Year ? iMinYear : this.Year;
			this.MaxYear = iMaxYear && iMaxYear > this.Year ? iMaxYear : this.Year;
			this.onChange = this.options.onChange;

			//年设置
			this.SetSelect(this.SelYear, this.MinYear, this.MaxYear - this.MinYear + 1, this.Year - this.MinYear);
			//月设置
			this.SetSelect(this.SelMonth, 1, 12, this.Month - 1);
			//日设置
			this.SetDay();

			var oThis = this;
			//日期改变事件
			addEventListener(this.SelYear, "change",
				function() {
					oThis.Year = oThis.SelYear.value;
					oThis.SetDay();
					oThis.onChange();
				});
			addEventListener(this.SelMonth, "change",
				function() {
					oThis.Month = oThis.SelMonth.value;
					oThis.SetDay();
					oThis.onChange();
				});
			addEventListener(this.SelDay, "change",
				function() {
					oThis.Day = oThis.SelDay.value;
					oThis.onChange();
				});
		},
		//设置默认属性
		SetOptions: function(options) {
			this.options = { //默认值
				Year: 0, //年
				Month: 0, //月
				Day: 0, //日
				MinYear: 0, //最小年份
				MaxYear: 0, //最大年份
				onChange: function() {} //日期改变时执行
			};
			extend(this.options, options || {});
		},
		//日设置
		SetDay: function() {
			//取得月份天数
			var daysInMonth = new Date(this.Year, this.Month, 0).getDate();
			if (this.Day > daysInMonth) {
				this.Day = daysInMonth;
			};
			this.SetSelect(this.SelDay, 1, daysInMonth, this.Day - 1);
		},
		//select设置
		SetSelect: function(oSelect, iStart, iLength, iIndex) {
			//添加option
			oSelect.options.length = iLength;
			for (var i = 0; i < iLength; i++) {
				oSelect.options[i].text = oSelect.options[i].value = iStart + i;
			}
			//设置选中项
			oSelect.selectedIndex = iIndex;
		}
	};

	if (typeof define === 'function' && define['amd'])
		define("DateSelector", [], function() {
			return DateSelector;
		});
	/* Global */
	else
		window['DateSelector'] = DateSelector;

}));