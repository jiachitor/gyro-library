(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcQrcodeIndexJs = require('../../../src/qrcode/index.js');

var _srcQrcodeIndexJs2 = _interopRequireDefault(_srcQrcodeIndexJs);

(function () {
  var ready = function ready(fn) {
    var doc = document;
    if (doc.addEventListener) {
      doc.addEventListener('DOMContentLoaded', fn, false);
    } else {
      doc.attachEvent('onreadystatechange', fn);
    }
  };
  ready(function () {
    var qrnode1 = new _srcQrcodeIndexJs2['default']({
      text: 'http://www.alipay.com/'
    });
    document.getElementById('qrcodeDefault').appendChild(qrnode1);

    var qrnode2 = new _srcQrcodeIndexJs2['default']({
      render: 'table',
      correctLevel: 0,
      pdground: '#00aaee',
      text: 'http://www.alipay.com/',
      size: 100,
      image: 'https://t.alipayobjects.com/images/rmsweb/T1ZsxhXdxbXXXXXXXX.png'
    });
    document.getElementById('qrcodeTable').appendChild(qrnode2);

    var qrnode3 = new _srcQrcodeIndexJs2['default']({
      render: 'canvas',
      correctLevel: 0,
      text: 'http://www.alipay.com/',
      size: 300,
      background: '#eeeeee',
      foreground: '#667766',
      pdground: '#00aaee',
      image: 'https://t.alipayobjects.com/images/rmsweb/T1ZsxhXdxbXXXXXXXX.png',
      imageSize: 100
    });
    document.getElementById('qrcodeCanvas').appendChild(qrnode3);

    var qrnode4 = new _srcQrcodeIndexJs2['default']({
      correctLevel: 0,
      render: 'svg',
      text: 'http://www.alipay.com/',
      size: 200,
      pdground: '#00aaee',
      image: 'https://t.alipayobjects.com/images/rmsweb/T1ZsxhXdxbXXXXXXXX.png',
      imageSize: 30
    });
    document.getElementById('qrcodeSVG').appendChild(qrnode4);
  }, false);
})();

},{"../../../src/qrcode/index.js":2}],2:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _mainMainJs = require('./main/main.js');

var _mainMainJs2 = _interopRequireDefault(_mainMainJs);

module.exports = _mainMainJs2["default"];

},{"./main/main.js":3}],3:[function(require,module,exports){
'use strict';

var qrcodeAlgObjCache = [];
var QRCodeAlg = require('./qrcodealg');

function extend(object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};

/**
* 计算矩阵点的前景色
* @param {Obj} config
* @param {Number} config.row 点x坐标
* @param {Number} config.col 点y坐标
* @param {Number} config.count 矩阵大小
* @param {Number} config.options 组件的options
* @return {String}
*/
var getForeGround = function getForeGround(config) {
    var options = config.options;
    if (options.pdground && (config.row > 1 && config.row < 5 && config.col > 1 && config.col < 5 || config.row > config.count - 6 && config.row < config.count - 2 && config.col > 1 && config.col < 5 || config.row > 1 && config.row < 5 && config.col > config.count - 6 && config.col < config.count - 2)) {
        return options.pdground;
    }
    return options.foreground;
};
/**
* 点是否在Position Detection
* @param  {row} 矩阵行
* @param  {col} 矩阵列
* @param  {count} 矩阵大小
* @return {Boolean}
*/
var inPositionDetection = function inPositionDetection(row, col, count) {
    if (row < 7 && col < 7 || row > count - 8 && col < 7 || row < 7 && col > count - 8) {
        return true;
    }
    return false;
};
/**
* 获取当前屏幕的设备像素比 devicePixelRatio/backingStore
* @param {context} 当前 canvas 上下文，可以为 window
*/
var getPixelRatio = function getPixelRatio(context) {
    var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;

    return (window.devicePixelRatio || 1) / backingStore;
};

/**
 * 二维码构造函数，主要用于绘制
 * @param  {参数列表} opt 传递参数
 * @return {}
 */
var qrcode = function qrcode(opt) {
    if (typeof opt === 'string') {
        // 只编码ASCII字符串
        opt = {
            text: opt
        };
    }
    //设置默认参数
    this.options = extend({}, {
        text: '',
        render: '',
        size: 256,
        correctLevel: 3,
        background: '#ffffff',
        foreground: '#000000',
        image: '',
        imageSize: 30
    }, opt);

    //使用QRCodeAlg创建二维码结构
    var qrCodeAlg = null;
    for (var i = 0, l = qrcodeAlgObjCache.length; i < l; i++) {
        if (qrcodeAlgObjCache[i].text == this.options.text && qrcodeAlgObjCache[i].text.correctLevel == this.options.correctLevel) {
            qrCodeAlg = qrcodeAlgObjCache[i].obj;
            break;
        }
    }

    if (i == l) {
        qrCodeAlg = new QRCodeAlg(this.options.text, this.options.correctLevel);
        qrcodeAlgObjCache.push({ text: this.options.text, correctLevel: this.options.correctLevel, obj: qrCodeAlg });
    }

    if (this.options.render) {
        switch (this.options.render) {
            case 'canvas':
                return this.createCanvas(qrCodeAlg);
            case 'table':
                return this.createTable(qrCodeAlg);
            case 'svg':
                return this.createSVG(qrCodeAlg);
            default:
                return this.createDefault(qrCodeAlg);
        }
    }
    return this.createDefault(qrCodeAlg);
};

extend(qrcode.prototype, {
    // default create  canvas -> svg -> table
    createDefault: function createDefault(qrCodeAlg) {
        var canvas = document.createElement('canvas');
        if (canvas.getContext) {
            return this.createCanvas(qrCodeAlg);
        }
        var SVG_NS = 'http://www.w3.org/2000/svg';
        if (!!document.createElementNS && !!document.createElementNS(SVG_NS, 'svg').createSVGRect) {
            return this.createSVG(qrCodeAlg);
        }
        return this.createTable(qrCodeAlg);
    },
    // canvas create
    createCanvas: function createCanvas(qrCodeAlg) {
        var options = this.options;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var count = qrCodeAlg.getModuleCount();
        var ratio = getPixelRatio(ctx);
        var size = options.size;
        var ratioSize = size * ratio;
        var ratioImgSize = options.imageSize * ratio;
        // preload img
        var loadImage = function loadImage(url, callback) {
            var img = new Image();
            img.src = url;
            img.onload = function () {
                callback(this);
                img.onload = null;
            };
        };

        //计算每个点的长宽
        var tileW = (ratioSize / count).toPrecision(4);
        var tileH = (ratioSize / count).toPrecision(4);

        canvas.width = ratioSize;
        canvas.height = ratioSize;

        //绘制
        for (var row = 0; row < count; row++) {
            for (var col = 0; col < count; col++) {
                var w = Math.ceil((col + 1) * tileW) - Math.floor(col * tileW);
                var h = Math.ceil((row + 1) * tileW) - Math.floor(row * tileW);
                var foreground = getForeGround({
                    row: row,
                    col: col,
                    count: count,
                    options: options
                });
                ctx.fillStyle = qrCodeAlg.modules[row][col] ? foreground : options.background;
                ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
            }
        }
        if (options.image) {
            loadImage(options.image, function (img) {
                var x = ((ratioSize - ratioImgSize) / 2).toFixed(2);
                var y = ((ratioSize - ratioImgSize) / 2).toFixed(2);
                ctx.drawImage(img, x, y, ratioImgSize, ratioImgSize);
            });
        }
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        return canvas;
    },
    // table create
    createTable: function createTable(qrCodeAlg) {
        var options = this.options;
        var count = qrCodeAlg.getModuleCount();

        // 计算每个节点的长宽；取整，防止点之间出现分离
        var tileW = Math.floor(options.size / count);
        var tileH = Math.floor(options.size / count);
        if (tileW <= 0) {
            tileW = count < 80 ? 2 : 1;
        }
        if (tileH <= 0) {
            tileH = count < 80 ? 2 : 1;
        }

        //创建table节点
        //重算码大小
        var s = [];
        s.push('<table style="border:0px; margin:0px; padding:0px; border-collapse:collapse; background-color:' + options.background + ';">');

        // 绘制二维码
        for (var row = 0; row < count; row++) {
            s.push('<tr style="border:0px; margin:0px; padding:0px; height:' + tileH + 'px">');
            for (var col = 0; col < count; col++) {
                var foreground = getForeGround({
                    row: row,
                    col: col,
                    count: count,
                    options: options
                });
                if (qrCodeAlg.modules[row][col]) {
                    s.push('<td style="border:0px; margin:0px; padding:0px; width:' + tileW + 'px; background-color:' + foreground + '"></td>');
                } else {
                    s.push('<td style="border:0px; margin:0px; padding:0px; width:' + tileW + 'px; background-color:' + options.background + '"></td>');
                }
            }
            s.push('</tr>');
        }
        s.push('</table>');

        if (options.image) {
            // 计算表格的总大小
            var width = tileW * count;
            var height = tileH * count;
            var x = ((width - options.imageSize) / 2).toFixed(2);
            var y = ((height - options.imageSize) / 2).toFixed(2);
            s.unshift('<div style=\'position:relative;\n                        width:' + width + 'px;\n                        height:' + height + 'px;\'>');
            s.push('<img src=\'' + options.image + '\'\n                        width=\'' + options.imageSize + '\'\n                        height=\'' + options.imageSize + '\'\n                        style=\'position:absolute;left:' + x + 'px; top:' + y + 'px;\'>');
            s.push('</div>');
        }

        var span = document.createElement('span');
        span.innerHTML = s.join('');

        return span.firstChild;
    },
    // create svg
    createSVG: function createSVG(qrCodeAlg) {
        var options = this.options;
        var count = qrCodeAlg.getModuleCount();
        var scale = count / options.size;

        // create svg
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', options.size);
        svg.setAttribute('height', options.size);
        svg.setAttribute('viewBox', '0 0 ' + count + ' ' + count);

        for (var row = 0; row < count; row++) {
            for (var col = 0; col < count; col++) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                var foreground = getForeGround({
                    row: row,
                    col: col,
                    count: count,
                    options: options
                });
                rect.setAttribute('x', col);
                rect.setAttribute('y', row);
                rect.setAttribute('width', 1);
                rect.setAttribute('height', 1);
                rect.setAttribute('stroke-width', 0);
                if (qrCodeAlg.modules[row][col]) {
                    rect.setAttribute('fill', foreground);
                } else {
                    rect.setAttribute('fill', options.background);
                }
                svg.appendChild(rect);
            }
        }

        // create image
        if (options.image) {
            var img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', options.image);
            img.setAttribute('x', ((count - options.imageSize * scale) / 2).toFixed(2));
            img.setAttribute('y', ((count - options.imageSize * scale) / 2).toFixed(2));
            img.setAttribute('width', options.imageSize * scale);
            img.setAttribute('height', options.imageSize * scale);
            svg.appendChild(img);
        }

        return svg;
    }
});
module.exports = qrcode;

},{"./qrcodealg":4}],4:[function(require,module,exports){
/**
 * 获取单个字符的utf8编码
 * unicode BMP平面约65535个字符
 * @param {num} code
 * return {array}
 */
"use strict";

function unicodeFormat8(code) {
	// 1 byte
	var c0, c1, c2;
	if (code < 128) {
		return [code];
		// 2 bytes
	} else if (code < 2048) {
			c0 = 192 + (code >> 6);
			c1 = 128 + (code & 63);
			return [c0, c1];
			// 3 bytes
		} else {
				c0 = 224 + (code >> 12);
				c1 = 128 + (code >> 6 & 63);
				c2 = 128 + (code & 63);
				return [c0, c1, c2];
			}
}

/**
 * 获取字符串的utf8编码字节串
 * @param {string} string
 * @return {array}
 */
function getUTF8Bytes(string) {
	var utf8codes = [];
	for (var i = 0; i < string.length; i++) {
		var code = string.charCodeAt(i);
		var utf8 = unicodeFormat8(code);
		for (var j = 0; j < utf8.length; j++) {
			utf8codes.push(utf8[j]);
		}
	}
	return utf8codes;
}

/**
 * 二维码算法实现
 * @param {string} data              要编码的信息字符串
 * @param {num} errorCorrectLevel 纠错等级
 */
function QRCodeAlg(data, errorCorrectLevel) {
	this.typeNumber = -1; //版本
	this.errorCorrectLevel = errorCorrectLevel;
	this.modules = null; //二维矩阵，存放最终结果
	this.moduleCount = 0; //矩阵大小
	this.dataCache = null; //数据缓存
	this.rsBlocks = null; //版本数据信息
	this.totalDataCount = -1; //可使用的数据量
	this.data = data;
	this.utf8bytes = getUTF8Bytes(data);
	this.make();
}

QRCodeAlg.prototype = {
	constructor: QRCodeAlg,
	/**
  * 获取二维码矩阵大小
  * @return {num} 矩阵大小
  */
	getModuleCount: function getModuleCount() {
		return this.moduleCount;
	},
	/**
  * 编码
  */
	make: function make() {
		this.getRightType();
		this.dataCache = this.createData();
		this.createQrcode();
	},
	/**
  * 设置二位矩阵功能图形
  * @param  {bool} test 表示是否在寻找最好掩膜阶段
  * @param  {num} maskPattern 掩膜的版本
  */
	makeImpl: function makeImpl(maskPattern) {

		this.moduleCount = this.typeNumber * 4 + 17;
		this.modules = new Array(this.moduleCount);

		for (var row = 0; row < this.moduleCount; row++) {

			this.modules[row] = new Array(this.moduleCount);
		}
		this.setupPositionProbePattern(0, 0);
		this.setupPositionProbePattern(this.moduleCount - 7, 0);
		this.setupPositionProbePattern(0, this.moduleCount - 7);
		this.setupPositionAdjustPattern();
		this.setupTimingPattern();
		this.setupTypeInfo(true, maskPattern);

		if (this.typeNumber >= 7) {
			this.setupTypeNumber(true);
		}
		this.mapData(this.dataCache, maskPattern);
	},
	/**
  * 设置二维码的位置探测图形
  * @param  {num} row 探测图形的中心横坐标
  * @param  {num} col 探测图形的中心纵坐标
  */
	setupPositionProbePattern: function setupPositionProbePattern(row, col) {

		for (var r = -1; r <= 7; r++) {

			if (row + r <= -1 || this.moduleCount <= row + r) continue;

			for (var c = -1; c <= 7; c++) {

				if (col + c <= -1 || this.moduleCount <= col + c) continue;

				if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
					this.modules[row + r][col + c] = true;
				} else {
					this.modules[row + r][col + c] = false;
				}
			}
		}
	},
	/**
  * 创建二维码
  * @return {[type]} [description]
  */
	createQrcode: function createQrcode() {

		var minLostPoint = 0;
		var pattern = 0;
		var bestModules = null;

		for (var i = 0; i < 8; i++) {

			this.makeImpl(i);

			var lostPoint = QRUtil.getLostPoint(this);
			if (i == 0 || minLostPoint > lostPoint) {
				minLostPoint = lostPoint;
				pattern = i;
				bestModules = this.modules;
			}
		}
		this.modules = bestModules;
		this.setupTypeInfo(false, pattern);

		if (this.typeNumber >= 7) {
			this.setupTypeNumber(false);
		}
	},
	/**
  * 设置定位图形
  * @return {[type]} [description]
  */
	setupTimingPattern: function setupTimingPattern() {

		for (var r = 8; r < this.moduleCount - 8; r++) {
			if (this.modules[r][6] != null) {
				continue;
			}
			this.modules[r][6] = r % 2 == 0;

			if (this.modules[6][r] != null) {
				continue;
			}
			this.modules[6][r] = r % 2 == 0;
		}
	},
	/**
  * 设置矫正图形
  * @return {[type]} [description]
  */
	setupPositionAdjustPattern: function setupPositionAdjustPattern() {

		var pos = QRUtil.getPatternPosition(this.typeNumber);

		for (var i = 0; i < pos.length; i++) {

			for (var j = 0; j < pos.length; j++) {

				var row = pos[i];
				var col = pos[j];

				if (this.modules[row][col] != null) {
					continue;
				}

				for (var r = -2; r <= 2; r++) {

					for (var c = -2; c <= 2; c++) {

						if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
							this.modules[row + r][col + c] = true;
						} else {
							this.modules[row + r][col + c] = false;
						}
					}
				}
			}
		}
	},
	/**
  * 设置版本信息（7以上版本才有）
  * @param  {bool} test 是否处于判断最佳掩膜阶段
  * @return {[type]}      [description]
  */
	setupTypeNumber: function setupTypeNumber(test) {

		var bits = QRUtil.getBCHTypeNumber(this.typeNumber);

		for (var i = 0; i < 18; i++) {
			var mod = !test && (bits >> i & 1) == 1;
			this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
			this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
		}
	},
	/**
  * 设置格式信息（纠错等级和掩膜版本）
  * @param  {bool} test
  * @param  {num} maskPattern 掩膜版本
  * @return {}
  */
	setupTypeInfo: function setupTypeInfo(test, maskPattern) {

		var data = QRErrorCorrectLevel[this.errorCorrectLevel] << 3 | maskPattern;
		var bits = QRUtil.getBCHTypeInfo(data);

		// vertical
		for (var i = 0; i < 15; i++) {

			var mod = !test && (bits >> i & 1) == 1;

			if (i < 6) {
				this.modules[i][8] = mod;
			} else if (i < 8) {
				this.modules[i + 1][8] = mod;
			} else {
				this.modules[this.moduleCount - 15 + i][8] = mod;
			}

			// horizontal
			var mod = !test && (bits >> i & 1) == 1;

			if (i < 8) {
				this.modules[8][this.moduleCount - i - 1] = mod;
			} else if (i < 9) {
				this.modules[8][15 - i - 1 + 1] = mod;
			} else {
				this.modules[8][15 - i - 1] = mod;
			}
		}

		// fixed module
		this.modules[this.moduleCount - 8][8] = !test;
	},
	/**
  * 数据编码
  * @return {[type]} [description]
  */
	createData: function createData() {
		var buffer = new QRBitBuffer();
		var lengthBits = this.typeNumber > 9 ? 16 : 8;
		buffer.put(4, 4); //添加模式
		buffer.put(this.utf8bytes.length, lengthBits);
		for (var i = 0, l = this.utf8bytes.length; i < l; i++) {
			buffer.put(this.utf8bytes[i], 8);
		}
		if (buffer.length + 4 <= this.totalDataCount * 8) {
			buffer.put(0, 4);
		}

		// padding
		while (buffer.length % 8 != 0) {
			buffer.putBit(false);
		}

		// padding
		while (true) {

			if (buffer.length >= this.totalDataCount * 8) {
				break;
			}
			buffer.put(QRCodeAlg.PAD0, 8);

			if (buffer.length >= this.totalDataCount * 8) {
				break;
			}
			buffer.put(QRCodeAlg.PAD1, 8);
		}
		return this.createBytes(buffer);
	},
	/**
  * 纠错码编码
  * @param  {buffer} buffer 数据编码
  * @return {[type]}
  */
	createBytes: function createBytes(buffer) {

		var offset = 0;

		var maxDcCount = 0;
		var maxEcCount = 0;

		var length = this.rsBlock.length / 3;

		var rsBlocks = new Array();

		for (var i = 0; i < length; i++) {

			var count = this.rsBlock[i * 3 + 0];
			var totalCount = this.rsBlock[i * 3 + 1];
			var dataCount = this.rsBlock[i * 3 + 2];

			for (var j = 0; j < count; j++) {
				rsBlocks.push([dataCount, totalCount]);
			}
		}

		var dcdata = new Array(rsBlocks.length);
		var ecdata = new Array(rsBlocks.length);

		for (var r = 0; r < rsBlocks.length; r++) {

			var dcCount = rsBlocks[r][0];
			var ecCount = rsBlocks[r][1] - dcCount;

			maxDcCount = Math.max(maxDcCount, dcCount);
			maxEcCount = Math.max(maxEcCount, ecCount);

			dcdata[r] = new Array(dcCount);

			for (var i = 0; i < dcdata[r].length; i++) {
				dcdata[r][i] = 0xff & buffer.buffer[i + offset];
			}
			offset += dcCount;

			var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
			var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

			var modPoly = rawPoly.mod(rsPoly);
			ecdata[r] = new Array(rsPoly.getLength() - 1);
			for (var i = 0; i < ecdata[r].length; i++) {
				var modIndex = i + modPoly.getLength() - ecdata[r].length;
				ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
			}
		}

		var data = new Array(this.totalDataCount);
		var index = 0;

		for (var i = 0; i < maxDcCount; i++) {
			for (var r = 0; r < rsBlocks.length; r++) {
				if (i < dcdata[r].length) {
					data[index++] = dcdata[r][i];
				}
			}
		}

		for (var i = 0; i < maxEcCount; i++) {
			for (var r = 0; r < rsBlocks.length; r++) {
				if (i < ecdata[r].length) {
					data[index++] = ecdata[r][i];
				}
			}
		}

		return data;
	},
	/**
  * 布置模块，构建最终信息
  * @param  {} data
  * @param  {} maskPattern
  * @return {}
  */
	mapData: function mapData(data, maskPattern) {

		var inc = -1;
		var row = this.moduleCount - 1;
		var bitIndex = 7;
		var byteIndex = 0;

		for (var col = this.moduleCount - 1; col > 0; col -= 2) {

			if (col == 6) col--;

			while (true) {

				for (var c = 0; c < 2; c++) {

					if (this.modules[row][col - c] == null) {

						var dark = false;

						if (byteIndex < data.length) {
							dark = (data[byteIndex] >>> bitIndex & 1) == 1;
						}

						var mask = QRUtil.getMask(maskPattern, row, col - c);

						if (mask) {
							dark = !dark;
						}

						this.modules[row][col - c] = dark;
						bitIndex--;

						if (bitIndex == -1) {
							byteIndex++;
							bitIndex = 7;
						}
					}
				}

				row += inc;

				if (row < 0 || this.moduleCount <= row) {
					row -= inc;
					inc = -inc;
					break;
				}
			}
		}
	}

};
/**
 * 填充字段
 */
