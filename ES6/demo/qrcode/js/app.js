import qrcode from '../../../src/qrcode/index.js';

(function() {
  let ready = function(fn) {
    let doc = document;
    if (doc.addEventListener) {
      doc.addEventListener('DOMContentLoaded', fn, false);
    } else {
      doc.attachEvent('onreadystatechange', fn);
    }
  };
  ready(function() {
    var qrnode1 = new qrcode({
      text: 'http://www.alipay.com/'
    });
    document.getElementById('qrcodeDefault').appendChild(qrnode1);


    var qrnode2 = new qrcode({
      render: 'table',
      correctLevel: 0,
      pdground: '#00aaee',
      text: 'http://www.alipay.com/',
      size: 100,
      image: 'https://t.alipayobjects.com/images/rmsweb/T1ZsxhXdxbXXXXXXXX.png'
    });
    document.getElementById('qrcodeTable').appendChild(qrnode2);

    var qrnode3 = new qrcode({
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

    var qrnode4 = new qrcode({  
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