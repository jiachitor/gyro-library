//弹出插件
// 说明：该款插件功能比较简单，只提供居中、定位、遮罩等功能，没有提供现实和关闭事件
//使用方法
/*
var popping1 = new popping({
     allchooseid  : "js-popping",       *//*使用这个id是为了保证一个页面里只有一个弹出框显示,所有弹出框都放在这个id 里面*//*
     alldragclass  : "js-ui-dragboxs",  *//*配合上面，需要唯一显示的弹出框都配置相同的class,用来控制唯一显示*//*
     displayusage  : "fixDrag",  *//*“middleDrag”为剧中显示，“fixDrag”为定位显示*//*
     closeBtn : "js-store-dialog-close",  *//*关闭按钮id*//*
     showshade : false,              //是否显示遮罩
     shadeName :"js-popup-shade",    //遮罩的id
     onresize : true,                 // 窗口大小变化时是否触发事件
     background : "#000",             //遮罩的背景颜色
     opacity : "0.7",                 //遮罩的透明度
     tanBox : "js-inventory-dialog",                  //通过id来选择弹出框
     showBtn : "js-store-selector",                //通过具体id 值来选择弹出事件触发对象
     fixDrag_X : 0,               //固定位置弹出时设置X轴 方向的偏移量
     fixDrag_Y : 25                //固定位置弹出时设置Y轴 方向的偏移量
 });
 */

/*用于点击页面隐藏弹出层*/
/*
 var tmpContextMenuOn = false;
 jQuery(document).ready(function(){
     jQuery("#js-inventory-dialog").hover(function(){
         tmpContextMenuOn = true;
     },function(){
         tmpContextMenuOn = false;
         }
     );
     jQuery(document).mousedown(function(){
         if(!tmpContextMenuOn){
            jQuery("#js-inventory-dialog").hide();
         }
     });
 });
 */


