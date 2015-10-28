/*           "弹出与拖拽\#drag拖动插件修改版.html"*/
//用法
/*
var mydrag1 = new Drag("J_gamelist", {
    mxContainer: "J_popping",
    Handle: "J_dragTitle1",
    Limit: true,
    View:true  //限制在可视区域移动
});
*/


(function(global) {
    "use strict";

    //拖放程序
    Drag = function(obj, options) {
        this._initialize.apply(this, arguments);
    };

    Drag.prototype = {
        //拖放对象
        _initialize: function(obj, options) {
            typeof(obj) == "object" ? this.Drag = obj: this.Drag = document.getElementById(obj); //拖放对象
            this._x = this._y = 0; //记录鼠标相对拖放对象的位置
            this._marginLeft = this._marginTop = 0; //记录margin
            //事件对象(用于绑定移除事件)
            this._fM = GLOBAL.Objects.BindAsEventListener(this, this._Move);
            this._fS = GLOBAL.Objects.BindFunction(this, this._Stop);

            this._SetOptions(options);

            this.Limit = !!this.options.Limit;
            this.mxLeft = parseInt(this.options.mxLeft);
            this.mxRight = parseInt(this.options.mxRight);
            this.mxTop = parseInt(this.options.mxTop);
            this.mxBottom = parseInt(this.options.mxBottom);

            this.LockX = !!this.options.LockX;
            this.LockY = !!this.options.LockY;
            this.Lock = !!this.options.Lock;

            this.onStart = this.options.onStart;
            this.onMove = this.options.onMove;
            this.onStop = this.options.onStop;

            this._Handle = document.getElementById(this.options.Handle) || this.Drag;
            this._mxContainer = document.getElementById(this.options.mxContainer) || null;

            //拖放对象的position必须是absolute绝对定位
            this.Drag.style.position = "absolute";
            //透明,能保证触发点直接在body或非背景上也可以
            if (Browser.ie && !!this.options.Transparent) {
                //填充拖放对象
                //当你有一个对象的多个属性或者方法需要操作时，就可以使用with,用于简化 代码 操作
                with(this._Handle.appendChild(document.createElement("div")).style) {
                    width = height = "100%";
                    backgroundColor = "#fff";
                    filter = "alpha(opacity:0)";
                    fontSize = 0; //不要忘了设置fontSize，否则就有一个默认最小高度。
                }
            };
            //修正范围
            //注意如果在程序执行之前设置过拖放对象的left和top而容器没有设置relative，在自动设置relative时会发生移位现象，所以程序在初始化时就执行一次Repair程序防止这种情况。因为offsetLeft和offsetTop要在设置relative之前获取才能正确获取值，所以在Start程序中Repair要在设置_x和_y之前执行
            this._Repair();
            GLOBAL.Event.addEventListener(this._Handle, "mousedown", GLOBAL.Objects.BindAsEventListener(this, this._Start));
        },
        //设置默认属性
        _SetOptions: function(options) {
            this.options = { //默认值
                Handle: "", //设置触发对象（不设置则使用拖放对象）
                mxContainer: "", //指定限制在容器内
                Limit: false, //是否设置范围限制(为true时下面参数有用,可以是负数)
                mxLeft: 0, //左边限制
                mxRight: 9999, //右边限制
                mxTop: 0, //上边限制
                mxBottom: 9999, //下边限制
                LockX: false, //是否锁定水平方向拖放
                LockY: false, //是否锁定垂直方向拖放
                Lock: false, //是否锁定
                Transparent: false, //是否透明
                onStart: function() {}, //开始移动时执行
                onMove: function() {}, //移动时执行
                onStop: function() {} //结束移动时执行
            };
            GLOBAL.Objects.extend(this.options, options || {});
        },
        //准备拖动
        _Start: function(oEvent) {
            if (this.Lock) {
                return;
            };
            this._Repair();
            //记录鼠标相对拖放对象的位置
            this._x = oEvent.clientX - this.Drag.offsetLeft;
            this._y = oEvent.clientY - this.Drag.offsetTop;
            //记录margin
            this._marginLeft = parseInt(GLOBAL.Dom.curStyle(this.Drag).marginLeft) || 0;
            this._marginTop = parseInt(GLOBAL.Dom.curStyle(this.Drag).marginTop) || 0;
            //mousemove时移动 mouseup时停止
            //把_fM拖动程序和_fS停止拖动程序分别绑定到document的mousemove和mouseup事件
            //注意要绑定到document才可以保证事件在整个窗口文档中都有效，如果只绑定到拖放对象就很容易出现拖太快就脱节的现象
            GLOBAL.Event.addEventListener(document, "mousemove", this._fM);
            GLOBAL.Event.addEventListener(document, "mouseup", this._fS);
            //即使鼠标移动到浏览器外面，拖放程序依然能够执行，仔细查看后发现是用了setCapture
            if (Browser.ie) {
                //焦点丢失
                GLOBAL.Event.addEventListener(this._Handle, "losecapture", this._fS);
                //设置鼠标捕获。即使鼠标移动到浏览器外面，拖放程序依然能够执行
                this._Handle.setCapture();
            } else {
                //焦点丢失
                GLOBAL.Event.addEventListener(window, "blur", this._fS);
                //阻止默认动作
                oEvent.preventDefault();
            };
            //附加程序
            this.onStart();
        },
        //修正范围
        //如果范围设置不正确，可能导致上下或左右同时超过范围的情况，程序中有一个Repair程序用来修正范围参数
        _Repair: function() {
            if (this.Limit) {
                //修正错误范围参数
                //对于左边上边要取更大的值，对于右边下面就要取更小的值
                this.mxRight = Math.max(this.mxRight, this.mxLeft + this.Drag.offsetWidth);
                this.mxBottom = Math.max(this.mxBottom, this.mxTop + this.Drag.offsetHeight);
                //如果有容器必须设置position为relative或absolute来相对或绝对定位，并在获取offset之前设置
                //当设置了容器，在Repair程序如果容器的position不是relative或absolute，会自动把position设为relative来相对定位
                if (!this.options.View) {
                    !this._mxContainer || GLOBAL.Dom.curStyle(this._mxContainer).position == "relative" || GLOBAL.Dom.curStyle(this._mxContainer).position == "absolute" || (this._mxContainer.style.position = "relative");
                }
            }
        },
        //可视范围拖动
        _Visible: function() {
            var topScroll = document.documentElement.scrollTop + document.body.scrollTop;
            var leftScroll = document.documentElement.scrollLeft + document.body.scrollLeft;
            this.mxLeft = Math.max(leftScroll, 0);
            this.mxRight = document.documentElement.clientWidth + leftScroll;
            this.mxTop = Math.max(topScroll, 0);
            this.mxBottom = document.documentElement.clientHeight + topScroll;
        },
        //拖动
        _Move: function(oEvent) {
            //判断是否锁定,完全锁定就直接返回
            if (this.Lock) {
                this._Stop();
                return;
            };
            //清除选择
            //好的方法清除选择，不但不影响拖放对象的选择效果，还能对整个文档进行清除
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            //设置移动参数
            //通过现在鼠标的坐标值跟开始拖动时鼠标相对的坐标值的差就可以得到拖放对象应该设置的left和top了
            var iLeft = oEvent.clientX - this._x,
                iTop = oEvent.clientY - this._y;
            //设置范围限制
            this._SetPos(iLeft, iTop);
        },
        //设置范围限制
        _SetPos: function(iLeft, iTop) {
            if (this.Limit) {
                //设置范围参数
                //容器范围限制就是指定上下左右的拖放范围。
                //各个属性的意思是：
                //上(mxTop)：top限制；
                //下(mxBottom)：top+offsetHeight限制；
                //左(mxLeft)：left限制；
                //右(mxRight)：left+offsetWidth限制
                var mxLeft = this.mxLeft,
                    mxRight = this.mxRight,
                    mxTop = this.mxTop,
                    mxBottom = this.mxBottom;
                //如果设置了容器，再修正范围参数
                if (this.options.View) { //限制在可视区域移动
                    this._Visible();
                } else if (!!this._mxContainer) {
                    //对于左边上边要取更大的值，对于右边下面就要取更小的值
                    //由于是相对定位，对于容器范围来说范围参数上下左右的值分别是0、clientHeight、0、clientWidth。 clientWidth和clientHeight是容器可视部分的宽度和高度
                    mxLeft = Math.max(mxLeft, 0);
                    mxTop = Math.max(mxTop, 0);
                    mxRight = Math.min(mxRight, this._mxContainer.clientWidth);
                    mxBottom = Math.min(mxBottom, this._mxContainer.clientHeight);
                };
                //修正移动参数,这里可以限制在一定范围里拖动
                iLeft = Math.max(Math.min(iLeft, mxRight - this.Drag.offsetWidth), mxLeft);
                iTop = Math.max(Math.min(iTop, mxBottom - this.Drag.offsetHeight), mxTop);
            }
            //设置位置，并修正margin
            //水平和垂直方向的锁定只要在Move判断是否锁定再设置left和top就行
            if (!this.LockX) {
                this.Drag.style.left = iLeft - this._marginLeft + "px";
            }
            if (!this.LockY) {
                this.Drag.style.top = iTop - this._marginTop + "px";
            }
            //附加程序
            this.onMove();
        },
        //停止拖动
        _Stop: function() {
            //移除事件
            GLOBAL.Event.removeEventListener(document, "mousemove", this._fM);
            GLOBAL.Event.removeEventListener(document, "mouseup", this._fS);
            if (Browser.ie) {
                GLOBAL.Event.removeEventListener(this._Handle, "losecapture", this._fS);
                this._Handle.releaseCapture();
            } else {
                GLOBAL.Event.removeEventListener(window, "blur", this._fS);
            };
            //附加程序
            this.onStop();
        }
    };

    /* CommonJS */
    if (typeof require === 'function' && typeof module === 'object' && module && typeof exports === 'object' && exports)
        module.exports = Drag;
    /* AMD */
    else if (typeof define === 'function' && define['amd'])
        define(function() {
            return Drag;
        });
    /* Global */
    else {
        global['Drag'] = global['Drag'] || Drag;
    }

})(this || window);