QRCodeAlg.PAD0 = 0xEC;
QRCodeAlg.PAD1 = 0x11;

//---------------------------------------------------------------------
// 纠错等级对应的编码
//---------------------------------------------------------------------

var QRErrorCorrectLevel = [1, 0, 3, 2];

//---------------------------------------------------------------------
// 掩膜版本
//---------------------------------------------------------------------

var QRMaskPattern = {
	PATTERN000: 0,
	PATTERN001: 1,
	PATTERN010: 2,
	PATTERN011: 3,
	PATTERN100: 4,
	PATTERN101: 5,
	PATTERN110: 6,
	PATTERN111: 7
};

//---------------------------------------------------------------------
// 工具类
//---------------------------------------------------------------------

var QRUtil = {

	/*
 每个版本矫正图形的位置
  */
	PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],

	G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0,
	G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0,
	G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1,

	/*
 BCH编码格式信息
  */
	getBCHTypeInfo: function getBCHTypeInfo(data) {
		var d = data << 10;
		while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
			d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
		}
		return (data << 10 | d) ^ QRUtil.G15_MASK;
	},
	/*
 BCH编码版本信息
  */
	getBCHTypeNumber: function getBCHTypeNumber(data) {
		var d = data << 12;
		while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
			d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
		}
		return data << 12 | d;
	},
	/*
 获取BCH位信息
  */
	getBCHDigit: function getBCHDigit(data) {

		var digit = 0;

		while (data != 0) {
			digit++;
			data >>>= 1;
		}

		return digit;
	},
	/*
 获取版本对应的矫正图形位置
  */
	getPatternPosition: function getPatternPosition(typeNumber) {
		return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
	},
	/*
 掩膜算法
  */
	getMask: function getMask(maskPattern, i, j) {

		switch (maskPattern) {

			case QRMaskPattern.PATTERN000:
				return (i + j) % 2 == 0;
			case QRMaskPattern.PATTERN001:
				return i % 2 == 0;
			case QRMaskPattern.PATTERN010:
				return j % 3 == 0;
			case QRMaskPattern.PATTERN011:
				return (i + j) % 3 == 0;
			case QRMaskPattern.PATTERN100:
				return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
			case QRMaskPattern.PATTERN101:
				return i * j % 2 + i * j % 3 == 0;
			case QRMaskPattern.PATTERN110:
				return (i * j % 2 + i * j % 3) % 2 == 0;
			case QRMaskPattern.PATTERN111:
				return (i * j % 3 + (i + j) % 2) % 2 == 0;

			default:
				throw new Error("bad maskPattern:" + maskPattern);
		}
	},
	/*
 获取RS的纠错多项式
  */
	getErrorCorrectPolynomial: function getErrorCorrectPolynomial(errorCorrectLength) {

		var a = new QRPolynomial([1], 0);

		for (var i = 0; i < errorCorrectLength; i++) {
			a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
		}

		return a;
	},
	/*
 获取评价
  */
	getLostPoint: function getLostPoint(qrCode) {

		var moduleCount = qrCode.getModuleCount(),
		    lostPoint = 0,
		    darkCount = 0;

		for (var row = 0; row < moduleCount; row++) {

			var sameCount = 0;
			var head = qrCode.modules[row][0];

			for (var col = 0; col < moduleCount; col++) {

				var current = qrCode.modules[row][col];

				//level 3 评价
				if (col < moduleCount - 6) {
					if (current && !qrCode.modules[row][col + 1] && qrCode.modules[row][col + 2] && qrCode.modules[row][col + 3] && qrCode.modules[row][col + 4] && !qrCode.modules[row][col + 5] && qrCode.modules[row][col + 6]) {
						if (col < moduleCount - 10) {
							if (qrCode.modules[row][col + 7] && qrCode.modules[row][col + 8] && qrCode.modules[row][col + 9] && qrCode.modules[row][col + 10]) {
								lostPoint += 40;
							}
						} else if (col > 3) {
							if (qrCode.modules[row][col - 1] && qrCode.modules[row][col - 2] && qrCode.modules[row][col - 3] && qrCode.modules[row][col - 4]) {
								lostPoint += 40;
							}
						}
					}
				}

				//level 2 评价
				if (row < moduleCount - 1 && col < moduleCount - 1) {
					var count = 0;
					if (current) count++;
					if (qrCode.modules[row + 1][col]) count++;
					if (qrCode.modules[row][col + 1]) count++;
					if (qrCode.modules[row + 1][col + 1]) count++;
					if (count == 0 || count == 4) {
						lostPoint += 3;
					}
				}

				//level 1 评价
				if (head ^ current) {
					sameCount++;
				} else {
					head = current;
					if (sameCount >= 5) {
						lostPoint += 3 + sameCount - 5;
					}
					sameCount = 1;
				}

				//level 4 评价
				if (current) {
					darkCount++;
				}
			}
		}

		for (var col = 0; col < moduleCount; col++) {

			var sameCount = 0;
			var head = qrCode.modules[0][col];

			for (var row = 0; row < moduleCount; row++) {

				var current = qrCode.modules[row][col];

				//level 3 评价
				if (row < moduleCount - 6) {
					if (current && !qrCode.modules[row + 1][col] && qrCode.modules[row + 2][col] && qrCode.modules[row + 3][col] && qrCode.modules[row + 4][col] && !qrCode.modules[row + 5][col] && qrCode.modules[row + 6][col]) {
						if (row < moduleCount - 10) {
							if (qrCode.modules[row + 7][col] && qrCode.modules[row + 8][col] && qrCode.modules[row + 9][col] && qrCode.modules[row + 10][col]) {
								lostPoint += 40;
							}
						} else if (row > 3) {
							if (qrCode.modules[row - 1][col] && qrCode.modules[row - 2][col] && qrCode.modules[row - 3][col] && qrCode.modules[row - 4][col]) {
								lostPoint += 40;
							}
						}
					}
				}

				//level 1 评价
				if (head ^ current) {
					sameCount++;
				} else {
					head = current;
					if (sameCount >= 5) {
						lostPoint += 3 + sameCount - 5;
					}
					sameCount = 1;
				}
			}
		}

		// LEVEL4

		var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
		lostPoint += ratio * 10;

		return lostPoint;
	}

};

//---------------------------------------------------------------------
// QRMath使用的数学工具
//---------------------------------------------------------------------

var QRMath = {
	/*
 将n转化为a^m
  */
	glog: function glog(n) {

		if (n < 1) {
			throw new Error("glog(" + n + ")");
		}

		return QRMath.LOG_TABLE[n];
	},
	/*
 将a^m转化为n
  */
	gexp: function gexp(n) {

		while (n < 0) {
			n += 255;
		}

		while (n >= 256) {
			n -= 255;
		}

		return QRMath.EXP_TABLE[n];
	},

	EXP_TABLE: new Array(256),

	LOG_TABLE: new Array(256)

};

for (var i = 0; i < 8; i++) {
	QRMath.EXP_TABLE[i] = 1 << i;
}
for (var i = 8; i < 256; i++) {
	QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
	QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
}

//---------------------------------------------------------------------
// QRPolynomial 多项式
//---------------------------------------------------------------------
/**
 * 多项式类
 * @param {Array} num   系数
 * @param {num} shift a^shift
 */
function QRPolynomial(num, shift) {

	if (num.length == undefined) {
		throw new Error(num.length + "/" + shift);
	}

	var offset = 0;

	while (offset < num.length && num[offset] == 0) {
		offset++;
	}

	this.num = new Array(num.length - offset + shift);
	for (var i = 0; i < num.length - offset; i++) {
		this.num[i] = num[i + offset];
	}
}

QRPolynomial.prototype = {

	get: function get(index) {
		return this.num[index];
	},

	getLength: function getLength() {
		return this.num.length;
	},
	/**
  * 多项式乘法
  * @param  {QRPolynomial} e 被乘多项式
  * @return {[type]}   [description]
  */
	multiply: function multiply(e) {

		var num = new Array(this.getLength() + e.getLength() - 1);

		for (var i = 0; i < this.getLength(); i++) {
			for (var j = 0; j < e.getLength(); j++) {
				num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
			}
		}

		return new QRPolynomial(num, 0);
	},
	/**
  * 多项式模运算
  * @param  {QRPolynomial} e 模多项式
  * @return {}
  */
	mod: function mod(e) {
		var tl = this.getLength(),
		    el = e.getLength();
		if (tl - el < 0) {
			return this;
		}
		var num = new Array(tl);
		for (var i = 0; i < tl; i++) {
			num[i] = this.get(i);
		}
		while (num.length >= el) {
			var ratio = QRMath.glog(num[0]) - QRMath.glog(e.get(0));

			for (var i = 0; i < e.getLength(); i++) {
				num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
			}
			while (num[0] == 0) {
				num.shift();
			}
		}
		return new QRPolynomial(num, 0);
	}
};

//---------------------------------------------------------------------
// RS_BLOCK_TABLE
//---------------------------------------------------------------------
/*
二维码各个版本信息[块数, 每块中的数据块数, 每块中的信息块数]
 */
var RS_BLOCK_TABLE = [

// L
// M
// Q
// H

// 1
[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],

// 2
[1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],

// 3
[1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],

// 4
[1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],

// 5
[1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],

// 6
[2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],

// 7
[2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],

// 8
[2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],

// 9
[2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],

// 10
[2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],

// 11
[4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13],

// 12
[2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15],

// 13
[4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12],

// 14
[3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13],

// 15
[5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12],

// 16
[5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16],

// 17
[1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15],

// 18
[5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15],

// 19
[3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14],

// 20
[3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16],

// 21
[4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17],

// 22
[2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13],

// 23
[4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16],

// 24
[6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17],

// 25
[8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16],

// 26
[10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17],

// 27
[8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16],

// 28
[3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16],

// 29
[7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16],

// 30
[5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16],

// 31
[13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16],

// 32
[17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16],

// 33
[17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16],

// 34
[13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17],

// 35
[12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16],

// 36
[6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16],

// 37
[17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16],

// 38
[4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16],

// 39
[20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16],

// 40
[19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];

/**
 * 根据数据获取对应版本
 * @return {[type]} [description]
 */
QRCodeAlg.prototype.getRightType = function () {
	for (var typeNumber = 1; typeNumber < 41; typeNumber++) {
		var rsBlock = RS_BLOCK_TABLE[(typeNumber - 1) * 4 + this.errorCorrectLevel];
		if (rsBlock == undefined) {
			throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + this.errorCorrectLevel);
		}
		var length = rsBlock.length / 3;
		var totalDataCount = 0;
		for (var i = 0; i < length; i++) {
			var count = rsBlock[i * 3 + 0];
			var dataCount = rsBlock[i * 3 + 2];
			totalDataCount += dataCount * count;
		}

		var lengthBytes = typeNumber > 9 ? 2 : 1;
		if (this.utf8bytes.length + lengthBytes < totalDataCount || typeNumber == 40) {
			this.typeNumber = typeNumber;
			this.rsBlock = rsBlock;
			this.totalDataCount = totalDataCount;
			break;
		}
	}
};

//---------------------------------------------------------------------
// QRBitBuffer
//---------------------------------------------------------------------

function QRBitBuffer() {
	this.buffer = new Array();
	this.length = 0;
}

