/*密码强弱    “表单验证/多功能验证版.html”*/


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
            oTarget.detachEvent("on" + sEventType, fnHandler);
        } else {
            oTarget["on" + sEventType] = null;
        };
    };


    var StrengthChack = function(id) {
        this.pwd = document.getElementById(id);
        this.init();
    }

    StrengthChack.prototype = {
        defConfig: {
            O_color: "#eeeeee",
            L_color: "#FF0000",
            M_color: "#FF9900",
            H_color: "#33CC00"
        },
        init: function() {
            var that = this;
            addEventListener(this.pwd, 'keyup', function(e) { //这里使用事件绑定，可以避免不同程序之间的相同事件冲突
                that.pwStrength();
            });
            // blur会在click前发生，这里使用mousedown
            addEventListener(this.pwd, 'blur', function(e) {
                that.pwStrength();
            });
        },
        pwStrength: function() { //当用户放开键盘或密码输入框失去焦点时,根据不同的级别显示不同的颜色
            var pwd = this.pwd.value,
                Lcolor, Mcolor, Hcolor;
            if (pwd == null || pwd == '') {
                Lcolor = Mcolor = Hcolor = this.defConfig["O_color"];
            } else {
                S_level = this.checkStrong(pwd);
                switch (S_level) {
                    case 0:
                        Lcolor = Mcolor = Hcolor = this.defConfig["O_color"];
                    case 1:
                        Lcolor = this.defConfig["L_color"];
                        Mcolor = Hcolor = this.defConfig["O_color"];
                        break;
                    case 2:
                        Lcolor = Mcolor = this.defConfig["M_color"];
                        Hcolor = this.defConfig["O_color"];
                        break;
                    default:
                        Lcolor = Mcolor = Hcolor = this.defConfig["H_color"];
                }
            }
            document.getElementById("strength_L").style.background = Lcolor;
            document.getElementById("strength_M").style.background = Mcolor;
            document.getElementById("strength_H").style.background = Hcolor;
            return;
        },

        CharMode: function(iN) {
            //CharMode函数
            //测试某个字符是属于哪一类.
            if (iN >= 48 && iN <= 57) //数字
                return 1;
            if (iN >= 65 && iN <= 90) //大写字母
                return 2;
            if (iN >= 97 && iN <= 122) //小写
                return 4;
            else
                return 8; //特殊字符
        },

        //bitTotal函数
        //计算出当前密码当中一共有多少种模式
        bitTotal: function(num) {
            modes = 0;
            for (i = 0; i < 4; i++) {
                if (num & 1) modes++;
                num >>>= 1;
            }
            return modes;
        },
        //checkStrong函数
        //返回密码的强度级别
        checkStrong: function(sPW) {
            if (sPW.length <= 4)
                return 0; //密码太短
            Modes = 0;
            for (i = 0; i < sPW.length; i++) {
                Modes |= this.CharMode(sPW.charCodeAt(i)); //测试每一个字符的类别并统计一共有多少种模式.
            }
            return this.bitTotal(Modes);
        }
    }


    if (typeof define === 'function' && define['amd'])
        define("StrengthChack", [], function() {
            return StrengthChack;
        });
    /* Global */
    else
        window['StrengthChack'] = StrengthChack;

}));