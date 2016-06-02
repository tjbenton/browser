'use strict';

;(function (name, factory) {
  // eslint-disable-line
  factory = factory();
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js Module
    module.exports = factory;
  } else if (typeof define === 'function' && define.amd) {
    // AMD Module
    define(factory);
  } else {
    // Assign to common namespaces or simply the global object (window)
    this[name] = factory; // eslint-disable-line
  }
})('browser', function () {
  var browser = {};
  var nav = navigator;
  var truthy = true;
  var ua = nav.userAgent;
  var match = function match(regex) {
    return (ua.match(regex) || ['', '', '']).slice(1);
  };
  var tem = void 0;

  Object.defineProperty(browser, 'addClasses', {
    value: function addClasses() {
      var prefix = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      var html = document.documentElement;
      Object.keys(this).forEach(function (key) {
        var value = '' + prefix + key;
        if (key !== 'osversion' && key !== 'version' && html.className.split(' ').indexOf(value) < 0) {
          html.className += ' ' + value;
        }
      });
    }
  });

  var _match = match(/(opera|chrome|crios|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i);
  var name = _match[0];
  var version = _match[1];
  name = name.toLowerCase();

  if (/trident/i.test(name)) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    name = 'ie';
    version = tem[1];
  }

  if (name === 'chrome' || name === 'crios') {
    name = 'chrome';
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) {
      tem = tem.slice(1).join(' ').replace('OPR', 'Opera').toLowerCase().split(' ');
      name = tem[0];
      version = tem[1];
    }
  }

  if (!version) {
    name = nav.appName;
    version = nav.appVersion;
  }

  tem = ua.match(/version\/(\d+)/i);
  if (tem != null) {
    version = tem[1];
  }

  name = name === 'msie' ? 'ie' : name;

  browser[name] = truthy;
  browser['' + name + version] = truthy;
  browser.version = version;

  var iosdevice = match(/(ipod|iphone|ipad)/i)[0].toLowerCase();
  var android = !/like android/i.test(ua) && /android/i.test(ua);
  if (/windows phone/i.test(ua)) {
    browser.iemobile = browser.iem = browser.windowsphone = truthy;
  } else if (iosdevice) {
    browser[iosdevice] = truthy;
    browser.ios = truthy;
  } else if (android) {
    browser.android = truthy;
  }

  if (browser.name === 'safari' && browser.ios) {
    if (/CriOS/i.test(ua)) {
      delete browser.safari;
      browser.chrome = truthy;
    }
  }

  var osversion = '';
  if (browser.iemobile) {
    osversion = match(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i)[0];
  } else if (iosdevice) {
    osversion = match(/(?:ipod|iphone|ipad)\s+os\s+(\d).*like mac os x/i)[0];
    osversion = osversion.replace(/[_\s]/g, '.');
  } else if (android) {
    osversion = match(/android[ \/-](\d+(\.\d+)*)/i)[0];
  }

  if (osversion) {
    browser.osversion = osversion;
    var devices = ['ios', 'android', 'iemobile', 'iem', 'windowsphone'];
    devices.forEach(function (os) {
      if (browser[os]) {
        osversion.split('.').reduce(function (prev, next) {
          prev += '' + (prev ? '.' : '') + next;
          browser['' + os + prev] = truthy;
          return prev;
        }, '');
      }
    });
  }

  return browser;
}); // eslint-disable-line
