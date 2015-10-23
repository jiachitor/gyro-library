/*动画扩展类————————————————————————————————————————————————————————————————————————————————————————————————————————*/


GLOBAL.Animate.fadeIn = function(elem, time, type, callback) {
	if(!callback){return};
	if (typeof time !== 'number') fn = time,time = 400; 
	if (typeof type === 'function') fn = type,type = '';
	GLOBAL.Animate.animate(elem, 'opacity', 1, time, type || 'linear',
	function() {
		GLOBAL.Dom.setStyle(elem, {"display":"block","opacity":"0"});
	},
	callback.call());
};
GLOBAL.Animate.fadeOut = function(elem,time, type, callback) {
	if(!callback){return};
	if (typeof time !== 'number') fn = time,time = 400;
	if (typeof type === 'function') fn = type,type = '';
	GLOBAL.Animate.animate(elem, 'opacity', 0, time, type || 'linear', null,
	function() {
		elem.style.display = 'none';
		callback && callback.call();
	});
};
GLOBAL.Animate.easing = {
	linear: function(t, b, c, d){
		return c*t/d + b;
	},
	quadIn: function(t, b, c, d){
		return c*(t/=d)*t + b;
	},
	quadOut: function(t, b, c, d){
		return -c *(t/=d)*(t-2) + b;
	},
	quadInOut: function(t, b, c, d){
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	cubicIn: function(t, b, c, d){
		return c*(t/=d)*t*t + b;
	},
	cubicOut: function(t, b, c, d){
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	cubicInOut: function(t, b, c, d){
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	quartIn: function(t, b, c, d){
		return c*(t/=d)*t*t*t + b; 
	},
	quartOut: function(t, b, c, d){
		return -c * ((t=t/d-1)*t*t*t - 1) + b; 
	},
	quartInOut: function(t, b, c, d){
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b; 
	},
	quintIn: function(t, b, c, d){
		return c*(t/=d)*t*t*t*t + b;
	},
	quintOut: function(t, b, c, d){
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	quintInOut: function(t, b, c, d){
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	sineIn: function(t, b, c, d){
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	sineOut: function(t, b, c, d){
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	sineInOut: function(t, b, c, d){
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	expoIn: function(t, b, c, d){
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	expoOut: function(t, b, c, d){
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	expoInOut: function(t, b, c, d){
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	circIn: function(t, b, c, d){
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	circOut: function(t, b, c, d){
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	circInOut: function(t, b, c, d){
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	elasticIn: function(t, b, c, d, a, p){
		if (t==0) return b; if ((t/=d)==1) return b+c; if (!p) p=d*.3; if (!a) a = 1;
		if (a < Math.abs(c)){ a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin(c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	elasticOut: function(t, b, c, d, a, p){
		if (t==0) return b; if ((t/=d)==1) return b+c; if (!p) p=d*.3; if (!a) a = 1;
		if (a < Math.abs(c)){ a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin(c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	elasticInOut: function(t, b, c, d, a, p){
		if (t==0) return b; if ((t/=d/2)==2) return b+c; if (!p) p=d*(.3*1.5); if (!a) a = 1;
		if (a < Math.abs(c)){ a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin(c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	backIn: function(t, b, c, d, s){
		if (!s) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	backOut: function(t, b, c, d, s){
		if (!s) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	backInOut: function(t, b, c, d, s){
		if (!s) s = 1.70158;
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	bounceIn: function(t, b, c, d){
		return c - Transition.bounceOut (d-t, 0, c, d) + b;
	},
	bounceOut: function(t, b, c, d){
		if ((t/=d) < (1/2.75)){
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)){
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)){
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	bounceInOut: function(t, b, c, d){
		if (t < d/2) return Transition.bounceIn(t*2, 0, c, d) * .5 + b;
		return Transition.bounceOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
};




//DOM 相关 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
GLOBAL.namespace("Dom");
GLOBAL.Dom.getNextNode = function (node) {    //node指DOM节点
    node = typeof node == "string" ? document.getElementById(node) : node;
    var nextNode = node.nextSibling;
    if (!nextNode) return null;
    if (!document.all) {
        while (true) {
            if (nextNode.nodeType == 1) {
                break;
            } else {
                if (nextNode.nextSibling) {
                    nextNode = nextNode.nextSibling;
                } else {
                    break;
                }
            }
        }
    }
    return nextNode;
};
/*
 例子
 var nextNode = getNextNode("item1");
 alert(nextNode.id);
 */

/*添加元素*/
GLOBAL.Dom.addElement = function (tag, id, value) {
    if (arguments.length <= 1) {
        return document.createElement(tag);
    } else {
        var tag = document.createElement(tag);
        tag.setAttribute(id, value);
        return tag;
    }
};

//获取元素相对于这个页面的x和y坐标。
GLOBAL.Dom.pageX = function (elem){
    return elem.offsetParent?(elem.offsetLeft+pageX(elem.offsetParent)):elem.offsetLeft;
}
GLOBAL.Dom.pageY = function (elem){
    return elem.offsetParent?(elem.offsetTop+pageY(elem.offsetParent)):elem.offsetTop;
}
//获取元素相对于父元素的x和y坐标。
GLOBAL.Dom.parentX = function (elem){
    return elem.parentNode==elem.offsetParent?elem.offsetLeft:pageX(elem)-pageX(elem.parentNode);
}
GLOBAL.Dom.parentY = function (elem){
    return elem.parentNode==elem.offsetParent?elem.offsetTop:pageY(elem)-pageY(elem.parentNode);
}
//获取使用css定位的元素的x和y坐标。
GLOBAL.Dom.posX = function (elem){
    return parseInt(getStyle(elem,"left"));
}
GLOBAL.Dom.posY = function (elem){
    return parseInt(getStyle(elem,"top"));
}
//设置元素位置。
GLOBAL.Dom.setX = function (elem,pos){
    elem.style.left=pos+"px";
}
GLOBAL.Dom.setY = function (elem,pos){
    elem.style.top=pos+"px";
}
//增加元素X和y坐标。
GLOBAL.Dom.addX = function (elem,pos){
    set(elem,(posX(elem)+pos));
}
GLOBAL.Dom.addY = function (elem,pos){
    set(elem,(posY(elem)+pos));
}
//获取元素使用css控制大小的高度和宽度
GLOBAL.Dom.getHeight = function (elem){
    return parseInt(getStyle(elem,"height"));
}
GLOBAL.Dom.getWidth = function (elem){
    return parseInt(getStyle(elem,"width"));
}
//获取元素可能，完整的高度和宽度
GLOBAL.Dom.getFullHeight = function (elem){
    if(getStyle(elem,"display")!="none"){
        return getHeight(elem)||elem.offsetHeight;
    }else{
        var old=resetCss(elem,{display:"block",visibility:"hidden",position:"absolute"});
        var h=elem.clientHeight||getHeight(elem);
        restoreCss(elem,old);
        return h;
    }
}
GLOBAL.Dom.getFullWidth = function (elem){
    if(getStyle(elem,"display")!="none"){
        return getWidth(elem)||elem.offsetWidth;
    }else{
        var old=resetCss(elem,{display:"block",visibility:"hidden",position:"absolute"});
        var w=elem.clientWidth||getWidth(elem);
        restoreCss(elem,old);
        return w;
    }
}

//-----显示，隐藏-----
GLOBAL.Dom.toggleDisplay = function (id) {
    var oTarget = this.document.getElementById(id);
    if (!oTarget) {
        return false;
    }
    oTarget.style.display == 'none' ? oTarget.style.display = 'block' : oTarget.style.display = 'none';
}

//显示和隐藏
GLOBAL.Dom.show = function (elem){
    elem.style.display=elem.$oldDisplay||" ";
}
GLOBAL.Dom.hide = function (elem){
    var curDisplay=getStyle(elem,"display");
    if(curDisplay!="none"){
        elem.$oldDisplay=curDisplay;
        elem.style.display="none";
    }
}



//以下这部分还没想好怎么改
//获取鼠标光标相对于整个页面的位置。
function getX(e){
    e=e||window.event;
    return e.pageX||e.clientX+document.body.scrollLeft;
}
function getY(e){
    e=e||window.event;
    return e.pageY||e.clientY+document.body.scrollTop;
}
//获取鼠标光标相对于当前元素的位置。
function getElementX(e){
    return (e&&e.layerX)||window.event.offsetX;
}
function getElementY(e){
    return (e&&e.layerY)||window.event.offsetY;
}


//获取页面的高度和宽度
function getPageHeight(){
    var de=document.documentElement;
    return document.body.scrollHeight||(de&&de.scrollHeight);
}
function getPageWidth(){
    var de=document.documentElement;
    return document.body.scrollWidth||(de&&de.scrollWidth);
}
//获取滚动条的位置。
function scrollX(){
    var de=document.documentElement;
    return self.pageXOffset||(de&&de.scrollLeft)||document.body.scrollLeft;
}
function scrollY(){
    var de=document.documentElement;
    return self.pageYOffset||(de&&de.scrollTop)||document.body.scrollTop;
}
//获取视口的高度和宽度。
function windowHeight() {
    var de = document.documentElement;
    return self.innerHeight||(de && de.offsetHeight)||document.body.offsetHeight;
}
function windowWidth() {
    var de = document.documentElement;
    return self.innerWidth||( de && de.offsetWidth )||document.body.offsetWidth;
}


//Lang相关 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
GLOBAL.namespace("Lang");
GLOBAL.Lang.trim = function(ostr){
    return ostr.replace(/^\s+|\s+$/g,"");
}
/*
 例子
 var str = " abc ";
 alert(trim(str).length);   // 3
 */


/*定义类型判断函数*/
GLOBAL.Lang.isNumber = function(s){
    return !isNaN(s);
}
GLOBAL.Lang.isString = function(s){
    return typeof s == "string";
}
GLOBAL.Lang.isBoolean = function(s){
    return typeof s == "boolean";
}
GLOBAL.Lang.isFunction = function(s){
    return typeof s == "function";
}
GLOBAL.Lang.isNull = function(s){
    return s == null;
}
GLOBAL.Lang.isUndefined = function(s){
    return typeof s == "undefined";
}
GLOBAL.Lang.isEmpty = function(s){
    return /^\s*$/.test(s);
}
GLOBAL.Lang.isArray = function(s){
    return s instanceof Array;
}

/*定义扩展函数*/
GLOBAL.Lang.extend = function(subClass,superClass){
    var F = function(){};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    subClass.superclass = superClass.prototype;
    if(superClass.prototype.constructor == Object.prototype.constructor){
        superClass.prototype.constructor = superClass;
    }
}


// 数字比较大小 (两个输入为字符串或数字类型，长数型数字比较)
GLOBAL.Lang.compareNumber = function(prevNum, nextNum) {
    if (isNaN(prevNum) || prevNum.length == 0) {
        throw new Error("第一个输入非数字");
    }
    else if (isNaN(prevNum) || prevNum.length == 0) {
        throw new Error("第二个输入非数字");
    }
    var result = 0; //返回结果 0：两个相等 1：第一个数字大于第二个 -1：第二个数字大于第一个
    if (prevNum.length > nextNum.length) {
        result++;
    }
    else if (prevNum.length < nextNum.length) {
        result--;
    }
    else {
        //位数一样
        for (var i = 0; i < prevNum.length; i++) {
            var charNum1 = prevNum.toString().charAt(i);
            var charNum2 = nextNum.toString().charAt(i);
            if (parseInt(charNum1) > parseInt(charNum2)) {
                result++;
                break;
            }
            else if (parseInt(charNum2) > parseInt(charNum1)) {
                result--;
                break;
            }
        }
    }
    return result;
}




