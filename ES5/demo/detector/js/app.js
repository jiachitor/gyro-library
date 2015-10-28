"use strict";
console.log(Detector)

function parses(userAgents) {
  let uas = userAgents.split(/\r\n|\r|\n/);
  let rst = [];
  let RE_BLANK = /^\s*$/;

  for (let i = 0, ua, l = uas.length; i < l; i++) {
    ua = uas[i];
    rst[i] = [ua, Detector.parse(ua)];
  }

  return rst;
}

function outputs(result) {
  let html = '<table><thead><tr><th>userAgent</th>' +
    '<th>OS</th>' +
    '<th>Browser</th>' +
    '</tr></thead><tbody>';
  let md = '| userAgent  | OS | Browser  |\n' +
    '|-----------|----|---------|\n';

  for (let i = 0, ua, rst, l = result.length; i < l; i++) {
    ua = result[i][0];
    rst = result[i][1];
    let isNA_os = rst.os.name === 'na';
    let isNA_browser = rst.browser.name === 'na';

    html += '<tr><th>' + ua + '</th>';
    html += '<td' + (isNA_os ? ' class="error"' : '') + '>' + rst.os.name + '<br/>' + rst.os.fullVersion + '</td>';
    html += '<td' + (isNA_browser ? ' class="error"' : '') + '>' + rst.browser.name + '<br/>' + rst.browser.fullVersion + '</td>';
    html += '</tr>';

    md += '| ' + ua + ' | ' +
      rst.os.name + '/' + rst.os.fullVersion + ' | ' +
      rst.browser.name + '/' + rst.browser.fullVersion + ' | ' ;

  }

  return {
    html: html,
    markdown: md
  };
}

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
    let url = location.href;
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      url = url.replace(location.hostname, '10.0.0.7');
    }

    console.log(url)
    console.log(Detector);
    console.log(Detector.browser.name);
    console.log(navigator.userAgent)

    let opt_html = document.getElementById("output-html");
    let opt_md = document.getElementById("output-md");
    let o = outputs(parses(navigator.userAgent));
    opt_html.innerHTML += o.html;
    opt_md.innerHTML += o.markdown;

  }, false);
})();
