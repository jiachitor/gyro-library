import Uploader from '../../../src/upload/index.js';
import $ from 'jquery';

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
    new Uploader({
      trigger: '#uploader-1',
      action: '/',
      progress: function() {
        console.log(arguments);
      }
    }).success(function(data) {
      alert(data);
    });

    var uploader = new Uploader({
      trigger: '#uploader-2',
      action: '/'
    }).change(function(filename) {
      document.getElementById('upload-2-text').innerHTML = filename.replace(/<.+?>/gim,'');
    }).success(function(data) {
      alert(data);
    });

    document.getElementById('submit-2').onclick = function() {
      uploader.submit();
      return false;
    };

    new Uploader({
      trigger: '#uploader-3',
      accept: 'image/*',
      action: '/'
    }).success(function(data) {
      alert(data);
    });

    var uploaderCanBeDisabled = new Uploader({
      trigger: '#uploader-4',
      action: '/'
    }).change(function(filename) {
      document.getElementById('upload-4-text').innerHTML = filename.replace(/<.+?>/gim,'');
    }).success(function(data) {
      alert(data);
    });
    document.getElementById('disable').onclick = function() {
      var txt = $(this).html();
      uploaderCanBeDisabled[txt === 'Disable'? 'disable': 'enable']();
      this.innerHTML = (txt === 'Disable'? 'Enable': 'Disable');
      return false;
    };

    document.getElementById('submit-4').onclick = function() {
      uploaderCanBeDisabled.submit();  
      return false;
    };

  }, false);
})();