QRBitBuffer.prototype = {

	get: function get(index) {
		var bufIndex = Math.floor(index / 8);
		return this.buffer[bufIndex] >>> 7 - index % 8 & 1;
	},

	put: function put(num, length) {
		for (var i = 0; i < length; i++) {
			this.putBit(num >>> length - i - 1 & 1);
		}
	},

	putBit: function putBit(bit) {

		var bufIndex = Math.floor(this.length / 8);
		if (this.buffer.length <= bufIndex) {
			this.buffer.push(0);
		}

		if (bit) {
			this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
		}

		this.length++;
	}
};
module.exports = QRCodeAlg;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkOi9naXRodWJEZXZlbG9wbWVudC9neXJvLWxpYnJhcnkvRVM2L2RlbW8vcXJjb2RlL2pzL2FwcC5qcyIsImQ6L2dpdGh1YkRldmVsb3BtZW50L2d5cm8tbGlicmFyeS9FUzYvc3JjL3FyY29kZS9pbmRleC5qcyIsImQ6L2dpdGh1YkRldmVsb3BtZW50L2d5cm8tbGlicmFyeS9FUzYvc3JjL3FyY29kZS9tYWluL21haW4uanMiLCJkOi9naXRodWJEZXZlbG9wbWVudC9neXJvLWxpYnJhcnkvRVM2L3NyYy9xcmNvZGUvbWFpbi9xcmNvZGVhbGcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O2dDQ0FtQiw4QkFBOEI7Ozs7QUFFakQsQ0FBQyxZQUFXO0FBQ1YsTUFBSSxLQUFLLEdBQUcsU0FBUixLQUFLLENBQVksRUFBRSxFQUFFO0FBQ3ZCLFFBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN4QixTQUFHLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3JELE1BQU07QUFDTCxTQUFHLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzNDO0dBQ0YsQ0FBQztBQUNGLE9BQUssQ0FBQyxZQUFXO0FBQ2YsUUFBSSxPQUFPLEdBQUcsa0NBQVc7QUFDdkIsVUFBSSxFQUFFLHdCQUF3QjtLQUMvQixDQUFDLENBQUM7QUFDSCxZQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFHOUQsUUFBSSxPQUFPLEdBQUcsa0NBQVc7QUFDdkIsWUFBTSxFQUFFLE9BQU87QUFDZixrQkFBWSxFQUFFLENBQUM7QUFDZixjQUFRLEVBQUUsU0FB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QyxTQUFTLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzFELFVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLFFBQVEsSUFBSSxDQUFDLEdBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0Q7R0FDRDs7QUFFRCxNQUFJLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDMUMsTUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDOztBQUVkLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDcEMsUUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekMsUUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUN6QixTQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDN0I7SUFDRDtHQUNEOztBQUVELE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDcEMsUUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekMsUUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUN6QixTQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDN0I7SUFDRDtHQUNEOztBQUVELFNBQU8sSUFBSSxDQUFDO0VBRVo7Ozs7Ozs7QUFPRCxRQUFPLEVBQUUsaUJBQVMsSUFBSSxFQUFFLFdBQVcsRUFBRTs7QUFFcEMsTUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDYixNQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztBQUMvQixNQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDakIsTUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDOztBQUVsQixPQUFLLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRTs7QUFFdkQsT0FBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDOztBQUVwQixVQUFPLElBQUksRUFBRTs7QUFFWixTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFOztBQUUzQixTQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTs7QUFFdkMsVUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDOztBQUVqQixVQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQzVCLFdBQUksR0FBSSxDQUFDLEFBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLFFBQVEsR0FBSSxDQUFDLENBQUEsSUFBSyxDQUFDLEFBQUMsQ0FBQztPQUNuRDs7QUFFRCxVQUFJLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUVyRCxVQUFJLElBQUksRUFBRTtBQUNULFdBQUksR0FBRyxDQUFDLElBQUksQ0FBQztPQUNiOztBQUVELFVBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNsQyxjQUFRLEVBQUUsQ0FBQzs7QUFFWCxVQUFJLFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRTtBQUNuQixnQkFBUyxFQUFFLENBQUM7QUFDWixlQUFRLEdBQUcsQ0FBQyxDQUFDO09BQ2I7TUFDRDtLQUNEOztBQUVELE9BQUcsSUFBSSxHQUFHLENBQUM7O0FBRVgsUUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksR0FBRyxFQUFFO0FBQ3ZDLFFBQUcsSUFBSSxHQUFHLENBQUM7QUFDWCxRQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7QUFDWCxXQUFNO0tBQ047SUFDRDtHQUNEO0VBQ0Q7O0NBRUQsQ0FBQzs7OztBQUlGLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFPdEIsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7Ozs7QUFNdkMsSUFBSSxhQUFhLEdBQUc7QUFDbkIsV0FBVSxFQUFFLENBQUM7QUFDYixXQUFVLEVBQUUsQ0FBQztBQUNiLFdBQVUsRUFBRSxDQUFDO0FBQ2IsV0FBVSxFQUFFLENBQUM7QUFDYixXQUFVLEVBQUUsQ0FBQztBQUNiLFdBQVUsRUFBRSxDQUFDO0FBQ2IsV0FBVSxFQUFFLENBQUM7QUFDYixXQUFVLEVBQUUsQ0FBQztDQUNiLENBQUM7Ozs7OztBQU1GLElBQUksTUFBTSxHQUFHOzs7OztBQUtaLHVCQUFzQixFQUFFLENBQ3ZCLEVBQUUsRUFDRixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ1gsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNYLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDWCxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ1gsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNYLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDWCxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ1gsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDZixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNmLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ2YsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDZixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNmLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ2YsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDZixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDbkIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ25CLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUNwQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFDcEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQ3BCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUNwQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFDcEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQ3pCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDekIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUN6QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQ3pCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDekIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUN6QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUM5QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUM5QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUM5QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUM5QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUM5QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUM5Qjs7QUFFRCxJQUFHLEVBQUUsQUFBQyxDQUFDLElBQUksRUFBRSxHQUFLLENBQUMsSUFBSSxDQUFDLEFBQUMsR0FBSSxDQUFDLElBQUksQ0FBQyxBQUFDLEdBQUksQ0FBQyxJQUFJLENBQUMsQUFBQyxHQUFJLENBQUMsSUFBSSxDQUFDLEFBQUMsR0FBSSxDQUFDLElBQUksQ0FBQyxBQUFDLEdBQUksQ0FBQyxJQUFJLENBQUMsQUFBQztBQUNoRixJQUFHLEVBQUUsQUFBQyxDQUFDLElBQUksRUFBRSxHQUFLLENBQUMsSUFBSSxFQUFFLEFBQUMsR0FBSSxDQUFDLElBQUksRUFBRSxBQUFDLEdBQUksQ0FBQyxJQUFJLENBQUMsQUFBQyxHQUFJLENBQUMsSUFBSSxDQUFDLEFBQUMsR0FBSSxDQUFDLElBQUksQ0FBQyxBQUFDLEdBQUksQ0FBQyxJQUFJLENBQUMsQUFBQyxHQUFJLENBQUMsSUFBSSxDQUFDLEFBQUM7QUFDN0YsU0FBUSxFQUFFLEFBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBSyxDQUFDLElBQUksRUFBRSxBQUFDLEdBQUksQ0FBQyxJQUFJLEVBQUUsQUFBQyxHQUFJLENBQUMsSUFBSSxDQUFDLEFBQUMsR0FBSSxDQUFDLElBQUksQ0FBQyxBQUFDOzs7OztBQUtqRSxlQUFjLEVBQUUsd0JBQVMsSUFBSSxFQUFFO0FBQzlCLE1BQUksQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbkIsU0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FB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Q0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDNUg7QUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzdCLE9BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUMxQzs7Ozs7Ozs7OztBQVVELFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7O0FBRWpDLEtBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxTQUFTLEVBQUU7QUFDNUIsUUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQztFQUMxQzs7QUFFRCxLQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRWYsUUFBTyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQy9DLFFBQU0sRUFBRSxDQUFDO0VBQ1Q7O0FBRUQsS0FBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNsRCxNQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDN0MsTUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0VBQzlCO0NBQ0Q7O0FBRUQsWUFBWSxDQUFDLFNBQVMsR0FBRzs7QUFFeEIsSUFBRyxFQUFFLGFBQVMsS0FBSyxFQUFFO0FBQ3BCLFNBQU8sSUFB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QUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ1gsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNYLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDWCxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHWCxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ1gsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNYLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDWCxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHWCxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQ1osQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNYLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDWCxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOzs7QUFHVixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQ2IsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNYLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3RCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDWCxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ1gsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNYLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUdYLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDWCxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ1gsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN0QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHdEIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUNaLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN0QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHdEIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUNiLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN0QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHdEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN0QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3RCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3RCLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFDWixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3RCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3RCLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN0QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3RCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd0QixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQ2IsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN0QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3RCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd2QixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQzFCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHdkIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3RCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR1osQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3RCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdkIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3ZCLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDMUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd2QixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQzFCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHdkIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUMxQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdkIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3ZCLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDMUIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd4QixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQzFCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDWixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd2QixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQzFCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDWixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUdaLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDMUIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3hCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd4QixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQzFCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdkIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN4QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHdkIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUMxQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdkIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3hCLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDM0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd2QixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQzFCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdkIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHeEIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUMzQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdkIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3hCLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDMUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd4QixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQzNCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDeEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN4QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHeEIsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUMzQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdkIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3hCLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDZCxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3hCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDeEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3hCLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDM0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN4QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3hCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd4QixDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQzNCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDeEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHdkIsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUMzQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3hCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDeEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3hCLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDM0IsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUd2QixDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQzNCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDeEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN4QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7QUFHeEIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUMzQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3hCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDeEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7O0FBR3hCLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDM0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3hCLENBQUMsRUFBRSxF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QUFDLEdBQUcsQ0FBQyxBQUFDLEdBQUksQ0FBQyxDQUFFLENBQUM7R0FDOUM7RUFDRDs7QUFFRCxPQUFNLEVBQUUsZ0JBQVMsR0FBRyxFQUFFOztBQUVyQixNQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0MsTUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxRQUFRLEVBQUU7QUFDbkMsT0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDcEI7O0FBRUQsTUFBSSxHQUFHLEVBQUU7QUFDUixPQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFLLElBQUksS0FBTSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxBQUFDLENBQUM7R0FDdEQ7O0FBRUQsTUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2Q7Q0FDRCxDQUFDO0FBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHFyY29kZSBmcm9tICcuLi8uLi8uLi9zcmMvcXJjb2RlL2luZGV4LmpzJztcclxuXHJcbihmdW5jdGlvbigpIHtcclxuICBsZXQgcmVhZHkgPSBmdW5jdGlvbihmbikge1xyXG4gICAgbGV0IGRvYyA9IGRvY3VtZW50O1xyXG4gICAgaWYgKGRvYy5hZGRFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4sIGZhbHNlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvYy5hdHRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZm4pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgcmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcXJub2RlMSA9IG5ldyBxcmNvZGUoe1xyXG4gICAgICB0ZXh0OiAnaHR0cDovL3d3dy5hbGlwYXkuY29tLydcclxuICAgIH0pO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3FyY29kZURlZmF1bHQnKS5hcHBlbmRDaGlsZChxcm5vZGUxKTtcclxuXHJcblxyXG4gICAgdmFyIHFybm9kZTIgPSBuZXcgcXJjb2RlKHtcclxuICAgICAgcmVuZGVyOiAndGFibGUnLFxyXG4gICAgICBjb3JyZWN0TGV2ZWw6IDAsXHJcbiAgICAgIHBkZ3JvdW5kOiAnIzAwYWFlZScsXHJcbiAgICAgIHRleHQ6ICdodHRwOi8vd3d3LmFsaXBheS5jb20vJyxcclxuICAgICAgc2l6ZTogMTAwLFxyXG4gICAgICBpbWFnZTogJ2h0dHBzOi8vdC5hbGlwYXlvYmplY3RzLmNvbS9pbWFnZXMvcm1zd2ViL1QxWnN4aFhkeGJYWFhYWFhYWC5wbmcnXHJcbiAgICB9KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxcmNvZGVUYWJsZScpLmFwcGVuZENoaWxkKHFybm9kZTIpO1xyXG5cclxuICAgIHZhciBxcm5vZGUzID0gbmV3IHFyY29kZSh7XHJcbiAgICAgIHJlbmRlcjogJ2NhbnZhcycsXHJcbiAgICAgIGNvcnJlY3RMZXZlbDogMCxcclxuICAgICAgdGV4dDogJ2h0dHA6Ly93d3cuYWxpcGF5LmNvbS8nLFxyXG4gICAgICBzaXplOiAzMDAsXHJcbiAgICAgIGJhY2tncm91bmQ6ICcjZWVlZWVlJyxcclxuICAgICAgZm9yZWdyb3VuZDogJyM2Njc3NjYnLFxyXG4gICAgICBwZGdyb3VuZDogJyMwMGFhZWUnLFxyXG4gICAgICBpbWFnZTogJ2h0dHBzOi8vdC5hbGlwYXlvYmplY3RzLmNvbS9pbWFnZXMvcm1zd2ViL1QxWnN4aFhkeGJYWFhYWFhYWC5wbmcnLFxyXG4gICAgICBpbWFnZVNpemU6IDEwMFxyXG4gICAgfSk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXJjb2RlQ2FudmFzJykuYXBwZW5kQ2hpbGQocXJub2RlMyk7XHJcblxyXG4gICAgdmFyIHFybm9kZTQgPSBuZXcgcXJjb2RlKHsgIFxyXG4gICAgICBjb3JyZWN0TGV2ZWw6IDAsXHJcbiAgICAgIHJlbmRlcjogJ3N2ZycsXHJcbiAgICAgIHRleHQ6ICdodHRwOi8vd3d3LmFsaXBheS5jb20vJyxcclxuICAgICAgc2l6ZTogMjAwLFxyXG4gICAgICBwZGdyb3VuZDogJyMwMGFhZWUnLFxyXG4gICAgICBpbWFnZTogJ2h0dHBzOi8vdC5hbGlwYXlvYmplY3RzLmNvbS9pbWFnZXMvcm1zd2ViL1QxWnN4aFhkeGJYWFhYWFhYWC5wbmcnLFxyXG4gICAgICBpbWFnZVNpemU6IDMwXHJcbiAgICB9KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxcmNvZGVTVkcnKS5hcHBlbmRDaGlsZChxcm5vZGU0KTtcclxuXHJcbiAgfSwgZmFsc2UpO1xyXG59KSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgcXJjb2RlIGZyb20gJy4vbWFpbi9tYWluLmpzJztcblxubW9kdWxlLmV4cG9ydHMgPSBxcmNvZGU7XG4iLCJ2YXIgcXJjb2RlQWxnT2JqQ2FjaGUgPSBbXTtcbnZhciBRUkNvZGVBbGcgPSByZXF1aXJlKCcuL3FyY29kZWFsZycpO1xuXG5mdW5jdGlvbiBleHRlbmQgKG9iamVjdCkge1xuICAgIC8vIFRha2VzIGFuIHVubGltaXRlZCBudW1iZXIgb2YgZXh0ZW5kZXJzLlxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIC8vIEZvciBlYWNoIGV4dGVuZGVyLCBjb3B5IHRoZWlyIHByb3BlcnRpZXMgb24gb3VyIG9iamVjdC5cbiAgICBmb3IgKHZhciBpID0gMCwgc291cmNlOyBzb3VyY2UgPSBhcmdzW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKCFzb3VyY2UpIGNvbnRpbnVlO1xuICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIG9iamVjdFtwcm9wZXJ0eV0gPSBzb3VyY2VbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdDtcbn07XG5cbi8qKlxuKiDorqHnrpfnn6npmLXngrnnmoTliY3mma/oibJcbiogQHBhcmFtIHtPYmp9IGNvbmZpZ1xuKiBAcGFyYW0ge051bWJlcn0gY29uZmlnLnJvdyDngrl45Z2Q5qCHXG4qIEBwYXJhbSB7TnVtYmVyfSBjb25maWcuY29sIOeCuXnlnZDmoIdcbiogQHBhcmFtIHtOdW1iZXJ9IGNvbmZpZy5jb3VudCDnn6npmLXlpKflsI9cbiogQHBhcmFtIHtOdW1iZXJ9IGNvbmZpZy5vcHRpb25zIOe7hOS7tueahG9wdGlvbnNcbiogQHJldHVybiB7U3RyaW5nfVxuKi9cbnZhciBnZXRGb3JlR3JvdW5kID0gZnVuY3Rpb24oY29uZmlnKXtcbiAgICB2YXIgb3B0aW9ucyA9IGNvbmZpZy5vcHRpb25zO1xuICAgIGlmKCBvcHRpb25zLnBkZ3JvdW5kICYmIChcbiAgICAgICAgKGNvbmZpZy5yb3cgPiAxICYmIGNvbmZpZy5yb3cgPCA1ICYmIGNvbmZpZy5jb2wgPjEgJiYgY29uZmlnLmNvbDw1KVxuICAgICAgICB8fCAoY29uZmlnLnJvdyA+IChjb25maWcuY291bnQgLSA2KSAmJiBjb25maWcucm93IDwgKGNvbmZpZy5jb3VudCAtIDIpICYmIGNvbmZpZy5jb2wgPjEgJiYgY29uZmlnLmNvbDw1KVxuICAgICAgICB8fCAoY29uZmlnLnJvdyA+IDEgJiYgY29uZmlnLnJvdyA8IDUgJiYgY29uZmlnLmNvbCA+IChjb25maWcuY291bnQgLSA2KSAmJiBjb25maWcuY29sIDwgKGNvbmZpZy5jb3VudCAtIDIpKVxuICAgICkpe1xuICAgICAgICByZXR1cm4gb3B0aW9ucy5wZGdyb3VuZDtcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnMuZm9yZWdyb3VuZDtcbn1cbi8qKlxuKiDngrnmmK/lkKblnKhQb3NpdGlvbiBEZXRlY3Rpb25cbiogQHBhcmFtICB7cm93fSDnn6npmLXooYxcbiogQHBhcmFtICB7Y29sfSDnn6npmLXliJdcbiogQHBhcmFtICB7Y291bnR9IOefqemYteWkp+Wwj1xuKiBAcmV0dXJuIHtCb29sZWFufVxuKi9cbnZhciBpblBvc2l0aW9uRGV0ZWN0aW9uID0gZnVuY3Rpb24ocm93LCBjb2wsIGNvdW50KXtcbiAgICBpZihcbiAgICAgICAgKHJvdzw3ICYmIGNvbDw3KVxuICAgICAgICB8fCAocm93ID4gKGNvdW50IC0gOCkgJiYgY29sIDwgNylcbiAgICAgICAgfHwgKHJvdyA8IDcgJiYgY29sID4oY291bnQgLSA4KSApXG4gICAgKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbi8qKlxuKiDojrflj5blvZPliY3lsY/luZXnmoTorr7lpIflg4/ntKDmr5QgZGV2aWNlUGl4ZWxSYXRpby9iYWNraW5nU3RvcmVcbiogQHBhcmFtIHtjb250ZXh0fSDlvZPliY0gY2FudmFzIOS4iuS4i+aWh++8jOWPr+S7peS4uiB3aW5kb3dcbiovXG52YXIgZ2V0UGl4ZWxSYXRpbyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICB2YXIgYmFja2luZ1N0b3JlID0gY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvXG4gICAgICAgIHx8IGNvbnRleHQud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpb1xuICAgICAgICB8fCBjb250ZXh0Lm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW9cbiAgICAgICAgfHwgY29udGV4dC5tc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW9cbiAgICAgICAgfHwgY29udGV4dC5vQmFja2luZ1N0b3JlUGl4ZWxSYXRpb1xuICAgICAgICB8fCBjb250ZXh0LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW9cbiAgICAgICAgfHwgMTtcblxuICAgIHJldHVybiAod2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMSkgLyBiYWNraW5nU3RvcmU7XG59O1xuXG4vKipcbiAqIOS6jOe7tOeggeaehOmAoOWHveaVsO+8jOS4u+imgeeUqOS6jue7mOWItlxuICogQHBhcmFtICB75Y+C5pWw5YiX6KGofSBvcHQg5Lyg6YCS5Y+C5pWwXG4gKiBAcmV0dXJuIHt9XG4gKi9cbnZhciBxcmNvZGUgPSBmdW5jdGlvbihvcHQpIHtcbiAgICBpZiAodHlwZW9mIG9wdCA9PT0gJ3N0cmluZycpIHsgLy8g5Y+q57yW56CBQVNDSUnlrZfnrKbkuLJcbiAgICAgICAgb3B0ID0ge1xuICAgICAgICAgICAgdGV4dDogb3B0XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8v6K6+572u6buY6K6k5Y+C5pWwXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHt9LCB7XG4gICAgICAgIHRleHQ6JycsXG4gICAgICAgIHJlbmRlcjogJycsXG4gICAgICAgIHNpemU6IDI1NixcbiAgICAgICAgY29ycmVjdExldmVsOiAzLFxuICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXG4gICAgICAgIGZvcmVncm91bmQ6ICcjMDAwMDAwJyxcbiAgICAgICAgaW1hZ2UgOiAnJyxcbiAgICAgICAgaW1hZ2VTaXplOiAzMFxuICAgIH0sIG9wdCk7XG5cbiAgICAvL+S9v+eUqFFSQ29kZUFsZ+WIm+W7uuS6jOe7tOeggee7k+aehFxuICAgIHZhciBxckNvZGVBbGcgPSBudWxsO1xuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBxcmNvZGVBbGdPYmpDYWNoZS5sZW5ndGg7IGkgPCBsOyBpKyspe1xuICAgICAgICBpZihxcmNvZGVBbGdPYmpDYWNoZVtpXS50ZXh0ID09IHRoaXMub3B0aW9ucy50ZXh0ICYmIHFyY29kZUFsZ09iakNhY2hlW2ldLnRleHQuY29ycmVjdExldmVsID09IHRoaXMub3B0aW9ucy5jb3JyZWN0TGV2ZWwpe1xuICAgICAgICAgICAgcXJDb2RlQWxnID0gcXJjb2RlQWxnT2JqQ2FjaGVbaV0ub2JqO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZihpID09IGwpe1xuICAgICAgcXJDb2RlQWxnID0gbmV3IFFSQ29kZUFsZyh0aGlzLm9wdGlvbnMudGV4dCwgdGhpcy5vcHRpb25zLmNvcnJlY3RMZXZlbCk7XG4gICAgICBxcmNvZGVBbGdPYmpDYWNoZS5wdXNoKHt0ZXh0OnRoaXMub3B0aW9ucy50ZXh0LCBjb3JyZWN0TGV2ZWw6IHRoaXMub3B0aW9ucy5jb3JyZWN0TGV2ZWwsIG9iajpxckNvZGVBbGd9KTtcbiAgICB9XG5cbiAgICBpZih0aGlzLm9wdGlvbnMucmVuZGVyKXtcbiAgICAgICAgc3dpdGNoICh0aGlzLm9wdGlvbnMucmVuZGVyKXtcbiAgICAgICAgICAgIGNhc2UgJ2NhbnZhcyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ2FudmFzKHFyQ29kZUFsZyk7XG4gICAgICAgICAgICBjYXNlICd0YWJsZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVGFibGUocXJDb2RlQWxnKTtcbiAgICAgICAgICAgIGNhc2UgJ3N2Zyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlU1ZHKHFyQ29kZUFsZyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZURlZmF1bHQocXJDb2RlQWxnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcmVhdGVEZWZhdWx0KHFyQ29kZUFsZyk7XG59O1xuXG5leHRlbmQocXJjb2RlLnByb3RvdHlwZSx7XG4gICAgLy8gZGVmYXVsdCBjcmVhdGUgIGNhbnZhcyAtPiBzdmcgLT4gdGFibGVcbiAgICBjcmVhdGVEZWZhdWx0IChxckNvZGVBbGcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBpZihjYW52YXMuZ2V0Q29udGV4dCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVDYW52YXMocXJDb2RlQWxnKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgU1ZHX05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcbiAgICAgICAgaWYoICEhZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICYmICEhZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3N2ZycpLmNyZWF0ZVNWR1JlY3QgKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVNWRyhxckNvZGVBbGcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVRhYmxlKHFyQ29kZUFsZyk7XG4gICAgfSxcbiAgICAvLyBjYW52YXMgY3JlYXRlXG4gICAgY3JlYXRlQ2FudmFzIChxckNvZGVBbGcpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB2YXIgY291bnQgPSBxckNvZGVBbGcuZ2V0TW9kdWxlQ291bnQoKTtcbiAgICAgICAgdmFyIHJhdGlvID0gZ2V0UGl4ZWxSYXRpbyhjdHgpO1xuICAgICAgICB2YXIgc2l6ZSA9IG9wdGlvbnMuc2l6ZTtcbiAgICAgICAgdmFyIHJhdGlvU2l6ZSA9IHNpemUgKiByYXRpbztcbiAgICAgICAgdmFyIHJhdGlvSW1nU2l6ZSA9IG9wdGlvbnMuaW1hZ2VTaXplICogcmF0aW87XG4gICAgICAgIC8vIHByZWxvYWQgaW1nXG4gICAgICAgIHZhciBsb2FkSW1hZ2UgPSBmdW5jdGlvbih1cmwsY2FsbGJhY2spe1xuICAgICAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHVybDtcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sodGhpcyk7XG4gICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9IG51bGxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvL+iuoeeul+avj+S4queCueeahOmVv+WuvVxuICAgICAgICB2YXIgdGlsZVcgPSAocmF0aW9TaXplIC8gY291bnQpLnRvUHJlY2lzaW9uKDQpO1xuICAgICAgICB2YXIgdGlsZUggPSAocmF0aW9TaXplIC8gY291bnQpLnRvUHJlY2lzaW9uKDQpO1xuXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHJhdGlvU2l6ZTtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHJhdGlvU2l6ZTtcblxuICAgICAgICAvL+e7mOWItlxuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBjb3VudDsgcm93KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IGNvdW50OyBjb2wrKykge1xuICAgICAgICAgICAgICAgIHZhciB3ID0gKE1hdGguY2VpbCgoY29sICsgMSkgKiB0aWxlVykgLSBNYXRoLmZsb29yKGNvbCAqIHRpbGVXKSk7XG4gICAgICAgICAgICAgICAgdmFyIGggPSAoTWF0aC5jZWlsKChyb3cgKyAxKSAqIHRpbGVXKSAtIE1hdGguZmxvb3Iocm93ICogdGlsZVcpKTtcbiAgICAgICAgICAgICAgICB2YXIgZm9yZWdyb3VuZCA9IGdldEZvcmVHcm91bmQoe1xuICAgICAgICAgICAgICAgICAgICByb3cgOiByb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbCA6IGNvbCxcbiAgICAgICAgICAgICAgICAgICAgY291bnQgOiBjb3VudCxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyA6IG9wdGlvbnNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gcXJDb2RlQWxnLm1vZHVsZXNbcm93XVtjb2xdID8gZm9yZWdyb3VuZCA6IG9wdGlvbnMuYmFja2dyb3VuZDtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoTWF0aC5yb3VuZChjb2wgKiB0aWxlVyksIE1hdGgucm91bmQocm93ICogdGlsZUgpLCB3LCBoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihvcHRpb25zLmltYWdlKXtcbiAgICAgICAgICAgIGxvYWRJbWFnZShvcHRpb25zLmltYWdlLCBmdW5jdGlvbihpbWcpe1xuICAgICAgICAgICAgICAgIHZhciB4ID0gKChyYXRpb1NpemUgLSByYXRpb0ltZ1NpemUpLzIpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSAoKHJhdGlvU2l6ZSAtIHJhdGlvSW1nU2l6ZSkvMikudG9GaXhlZCgyKTtcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgeCwgeSwgcmF0aW9JbWdTaXplLCByYXRpb0ltZ1NpemUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzLnN0eWxlLndpZHRoID0gc2l6ZSArICdweCc7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBzaXplICsgJ3B4JztcbiAgICAgICAgcmV0dXJuIGNhbnZhcztcbiAgICB9LFxuICAgIC8vIHRhYmxlIGNyZWF0ZVxuICAgIGNyZWF0ZVRhYmxlIChxckNvZGVBbGcpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgIHZhciBjb3VudCA9IHFyQ29kZUFsZy5nZXRNb2R1bGVDb3VudCgpO1xuXG4gICAgICAgIC8vIOiuoeeul+avj+S4quiKgueCueeahOmVv+Wuve+8m+WPluaVtO+8jOmYsuatoueCueS5i+mXtOWHuueOsOWIhuemu1xuICAgICAgICB2YXIgdGlsZVcgPSBNYXRoLmZsb29yKG9wdGlvbnMuc2l6ZSAvIGNvdW50KTtcbiAgICAgICAgdmFyIHRpbGVIID0gTWF0aC5mbG9vcihvcHRpb25zLnNpemUgLyBjb3VudCk7XG4gICAgICAgIGlmKHRpbGVXIDw9IDApe1xuICAgICAgICAgICAgdGlsZVcgPSBjb3VudCA8IDgwID8gMiA6IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGlsZUggPD0gMCl7XG4gICAgICAgICAgICB0aWxlSCA9IGNvdW50IDwgODAgPyAyIDogMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5Yib5bu6dGFibGXoioLngrlcbiAgICAgICAgLy/ph43nrpfnoIHlpKflsI9cbiAgICAgICAgdmFyIHMgPSBbXTtcbiAgICAgICAgcy5wdXNoKGA8dGFibGUgc3R5bGU9XCJib3JkZXI6MHB4OyBtYXJnaW46MHB4OyBwYWRkaW5nOjBweDsgYm9yZGVyLWNvbGxhcHNlOmNvbGxhcHNlOyBiYWNrZ3JvdW5kLWNvbG9yOiR7b3B0aW9ucy5iYWNrZ3JvdW5kfTtcIj5gKTtcblxuICAgICAgICAvLyDnu5jliLbkuoznu7TnoIFcbiAgICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgY291bnQ7IHJvdysrKSB7XG4gICAgICAgICAgICBzLnB1c2goYDx0ciBzdHlsZT1cImJvcmRlcjowcHg7IG1hcmdpbjowcHg7IHBhZGRpbmc6MHB4OyBoZWlnaHQ6JHt0aWxlSH1weFwiPmApO1xuICAgICAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgY291bnQ7IGNvbCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZvcmVncm91bmQgPSBnZXRGb3JlR3JvdW5kKHtcbiAgICAgICAgICAgICAgICAgICAgcm93IDogcm93LFxuICAgICAgICAgICAgICAgICAgICBjb2wgOiBjb2wsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50IDogY291bnQsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgOiBvcHRpb25zXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYocXJDb2RlQWxnLm1vZHVsZXNbcm93XVtjb2xdKXtcbiAgICAgICAgICAgICAgICAgICAgcy5wdXNoKGA8dGQgc3R5bGU9XCJib3JkZXI6MHB4OyBtYXJnaW46MHB4OyBwYWRkaW5nOjBweDsgd2lkdGg6JHt0aWxlV31weDsgYmFja2dyb3VuZC1jb2xvcjoke2ZvcmVncm91bmR9XCI+PC90ZD5gKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgcy5wdXNoKGA8dGQgc3R5bGU9XCJib3JkZXI6MHB4OyBtYXJnaW46MHB4OyBwYWRkaW5nOjBweDsgd2lkdGg6JHt0aWxlV31weDsgYmFja2dyb3VuZC1jb2xvcjoke29wdGlvbnMuYmFja2dyb3VuZH1cIj48L3RkPmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHMucHVzaCgnPC90cj4nKTtcbiAgICAgICAgfVxuICAgICAgICBzLnB1c2goJzwvdGFibGU+Jyk7XG5cbiAgICAgICAgaWYob3B0aW9ucy5pbWFnZSl7XG4gICAgICAgICAgICAvLyDorqHnrpfooajmoLznmoTmgLvlpKflsI9cbiAgICAgICAgICAgIHZhciB3aWR0aCA9IHRpbGVXICogY291bnQ7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gdGlsZUggKiBjb3VudDtcbiAgICAgICAgICAgIHZhciB4ID0gKCh3aWR0aCAtIG9wdGlvbnMuaW1hZ2VTaXplKS8yKS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgdmFyIHkgPSAoKGhlaWdodCAtIG9wdGlvbnMuaW1hZ2VTaXplKS8yKS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgcy51bnNoaWZ0KGA8ZGl2IHN0eWxlPSdwb3NpdGlvbjpyZWxhdGl2ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiR7d2lkdGh9cHg7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6JHtoZWlnaHR9cHg7Jz5gKTtcbiAgICAgICAgICAgIHMucHVzaChgPGltZyBzcmM9JyR7b3B0aW9ucy5pbWFnZX0nXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD0nJHtvcHRpb25zLmltYWdlU2l6ZX0nXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9JyR7b3B0aW9ucy5pbWFnZVNpemV9J1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9J3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6JHt4fXB4OyB0b3A6JHt5fXB4Oyc+YCk7XG4gICAgICAgICAgICBzLnB1c2goJzwvZGl2PicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHNwYW4uaW5uZXJIVE1MPXMuam9pbignJyk7XG5cbiAgICAgICAgcmV0dXJuIHNwYW4uZmlyc3RDaGlsZDtcbiAgICB9LFxuICAgIC8vIGNyZWF0ZSBzdmdcbiAgICBjcmVhdGVTVkcgKHFyQ29kZUFsZyl7XG4gICAgICAgIGxldCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgICBsZXQgY291bnQgPSBxckNvZGVBbGcuZ2V0TW9kdWxlQ291bnQoKTtcbiAgICAgICAgbGV0IHNjYWxlID0gY291bnQgLyBvcHRpb25zLnNpemU7XG5cbiAgICAgICAgLy8gY3JlYXRlIHN2Z1xuICAgICAgICBsZXQgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdzdmcnKTtcbiAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBvcHRpb25zLnNpemUpO1xuICAgICAgICBzdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBvcHRpb25zLnNpemUpO1xuICAgICAgICBzdmcuc2V0QXR0cmlidXRlKCd2aWV3Qm94JywgYDAgMCAke2NvdW50fSAke2NvdW50fWApO1xuXG4gICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGNvdW50OyByb3crKykge1xuICAgICAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgY291bnQ7IGNvbCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3JlY3QnKTtcbiAgICAgICAgICAgICAgICBsZXQgZm9yZWdyb3VuZCA9IGdldEZvcmVHcm91bmQoe1xuICAgICAgICAgICAgICAgICAgICByb3cgOiByb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbCA6IGNvbCxcbiAgICAgICAgICAgICAgICAgICAgY291bnQgOiBjb3VudCxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyA6IG9wdGlvbnNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZWN0LnNldEF0dHJpYnV0ZSgneCcsIGNvbCk7XG4gICAgICAgICAgICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCByb3cpO1xuICAgICAgICAgICAgICAgIHJlY3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIDEpO1xuICAgICAgICAgICAgICAgIHJlY3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCAxKTtcbiAgICAgICAgICAgICAgICByZWN0LnNldEF0dHJpYnV0ZSgnc3Ryb2tlLXdpZHRoJywgMCk7XG4gICAgICAgICAgICAgICAgaWYocXJDb2RlQWxnLm1vZHVsZXNbcm93XVsgY29sXSl7XG4gICAgICAgICAgICAgICAgICAgIHJlY3Quc2V0QXR0cmlidXRlKCdmaWxsJywgZm9yZWdyb3VuZCk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHJlY3Quc2V0QXR0cmlidXRlKCdmaWxsJywgb3B0aW9ucy5iYWNrZ3JvdW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZENoaWxkKHJlY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gY3JlYXRlIGltYWdlXG4gICAgICAgIGlmKG9wdGlvbnMuaW1hZ2Upe1xuICAgICAgICAgICAgbGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAnaW1hZ2UnKTtcbiAgICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICdocmVmJywgb3B0aW9ucy5pbWFnZSk7XG4gICAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCd4JywgKChjb3VudCAtIG9wdGlvbnMuaW1hZ2VTaXplICogc2NhbGUpLzIpLnRvRml4ZWQoMikpO1xuICAgICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZSgneScsICgoY291bnQgLSBvcHRpb25zLmltYWdlU2l6ZSAqIHNjYWxlKS8yKS50b0ZpeGVkKDIpKTtcbiAgICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgb3B0aW9ucy5pbWFnZVNpemUgKiBzY2FsZSk7XG4gICAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBvcHRpb25zLmltYWdlU2l6ZSAqIHNjYWxlKTtcbiAgICAgICAgICAgIHN2Zy5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN2ZztcbiAgICB9XG59KTtcbm1vZHVsZS5leHBvcnRzID0gcXJjb2RlO1xuIiwiLyoqXG4gKiDojrflj5bljZXkuKrlrZfnrKbnmoR1dGY457yW56CBXG4gKiB1bmljb2RlIEJNUOW5s+mdoue6pjY1NTM15Liq5a2X56ymXG4gKiBAcGFyYW0ge251bX0gY29kZVxuICogcmV0dXJuIHthcnJheX1cbiAqL1xuZnVuY3Rpb24gdW5pY29kZUZvcm1hdDgoY29kZSl7XG5cdC8vIDEgYnl0ZVxuXHR2YXIgYzAsIGMxLCBjMjtcblx0aWYoY29kZSA8IDEyOCl7XG5cdFx0cmV0dXJuIFtjb2RlXTtcblx0Ly8gMiBieXRlc1xuXHR9ZWxzZSBpZihjb2RlIDwgMjA0OCl7XG5cdFx0YzAgPSAxOTIgKyAoY29kZSA+PiA2KTtcblx0XHRjMSA9IDEyOCArIChjb2RlICYgNjMpO1xuXHRcdHJldHVybiBbYzAsIGMxXTtcblx0Ly8gMyBieXRlc1xuXHR9ZWxzZXtcblx0XHRjMCA9IDIyNCArIChjb2RlID4+IDEyKTtcblx0XHRjMSA9IDEyOCArIChjb2RlID4+IDYgJiA2Myk7XG5cdFx0YzIgPSAxMjggKyAoY29kZSAmIDYzKTtcblx0XHRyZXR1cm4gW2MwLCBjMSwgYzJdO1xuXHR9XG59XG5cbi8qKlxuICog6I635Y+W5a2X56ym5Liy55qEdXRmOOe8lueggeWtl+iKguS4slxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7YXJyYXl9XG4gKi9cbmZ1bmN0aW9uIGdldFVURjhCeXRlcyhzdHJpbmcpe1xuXHR2YXIgdXRmOGNvZGVzID0gW107XG5cdGZvcih2YXIgaT0wOyBpPHN0cmluZy5sZW5ndGg7IGkrKyl7XG5cdFx0dmFyIGNvZGUgPSBzdHJpbmcuY2hhckNvZGVBdChpKTtcblx0XHR2YXIgdXRmOCA9IHVuaWNvZGVGb3JtYXQ4KGNvZGUpO1xuXHRcdGZvcih2YXIgaj0wOyBqPHV0ZjgubGVuZ3RoOyBqKyspe1xuXHRcdFx0dXRmOGNvZGVzLnB1c2godXRmOFtqXSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1dGY4Y29kZXM7XG59XG5cbi8qKlxuICog5LqM57u056CB566X5rOV5a6e546wXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAgICAgICAgICAgICAg6KaB57yW56CB55qE5L+h5oGv5a2X56ym5LiyXG4gKiBAcGFyYW0ge251bX0gZXJyb3JDb3JyZWN0TGV2ZWwg57qg6ZSZ562J57qnXG4gKi9cbmZ1bmN0aW9uIFFSQ29kZUFsZyhkYXRhLCBlcnJvckNvcnJlY3RMZXZlbCkge1xuXHR0aGlzLnR5cGVOdW1iZXIgPSAtMTsgLy/niYjmnKxcblx0dGhpcy5lcnJvckNvcnJlY3RMZXZlbCA9IGVycm9yQ29ycmVjdExldmVsO1xuXHR0aGlzLm1vZHVsZXMgPSBudWxsOyAgLy/kuoznu7Tnn6npmLXvvIzlrZjmlL7mnIDnu4jnu5Pmnpxcblx0dGhpcy5tb2R1bGVDb3VudCA9IDA7IC8v55+p6Zi15aSn5bCPXG5cdHRoaXMuZGF0YUNhY2hlID0gbnVsbDsgLy/mlbDmja7nvJPlrZhcblx0dGhpcy5yc0Jsb2NrcyA9IG51bGw7IC8v54mI5pys5pWw5o2u5L+h5oGvXG5cdHRoaXMudG90YWxEYXRhQ291bnQgPSAtMTsgLy/lj6/kvb/nlKjnmoTmlbDmja7ph49cblx0dGhpcy5kYXRhID0gZGF0YTtcblx0dGhpcy51dGY4Ynl0ZXMgPSBnZXRVVEY4Qnl0ZXMoZGF0YSk7XG5cdHRoaXMubWFrZSgpO1xufVxuXG5RUkNvZGVBbGcucHJvdG90eXBlID0ge1xuXHRjb25zdHJ1Y3RvcjogUVJDb2RlQWxnLFxuXHQvKipcblx0ICog6I635Y+W5LqM57u056CB55+p6Zi15aSn5bCPXG5cdCAqIEByZXR1cm4ge251bX0g55+p6Zi15aSn5bCPXG5cdCAqL1xuXHRnZXRNb2R1bGVDb3VudDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMubW9kdWxlQ291bnQ7XG5cdH0sXG5cdC8qKlxuXHQgKiDnvJbnoIFcblx0ICovXG5cdG1ha2U6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZ2V0UmlnaHRUeXBlKCk7XG5cdFx0dGhpcy5kYXRhQ2FjaGUgPSB0aGlzLmNyZWF0ZURhdGEoKTtcblx0XHR0aGlzLmNyZWF0ZVFyY29kZSgpO1xuXHR9LFxuXHQvKipcblx0ICog6K6+572u5LqM5L2N55+p6Zi15Yqf6IO95Zu+5b2iXG5cdCAqIEBwYXJhbSAge2Jvb2x9IHRlc3Qg6KGo56S65piv5ZCm5Zyo5a+75om+5pyA5aW95o6p6Iac6Zi25q61XG5cdCAqIEBwYXJhbSAge251bX0gbWFza1BhdHRlcm4g5o6p6Iac55qE54mI5pysXG5cdCAqL1xuXHRtYWtlSW1wbDogZnVuY3Rpb24obWFza1BhdHRlcm4pIHtcblxuXHRcdHRoaXMubW9kdWxlQ291bnQgPSB0aGlzLnR5cGVOdW1iZXIgKiA0ICsgMTc7XG5cdFx0dGhpcy5tb2R1bGVzID0gbmV3IEFycmF5KHRoaXMubW9kdWxlQ291bnQpO1xuXG5cdFx0Zm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5tb2R1bGVDb3VudDsgcm93KyspIHtcblxuXHRcdFx0dGhpcy5tb2R1bGVzW3Jvd10gPSBuZXcgQXJyYXkodGhpcy5tb2R1bGVDb3VudCk7XG5cblx0XHR9XG5cdFx0dGhpcy5zZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKDAsIDApO1xuXHRcdHRoaXMuc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybih0aGlzLm1vZHVsZUNvdW50IC0gNywgMCk7XG5cdFx0dGhpcy5zZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKDAsIHRoaXMubW9kdWxlQ291bnQgLSA3KTtcblx0XHR0aGlzLnNldHVwUG9zaXRpb25BZGp1c3RQYXR0ZXJuKCk7XG5cdFx0dGhpcy5zZXR1cFRpbWluZ1BhdHRlcm4oKTtcblx0XHR0aGlzLnNldHVwVHlwZUluZm8odHJ1ZSwgbWFza1BhdHRlcm4pO1xuXG5cdFx0aWYgKHRoaXMudHlwZU51bWJlciA+PSA3KSB7XG5cdFx0XHR0aGlzLnNldHVwVHlwZU51bWJlcih0cnVlKTtcblx0XHR9XG5cdFx0dGhpcy5tYXBEYXRhKHRoaXMuZGF0YUNhY2hlLCBtYXNrUGF0dGVybik7XG5cdH0sXG5cdC8qKlxuXHQgKiDorr7nva7kuoznu7TnoIHnmoTkvY3nva7mjqLmtYvlm77lvaJcblx0ICogQHBhcmFtICB7bnVtfSByb3cg5o6i5rWL5Zu+5b2i55qE5Lit5b+D5qiq5Z2Q5qCHXG5cdCAqIEBwYXJhbSAge251bX0gY29sIOaOoua1i+WbvuW9oueahOS4reW/g+e6teWdkOagh1xuXHQgKi9cblx0c2V0dXBQb3NpdGlvblByb2JlUGF0dGVybjogZnVuY3Rpb24ocm93LCBjb2wpIHtcblxuXHRcdGZvciAodmFyIHIgPSAtMTsgciA8PSA3OyByKyspIHtcblxuXHRcdFx0aWYgKHJvdyArIHIgPD0gLTEgfHwgdGhpcy5tb2R1bGVDb3VudCA8PSByb3cgKyByKSBjb250aW51ZTtcblxuXHRcdFx0Zm9yICh2YXIgYyA9IC0xOyBjIDw9IDc7IGMrKykge1xuXG5cdFx0XHRcdGlmIChjb2wgKyBjIDw9IC0xIHx8IHRoaXMubW9kdWxlQ291bnQgPD0gY29sICsgYykgY29udGludWU7XG5cblx0XHRcdFx0aWYgKCgwIDw9IHIgJiYgciA8PSA2ICYmIChjID09IDAgfHwgYyA9PSA2KSkgfHwgKDAgPD0gYyAmJiBjIDw9IDYgJiYgKHIgPT0gMCB8fCByID09IDYpKSB8fCAoMiA8PSByICYmIHIgPD0gNCAmJiAyIDw9IGMgJiYgYyA8PSA0KSkge1xuXHRcdFx0XHRcdHRoaXMubW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IHRydWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiDliJvlu7rkuoznu7TnoIFcblx0ICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG5cdCAqL1xuXHRjcmVhdGVRcmNvZGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG1pbkxvc3RQb2ludCA9IDA7XG5cdFx0dmFyIHBhdHRlcm4gPSAwO1xuXHRcdHZhciBiZXN0TW9kdWxlcyA9IG51bGw7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuXG5cdFx0XHR0aGlzLm1ha2VJbXBsKGkpO1xuXG5cdFx0XHR2YXIgbG9zdFBvaW50ID0gUVJVdGlsLmdldExvc3RQb2ludCh0aGlzKTtcblx0XHRcdGlmIChpID09IDAgfHwgbWluTG9zdFBvaW50ID4gbG9zdFBvaW50KSB7XG5cdFx0XHRcdG1pbkxvc3RQb2ludCA9IGxvc3RQb2ludDtcblx0XHRcdFx0cGF0dGVybiA9IGk7XG5cdFx0XHRcdGJlc3RNb2R1bGVzID0gdGhpcy5tb2R1bGVzO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLm1vZHVsZXMgPSBiZXN0TW9kdWxlcztcblx0XHR0aGlzLnNldHVwVHlwZUluZm8oZmFsc2UsIHBhdHRlcm4pO1xuXG5cdFx0aWYgKHRoaXMudHlwZU51bWJlciA+PSA3KSB7XG5cdFx0XHR0aGlzLnNldHVwVHlwZU51bWJlcihmYWxzZSk7XG5cdFx0fVxuXG5cdH0sXG5cdC8qKlxuXHQgKiDorr7nva7lrprkvY3lm77lvaJcblx0ICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG5cdCAqL1xuXHRzZXR1cFRpbWluZ1BhdHRlcm46IGZ1bmN0aW9uKCkge1xuXG5cdFx0Zm9yICh2YXIgciA9IDg7IHIgPCB0aGlzLm1vZHVsZUNvdW50IC0gODsgcisrKSB7XG5cdFx0XHRpZiAodGhpcy5tb2R1bGVzW3JdWzZdICE9IG51bGwpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLm1vZHVsZXNbcl1bNl0gPSAociAlIDIgPT0gMCk7XG5cblx0XHRcdGlmICh0aGlzLm1vZHVsZXNbNl1bcl0gIT0gbnVsbCkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdHRoaXMubW9kdWxlc1s2XVtyXSA9IChyICUgMiA9PSAwKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiDorr7nva7nn6vmraPlm77lvaJcblx0ICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG5cdCAqL1xuXHRzZXR1cFBvc2l0aW9uQWRqdXN0UGF0dGVybjogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgcG9zID0gUVJVdGlsLmdldFBhdHRlcm5Qb3NpdGlvbih0aGlzLnR5cGVOdW1iZXIpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwb3MubGVuZ3RoOyBpKyspIHtcblxuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBwb3MubGVuZ3RoOyBqKyspIHtcblxuXHRcdFx0XHR2YXIgcm93ID0gcG9zW2ldO1xuXHRcdFx0XHR2YXIgY29sID0gcG9zW2pdO1xuXG5cdFx0XHRcdGlmICh0aGlzLm1vZHVsZXNbcm93XVtjb2xdICE9IG51bGwpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZvciAodmFyIHIgPSAtMjsgciA8PSAyOyByKyspIHtcblxuXHRcdFx0XHRcdGZvciAodmFyIGMgPSAtMjsgYyA8PSAyOyBjKyspIHtcblxuXHRcdFx0XHRcdFx0aWYgKHIgPT0gLTIgfHwgciA9PSAyIHx8IGMgPT0gLTIgfHwgYyA9PSAyIHx8IChyID09IDAgJiYgYyA9PSAwKSkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSB0cnVlO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog6K6+572u54mI5pys5L+h5oGv77yIN+S7peS4iueJiOacrOaJjeacie+8iVxuXHQgKiBAcGFyYW0gIHtib29sfSB0ZXN0IOaYr+WQpuWkhOS6juWIpOaWreacgOS9s+aOqeiGnOmYtuautVxuXHQgKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgW2Rlc2NyaXB0aW9uXVxuXHQgKi9cblx0c2V0dXBUeXBlTnVtYmVyOiBmdW5jdGlvbih0ZXN0KSB7XG5cblx0XHR2YXIgYml0cyA9IFFSVXRpbC5nZXRCQ0hUeXBlTnVtYmVyKHRoaXMudHlwZU51bWJlcik7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDE4OyBpKyspIHtcblx0XHRcdHZhciBtb2QgPSAoIXRlc3QgJiYgKChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG5cdFx0XHR0aGlzLm1vZHVsZXNbTWF0aC5mbG9vcihpIC8gMyldW2kgJSAzICsgdGhpcy5tb2R1bGVDb3VudCAtIDggLSAzXSA9IG1vZDtcblx0XHRcdHRoaXMubW9kdWxlc1tpICUgMyArIHRoaXMubW9kdWxlQ291bnQgLSA4IC0gM11bTWF0aC5mbG9vcihpIC8gMyldID0gbW9kO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIOiuvue9ruagvOW8j+S/oeaBr++8iOe6oOmUmeetiee6p+WSjOaOqeiGnOeJiOacrO+8iVxuXHQgKiBAcGFyYW0gIHtib29sfSB0ZXN0XG5cdCAqIEBwYXJhbSAge251bX0gbWFza1BhdHRlcm4g5o6p6Iac54mI5pysXG5cdCAqIEByZXR1cm4ge31cblx0ICovXG5cdHNldHVwVHlwZUluZm86IGZ1bmN0aW9uKHRlc3QsIG1hc2tQYXR0ZXJuKSB7XG5cblx0XHR2YXIgZGF0YSA9IChRUkVycm9yQ29ycmVjdExldmVsW3RoaXMuZXJyb3JDb3JyZWN0TGV2ZWxdIDw8IDMpIHwgbWFza1BhdHRlcm47XG5cdFx0dmFyIGJpdHMgPSBRUlV0aWwuZ2V0QkNIVHlwZUluZm8oZGF0YSk7XG5cblx0XHQvLyB2ZXJ0aWNhbFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTU7IGkrKykge1xuXG5cdFx0XHR2YXIgbW9kID0gKCF0ZXN0ICYmICgoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuXG5cdFx0XHRpZiAoaSA8IDYpIHtcblx0XHRcdFx0dGhpcy5tb2R1bGVzW2ldWzhdID0gbW9kO1xuXHRcdFx0fSBlbHNlIGlmIChpIDwgOCkge1xuXHRcdFx0XHR0aGlzLm1vZHVsZXNbaSArIDFdWzhdID0gbW9kO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb2R1bGVzW3RoaXMubW9kdWxlQ291bnQgLSAxNSArIGldWzhdID0gbW9kO1xuXHRcdFx0fVxuXG5cdFx0Ly8gaG9yaXpvbnRhbFxuXHRcdFx0dmFyIG1vZCA9ICghdGVzdCAmJiAoKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcblxuXHRcdFx0aWYgKGkgPCA4KSB7XG5cdFx0XHRcdHRoaXMubW9kdWxlc1s4XVt0aGlzLm1vZHVsZUNvdW50IC0gaSAtIDFdID0gbW9kO1xuXHRcdFx0fSBlbHNlIGlmIChpIDwgOSkge1xuXHRcdFx0XHR0aGlzLm1vZHVsZXNbOF1bMTUgLSBpIC0gMSArIDFdID0gbW9kO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb2R1bGVzWzhdWzE1IC0gaSAtIDFdID0gbW9kO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGZpeGVkIG1vZHVsZVxuXHRcdHRoaXMubW9kdWxlc1t0aGlzLm1vZHVsZUNvdW50IC0gOF1bOF0gPSAoIXRlc3QpO1xuXG5cdH0sXG5cdC8qKlxuXHQgKiDmlbDmja7nvJbnoIFcblx0ICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG5cdCAqL1xuXHRjcmVhdGVEYXRhOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYnVmZmVyID0gbmV3IFFSQml0QnVmZmVyKCk7XG5cdFx0dmFyIGxlbmd0aEJpdHMgPSB0aGlzLnR5cGVOdW1iZXIgPiA5ID8gMTYgOiA4O1xuXHRcdGJ1ZmZlci5wdXQoNCwgNCk7IC8v5re75Yqg5qih5byPXG5cdFx0YnVmZmVyLnB1dCh0aGlzLnV0ZjhieXRlcy5sZW5ndGgsIGxlbmd0aEJpdHMpO1xuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy51dGY4Ynl0ZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRidWZmZXIucHV0KHRoaXMudXRmOGJ5dGVzW2ldLCA4KTtcblx0XHR9XG5cdFx0aWYgKGJ1ZmZlci5sZW5ndGggKyA0IDw9IHRoaXMudG90YWxEYXRhQ291bnQgKiA4KSB7XG5cdFx0XHRidWZmZXIucHV0KDAsIDQpO1xuXHRcdH1cblxuXHRcdC8vIHBhZGRpbmdcblx0XHR3aGlsZSAoYnVmZmVyLmxlbmd0aCAlIDggIT0gMCkge1xuXHRcdFx0YnVmZmVyLnB1dEJpdChmYWxzZSk7XG5cdFx0fVxuXG5cdFx0Ly8gcGFkZGluZ1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cblx0XHRcdGlmIChidWZmZXIubGVuZ3RoID49IHRoaXMudG90YWxEYXRhQ291bnQgKiA4KSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0YnVmZmVyLnB1dChRUkNvZGVBbGcuUEFEMCwgOCk7XG5cblx0XHRcdGlmIChidWZmZXIubGVuZ3RoID49IHRoaXMudG90YWxEYXRhQ291bnQgKiA4KSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0YnVmZmVyLnB1dChRUkNvZGVBbGcuUEFEMSwgOCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUJ5dGVzKGJ1ZmZlcik7XG5cdH0sXG5cdC8qKlxuXHQgKiDnuqDplJnnoIHnvJbnoIFcblx0ICogQHBhcmFtICB7YnVmZmVyfSBidWZmZXIg5pWw5o2u57yW56CBXG5cdCAqIEByZXR1cm4ge1t0eXBlXX1cblx0ICovXG5cdGNyZWF0ZUJ5dGVzOiBmdW5jdGlvbihidWZmZXIpIHtcblxuXHRcdHZhciBvZmZzZXQgPSAwO1xuXG5cdFx0dmFyIG1heERjQ291bnQgPSAwO1xuXHRcdHZhciBtYXhFY0NvdW50ID0gMDtcblxuXHRcdHZhciBsZW5ndGggPSB0aGlzLnJzQmxvY2subGVuZ3RoIC8gMztcblxuXHRcdHZhciByc0Jsb2NrcyA9IG5ldyBBcnJheSgpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXG5cdFx0XHR2YXIgY291bnQgPSB0aGlzLnJzQmxvY2tbaSAqIDMgKyAwXTtcblx0XHRcdHZhciB0b3RhbENvdW50ID0gdGhpcy5yc0Jsb2NrW2kgKiAzICsgMV07XG5cdFx0XHR2YXIgZGF0YUNvdW50ID0gdGhpcy5yc0Jsb2NrW2kgKiAzICsgMl07XG5cblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgY291bnQ7IGorKykge1xuXHRcdFx0XHRyc0Jsb2Nrcy5wdXNoKFtkYXRhQ291bnQsIHRvdGFsQ291bnRdKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgZGNkYXRhID0gbmV3IEFycmF5KHJzQmxvY2tzLmxlbmd0aCk7XG5cdFx0dmFyIGVjZGF0YSA9IG5ldyBBcnJheShyc0Jsb2Nrcy5sZW5ndGgpO1xuXG5cdFx0Zm9yICh2YXIgciA9IDA7IHIgPCByc0Jsb2Nrcy5sZW5ndGg7IHIrKykge1xuXG5cdFx0XHR2YXIgZGNDb3VudCA9IHJzQmxvY2tzW3JdWzBdO1xuXHRcdFx0dmFyIGVjQ291bnQgPSByc0Jsb2Nrc1tyXVsxXSAtIGRjQ291bnQ7XG5cblx0XHRcdG1heERjQ291bnQgPSBNYXRoLm1heChtYXhEY0NvdW50LCBkY0NvdW50KTtcblx0XHRcdG1heEVjQ291bnQgPSBNYXRoLm1heChtYXhFY0NvdW50LCBlY0NvdW50KTtcblxuXHRcdFx0ZGNkYXRhW3JdID0gbmV3IEFycmF5KGRjQ291bnQpO1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRjZGF0YVtyXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRkY2RhdGFbcl1baV0gPSAweGZmICYgYnVmZmVyLmJ1ZmZlcltpICsgb2Zmc2V0XTtcblx0XHRcdH1cblx0XHRcdG9mZnNldCArPSBkY0NvdW50O1xuXG5cdFx0XHR2YXIgcnNQb2x5ID0gUVJVdGlsLmdldEVycm9yQ29ycmVjdFBvbHlub21pYWwoZWNDb3VudCk7XG5cdFx0XHR2YXIgcmF3UG9seSA9IG5ldyBRUlBvbHlub21pYWwoZGNkYXRhW3JdLCByc1BvbHkuZ2V0TGVuZ3RoKCkgLSAxKTtcblxuXHRcdFx0dmFyIG1vZFBvbHkgPSByYXdQb2x5Lm1vZChyc1BvbHkpO1xuXHRcdFx0ZWNkYXRhW3JdID0gbmV3IEFycmF5KHJzUG9seS5nZXRMZW5ndGgoKSAtIDEpO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlY2RhdGFbcl0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIG1vZEluZGV4ID0gaSArIG1vZFBvbHkuZ2V0TGVuZ3RoKCkgLSBlY2RhdGFbcl0ubGVuZ3RoO1xuXHRcdFx0XHRlY2RhdGFbcl1baV0gPSAobW9kSW5kZXggPj0gMCkgPyBtb2RQb2x5LmdldChtb2RJbmRleCkgOiAwO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBkYXRhID0gbmV3IEFycmF5KHRoaXMudG90YWxEYXRhQ291bnQpO1xuXHRcdHZhciBpbmRleCA9IDA7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1heERjQ291bnQ7IGkrKykge1xuXHRcdFx0Zm9yICh2YXIgciA9IDA7IHIgPCByc0Jsb2Nrcy5sZW5ndGg7IHIrKykge1xuXHRcdFx0XHRpZiAoaSA8IGRjZGF0YVtyXS5sZW5ndGgpIHtcblx0XHRcdFx0XHRkYXRhW2luZGV4KytdID0gZGNkYXRhW3JdW2ldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXhFY0NvdW50OyBpKyspIHtcblx0XHRcdGZvciAodmFyIHIgPSAwOyByIDwgcnNCbG9ja3MubGVuZ3RoOyByKyspIHtcblx0XHRcdFx0aWYgKGkgPCBlY2RhdGFbcl0ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZGF0YVtpbmRleCsrXSA9IGVjZGF0YVtyXVtpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBkYXRhO1xuXG5cdH0sXG5cdC8qKlxuXHQgKiDluIPnva7mqKHlnZfvvIzmnoTlu7rmnIDnu4jkv6Hmga9cblx0ICogQHBhcmFtICB7fSBkYXRhXG5cdCAqIEBwYXJhbSAge30gbWFza1BhdHRlcm5cblx0ICogQHJldHVybiB7fVxuXHQgKi9cblx0bWFwRGF0YTogZnVuY3Rpb24oZGF0YSwgbWFza1BhdHRlcm4pIHtcblxuXHRcdHZhciBpbmMgPSAtMTtcblx0XHR2YXIgcm93ID0gdGhpcy5tb2R1bGVDb3VudCAtIDE7XG5cdFx0dmFyIGJpdEluZGV4ID0gNztcblx0XHR2YXIgYnl0ZUluZGV4ID0gMDtcblxuXHRcdGZvciAodmFyIGNvbCA9IHRoaXMubW9kdWxlQ291bnQgLSAxOyBjb2wgPiAwOyBjb2wgLT0gMikge1xuXG5cdFx0XHRpZiAoY29sID09IDYpIGNvbC0tO1xuXG5cdFx0XHR3aGlsZSAodHJ1ZSkge1xuXG5cdFx0XHRcdGZvciAodmFyIGMgPSAwOyBjIDwgMjsgYysrKSB7XG5cblx0XHRcdFx0XHRpZiAodGhpcy5tb2R1bGVzW3Jvd11bY29sIC0gY10gPT0gbnVsbCkge1xuXG5cdFx0XHRcdFx0XHR2YXIgZGFyayA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRpZiAoYnl0ZUluZGV4IDwgZGF0YS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0ZGFyayA9ICgoKGRhdGFbYnl0ZUluZGV4XSA+Pj4gYml0SW5kZXgpICYgMSkgPT0gMSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHZhciBtYXNrID0gUVJVdGlsLmdldE1hc2sobWFza1BhdHRlcm4sIHJvdywgY29sIC0gYyk7XG5cblx0XHRcdFx0XHRcdGlmIChtYXNrKSB7XG5cdFx0XHRcdFx0XHRcdGRhcmsgPSAhZGFyaztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dGhpcy5tb2R1bGVzW3Jvd11bY29sIC0gY10gPSBkYXJrO1xuXHRcdFx0XHRcdFx0Yml0SW5kZXgtLTtcblxuXHRcdFx0XHRcdFx0aWYgKGJpdEluZGV4ID09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdGJ5dGVJbmRleCsrO1xuXHRcdFx0XHRcdFx0XHRiaXRJbmRleCA9IDc7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cm93ICs9IGluYztcblxuXHRcdFx0XHRpZiAocm93IDwgMCB8fCB0aGlzLm1vZHVsZUNvdW50IDw9IHJvdykge1xuXHRcdFx0XHRcdHJvdyAtPSBpbmM7XG5cdFx0XHRcdFx0aW5jID0gLWluYztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG59O1xuLyoqXG4gKiDloavlhYXlrZfmrrVcbiAqL1xuUVJDb2RlQWxnLlBBRDAgPSAweEVDO1xuUVJDb2RlQWxnLlBBRDEgPSAweDExO1xuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyDnuqDplJnnrYnnuqflr7nlupTnmoTnvJbnoIFcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBRUkVycm9yQ29ycmVjdExldmVsID0gWzEsIDAsIDMsIDJdO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8g5o6p6Iac54mI5pysXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgUVJNYXNrUGF0dGVybiA9IHtcblx0UEFUVEVSTjAwMDogMCxcblx0UEFUVEVSTjAwMTogMSxcblx0UEFUVEVSTjAxMDogMixcblx0UEFUVEVSTjAxMTogMyxcblx0UEFUVEVSTjEwMDogNCxcblx0UEFUVEVSTjEwMTogNSxcblx0UEFUVEVSTjExMDogNixcblx0UEFUVEVSTjExMTogN1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIOW3peWFt+exu1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIFFSVXRpbCA9IHtcblxuXHQvKlxuXHTmr4/kuKrniYjmnKznn6vmraPlm77lvaLnmoTkvY3nva5cblx0ICovXG5cdFBBVFRFUk5fUE9TSVRJT05fVEFCTEU6IFtcblx0XHRbXSxcblx0XHRbNiwgMThdLFxuXHRcdFs2LCAyMl0sXG5cdFx0WzYsIDI2XSxcblx0XHRbNiwgMzBdLFxuXHRcdFs2LCAzNF0sXG5cdFx0WzYsIDIyLCAzOF0sXG5cdFx0WzYsIDI0LCA0Ml0sXG5cdFx0WzYsIDI2LCA0Nl0sXG5cdFx0WzYsIDI4LCA1MF0sXG5cdFx0WzYsIDMwLCA1NF0sXG5cdFx0WzYsIDMyLCA1OF0sXG5cdFx0WzYsIDM0LCA2Ml0sXG5cdFx0WzYsIDI2LCA0NiwgNjZdLFxuXHRcdFs2LCAyNiwgNDgsIDcwXSxcblx0XHRbNiwgMjYsIDUwLCA3NF0sXG5cdFx0WzYsIDMwLCA1NCwgNzhdLFxuXHRcdFs2LCAzMCwgNTYsIDgyXSxcblx0XHRbNiwgMzAsIDU4LCA4Nl0sXG5cdFx0WzYsIDM0LCA2MiwgOTBdLFxuXHRcdFs2LCAyOCwgNTAsIDcyLCA5NF0sXG5cdFx0WzYsIDI2LCA1MCwgNzQsIDk4XSxcblx0XHRbNiwgMzAsIDU0LCA3OCwgMTAyXSxcblx0XHRbNiwgMjgsIDU0LCA4MCwgMTA2XSxcblx0XHRbNiwgMzIsIDU4LCA4NCwgMTEwXSxcblx0XHRbNiwgMzAsIDU4LCA4NiwgMTE0XSxcblx0XHRbNiwgMzQsIDYyLCA5MCwgMTE4XSxcblx0XHRbNiwgMjYsIDUwLCA3NCwgOTgsIDEyMl0sXG5cdFx0WzYsIDMwLCA1NCwgNzgsIDEwMiwgMTI2XSxcblx0XHRbNiwgMjYsIDUyLCA3OCwgMTA0LCAxMzBdLFxuXHRcdFs2LCAzMCwgNTYsIDgyLCAxMDgsIDEzNF0sXG5cdFx0WzYsIDM0LCA2MCwgODYsIDExMiwgMTM4XSxcblx0XHRbNiwgMzAsIDU4LCA4NiwgMTE0LCAxNDJdLFxuXHRcdFs2LCAzNCwgNjIsIDkwLCAxMTgsIDE0Nl0sXG5cdFx0WzYsIDMwLCA1NCwgNzgsIDEwMiwgMTI2LCAxNTBdLFxuXHRcdFs2LCAyNCwgNTAsIDc2LCAxMDIsIDEyOCwgMTU0XSxcblx0XHRbNiwgMjgsIDU0LCA4MCwgMTA2LCAxMzIsIDE1OF0sXG5cdFx0WzYsIDMyLCA1OCwgODQsIDExMCwgMTM2LCAxNjJdLFxuXHRcdFs2LCAyNiwgNTQsIDgyLCAxMTAsIDEzOCwgMTY2XSxcblx0XHRbNiwgMzAsIDU4LCA4NiwgMTE0LCAxNDIsIDE3MF1cblx0XSxcblxuXHRHMTU6ICgxIDw8IDEwKSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCA0KSB8ICgxIDw8IDIpIHwgKDEgPDwgMSkgfCAoMSA8PCAwKSxcblx0RzE4OiAoMSA8PCAxMikgfCAoMSA8PCAxMSkgfCAoMSA8PCAxMCkgfCAoMSA8PCA5KSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCAyKSB8ICgxIDw8IDApLFxuXHRHMTVfTUFTSzogKDEgPDwgMTQpIHwgKDEgPDwgMTIpIHwgKDEgPDwgMTApIHwgKDEgPDwgNCkgfCAoMSA8PCAxKSxcblxuXHQvKlxuXHRCQ0jnvJbnoIHmoLzlvI/kv6Hmga9cblx0ICovXG5cdGdldEJDSFR5cGVJbmZvOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dmFyIGQgPSBkYXRhIDw8IDEwO1xuXHRcdHdoaWxlIChRUlV0aWwuZ2V0QkNIRGlnaXQoZCkgLSBRUlV0aWwuZ2V0QkNIRGlnaXQoUVJVdGlsLkcxNSkgPj0gMCkge1xuXHRcdFx0ZCBePSAoUVJVdGlsLkcxNSA8PCAoUVJVdGlsLmdldEJDSERpZ2l0KGQpIC0gUVJVdGlsLmdldEJDSERpZ2l0KFFSVXRpbC5HMTUpKSk7XG5cdFx0fVxuXHRcdHJldHVybiAoKGRhdGEgPDwgMTApIHwgZCkgXiBRUlV0aWwuRzE1X01BU0s7XG5cdH0sXG5cdC8qXG5cdEJDSOe8lueggeeJiOacrOS/oeaBr1xuXHQgKi9cblx0Z2V0QkNIVHlwZU51bWJlcjogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHZhciBkID0gZGF0YSA8PCAxMjtcblx0XHR3aGlsZSAoUVJVdGlsLmdldEJDSERpZ2l0KGQpIC0gUVJVdGlsLmdldEJDSERpZ2l0KFFSVXRpbC5HMTgpID49IDApIHtcblx0XHRcdGQgXj0gKFFSVXRpbC5HMTggPDwgKFFSVXRpbC5nZXRCQ0hEaWdpdChkKSAtIFFSVXRpbC5nZXRCQ0hEaWdpdChRUlV0aWwuRzE4KSkpO1xuXHRcdH1cblx0XHRyZXR1cm4gKGRhdGEgPDwgMTIpIHwgZDtcblx0fSxcblx0Lypcblx06I635Y+WQkNI5L2N5L+h5oGvXG5cdCAqL1xuXHRnZXRCQ0hEaWdpdDogZnVuY3Rpb24oZGF0YSkge1xuXG5cdFx0dmFyIGRpZ2l0ID0gMDtcblxuXHRcdHdoaWxlIChkYXRhICE9IDApIHtcblx0XHRcdGRpZ2l0Kys7XG5cdFx0XHRkYXRhID4+Pj0gMTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGlnaXQ7XG5cdH0sXG5cdC8qXG5cdOiOt+WPlueJiOacrOWvueW6lOeahOefq+ato+WbvuW9ouS9jee9rlxuXHQgKi9cblx0Z2V0UGF0dGVyblBvc2l0aW9uOiBmdW5jdGlvbih0eXBlTnVtYmVyKSB7XG5cdFx0cmV0dXJuIFFSVXRpbC5QQVRURVJOX1BPU0lUSU9OX1RBQkxFW3R5cGVOdW1iZXIgLSAxXTtcblx0fSxcblx0Lypcblx05o6p6Iac566X5rOVXG5cdCAqL1xuXHRnZXRNYXNrOiBmdW5jdGlvbihtYXNrUGF0dGVybiwgaSwgaikge1xuXG5cdFx0c3dpdGNoIChtYXNrUGF0dGVybikge1xuXG5cdFx0XHRjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAwMDpcblx0XHRcdFx0cmV0dXJuIChpICsgaikgJSAyID09IDA7XG5cdFx0XHRjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAwMTpcblx0XHRcdFx0cmV0dXJuIGkgJSAyID09IDA7XG5cdFx0XHRjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAxMDpcblx0XHRcdFx0cmV0dXJuIGogJSAzID09IDA7XG5cdFx0XHRjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAxMTpcblx0XHRcdFx0cmV0dXJuIChpICsgaikgJSAzID09IDA7XG5cdFx0XHRjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjEwMDpcblx0XHRcdFx0cmV0dXJuIChNYXRoLmZsb29yKGkgLyAyKSArIE1hdGguZmxvb3IoaiAvIDMpKSAlIDIgPT0gMDtcblx0XHRcdGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTAxOlxuXHRcdFx0XHRyZXR1cm4gKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMyA9PSAwO1xuXHRcdFx0Y2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMTA6XG5cdFx0XHRcdHJldHVybiAoKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMykgJSAyID09IDA7XG5cdFx0XHRjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjExMTpcblx0XHRcdFx0cmV0dXJuICgoaSAqIGopICUgMyArIChpICsgaikgJSAyKSAlIDIgPT0gMDtcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiYmFkIG1hc2tQYXR0ZXJuOlwiICsgbWFza1BhdHRlcm4pO1xuXHRcdH1cblx0fSxcblx0Lypcblx06I635Y+WUlPnmoTnuqDplJnlpJrpobnlvI9cblx0ICovXG5cdGdldEVycm9yQ29ycmVjdFBvbHlub21pYWw6IGZ1bmN0aW9uKGVycm9yQ29ycmVjdExlbmd0aCkge1xuXG5cdFx0dmFyIGEgPSBuZXcgUVJQb2x5bm9taWFsKFsxXSwgMCk7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVycm9yQ29ycmVjdExlbmd0aDsgaSsrKSB7XG5cdFx0XHRhID0gYS5tdWx0aXBseShuZXcgUVJQb2x5bm9taWFsKFsxLCBRUk1hdGguZ2V4cChpKV0sIDApKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYTtcblx0fSxcblx0Lypcblx06I635Y+W6K+E5Lu3XG5cdCAqL1xuXHRnZXRMb3N0UG9pbnQ6IGZ1bmN0aW9uKHFyQ29kZSkge1xuXG4gICAgdmFyIG1vZHVsZUNvdW50ID0gcXJDb2RlLmdldE1vZHVsZUNvdW50KCksXG4gICAgICAgIGxvc3RQb2ludCA9IDAsXG4gICAgICAgIGRhcmtDb3VudCA9IDA7XG5cbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93KyspIHtcblxuICAgICAgdmFyIHNhbWVDb3VudCA9IDA7XG4gICAgICB2YXIgaGVhZCA9IHFyQ29kZS5tb2R1bGVzW3Jvd11bMF07XG5cbiAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wrKykge1xuXG4gICAgICAgIHZhciBjdXJyZW50ID0gcXJDb2RlLm1vZHVsZXNbcm93XVtjb2xdO1xuXG4gICAgICAgIC8vbGV2ZWwgMyDor4Tku7dcbiAgICAgICAgaWYoIGNvbCA8IG1vZHVsZUNvdW50LTYpe1xuICAgICAgICAgIGlmIChjdXJyZW50ICYmICFxckNvZGUubW9kdWxlc1tyb3ddWyBjb2wgKyAxXSAmJiBxckNvZGUubW9kdWxlc1tyb3ddWyBjb2wgKyAyXSAmJiBxckNvZGUubW9kdWxlc1tyb3ddWyBjb2wgKyAzXSAmJiBxckNvZGUubW9kdWxlc1tyb3ddWyBjb2wgKyA0XSAmJiAhcXJDb2RlLm1vZHVsZXNbcm93XVsgY29sICsgNV0gJiYgcXJDb2RlLm1vZHVsZXNbcm93XVsgY29sICsgNl0pIHtcbiAgICAgICAgICBcdGlmKGNvbCA8IG1vZHVsZUNvdW50LTEwKXtcbiAgICAgICAgICBcdFx0aWYocXJDb2RlLm1vZHVsZXNbcm93XVsgY29sICsgN10gJiZxckNvZGUubW9kdWxlc1tyb3ddWyBjb2wgKyA4XSAmJnFyQ29kZS5tb2R1bGVzW3Jvd11bIGNvbCArIDldICYmcXJDb2RlLm1vZHVsZXNbcm93XVsgY29sICsgMTBdKXtcbiAgICAgICAgICBcdFx0XHRsb3N0UG9pbnQgKz0gNDA7XG4gICAgICAgICAgXHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSBpZihjb2wgPiAzKSB7XG5cdFx0XHRcdFx0XHRcdGlmKHFyQ29kZS5tb2R1bGVzW3Jvd11bIGNvbCAtIDFdICYmcXJDb2RlLm1vZHVsZXNbcm93XVsgY29sIC0gMl0gJiZxckNvZGUubW9kdWxlc1tyb3ddWyBjb2wgLSAzXSAmJnFyQ29kZS5tb2R1bGVzW3Jvd11bIGNvbCAtIDRdKXtcbiAgICAgICAgICBcdFx0XHRsb3N0UG9pbnQgKz0gNDA7XG4gICAgICAgICAgXHRcdH1cblx0XHRcdFx0XHRcdH1cblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vbGV2ZWwgMiDor4Tku7dcbiAgICAgICAgaWYoIChyb3cgPCBtb2R1bGVDb3VudC0xKSYmKGNvbCA8IG1vZHVsZUNvdW50LTEpICl7XG4gICAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgICBpZiAoY3VycmVudCkgY291bnQrKztcbiAgICAgICAgICBpZiAocXJDb2RlLm1vZHVsZXNbcm93ICsgMV1bIGNvbF0pIGNvdW50Kys7XG4gICAgICAgICAgaWYgKHFyQ29kZS5tb2R1bGVzW3Jvd11bIGNvbCArIDFdKSBjb3VudCsrO1xuICAgICAgICAgIGlmIChxckNvZGUubW9kdWxlc1tyb3cgKyAxXVsgY29sICsgMV0pIGNvdW50Kys7XG4gICAgICAgICAgaWYgKGNvdW50ID09IDAgfHwgY291bnQgPT0gNCkge1xuICAgICAgICAgICAgbG9zdFBvaW50ICs9IDM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9sZXZlbCAxIOivhOS7t1xuICAgICAgICBpZihoZWFkIF4gY3VycmVudCl7XG4gICAgICAgICAgc2FtZUNvdW50ICsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhlYWQgPSBjdXJyZW50O1xuICAgICAgICAgIGlmIChzYW1lQ291bnQgPj0gNSkge1xuICAgICAgICAgICAgbG9zdFBvaW50ICs9ICgzICsgc2FtZUNvdW50IC0gNSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNhbWVDb3VudCA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICAvL2xldmVsIDQg6K+E5Lu3XG4gICAgICAgIGlmIChjdXJyZW50KSB7XG4gICAgICAgICAgZGFya0NvdW50Kys7XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wrKykge1xuXG4gICAgICB2YXIgc2FtZUNvdW50ID0gMDtcbiAgICAgIHZhciBoZWFkID0gcXJDb2RlLm1vZHVsZXNbMF1bY29sXTtcblxuICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQ7IHJvdysrKSB7XG5cbiAgICAgICAgdmFyIGN1cnJlbnQgPSBxckNvZGUubW9kdWxlc1tyb3ddW2NvbF07XG5cbiAgICAgICAgLy9sZXZlbCAzIOivhOS7t1xuICAgICAgICBpZiggcm93IDwgbW9kdWxlQ291bnQtNil7XG4gICAgICAgICAgaWYgKGN1cnJlbnQgJiYgIXFyQ29kZS5tb2R1bGVzW3JvdyArIDFdWyBjb2xdICYmIHFyQ29kZS5tb2R1bGVzW3JvdyArIDJdWyBjb2xdICYmIHFyQ29kZS5tb2R1bGVzW3JvdyArIDNdWyBjb2xdICYmIHFyQ29kZS5tb2R1bGVzW3JvdyArIDRdWyBjb2xdICYmICFxckNvZGUubW9kdWxlc1tyb3cgKyA1XVsgY29sXSAmJiBxckNvZGUubW9kdWxlc1tyb3cgKyA2XVsgY29sXSkge1xuICAgICAgICAgICAgaWYocm93IDwgbW9kdWxlQ291bnQtMTApe1xuICAgICAgICAgIFx0XHRpZihxckNvZGUubW9kdWxlc1tyb3cgKyA3XVsgY29sXSAmJiBxckNvZGUubW9kdWxlc1tyb3cgKyA4XVsgY29sXSYmIHFyQ29kZS5tb2R1bGVzW3JvdyArIDldWyBjb2xdJiYgcXJDb2RlLm1vZHVsZXNbcm93ICsgMTBdWyBjb2xdKXtcbiAgICAgICAgICBcdFx0XHRsb3N0UG9pbnQgKz0gNDA7XG4gICAgICAgICAgXHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSBpZihyb3cgPiAzKSB7XG5cdFx0XHRcdFx0XHRcdGlmKHFyQ29kZS5tb2R1bGVzW3JvdyAtIDFdWyBjb2xdICYmIHFyQ29kZS5tb2R1bGVzW3JvdyAtIDJdWyBjb2xdJiYgcXJDb2RlLm1vZHVsZXNbcm93IC0gM11bIGNvbF0mJiBxckNvZGUubW9kdWxlc1tyb3cgLSA0XVsgY29sXSl7XG4gICAgICAgICAgXHRcdFx0bG9zdFBvaW50ICs9IDQwO1xuICAgICAgICAgIFx0XHR9XG5cdFx0XHRcdFx0XHR9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9sZXZlbCAxIOivhOS7t1xuICAgICAgICBpZihoZWFkIF4gY3VycmVudCl7XG4gICAgICAgICAgc2FtZUNvdW50ICsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhlYWQgPSBjdXJyZW50O1xuICAgICAgICAgIGlmIChzYW1lQ291bnQgPj0gNSkge1xuICAgICAgICAgICAgbG9zdFBvaW50ICs9ICgzICsgc2FtZUNvdW50IC0gNSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNhbWVDb3VudCA9IDE7XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExFVkVMNFxuXG4gICAgdmFyIHJhdGlvID0gTWF0aC5hYnMoMTAwICogZGFya0NvdW50IC8gbW9kdWxlQ291bnQgLyBtb2R1bGVDb3VudCAtIDUwKSAvIDU7XG4gICAgbG9zdFBvaW50ICs9IHJhdGlvICogMTA7XG5cbiAgICByZXR1cm4gbG9zdFBvaW50O1xuICB9XG5cbn07XG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSTWF0aOS9v+eUqOeahOaVsOWtpuW3peWFt1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIFFSTWF0aCA9IHtcblx0Lypcblx05bCGbui9rOWMluS4umFebVxuXHQgKi9cblx0Z2xvZzogZnVuY3Rpb24obikge1xuXG5cdFx0aWYgKG4gPCAxKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJnbG9nKFwiICsgbiArIFwiKVwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gUVJNYXRoLkxPR19UQUJMRVtuXTtcblx0fSxcblx0Lypcblx05bCGYV5t6L2s5YyW5Li6blxuXHQgKi9cblx0Z2V4cDogZnVuY3Rpb24obikge1xuXG5cdFx0d2hpbGUgKG4gPCAwKSB7XG5cdFx0XHRuICs9IDI1NTtcblx0XHR9XG5cblx0XHR3aGlsZSAobiA+PSAyNTYpIHtcblx0XHRcdG4gLT0gMjU1O1xuXHRcdH1cblxuXHRcdHJldHVybiBRUk1hdGguRVhQX1RBQkxFW25dO1xuXHR9LFxuXG5cdEVYUF9UQUJMRTogbmV3IEFycmF5KDI1NiksXG5cblx0TE9HX1RBQkxFOiBuZXcgQXJyYXkoMjU2KVxuXG59O1xuXG5mb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuXHRRUk1hdGguRVhQX1RBQkxFW2ldID0gMSA8PCBpO1xufVxuZm9yICh2YXIgaSA9IDg7IGkgPCAyNTY7IGkrKykge1xuXHRRUk1hdGguRVhQX1RBQkxFW2ldID0gUVJNYXRoLkVYUF9UQUJMRVtpIC0gNF0gXiBRUk1hdGguRVhQX1RBQkxFW2kgLSA1XSBeIFFSTWF0aC5FWFBfVEFCTEVbaSAtIDZdIF4gUVJNYXRoLkVYUF9UQUJMRVtpIC0gOF07XG59XG5mb3IgKHZhciBpID0gMDsgaSA8IDI1NTsgaSsrKSB7XG5cdFFSTWF0aC5MT0dfVEFCTEVbUVJNYXRoLkVYUF9UQUJMRVtpXV0gPSBpO1xufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJQb2x5bm9taWFsIOWkmumhueW8j1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8qKlxuICog5aSa6aG55byP57G7XG4gKiBAcGFyYW0ge0FycmF5fSBudW0gICDns7vmlbBcbiAqIEBwYXJhbSB7bnVtfSBzaGlmdCBhXnNoaWZ0XG4gKi9cbmZ1bmN0aW9uIFFSUG9seW5vbWlhbChudW0sIHNoaWZ0KSB7XG5cblx0aWYgKG51bS5sZW5ndGggPT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKG51bS5sZW5ndGggKyBcIi9cIiArIHNoaWZ0KTtcblx0fVxuXG5cdHZhciBvZmZzZXQgPSAwO1xuXG5cdHdoaWxlIChvZmZzZXQgPCBudW0ubGVuZ3RoICYmIG51bVtvZmZzZXRdID09IDApIHtcblx0XHRvZmZzZXQrKztcblx0fVxuXG5cdHRoaXMubnVtID0gbmV3IEFycmF5KG51bS5sZW5ndGggLSBvZmZzZXQgKyBzaGlmdCk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aCAtIG9mZnNldDsgaSsrKSB7XG5cdFx0dGhpcy5udW1baV0gPSBudW1baSArIG9mZnNldF07XG5cdH1cbn1cblxuUVJQb2x5bm9taWFsLnByb3RvdHlwZSA9IHtcblxuXHRnZXQ6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cmV0dXJuIHRoaXMubnVtW2luZGV4XTtcblx0fSxcblxuXHRnZXRMZW5ndGg6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLm51bS5sZW5ndGg7XG5cdH0sXG5cdC8qKlxuXHQgKiDlpJrpobnlvI/kuZjms5Vcblx0ICogQHBhcmFtICB7UVJQb2x5bm9taWFsfSBlIOiiq+S5mOWkmumhueW8j1xuXHQgKiBAcmV0dXJuIHtbdHlwZV19ICAgW2Rlc2NyaXB0aW9uXVxuXHQgKi9cblx0bXVsdGlwbHk6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdHZhciBudW0gPSBuZXcgQXJyYXkodGhpcy5nZXRMZW5ndGgoKSArIGUuZ2V0TGVuZ3RoKCkgLSAxKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nZXRMZW5ndGgoKTsgaSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGUuZ2V0TGVuZ3RoKCk7IGorKykge1xuXHRcdFx0XHRudW1baSArIGpdIF49IFFSTWF0aC5nZXhwKFFSTWF0aC5nbG9nKHRoaXMuZ2V0KGkpKSArIFFSTWF0aC5nbG9nKGUuZ2V0KGopKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBRUlBvbHlub21pYWwobnVtLCAwKTtcblx0fSxcblx0LyoqXG5cdCAqIOWkmumhueW8j+aooei/kOeul1xuXHQgKiBAcGFyYW0gIHtRUlBvbHlub21pYWx9IGUg5qih5aSa6aG55byPXG5cdCAqIEByZXR1cm4ge31cblx0ICovXG5cdG1vZDogZnVuY3Rpb24oZSkge1xuXHRcdHZhciB0bCA9IHRoaXMuZ2V0TGVuZ3RoKCksXG5cdFx0XHRlbCA9IGUuZ2V0TGVuZ3RoKCk7XG5cdFx0aWYgKHRsIC0gZWwgPCAwKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdFx0dmFyIG51bSA9IG5ldyBBcnJheSh0bCk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0bDsgaSsrKSB7XG5cdFx0XHRudW1baV0gPSB0aGlzLmdldChpKTtcblx0XHR9XG5cdFx0d2hpbGUgKG51bS5sZW5ndGggPj0gZWwpIHtcblx0XHRcdHZhciByYXRpbyA9IFFSTWF0aC5nbG9nKG51bVswXSkgLSBRUk1hdGguZ2xvZyhlLmdldCgwKSk7XG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZS5nZXRMZW5ndGgoKTsgaSsrKSB7XG5cdFx0XHRcdG51bVtpXSBePSBRUk1hdGguZ2V4cChRUk1hdGguZ2xvZyhlLmdldChpKSkgKyByYXRpbyk7XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAobnVtWzBdID09IDApIHtcblx0XHRcdFx0bnVtLnNoaWZ0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgUVJQb2x5bm9taWFsKG51bSwgMCk7XG5cdH1cbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSU19CTE9DS19UQUJMRVxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8qXG7kuoznu7TnoIHlkITkuKrniYjmnKzkv6Hmga9b5Z2X5pWwLCDmr4/lnZfkuK3nmoTmlbDmja7lnZfmlbAsIOavj+Wdl+S4reeahOS/oeaBr+Wdl+aVsF1cbiAqL1xudmFyIFJTX0JMT0NLX1RBQkxFID0gW1xuXG4vLyBMXG4vLyBNXG4vLyBRXG4vLyBIXG5cbi8vIDFcblsxLCAyNiwgMTldLFxuXHRbMSwgMjYsIDE2XSxcblx0WzEsIDI2LCAxM10sXG5cdFsxLCAyNiwgOV0sXG5cblx0Ly8gMlxuXHRbMSwgNDQsIDM0XSxcblx0WzEsIDQ0LCAyOF0sXG5cdFsxLCA0NCwgMjJdLFxuXHRbMSwgNDQsIDE2XSxcblxuXHQvLyAzXG5cdFsxLCA3MCwgNTVdLFxuXHRbMSwgNzAsIDQ0XSxcblx0WzIsIDM1LCAxN10sXG5cdFsyLCAzNSwgMTNdLFxuXG5cdC8vIDRcblx0WzEsIDEwMCwgODBdLFxuXHRbMiwgNTAsIDMyXSxcblx0WzIsIDUwLCAyNF0sXG5cdFs0LCAyNSwgOV0sXG5cblx0Ly8gNVxuXHRbMSwgMTM0LCAxMDhdLFxuXHRbMiwgNjcsIDQzXSxcblx0WzIsIDMzLCAxNSwgMiwgMzQsIDE2XSxcblx0WzIsIDMzLCAxMSwgMiwgMzQsIDEyXSxcblxuXHQvLyA2XG5cdFsyLCA4NiwgNjhdLFxuXHRbNCwgNDMsIDI3XSxcblx0WzQsIDQzLCAxOV0sXG5cdFs0LCA0MywgMTVdLFxuXG5cdC8vIDdcblx0WzIsIDk4LCA3OF0sXG5cdFs0LCA0OSwgMzFdLFxuXHRbMiwgMzIsIDE0LCA0LCAzMywgMTVdLFxuXHRbNCwgMzksIDEzLCAxLCA0MCwgMTRdLFxuXG5cdC8vIDhcblx0WzIsIDEyMSwgOTddLFxuXHRbMiwgNjAsIDM4LCAyLCA2MSwgMzldLFxuXHRbNCwgNDAsIDE4LCAyLCA0MSwgMTldLFxuXHRbNCwgNDAsIDE0LCAyLCA0MSwgMTVdLFxuXG5cdC8vIDlcblx0WzIsIDE0NiwgMTE2XSxcblx0WzMsIDU4LCAzNiwgMiwgNTksIDM3XSxcblx0WzQsIDM2LCAxNiwgNCwgMzcsIDE3XSxcblx0WzQsIDM2LCAxMiwgNCwgMzcsIDEzXSxcblxuXHQvLyAxMFxuXHRbMiwgODYsIDY4LCAyLCA4NywgNjldLFxuXHRbNCwgNjksIDQzLCAxLCA3MCwgNDRdLFxuXHRbNiwgNDMsIDE5LCAyLCA0NCwgMjBdLFxuXHRbNiwgNDMsIDE1LCAyLCA0NCwgMTZdLFxuXG5cdC8vIDExXG5cdFs0LCAxMDEsIDgxXSxcblx0WzEsIDgwLCA1MCwgNCwgODEsIDUxXSxcblx0WzQsIDUwLCAyMiwgNCwgNTEsIDIzXSxcblx0WzMsIDM2LCAxMiwgOCwgMzcsIDEzXSxcblxuXHQvLyAxMlxuXHRbMiwgMTE2LCA5MiwgMiwgMTE3LCA5M10sXG5cdFs2LCA1OCwgMzYsIDIsIDU5LCAzN10sXG5cdFs0LCA0NiwgMjAsIDYsIDQ3LCAyMV0sXG5cdFs3LCA0MiwgMTQsIDQsIDQzLCAxNV0sXG5cblx0Ly8gMTNcblx0WzQsIDEzMywgMTA3XSxcblx0WzgsIDU5LCAzNywgMSwgNjAsIDM4XSxcblx0WzgsIDQ0LCAyMCwgNCwgNDUsIDIxXSxcblx0WzEyLCAzMywgMTEsIDQsIDM0LCAxMl0sXG5cblx0Ly8gMTRcblx0WzMsIDE0NSwgMTE1LCAxLCAxNDYsIDExNl0sXG5cdFs0LCA2NCwgNDAsIDUsIDY1LCA0MV0sXG5cdFsxMSwgMzYsIDE2LCA1LCAzNywgMTddLFxuXHRbMTEsIDM2LCAxMiwgNSwgMzcsIDEzXSxcblxuXHQvLyAxNVxuXHRbNSwgMTA5LCA4NywgMSwgMTEwLCA4OF0sXG5cdFs1LCA2NSwgNDEsIDUsIDY2LCA0Ml0sXG5cdFs1LCA1NCwgMjQsIDcsIDU1LCAyNV0sXG5cdFsxMSwgMzYsIDEyXSxcblxuXHQvLyAxNlxuXHRbNSwgMTIyLCA5OCwgMSwgMTIzLCA5OV0sXG5cdFs3LCA3MywgNDUsIDMsIDc0LCA0Nl0sXG5cdFsxNSwgNDMsIDE5LCAyLCA0NCwgMjBdLFxuXHRbMywgNDUsIDE1LCAxMywgNDYsIDE2XSxcblxuXHQvLyAxN1xuXHRbMSwgMTM1LCAxMDcsIDUsIDEzNiwgMTA4XSxcblx0WzEwLCA3NCwgNDYsIDEsIDc1LCA0N10sXG5cdFsxLCA1MCwgMjIsIDE1LCA1MSwgMjNdLFxuXHRbMiwgNDIsIDE0LCAxNywgNDMsIDE1XSxcblxuXHQvLyAxOFxuXHRbNSwgMTUwLCAxMjAsIDEsIDE1MSwgMTIxXSxcblx0WzksIDY5LCA0MywgNCwgNzAsIDQ0XSxcblx0WzE3LCA1MCwgMjIsIDEsIDUxLCAyM10sXG5cdFsyLCA0MiwgMTQsIDE5LCA0MywgMTVdLFxuXG5cdC8vIDE5XG5cdFszLCAxNDEsIDExMywgNCwgMTQyLCAxMTRdLFxuXHRbMywgNzAsIDQ0LCAxMSwgNzEsIDQ1XSxcblx0WzE3LCA0NywgMjEsIDQsIDQ4LCAyMl0sXG5cdFs5LCAzOSwgMTMsIDE2LCA0MCwgMTRdLFxuXG5cdC8vIDIwXG5cdFszLCAxMzUsIDEwNywgNSwgMTM2LCAxMDhdLFxuXHRbMywgNjcsIDQxLCAxMywgNjgsIDQyXSxcblx0WzE1LCA1NCwgMjQsIDUsIDU1LCAyNV0sXG5cdFsxNSwgNDMsIDE1LCAxMCwgNDQsIDE2XSxcblxuXHQvLyAyMVxuXHRbNCwgMTQ0LCAxMTYsIDQsIDE0NSwgMTE3XSxcblx0WzE3LCA2OCwgNDJdLFxuXHRbMTcsIDUwLCAyMiwgNiwgNTEsIDIzXSxcblx0WzE5LCA0NiwgMTYsIDYsIDQ3LCAxN10sXG5cblx0Ly8gMjJcblx0WzIsIDEzOSwgMTExLCA3LCAxNDAsIDExMl0sXG5cdFsxNywgNzQsIDQ2XSxcblx0WzcsIDU0LCAyNCwgMTYsIDU1LCAyNV0sXG5cdFszNCwgMzcsIDEzXSxcblxuXHQvLyAyM1xuXHRbNCwgMTUxLCAxMjEsIDUsIDE1MiwgMTIyXSxcblx0WzQsIDc1LCA0NywgMTQsIDc2LCA0OF0sXG5cdFsxMSwgNTQsIDI0LCAxNCwgNTUsIDI1XSxcblx0WzE2LCA0NSwgMTUsIDE0LCA0NiwgMTZdLFxuXG5cdC8vIDI0XG5cdFs2LCAxNDcsIDExNywgNCwgMTQ4LCAxMThdLFxuXHRbNiwgNzMsIDQ1LCAxNCwgNzQsIDQ2XSxcblx0WzExLCA1NCwgMjQsIDE2LCA1NSwgMjVdLFxuXHRbMzAsIDQ2LCAxNiwgMiwgNDcsIDE3XSxcblxuXHQvLyAyNVxuXHRbOCwgMTMyLCAxMDYsIDQsIDEzMywgMTA3XSxcblx0WzgsIDc1LCA0NywgMTMsIDc2LCA0OF0sXG5cdFs3LCA1NCwgMjQsIDIyLCA1NSwgMjVdLFxuXHRbMjIsIDQ1LCAxNSwgMTMsIDQ2LCAxNl0sXG5cblx0Ly8gMjZcblx0WzEwLCAxNDIsIDExNCwgMiwgMTQzLCAxMTVdLFxuXHRbMTksIDc0LCA0NiwgNCwgNzUsIDQ3XSxcblx0WzI4LCA1MCwgMjIsIDYsIDUxLCAyM10sXG5cdFszMywgNDYsIDE2LCA0LCA0NywgMTddLFxuXG5cdC8vIDI3XG5cdFs4LCAxNTIsIDEyMiwgNCwgMTUzLCAxMjNdLFxuXHRbMjIsIDczLCA0NSwgMywgNzQsIDQ2XSxcblx0WzgsIDUzLCAyMywgMjYsIDU0LCAyNF0sXG5cdFsxMiwgNDUsIDE1LCAyOCwgNDYsIDE2XSxcblxuXHQvLyAyOFxuXHRbMywgMTQ3LCAxMTcsIDEwLCAxNDgsIDExOF0sXG5cdFszLCA3MywgNDUsIDIzLCA3NCwgNDZdLFxuXHRbNCwgNTQsIDI0LCAzMSwgNTUsIDI1XSxcblx0WzExLCA0NSwgMTUsIDMxLCA0NiwgMTZdLFxuXG5cdC8vIDI5XG5cdFs3LCAxNDYsIDExNiwgNywgMTQ3LCAxMTddLFxuXHRbMjEsIDczLCA0NSwgNywgNzQsIDQ2XSxcblx0WzEsIDUzLCAyMywgMzcsIDU0LCAyNF0sXG5cdFsxOSwgNDUsIDE1LCAyNiwgNDYsIDE2XSxcblxuXHQvLyAzMFxuXHRbNSwgMTQ1LCAxMTUsIDEwLCAxNDYsIDExNl0sXG5cdFsxOSwgNzUsIDQ3LCAxMCwgNzYsIDQ4XSxcblx0WzE1LCA1NCwgMjQsIDI1LCA1NSwgMjVdLFxuXHRbMjMsIDQ1LCAxNSwgMjUsIDQ2LCAxNl0sXG5cblx0Ly8gMzFcblx0WzEzLCAxNDUsIDExNSwgMywgMTQ2LCAxMTZdLFxuXHRbMiwgNzQsIDQ2LCAyOSwgNzUsIDQ3XSxcblx0WzQyLCA1NCwgMjQsIDEsIDU1LCAyNV0sXG5cdFsyMywgNDUsIDE1LCAyOCwgNDYsIDE2XSxcblxuXHQvLyAzMlxuXHRbMTcsIDE0NSwgMTE1XSxcblx0WzEwLCA3NCwgNDYsIDIzLCA3NSwgNDddLFxuXHRbMTAsIDU0LCAyNCwgMzUsIDU1LCAyNV0sXG5cdFsxOSwgNDUsIDE1LCAzNSwgNDYsIDE2XSxcblxuXHQvLyAzM1xuXHRbMTcsIDE0NSwgMTE1LCAxLCAxNDYsIDExNl0sXG5cdFsxNCwgNzQsIDQ2LCAyMSwgNzUsIDQ3XSxcblx0WzI5LCA1NCwgMjQsIDE5LCA1NSwgMjVdLFxuXHRbMTEsIDQ1LCAxNSwgNDYsIDQ2LCAxNl0sXG5cblx0Ly8gMzRcblx0WzEzLCAxNDUsIDExNSwgNiwgMTQ2LCAxMTZdLFxuXHRbMTQsIDc0LCA0NiwgMjMsIDc1LCA0N10sXG5cdFs0NCwgNTQsIDI0LCA3LCA1NSwgMjVdLFxuXHRbNTksIDQ2LCAxNiwgMSwgNDcsIDE3XSxcblxuXHQvLyAzNVxuXHRbMTIsIDE1MSwgMTIxLCA3LCAxNTIsIDEyMl0sXG5cdFsxMiwgNzUsIDQ3LCAyNiwgNzYsIDQ4XSxcblx0WzM5LCA1NCwgMjQsIDE0LCA1NSwgMjVdLFxuXHRbMjIsIDQ1LCAxNSwgNDEsIDQ2LCAxNl0sXG5cblx0Ly8gMzZcblx0WzYsIDE1MSwgMTIxLCAxNCwgMTUyLCAxMjJdLFxuXHRbNiwgNzUsIDQ3LCAzNCwgNzYsIDQ4XSxcblx0WzQ2LCA1NCwgMjQsIDEwLCA1NSwgMjVdLFxuXHRbMiwgNDUsIDE1LCA2NCwgNDYsIDE2XSxcblxuXHQvLyAzN1xuXHRbMTcsIDE1MiwgMTIyLCA0LCAxNTMsIDEyM10sXG5cdFsyOSwgNzQsIDQ2LCAxNCwgNzUsIDQ3XSxcblx0WzQ5LCA1NCwgMjQsIDEwLCA1NSwgMjVdLFxuXHRbMjQsIDQ1LCAxNSwgNDYsIDQ2LCAxNl0sXG5cblx0Ly8gMzhcblx0WzQsIDE1MiwgMTIyLCAxOCwgMTUzLCAxMjNdLFxuXHRbMTMsIDc0LCA0NiwgMzIsIDc1LCA0N10sXG5cdFs0OCwgNTQsIDI0LCAxNCwgNTUsIDI1XSxcblx0WzQyLCA0NSwgMTUsIDMyLCA0NiwgMTZdLFxuXG5cdC8vIDM5XG5cdFsyMCwgMTQ3LCAxMTcsIDQsIDE0OCwgMTE4XSxcblx0WzQwLCA3NSwgNDcsIDcsIDc2LCA0OF0sXG5cdFs0MywgNTQsIDI0LCAyMiwgNTUsIDI1XSxcblx0WzEwLCA0NSwgMTUsIDY3LCA0NiwgMTZdLFxuXG5cdC8vIDQwXG5cdFsxOSwgMTQ4LCAxMTgsIDYsIDE0OSwgMTE5XSxcblx0WzE4LCA3NSwgNDcsIDMxLCA3NiwgNDhdLFxuXHRbMzQsIDU0LCAyNCwgMzQsIDU1LCAyNV0sXG5cdFsyMCwgNDUsIDE1LCA2MSwgNDYsIDE2XVxuXTtcblxuLyoqXG4gKiDmoLnmja7mlbDmja7ojrflj5blr7nlupTniYjmnKxcbiAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICovXG5RUkNvZGVBbGcucHJvdG90eXBlLmdldFJpZ2h0VHlwZSA9IGZ1bmN0aW9uKCkge1xuXHRmb3IgKHZhciB0eXBlTnVtYmVyID0gMTsgdHlwZU51bWJlciA8IDQxOyB0eXBlTnVtYmVyKyspIHtcblx0XHR2YXIgcnNCbG9jayA9IFJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgdGhpcy5lcnJvckNvcnJlY3RMZXZlbF07XG5cdFx0aWYgKHJzQmxvY2sgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJiYWQgcnMgYmxvY2sgQCB0eXBlTnVtYmVyOlwiICsgdHlwZU51bWJlciArIFwiL2Vycm9yQ29ycmVjdExldmVsOlwiICsgdGhpcy5lcnJvckNvcnJlY3RMZXZlbCk7XG5cdFx0fVxuXHRcdHZhciBsZW5ndGggPSByc0Jsb2NrLmxlbmd0aCAvIDM7XG5cdFx0dmFyIHRvdGFsRGF0YUNvdW50ID0gMDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgY291bnQgPSByc0Jsb2NrW2kgKiAzICsgMF07XG5cdFx0XHR2YXIgZGF0YUNvdW50ID0gcnNCbG9ja1tpICogMyArIDJdO1xuXHRcdFx0dG90YWxEYXRhQ291bnQgKz0gZGF0YUNvdW50ICogY291bnQ7XG5cdFx0fVxuXG5cdFx0dmFyIGxlbmd0aEJ5dGVzID0gdHlwZU51bWJlciA+IDkgPyAyIDogMTtcblx0XHRpZiAodGhpcy51dGY4Ynl0ZXMubGVuZ3RoICsgbGVuZ3RoQnl0ZXMgPCB0b3RhbERhdGFDb3VudCB8fCB0eXBlTnVtYmVyID09IDQwKSB7XG5cdFx0XHR0aGlzLnR5cGVOdW1iZXIgPSB0eXBlTnVtYmVyO1xuXHRcdFx0dGhpcy5yc0Jsb2NrID0gcnNCbG9jaztcblx0XHRcdHRoaXMudG90YWxEYXRhQ291bnQgPSB0b3RhbERhdGFDb3VudDtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSQml0QnVmZmVyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBRUkJpdEJ1ZmZlcigpIHtcblx0dGhpcy5idWZmZXIgPSBuZXcgQXJyYXkoKTtcblx0dGhpcy5sZW5ndGggPSAwO1xufVxuXG5RUkJpdEJ1ZmZlci5wcm90b3R5cGUgPSB7XG5cblx0Z2V0OiBmdW5jdGlvbihpbmRleCkge1xuXHRcdHZhciBidWZJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyA4KTtcblx0XHRyZXR1cm4gKCh0aGlzLmJ1ZmZlcltidWZJbmRleF0gPj4+ICg3IC0gaW5kZXggJSA4KSkgJiAxKTtcblx0fSxcblxuXHRwdXQ6IGZ1bmN0aW9uKG51bSwgbGVuZ3RoKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5wdXRCaXQoKChudW0gPj4+IChsZW5ndGggLSBpIC0gMSkpICYgMSkpO1xuXHRcdH1cblx0fSxcblxuXHRwdXRCaXQ6IGZ1bmN0aW9uKGJpdCkge1xuXG5cdFx0dmFyIGJ1ZkluZGV4ID0gTWF0aC5mbG9vcih0aGlzLmxlbmd0aCAvIDgpO1xuXHRcdGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPD0gYnVmSW5kZXgpIHtcblx0XHRcdHRoaXMuYnVmZmVyLnB1c2goMCk7XG5cdFx0fVxuXG5cdFx0aWYgKGJpdCkge1xuXHRcdFx0dGhpcy5idWZmZXJbYnVmSW5kZXhdIHw9ICgweDgwID4+PiAodGhpcy5sZW5ndGggJSA4KSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5sZW5ndGgrKztcblx0fVxufTtcbm1vZHVsZS5leHBvcnRzID0gUVJDb2RlQWxnO1xuIl19