(function (global) {
    "use strict";

    Popping = function(options){
        this._initialize(options);
    }
    Popping.prototype = {
        _initialize: function(options) {
            var opt = this._setOptions(options);
            this.showshade = opt.showshade;

            this.allchooseid  = opt.allchooseid || this;
            this.alldragclass  = opt.alldragclass;
            this.displayusage  = opt.displayusage;
            this.onresize = opt.onresize;
            this.tanBox = document.getElementById(opt.tanBox);
            this.eventtype = opt.eventtype;
            this.shadeName = opt.shadeName;
            this.fixDrag_X = opt.fixDrag_X;
            this.fixDrag_Y = opt.fixDrag_Y;

            this.background = opt.background;
            this.opacity = opt.opacity;
            this.showBtn= document.getElementById(opt.showBtn);
            this.closeBtn= document.getElementById(opt.closeBtn);
            this.init();
        },
        //设置默认属性
        _setOptions: function(options) {
            this.options = { //默认值
                allchooseid  : "J_popping",       /*使用这个id是为了保证一个页面里只有一个弹出框显示,所有弹出框都放在这个id 里面*/
                alldragclass  : "J-ui-dragBox",  /*配合上面，需要唯一显示的弹出框都配置相同的class,用来控制唯一显示*/
                displayusage  : "middleDrag",
                closeBtn : "J_dragClose",    //关闭按钮id
                eventtype : "click",           //触发事件类型
                showshade : false,              //是否显示遮罩
                shadeName :"J_popup_zhezhao",    //遮罩的id
                onresize : true,                 // 窗口大小变化时是否触发事件
                background : "#000",             //遮罩的背景颜色
                opacity : "0.7",                 //遮罩的透明度
                tanBox : null,                   //通过id来选择弹出框
                showBtn : null,                  //通过具体id 值来选择弹出事件触发对象
                fixDrag_X : null,               //固定位置弹出时设置X轴 方向的偏移量
                fixDrag_Y : null                //固定位置弹出时设置Y轴 方向的偏移量
            };
            return GLOBAL.Objects.extend(this.options, options || {});
        },
        init:function(){
            var _this=this;
            if(_this.showBtn){
                GLOBAL.Event.addEventListener(_this.showBtn,_this.eventtype,function(e){
                    _this[_this.displayusage]();
                });
            };
            GLOBAL.Event.addEventListener(_this.closeBtn,_this.eventtype,function(e){
                _this.shadeClose();
            });
        },
        /*显示遮罩*/
        shadeShow:function(){
            //创建遮罩层
            var theShadeDiv=document.getElementById(this.shadeName);
            if(theShadeDiv == null){
                var newMask = document.createElement("div");
                newMask.id = this.shadeName;
                document.body.appendChild(newMask);
                var theShadeDiv=document.getElementById(this.shadeName);
            };
            this.zhezhao = theShadeDiv;
            GLOBAL.Dom.setStyle(this.zhezhao, {
                display : "block",
                overflow: "hidden",
                width: "100%",
                height: "100%",
                border: 0,
                padding: 0,
                margin: 0,
                zIndex:100,
                position:"absolute",
                top: 0,
                left: 0
            });
            var topScroll=document.documentElement.scrollTop+document.body.scrollTop; //为了解决chrome下的bug
            var leftScroll=document.documentElement.scrollLeft+document.body.scrollLeft;
            var height1=document.documentElement.clientHeight + topScroll;
            var width1=document.documentElement.clientWidth + leftScroll;
            if(document.documentElement.scrollHeight >= height1){
                this.zhezhao.style.height = document.documentElement.scrollHeight + "px";
            }else{
                this.zhezhao.style.height = height1 + "px";
            };

            if(document.documentElement.scrollWidth >= width1){
                this.zhezhao.style.width = document.documentElement.scrollWidth + "px";
            }else{
                this.zhezhao.style.width =width1+"px";
            };

            this.zhezhao.style.background = this.background;
            this.zhezhao.style.opacity = this.opacity;
            this.zhezhao.style.filter = "Alpha(opacity="+this.opacity*100+")";

        },
        /*关闭弹出层*/
        shadeClose:function(){
            this.tanBox.style.display = "none";
            if(this.showshade){this.zhezhao.style.display = "none";};
            if(this.showBtn){this.showBtn.className = "";};
        },
        //弹出层居中
        middleDrag:function(){
            var _this=this;
            var pop_width = GLOBAL.Dom.getStyle(this.tanBox,"width");
            var pop_height = GLOBAL.Dom.getStyle(this.tanBox,"height");
            var topScroll=document.documentElement.scrollTop+document.body.scrollTop; //为了解决chrome下的bug
            var leftScroll=document.documentElement.scrollLeft+document.body.scrollLeft;
            divtop = (document.documentElement.clientHeight-parseInt(pop_height))/2+topScroll;
            divleft = (document.documentElement.clientWidth-parseInt(pop_width))/2+leftScroll;
            this.tanBox.style.top = divtop+"px";
            this.tanBox.style.left = divleft+"px";
            /*以下这里是为了保证一个页面里只有一个弹出框显示*/
            var Choose=document.getElementById(this.allchooseid);
            var drags=GLOBAL.Dom.getElementsByClassName(Choose,'',this.alldragclass);
            var dragsshow=[];
            for(i=0,n=drags.length;i<n;i++){
                if(drags[i].style.display == "block"){
                    dragsshow.push(drags[i]);
                };
            };
            if(dragsshow.length == 0){
                this.tanBox.style.display = "block";
                if(this.showshade)this.shadeShow();
            }else if(dragsshow.length > 0){
                return;
            };

            window.onresize=function(){
                if(_this.tanBox.style.display == "block"){
                    _this[_this.displayusage]();
                };
                if(_this.zhezhao.style.display == "block"){
                    if(_this.showshade)_this.shadeShow();
                };
            };
        },
        /*根据元素定位弹出框*/
        fixDrag:function(){
            var position=GLOBAL.Dom.rect(this.showBtn);
            var boxwidth=parseInt(this.tanBox.style.width);
            this.tanBox.style.top = position.top+parseInt(this.fixDrag_Y)+"px";
            this.tanBox.style.left = position.left+parseInt(this.fixDrag_X)+"px";
            var Choose=document.getElementById(this.allchooseid);
            var drags=GLOBAL.Dom.getElementsByClassName(Choose,'',this.alldragclass);
            var dragsshow=[];
            for(i=0,n=drags.length;i<n;i++){
                if(drags[i].style.display == "block"){
                    dragsshow.push(drags[i]);
                }
            };
            if(dragsshow.length == 0){
                this.tanBox.style.display = "block";
                this.showBtn.className = "ui-btnShow-avtive";
            }else if(dragsshow.length > 0){
                return;
            };
        }
    };

  /* CommonJS */
  if (typeof require === 'function' && typeof module === 'object' && module && typeof exports === 'object' && exports)
    module.exports = Popping;
  /* AMD */
  else if (typeof define === 'function' && define['amd'])
    define(function() {
      return Popping;
    });
  /* Global */
  else {
    global['Popping'] = global['Popping'] || Popping;
  }

})(this || window);
