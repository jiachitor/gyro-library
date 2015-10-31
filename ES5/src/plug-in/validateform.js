/*用法1---登陆验证     “表单验证/多功能验证版.html”*/
/*
var options1 = {
    "J-login-username-i":[/^[a-zA-Z][a-zA-Z0-9_-]{3,19}$/, '', '请输入正确的用户名'],
    "J-login-pwd-i":[/^.{6,12}$/, '', '请输入6-12位密码']
};
var checkMe1 = new Validateform('J_login_from', options1);
*/

/*用法2---注册验证*/
/*
var options2 = {
    "J-register-username-i":[, 'ajaxusername', ''],
    "J-register-pwd-i":[/^.{6,12}$/, '', '请输入6-12位密码'],
    "J_register_checkcode":[/^[0-9a-zA-Z]+$/, '', '请输入验证码']
};
var checkMe2 = new Validateform('J_register_from', options2);
*/

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

	/*定义jsonp实现*/
	var CallBackHandler = {
		tid: 0,
		callbacks: {},
		getTid: function() {
			return ++this.tid;
		},
		registerCallBack: function(tid, func) {
			this.callbacks[tid] = func;
		},
		handleCallBack: function(tid, data) {
			var func = this.callbacks[tid];
			if (func && (typeof func == 'function')) func(data);
			var script = document.getElementById('jsonp_invoker_' + tid);
			if (script) try {
				script.parentNode.removeChild(script);
			} catch (e) {}
		}
	};

	var Jsonp = function(url, callback) {
		var tid = CallBackHandler.getTid();
		var script = document.createElement('script');
		script.id = 'jsonp_invoker_' + tid;
		script.type = 'text/javascript';
		script.id = src = url.indexOf('?') > 0 ? (url + '&tid=' + tid) : (url + '?tid=' + tid + '&callback=CallBackHandler.handleCallBack');

		if (callback && typeof(callback) == "function") CallBackHandler.registerCallBack(tid, callback);
		var head = document.getElementsByTagName('head');
		if (head[0])
			head[0].appendChild(script);
		else
			document.body.appendChild(script);
	};

	function extend(destination, source, override) {
		if (override === undefined) override = true;
		for (var property in source) {
			if (override || !(property in destination)) {
				destination[property] = source[property];
			};
		};
		return destination;
	};


	function getFirstChild(elem) {
		var result = elem.firstChild;
		while (!result.tagName) {
			result = result.nextSibling;
		};
		return result;
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

	function setCookie(name, value) {
		var Days = 30; //此 cookie 将被保存 30 天
		var exp = new Date(); //new Date("December 31, 9998");
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	};


	// 创建完整Ajax程序包 ，该包不支持跨域
	function ajax(options) {
		options = {
			type: options.type || "GET",
			dataType: options.dataType || "json",
			url: options.url || "",
			xhr: options.xhr || function() {
				try {
					return new XMLHttpRequest();
				} catch (e) {}
			},
			data: options.data || "",
			timeout: options.timeout || 5000,
			onComplete: options.onComplete || function() {},
			onError: options.onError || function() {},
			onSuccess: options.onSuccess || function() {}
		};

		var xml = options.xhr();
		xml.open(options.type, options.url, true);
		var timeoutLength = options.timeout;

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


	function serialize(a) {
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

	function stopPropagation(e) {
		if (e && e.stopPropagation && e.preventDefault) { // 非IE
			e.stopPropagation(); // 标准W3C的取消冒泡
			e.preventDefault(); // 取消默认行为
		} else {
			window.event.cancelBubble = true; // IE的取消冒泡方式
			window.event.returnValue = false; // IE的取消默认行为
		};
	};



	/*验证插件*/
	var Validateform = function(container, options, cookieNameId, cookiePwdId) {
		this._initialize(container, options, cookieNameId, cookiePwdId);
	};

	Validateform.prototype = {
		_initialize: function(container, options, cookieNameId, cookiePwdId) {
			this.form = document.getElementById(container);
			this.config = this._setOptions(options);
			this.cookieNameId = cookieNameId; /*需要保存cookie时添加此项*/
			this.cookiePwdId = cookiePwdId;
			this.formElements = this.form.elements;
			this.formstatus = {};
			this.addFormEvent();
		},
		_setOptions: function(options) {
			this.options = {
				account: [/^[a-zA-Z][a-zA-Z0-9_-]{3,19}$/, '', '请输入正确的用户名'],
				email: [/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/, '', '邮件格式不正确'],
				Chinese: [/^[\u0391-\uFFE5]+$/, '', '只能为中文'],
				IdCard: [/^\d{17}(\d|x)$/, '', '身份证格式不正确'],
				pwd: [/^.{6,12}$/, '', '请输入6-12位密码'],
				ajaxUrl: ['http://9xwan.com/user/checkuser.html'],
				jsonpUrl: ['http://9xwan.com/user/checkuser.html']
			};
			return extend(this.options, options || {});
		},
		extend: function() {
			var arg = arguments,
				len = arg.length,
				dest;
			if (this === Validateform.prototype) {
				if (len === 1) dest = Validateform.prototype, i = 0;
				else dest = arg[0], i = 1;
			} else {
				dest = this, i = 0;
			};
			for (i; i < len; i++) {
				for (var p in arg[i]) {
					dest[p] = arg[i][p];
				}
			};
			return dest; // 返回扩展后的对象
		},
		/*给表单添加事件*/
		addFormEvent: function() {
			forEach(this.formElements, function(o, index) {
					//设置每个对象的状态
					o.statu = false;
					var that = this;
					var thisId = o.id;
					var thisReg = this.config[thisId] ? this.config[thisId][0] : null;
					var thismyRegular = this.config[thisId] ? this.config[thisId][1] : null;
					var thisTip = this.config[thisId] ? this.config[thisId][2] : null;
					switch (o.type) {
						case 'text':
							o.onblur = function(id, regular, myRegular, tip) {
								return function() {
									that._detection(id, regular, myRegular, tip);
								};
							}(thisId, thisReg, thismyRegular, thisTip);
							break;
						case 'password':
							o.onblur = o.onkeyup = function(id, regular, myRegular, tip) {
								return function() {
									that._detection(id, regular, myRegular, tip);
								};
							}(thisId, thisReg, thismyRegular, thisTip);
							if (thisId.indexOf('Repeat') != -1) {
								var pwdId = thisId.substring(0, thisId.indexOf('Repeat'));
								o.onblur = o.onkeyup = function(id, pwdId) {
									return function() {
										that._repwdCheck(id, pwdId);
									};
								}(thisId, pwdId);
							};
							break;
						case 'select-one':
							break;
						case 'select-multiple':
							alert("b");
							break;
						case 'submit':
							o.onclick = function(event) {
								that._submit(event);
							};
							break;
						default:
							break;
					}
				},
				this);
		},
		/*此为验证后的提示效果*/
		_result: function(id, result, tip) {
			var poptipbox = document.getElementById(id + "-pop");
			var tipp = document.getElementById(id + "-tip");
			var tipb = document.getElementById(id + "-b");
			var poptip = getFirstChild(poptipbox);
			setStyle(poptipbox, {
				"display": "inline-block"
			});
			if (this.config[id]) {
				var showTip = this.config[id][3] ? this.config[id][3] : "show";
			} else {
				var showTip = "show"; //重复密码
			};
			if (result) {
				poptip.id = 'J_ui_poptip_succeed';
				tipp.innerHTML = "?";
				tipb.innerHTML = "";
				this.formstatus[id] = true;
				if (showTip == "hide") {
					GLOBAL.Dom.setStyle(poptipbox, {
						"display": "none"
					});
				};
			} else {
				poptip.id = 'J_ui_poptip_error';
				tipp.innerHTML = "?";
				tipb.innerHTML = tip;
				this.formstatus[id] = false;
			};
		},
		/*重复密码检测*/
		_repwdCheck: function(id, pwdId) {
			var repwdValue = document.getElementById(id).value;
			var pwdValue = document.getElementById(pwdId).value;
			var tip = "两次密码输入不一致";
			if (repwdValue != pwdValue || pwdValue == '') {
				this._result(id, false, tip);
			} else {
				this._result(id, true, tip);
			};
		},
		/*正常的检测功能*/
		_detection: function(id, regular, myRegular, tip) {
			var my = document.getElementById(id);
			var myValue = my.value;
			if (myRegular) {
				this[myRegular](id, my, myValue);
			} else if (regular && !myRegular) {
				if (!regular.test(myValue)) {
					this._result(id, false, tip);
				} else {
					this._result(id, true, tip);
				};
			};
		},
		/*表单提交功能*/
		_submit: function(e) {
			forEach(this.formElements, function(o) {
					if (o.type != "submit") {
						o.focus();
						o.blur();
					};
				},
				this);
			this._checkformstatus(e);
		},
		_checkformstatus: function(e) {
			var checkformstatus;
			for (var key in this.formstatus) {
				if (!this.formstatus[key]) {
					checkformstatus = false;
					break;
				} else {
					checkformstatus = true;
				};
			};
			this._putin(e, checkformstatus);
		},
		_putin: function(e, checkformstatus) {
			if (!checkformstatus) {
				stopPropagation(e);
				return false;
			} else {
				this.setCookie();
			};
		},
		/*加入cookie功能*/
		setCookie: function() {
			var cookieNameInput = this.cookieNameId ? document.getElementById(this.cookieNameId) : null;
			var cookiePwdInput = this.cookiePwdId ? document.getElementById(this.cookiePwdId) : null;
			if (cookieNameInput && cookiePwdInput) {
				setCookie("jcl_last_name", cookieNameInput.value);
			};
		}
	};
	/*扩展功能*/
	Validateform.prototype.extend({
		isNumber: function(id, my, myValue) { //验证是不是数字，my是指验证的表单元素，myValue指表单里的值
			var poptipbox = document.getElementById(id + "-pop");
			var tipp = document.getElementById(id + "-tip");
			var tipb = document.getElementById(id + "-b");
			var poptip = getFirstChild(poptipbox);

			function isNumberStatus() {
				if (!myValue) return false;
				var strP = /^\d+(\.\d+)?$/;
				if (!strP.test(myValue)) return false;
				try {
					if (parseFloat(myValue) != myValue) return false;
				} catch (ex) {
					return false;
				}
				return true;
			}
			var isNumberStatus = isNumberStatus();
			if (isNumberStatus) {
				my.style.background = '';
				poptip.id = 'J_ui_poptip_succeed';
				tipp.innerHTML = "?";
				tipb.innerHTML = "";
				this.formstatus[id] = true;
			} else {
				my.style.background = '#ffcece';
				poptip.id = 'J_ui_poptip_error';
				tipp.innerHTML = "?";
				tipb.innerHTML = "不是数字";
				this.formstatus[id] = false;
			}
		},
		ajaxusername: function(id, my, myValue) { //ajax验证用户名
			var poptipbox = document.getElementById(id + "-pop");
			var tipp = document.getElementById(id + "-tip");
			var tipb = document.getElementById(id + "-b");
			var poptip = getFirstChild(poptipbox);
			setStyle(poptipbox, {
				"display": "inline-block"
			});

			function isNumberStatus() {
				if (!myValue) return false;
				var strP = /^[a-zA-Z][a-zA-Z0-9_-]{3,19}$/;
				if (!strP.test(myValue)) return false;
				return true;
			};

			var that = this;
			var isNumberStatus = isNumberStatus();
			if (isNumberStatus) {
				var param = {
					account: myValue
				};
				ajax({
					url: that.config["ajaxUrl"][0] + "?" + serialize(param),
					type: "GET",
					dataType: "html",
					onSuccess: function(html) {
						if (html == '1') {
							my.style.background = '';
							poptip.id = 'J_ui_poptip_succeed';
							tipp.innerHTML = "?";
							tipb.innerHTML = "";
							that.formstatus[id] = true;
						} else if (html == '2') {
							my.style.background = '#ffcece';
							poptip.id = 'J_ui_poptip_error';
							tipp.innerHTML = "?";
							tipb.innerHTML = "系统繁忙,请稍候再试";
							that.formstatus[id] = false;
						} else {
							my.style.background = '#ffcece';
							poptip.id = 'J_ui_poptip_error';
							tipp.innerHTML = "?";
							tipb.innerHTML = "该帐号已被注册，请重新输入";
							that.formstatus[id] = false;
						};
					},
					onError: function() {
						my.style.background = '#ffcece';
						poptip.id = 'J_ui_poptip_error';
						tipp.innerHTML = "?";
						tipb.innerHTML = "系统繁忙,请稍候再试";
						that.formstatus[id] = false;
					}
				});
			} else {
				my.style.background = '#ffcece';
				poptip.id = 'J_ui_poptip_error';
				tipp.innerHTML = "?";
				tipb.innerHTML = "请输入正确的用户名";
				this.formstatus[id] = false;
			}
		},
		jsonpusername: function(id, my, myValue) { //jsonp验证用户名
			var poptipbox = document.getElementById(id + "-pop");
			var tipp = document.getElementById(id + "-tip");
			var tipb = document.getElementById(id + "-b");
			var poptip = GLOBAL.Dom.getFirstChild(poptipbox);
			setStyle(poptipbox, {
				"display": "inline-block"
			});

			function isNumberStatus() {
				if (!myValue) return false;
				var strP = /^[a-zA-Z][a-zA-Z0-9_-]{3,19}$/;
				if (!strP.test(myValue)) return false;
				return true;
			};

			var that = this;
			var data = {};
			var isNumberStatus = isNumberStatus();
			if (isNumberStatus) {
				var url = that.config["jsonpUrl"][0] + "?account=" + myValue;
				jsonpResult = function(data) {
					if (data.success == 1) {
						my.style.background = '';
						poptip.id = 'J_ui_poptip_succeed';
						tipp.innerHTML = "?";
						tipb.innerHTML = "";
						that.formstatus[id] = true;
					} else if (data.success == 2) {
						my.style.background = '#ffcece';
						poptip.id = 'J_ui_poptip_error';
						tipp.innerHTML = "?";
						tipb.innerHTML = "该帐号已被注册，请重新输入!";
						that.formstatus[id] = false;
					} else {
						my.style.background = '#ffcece';
						poptip.id = 'J_ui_poptip_error';
						tipp.innerHTML = "?";
						tipb.innerHTML = "系统繁忙，请稍后重试!";
						that.formstatus[id] = false;
					}
				};
				Jsonp(url, jsonpResult);
			} else {
				my.style.background = '#ffcece';
				poptip.id = 'J_ui_poptip_error';
				tipp.innerHTML = "?";
				tipb.innerHTML = "请输入正确的用户名";
				this.formstatus[id] = false;
			}

		}
	});


	if (typeof define === 'function' && define['amd'])
		define("Validateform", [], function() {
			return Validateform;
		});
	/* Global */
	else
		window['Validateform'] = Validateform;

}));