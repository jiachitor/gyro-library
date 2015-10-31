/*多功能插件      “导航类\my-fixMenu\my-fixMenu.html”*/
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


	/*定义判断*/
	var GLOBALObject = Object.prototype.toString,
		isFun = function(f) {
			return GLOBALObject.call(f) === "[object Function]"
		},
		isNum = function(f) {
			return GLOBALObject.call(f) === "[object Number]"
		},
		isArr = function(f) {
			return GLOBALObject.call(f) === "[object Array]"
		},
		isObj = function(o) {
			return GLOBALObject.call(o) === "[object Object]"
		},
		isStr = function(o) {
			return GLOBALObject.call(o) === "[object String]"
		},
		trim = function(text) {
			return (text || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
		},
		jc = 1;

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

	function deepextend(destination, source) {
		for (var property in source) {
			var copy = source[property];
			if (destination === copy) continue;
			if (typeof copy === "object") {
				destination[property] = deepextend(destination[property] || {}, copy);
			} else {
				destination[property] = copy;
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

	function clientRect(node) {
		var _rect = rect(node),
			sLeft = getScrollLeft(node),
			sTop = getScrollTop(node);
		_rect.left -= sLeft;
		_rect.right -= sLeft;
		_rect.top -= sTop;
		_rect.bottom -= sTop;
		return _rect;
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

	function every(object, callback, thisp) {
		var ret = true;
		each(object,
			function() {
				if (!callback.apply(thisp, arguments)) {
					ret = false;
					return false;
				};
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

	function indexOf(array, elt, from) {
		if (array.indexOf) {
			return isNaN(from) ? array.indexOf(elt) : array.indexOf(elt, from);
		} else {
			var len = array.length;
			from = isNaN(from) ? 0 : from < 0 ? Math.ceil(from) + len : Math.floor(from);
			for (; from < len; from++) {
				if (array[from] === elt) return from;
			};
			return -1;
		}
	};

	//容器集合
	var FixedMenu = function(containers, options) {
		this._initialize(containers, options);
	};
	FixedMenu.prototype = {
		_initialize: function(containers, options) {
			this._timerContainer = null; //容器定时器
			this._timerMenu = null; //菜单定时器
			this._frag = document.createDocumentFragment(); //碎片对象，保存菜单元素
			this._menus = {}; //菜单对象
			this._containers = []; //容器集合

			this._setOptions(options);
			var opt = this.options;
			this._custommenu = opt.menu; //目录列表数组
			this.css = opt.css;
			this.hover = opt.hover;
			this.active = opt.active;
			this.tag = opt.tag;
			this.html = opt.html;
			this.relContainer = opt.relContainer;
			this.relative = opt.relative;
			this.attribute = opt.attribute;
			this.property = opt.property;
			this.onBeforeShow = opt.onBeforeShow;
			this.delay = parseInt(opt.delay) || 0;

			//修正自定义容器
			forEach(isArr(containers) ? containers : [containers], function(o, i) {
					//自定义容器 id:定位元素 menu:插入菜单元素
					//生成一个容器对象，其中pos属性是容器元素，menu属性是插入菜单的元素
					var pos, menu;
					//o是指containers[0],containers[1]等，一般来说，containers[0]指根目录的id,containers[1]一般是是自定义的对象，如：{id: "idContainer2_2",menu: "idMenu2"}，
					//o.id是指初始化时指定的子容器层id，显示与隐藏用的
					//o.menu是指装载子目录容器的id
					if (o.id) { //containers[1]
						pos = o.id;
						menu = o.menu ? o.menu : pos;
					} else { //containers[0],此时是根目录，容器元素和插入目录的元素都是自己
						pos = menu = o;
					};
					pos = document.getElementById(pos);
					menu = document.getElementById(menu);
					//容器对象 pos:定位元素 menu:插入菜单元素
					//传递索引和容器对象给_iniContainer函数，对容器对象做初始化
					//这里的索引是指containers数组的索引
					pos && menu && this._iniContainer(i, {
						"pos": pos,
						"menu": menu
					});
				},
				this);

			//初始化程序
			this._iniMenu();
		},
		//设置默认属性
		_setOptions: function(options) {
			this.options = { //默认值
				menu: [], //自定义菜单集合
				delay: 200, //延迟值(微秒)
				tag: "div", //默认生成标签
				css: undefined, //默认样式
				hover: undefined, //触发菜单样式
				active: undefined, //显示下级菜单时显示样式
				html: "", //菜单内容
				relContainer: false, //是否相对容器定位（否则相对菜单）
				relative: {
					align: "clientleft",
					vAlign: "bottom"
				},
				//定位对象
				attribute: {}, //自定义attribute属性
				property: {}, //自定义property属性
				onBeforeShow: function() {} //菜单显示时执行
			};
			extend(this.options, options || {});
		},
		//程序初始化
		_iniMenu: function() {
			this.hide(); //隐藏菜单
			this._buildMenu(); //生成菜单对象
			this._forEachContainer(this._resetContainer); //重置容器属性
			this._insertMenu(0, 0); //显示菜单
		},
		//根据自定义菜单对象生成程序菜单对象
		//自定义菜单集合会保存在_custommenu属性中。
		//在程序初始化时会执行_buildMenu程序，根据这个_custommenu生成程序需要的_menus菜单对象集合。
		//_buildMenu是比较关键的程序，菜单的层级结构就是在这里确定，它由以下几步组成
		_buildMenu: function() {
			//清除旧菜单dom(包括自定义的)
			//第一步，清除旧菜单对象集合的dom元素
			this._forEachMenu(function(o) {
				var elem = o._elem;
				if (elem) {
					//防止dom内存泄漏
					//在ie用attachEvent给dom元素绑定事件，在cloneNode之后会把事件也复制过去,而用addEventListener添加的事件就不会
					//推荐使用addEvent和removeEvent方法来添加/移除事件
					//它的好处就不用说了，而且它能在ie解决上面说到的cloneNode的bug
					removeEventListener(elem, "mouseover", o._event);
					elem.parentNode.removeChild(elem);
					o._elem = o.elem = null;
				};
			});
			//设置菜单默认值
			var options = {
				id: 0, //id是菜单的唯一标识,，parent是父级菜单的id
				rank: 0, //排序属性
				elem: "", //自定义元素
				tag: this.tag, //生成标签
				css: this.css, //默认样式
				hover: this.hover, //触发菜单样式
				active: this.active, //显示下级菜单时显示样式
				html: this.html, //菜单内容
				relContainer: !!this.relContainer, //是否相对容器定位（否则相对菜单）
				relative: this.relative, //定位对象,其中relContainer和relative是用于下级容器定位的
				attribute: this.attribute, //自定义Attribute属性
				property: this.property //自定义Property属性
			};
			//第二步，生成菜单对象集合
			//为了能更有效率地获取指定id的菜单对象，_menus是以id作为字典关键字的对象
			//首先创建带根菜单（id为“0”）对象的_menus
			this._menus = {
				"0": {
					"_children": []
				}
			};
			//整理自定义菜单_custommenu并插入到程序菜单对象_menus中
			forEach(this._custommenu, function(o) {
					//菜单对象中包含对象属性,生成菜单对象(由于包含对象，要用深度扩展)
					var menu = deepextend(deepextend({}, options), o || {});
					//为确保id是唯一标识，会排除相同id的菜单，间接排除了id为“0”的菜单
					if (!!this._menus[menu.id]) {
						return;
					};
					//重置_children（子菜单集合）和_index（联级级数）之后，就可以插入到_menus中了
					menu._children = [];
					menu._index = -1;
					this._menus[menu.id] = menu;
				},
				this);
			//第三步，建立树形结构
			//菜单之间的关系是一个树形结构，程序通过id和parent来建立这个关系的（写过数据库分级结构的话应该很熟悉）
			//在写自定义菜单对象时用的是新版的方法，然后程序初始化时把它转换成类多维数组结构
			this._forEachMenu(function(o, id, menus) {
				if ("0" === id) {
					return;
				}; //顶级没有父级菜单
				//首先根据parent找到父菜单对象
				var parent = this._menus[o.parent];
				//父级菜单不存在或者父级是自己的话，当成一级菜单
				if (!parent || parent === o) {
					parent = menus[o.parent = "0"];
				};
				//最后把当前菜单对象放到父菜单对象的_children集合中,把_menus变成了类多维数组结构，而且这个结构不会发生死循环
				parent._children.push(o);
			});
			//第四步，整理菜单对象集合,主要是整理_menus里面的菜单对象
			this._forEachMenu(function(o) {
				//首先，如果有自定义元素的话先放到碎片文档中
				//菜单元素是需要显示时才会处理的，这样可以防止在容器上出现未处理的菜单元素
				!!o.elem && (o.elem = document.getElementById(o.elem)) && this._frag.appendChild(o.elem);
				//然后是修正样式,优先使用自定义元素的class，避免被程序设置的默认样式覆盖
				if (!!o.elem && o.elem.className) {
					o.css = o.elem.className;
				} else if (o.css === undefined) { //空字符串也可能被用来清空样式，所以要用undefined来判断是否自定义了样式
					o.css = "";
				};
				if (o.hover === undefined) {
					o.hover = o.css;
				};
				if (o.active === undefined) {
					o.active = o.hover;
				};

				//最后，对菜单对象的_children集合排序(先按rank再按id排序)
				o._children.sort(function(x, y) {
					//先按rank再按id排序，跟菜单对象定义的顺序是无关的
					return x.rank - y.rank || x.id - y.id;
				});
				//执行完BuildMenu程序之后，_menus菜单对象集合就建立好了。
				//麻烦的是在每次修改_custommenu之后，都必须执行一次_buildMenu程序
			});
		},
		//容器对象和菜单对象都准备好了，下面就是如何利用它们来做程序的核心——多级联动效果了
		//第一步，准备一级容器
		//第二步，向容器插入菜单
		//通过_insertMenu程序，可以向指定容器插入指定菜单，其中第一个参数是索引，第二个参数是父菜单id
		_insertMenu: function(index, parent) {
			var container = this._containers[index];
			//先判断是否同一个父级菜单，是的话就返回不用重复操作了
			if (container._parent === parent) {
				return;
			};
			container._parent = parent;
			//把原有容器内菜单移到碎片对象中
			forEach(container._menus, function(o) {
					o._elem && this._frag.appendChild(o._elem);
				},
				this);
			//重置子菜单对象集合
			container._menus = [];
			//把旧菜单元素保存到碎片对象中，要使用时再拿出来
			//把从父级菜单元素的子菜单对象集合获取的元素插入到容器
			forEach(this._menus[parent]._children, function(menu, i) {
					this._checkMenu(menu, index); //检查菜单
					container._menus.push(menu); //加入到容器的子菜单集合，方便调用
					container.menu.appendChild(menu._elem); //菜单元素插入到容器
				},
				this);
		},
		//第三步，添加触发下级菜单事件
		//检查菜单,_checkMenu程序主要是检测和处理菜单元素
		_checkMenu: function(menu, index) {
			//索引保存到菜单对象属性中，方便调用
			menu._index = index;
			//如果菜单对象没有元素
			if (!menu._elem) {
				var elem = menu.elem;
				//如果没有自定义元素的话创建一个
				if (!elem) {
					elem = document.createElement(menu.tag);
					elem.innerHTML = menu.html;
				};
				//设置property
				extend(elem, menu.property);
				//设置attribute
				var attribute = menu.attribute;
				for (var att in attribute) {
					elem.setAttribute(att, attribute[att]);
				};
				//设置样式
				elem.className = menu.css;
				//设置事件
				menu._event = bindAsEventListener(this, this._hoverMenu, menu); //用于清除事件
				addEventListener(elem, "mouseover", menu._event);
				//保存到菜单对象
				menu._elem = elem;
			};
		},
		//第四步，触发显示下级菜单事件
		_hoverMenu: function(e, menu) {
			var elem = menu._elem;
			//如果是内部元素触发直接返回
			if (!fixedMouse(e, elem)) {
				return;
			};
			clearTimeout(this._timerMenu);
			//可能在多个容器间移动，所以全部容器都重新设置样式
			this._forEachContainer(function(o, i) {
				if (o.pos.visibility === "hidden") {
					return;
				};
				this._resetCss(o);
				//设置当前菜单为active样式
				var menu = o._active;
				if (menu) {
					menu._elem.className = menu.active;
				};
			});
			//设置当前菜单为触发样式
			if (this._containers[menu._index]._active !== menu) {
				elem.className = menu.hover;
			};
			//延时触发显示菜单
			this._timerMenu = setTimeout(bindFunction(this, this._showMenu, menu), this.delay);
		},
		//第五步，整理菜单容器
		//显示菜单
		_showMenu: function(menu) {
			var index = menu._index,
				container = this._containers[index],
				child = !!menu._children.length;
			//隐藏不需要的容器
			this._forEachContainer(function(o, i) {
				i > index && this._hideContainer(o);
			});
			//重置当前容器_active
			container._active = null;
			//然后判断当前菜单是否有子菜单，当有子菜单时，先用_checkContainer程序检查下级菜单容器。
			//_checkContainer程序主要是检查容器是否存在，不存在的话就自动添加一个
			//如果有子级菜单
			if (child) {
				//设置当前容器_active
				container._active = menu;
				//显示下一级容器
				index++; //设置索引
				this._checkContainer(index); //检查容器
				this._insertMenu(index, menu.id); //插入菜单
				this._showContainer(menu); //显示容器
			};
			//重置当前容器的css
			this._resetCss(container);
			//设置当前菜单样式
			menu._elem.className = child ? menu.active : menu.hover;
		},
		//初始化容器(索引, 容器元素)
		_iniContainer: function(index, container) {
			var oContainer = container.pos,
				that = this;
			//重置容器对象可能在程序中设置过的属性
			this._resetContainer(container);
			//添加事件,在mouseover时清除容器定时器，其实就是取消hide执行
			addEventListener(oContainer, "mouseover", bindFunction(this, function() {
				clearTimeout(this._timerContainer);
			}));
			addEventListener(oContainer, "mouseout", bindAsEventListener(this, function(e) {
				//先判断是否移出到所有容器之外
				//this._containers 为容器数组
				var isOut = every(this._containers, function(o) {
					return fixedMouse(e, o.pos);
				});
				if (isOut) {
					//清除定时器并延时隐藏
					clearTimeout(this._timerContainer);
					clearTimeout(this._timerMenu);
					this._timerContainer = setTimeout(bindFunction(this, this.hide), this.delay);
				};
			}));
			//除了第一个容器外设置浮动样式,由于第一级容器一般是不自动隐藏的，只需要用_resetCss来重置样式
			if (index) {
				setStyle(container.pos, {
					position: "absolute",
					display: "block",
					margin: 0,
					zIndex: this._containers[index - 1].pos.style.zIndex + 1 //要后面的覆盖前面的
				});
			};
			//ie6处理select
			if (Browser.ie6) {
				var iframe = document.createElement("<iframe style='position:absolute;filter:alpha(opacity=0);display:none;'>");
				document.body.insertBefore(iframe, document.body.childNodes[0]);
				container._iframe = iframe;
			};
			//记录索引，方便调用
			//这个索引很重要，它决定了容器是用在第几级菜单，为0的话就是根目录容器，为1的话就是一级子目录容器
			container._index = index;
			//插入到容器集合
			this._containers[index] = container;
		},
		//检查容器
		_checkContainer: function(index) {
			if (index > 0 && !this._containers[index]) {
				//如果容器不存在，根据前一个容器复制成新容器，第一个容器必须自定义
				var pre = this._containers[index - 1].pos
					//用了新的添加事件方式，没有ie的cloneNode的bug
					,
					container = pre.parentNode.insertBefore(pre.cloneNode(false), pre);
				//清除id防止冲突
				container.id = "";
				//初始化容器
				this._iniContainer(index, {
					"pos": container,
					"menu": container
				});
			};
		},
		//第六步，显示菜单容器
		//显示容器
		_showContainer: function(menu) {
			var index = menu._index,
				container = this._containers[index + 1].pos,
				elem = menu.relContainer ? this._containers[index].pos : menu._elem,
				pos = RelativePosition(elem, container, menu.relative);
			//执行显示前事件
			this.onBeforeShow(container, menu);
			//定位并显示容器
			setStyle(container, {
				left: pos.Left + "px",
				top: pos.Top + "px",
				visibility: "visible"
			});
			//ie6处理select
			if (Browser.ie6) {
				setStyle(this._containers[index + 1]._iframe, {
					width: container.offsetWidth + "px",
					height: container.offsetHeight + "px",
					left: pos.Left + "px",
					top: pos.Top + "px",
					display: ""
				});
			};
		},
		//隐藏容器
		_hideContainer: function(container) {
			//设置隐藏
			setStyle(container.pos, {
				left: "-9999px",
				top: "-9999px",
				visibility: "hidden"
			});
			//重置上一个菜单的触发菜单对象
			this._containers[container._index - 1]._active = null;
			//ie6处理select
			if (Browser.ie6) {
				container._iframe.style.display = "none";
			};
		},
		//重置容器对象属性
		_resetContainer: function(container) {
			container._active = null; //重置触发菜单
			container._menus = []; //重置子菜单对象集合
			container._parent = -1; //重置父级菜单id
		},
		//隐藏菜单
		hide: function() {
			this._forEachContainer(function(o, i) {
				if (i === 0) {
					//如果是第一个重设样式和_active
					this._resetCss(o);
				} else { //隐藏容器
					this._hideContainer(o);
				};
			});
		},
		//重设容器菜单样式
		_resetCss: function(container) {
			forEach(container._menus,
				function(o, i) {
					o._elem.className = o.css;
				},
				this);
		},
		//历遍菜单对象集合
		_forEachMenu: function(callback) {
			for (var id in this._menus) {
				callback.call(this, this._menus[id], id, this._menus);
			};
		},
		//历遍容器对象集合
		_forEachContainer: function(callback) {
			forEach(this._containers, callback, this);
		},
		//添加自定义菜单
		add: function(menu) {
			this._custommenu = this._custommenu.concat(menu);
			this._iniMenu();
		},
		//修改自定义菜单
		edit: function(menu) {
			forEach(isArr(menu) ? menu : [menu],
				function(o) {
					//如果对应id的菜单存在
					if (o.id && this._menus[o.id]) {
						//从自定义菜单中找出对应菜单,并修改
						every(this._custommenu,
							function(m, i) {
								if (m.id === o.id) {
									this._custommenu[i] = deepextend(m, o);
									return false;
								};
								return true;
								//用every可以跳出循环
							},
							this);
					};
				},
				this);
			this._iniMenu();
		},
		//删除自定义菜单
		del: function() {
			var ids = Array.prototype.slice.call(arguments);
			this._custommenu = filter(this._custommenu,
				function(o) {
					return indexOf(ids, o.id) === -1;
				});
			this._iniMenu();
		}
	};



	if (typeof define === 'function' && define['amd'])
		define("FixedMenu", [], function() {
			return FixedMenu;
		});
	/* Global */
	else
		window['FixedMenu'] = FixedMenu;


	/*元素定位*/
	var RelativePosition = function() {
		function getLeft(align, rect, rel) {
			var iLeft = 0;
			switch (align.toLowerCase()) {
				case "left":
					return rect.left - rel.offsetWidth;
				case "clientleft":
					return rect.left;
				case "center":
					return (rect.left + rect.right - rel.offsetWidth) / 2;
				case "clientright":
					return rect.right - rel.offsetWidth;
				case "right":
				default:
					return rect.right;
			};
		};

		function getTop(valign, rect, rel) {
			var iTop = 0;
			switch (valign.toLowerCase()) {
				case "top":
					return rect.top - rel.offsetHeight;
				case "clienttop":
					return rect.top;
				case "center":
					return (rect.top + rect.bottom - rel.offsetHeight) / 2;
				case "clientbottom":
					return rect.bottom - rel.offsetHeight;
				case "bottom":
				default:
					return rect.bottom;
			};
		};
		//定位元素 相对定位元素
		return function(fix, rel, options) {
			//默认值
			var opt = extend({
					align: "clientleft", //水平方向定位
					vAlign: "clienttop", //垂直方向定位
					customLeft: 0, //自定义left定位
					customTop: 0, //自定义top定位
					percentLeft: 0, //自定义left百分比定位
					percentTop: 0, //自定义top百分比定位
					adaptive: false, //是否自适应定位
					reset: false //自适应定位时是否重新定位
				},
				options || {});
			//定义参数
			var rect = clientRect(fix),
				iLeft = getLeft(opt.align, rect, rel) + opt.customLeft,
				iTop = getTop(opt.vAlign, rect, rel) + opt.customTop;
			//自定义百分比定位
			if (opt.percentLeft) {
				iLeft += .01 * opt.percentLeft * fix.offsetWidth;
			};
			if (opt.percentTop) {
				iTop += .01 * opt.percentTop * fix.offsetHeight;
			};
			//自适应视窗定位
			if (opt.adaptive) {
				//修正定位参数
				var doc = fix.ownerDocument,
					maxLeft = doc.clientWidth - rel.offsetWidth,
					maxTop = doc.clientHeight - rel.offsetHeight;
				if (opt.reset) {
					//自动重新定位
					if (iLeft > maxLeft || iLeft < 0) {
						iLeft = getLeft(2 * iLeft > maxLeft ? "left" : "right", rect, rel) + opt.customLeft;
					};
					if (iTop > maxTop || iTop < 0) {
						iTop = getTop(2 * iTop > maxTop ? "top" : "bottom", rect, rel) + opt.customTop;
					};
				} else {
					//修正到适合位置
					iLeft = Math.max(Math.min(iLeft, maxLeft), 0);
					iTop = Math.max(Math.min(iTop, maxTop), 0);
				};
			};
			//加上滚动条
			iLeft += getScrollLeft(fix);
			iTop += getScrollTop(fix);
			//返回定位参数
			return {
				Left: iLeft,
				Top: iTop
			};
		};
	}();



}));