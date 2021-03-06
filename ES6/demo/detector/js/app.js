import detector from '../../../src/detector/index.js';

function parses(userAgents) {
  let uas = userAgents.split(/\r\n|\r|\n/);
  let rst = [];
  let RE_BLANK = /^\s*$/;

  for (let i = 0, ua, l = uas.length; i < l; i++) {
    ua = uas[i];
    rst[i] = [ua, detector.parse(ua)];
  }

  return rst;
}

function outputs(result) {
  let html = '<table><thead><tr><th>userAgent</th>' +
    '<th>Device</th>' +
    '<th>OS</th>' +
    '<th>Browser</th>' +
    '<th>Engine</th>' +
    '</tr></thead><tbody>';
  let md = '| userAgent | Device | OS | Browser | Engine |\n' +
    '|-----------|--------|----|---------|--------|\n';

  for (let i = 0, ua, rst, l = result.length; i < l; i++) {
    ua = result[i][0];
    rst = result[i][1];
    let isNA_device = rst.device.name === 'na';
    let isNA_os = rst.os.name === 'na';
    let isNA_browser = rst.browser.name === 'na';
    let isNA_engine = rst.engine.name === 'na';

    html += '<tr><th>' + ua + '</th>';
    html += '<td' + (isNA_device ? ' class="error"' : '') + '>' + rst.device.name + '<br/>' + rst.device.fullVersion + '</td>';
    html += '<td' + (isNA_os ? ' class="error"' : '') + '>' + rst.os.name + '<br/>' + rst.os.fullVersion + '</td>';
    html += '<td' + (isNA_browser ? ' class="error"' : '') + '>' + rst.browser.name + '<br/>' + rst.browser.fullVersion + '</td>';
    html += '<td' + (isNA_engine ? ' class="error"' : '') + '>' + rst.engine.name + '<br/>' + rst.engine.fullVersion + '</td>';
    html += '</tr>';

    md += '| ' + ua + ' | ' +
      rst.device.name + '/' + rst.device.fullVersion + ' | ' +
      rst.os.name + '/' + rst.os.fullVersion + ' | ' +
      rst.browser.name + '/' + rst.browser.fullVersion + ' | ' +
      rst.engine.name + '/' + rst.engine.fullVersion + ' | ';

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
    console.log(detector);
    console.log(detector.browser.name);
    console.log(navigator.userAgent)

    let opt_html = document.getElementById("output-html");
    let opt_md = document.getElementById("output-md");
    let o = outputs(parses(navigator.userAgent));
    opt_html.innerHTML += o.html;
    opt_md.innerHTML += o.markdown;

  }, false);
})();