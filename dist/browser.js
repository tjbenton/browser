'use strict';

;(function (name, factory) {
  // eslint-disable-line
  var root = window;
  factory = factory(root, localStorage || {});
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js Module
    module.exports = factory;
  } else if (typeof define === 'function' && define.amd) {
    // AMD Module
    define(factory);
  } else {
    // Assign to common namespaces or simply the global object (window)
    root[name] = factory; // eslint-disable-line
  }
})('browser', function (root, storage) {
  var storage_id = '__browser';
  var tem = storage[storage_id];
  var browser = tem ? JSON.parse(tem) : {};
  tem = undefined;
  var nav = navigator;
  var truthy = true;
  var ua = nav.userAgent;
  var match = function match(regex) {
    return (ua.match(regex) || ['', '', '']).slice(1);
  };
  var define = function define(name, value) {
    return Object.defineProperty(browser, name, { value: value });
  };
  var semver = function semver(version, modifier) {
    version.split('.').reduce(function (prev, next) {
      prev += '' + (prev ? '.' : '') + next;
      browser['' + modifier + prev] = truthy;
      return prev;
    }, '');
  };

  define('addClasses', function AddClasses(prefix) {
    prefix = !!prefix ? ' ' + prefix : ' ';
    var classes = Object.keys(this).filter(function (key) {
      return key.indexOf('ver') < 0;
    });
    document.documentElement.className += prefix + classes.join(prefix);
  });

  var timestamp = storage_id + 'timestamp';
  var log = storage[storage_id + 'log'];
  var browser_expire = storage_id + 'browser_expire';
  browser_expire = root[browser_expire] || storage[browser_expire] || 1;
  var now = new Date().getTime();
  var laststamp = storage[timestamp];

  if (laststamp && now - laststamp < browser_expire * 60 * 60 * 1000 && storage.ua === ua) {
    log && console.log('browser returned early');
    define('storage', true);
    return browser;
  }

  storage.ua = ua;

  define('storage', false);

  log && console.log('browser logic is running');

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
  browser.semver = version;
  semver(version, name);
  version = ~ ~version.split('.')[0];
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
    ['ios', 'android', 'iemobile', 'iem', 'windowsphone'].forEach(function (os) {
      return browser[os] && semver(osversion, os);
    });
    browser.ossemver = osversion;
    browser.osversion = ~ ~osversion.split('.')[0];
  }

  storage[timestamp] = now;
  storage[storage_id] = JSON.stringify(browser);

  return browser;
}); // eslint-disable-line
