'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _caseless = require('caseless');

var _caseless2 = _interopRequireDefault(_caseless);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _buffer = require('buffer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetch = (typeof window === 'undefined' ? 'undefined' : (0, _typeof3.default)(window)) === 'object' ? window.fetch : global.fetch;
//     frisbee
//     Copyright (c) 2015- Nick Baugh <niftylettuce@gmail.com>
//     MIT Licensed

// * Author: [@niftylettuce](https://twitter.com/#!/niftylettuce)
// * Source: <https://github.com/niftylettuce/frisbee>

// # frisbee

if (!fetch) throw new Error('A global `fetch` method is required as either `window.fetch` ' + 'for browsers or `global.fetch` for node runtime environments. ' + 'Please add `require(\'isomorphic-fetch\')` before importing `frisbee`. ' + 'You may optionally `require(\'es6-promise\').polyfill()` before you ' + 'require `isomorphic-fetch` if you want to support older browsers.' + '\n\nFor more info: https://github.com/niftylettuce/frisbee#usage');

var methods = ['get', 'head', 'post', 'put', 'del', 'options', 'patch'];

var respProperties = {
  readOnly: ['headers', 'ok', 'redirected', 'status', 'statusText', 'type', 'url', 'bodyUsed'],
  writable: ['useFinalURL'],
  callable: ['clone', 'error', 'redirect', 'arrayBuffer', 'blob', 'formData', 'json', 'text']
};

function createFrisbeeResponse(origResp) {
  var resp = {
    originalResponse: origResp
  };

  respProperties.readOnly.forEach(function (prop) {
    return (0, _defineProperty2.default)(resp, prop, {
      value: origResp[prop]
    });
  });

  respProperties.writable.forEach(function (prop) {
    return (0, _defineProperty2.default)(resp, prop, {
      get: function get() {
        return origResp[prop];
      },
      set: function set(value) {
        origResp[prop] = value;
      }
    });
  });

  var callable = null;
  respProperties.callable.forEach(function (prop) {
    (0, _defineProperty2.default)(resp, prop, {
      value: (callable = origResp[prop], typeof callable === 'function' && callable.bind(origResp))
    });
  });

  return resp;
}

var Frisbee = function () {
  function Frisbee(opts) {
    var _this = this;

    (0, _classCallCheck3.default)(this, Frisbee);

    this.opts = opts || {};

    if (!this.opts.baseURI) throw new Error('baseURI option is required');

    this.parseErr = new Error('Invalid JSON received from ' + opts.baseURI);

    this.headers = (0, _extends3.default)({}, opts.headers);

    this.arrayFormat = opts.arrayFormat || 'indices';

    if (this.opts.auth) this.auth(this.opts.auth);

    methods.forEach(function (method) {
      _this[method] = _this._setup(method);
    });
  }

  (0, _createClass3.default)(Frisbee, [{
    key: '_setup',
    value: function _setup(method) {
      var _this2 = this;

      return function () {
        var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


        // path must be string
        if (typeof path !== 'string') throw new Error('`path` must be a string');

        // otherwise check if its an object
        if ((typeof options === 'undefined' ? 'undefined' : (0, _typeof3.default)(options)) !== 'object' || Array.isArray(options)) throw new Error('`options` must be an object');

        var opts = (0, _extends3.default)({
          headers: (0, _extends3.default)({}, _this2.headers)
        }, options, {
          method: method === 'del' ? 'DELETE' : method.toUpperCase()
        });

        var c = (0, _caseless2.default)(opts.headers);

        // in order to support Android POST requests
        // we must allow an empty body to be sent
        // https://github.com/facebook/react-native/issues/4890
        if (typeof opts.body === 'undefined') {
          if (opts.method === 'POST') opts.body = '';
        } else if ((0, _typeof3.default)(opts.body) === 'object' || opts.body instanceof Array) {
          if (opts.method === 'GET') {
            path += '?' + _qs2.default.stringify(opts.body, { arrayFormat: _this2.arrayFormat });
            delete opts.body;
          } else if (c.get('Content-Type') === 'application/json') {
            try {
              opts.body = (0, _stringify2.default)(opts.body);
            } catch (err) {
              throw err;
            }
          }
        }

        return new _promise2.default(function () {
          var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(resolve, reject) {
            var originalRes, res;
            return _regenerator2.default.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.prev = 0;
                    _context.next = 3;
                    return fetch(_this2.opts.baseURI + path, opts);

                  case 3:
                    originalRes = _context.sent;
                    res = createFrisbeeResponse(originalRes);

                    if (res.ok) {
                      _context.next = 21;
                      break;
                    }

                    res.err = new Error(res.statusText);

                    // check if the response was JSON, and if so, better the error

                    if (!(res.headers.get('Content-Type').indexOf('application/json') !== -1)) {
                      _context.next = 19;
                      break;
                    }

                    _context.prev = 8;
                    _context.next = 11;
                    return res.text();

                  case 11:
                    res.body = _context.sent;

                    res.body = JSON.parse(res.body);

                    // attempt to use Glazed error messages
                    if ((0, _typeof3.default)(res.body) === 'object' && typeof res.body.message === 'string') {
                      res.err = new Error(res.body.message);
                    } else if (!(res.body instanceof Array)
                    // attempt to utilize Stripe-inspired error messages
                    && (0, _typeof3.default)(res.body.error) === 'object') {
                      if (res.body.error.message) res.err = new Error(res.body.error.message);
                      if (res.body.error.stack) res.err.stack = res.body.error.stack;
                      if (res.body.error.code) res.err.code = res.body.error.code;
                      if (res.body.error.param) res.err.param = res.body.error.param;
                    }

                    _context.next = 19;
                    break;

                  case 16:
                    _context.prev = 16;
                    _context.t0 = _context['catch'](8);

                    res.err = _this2.parseErr;

                  case 19:

                    resolve(res);
                    return _context.abrupt('return');

                  case 21:
                    if (!(res.headers.get('Content-Type').indexOf('application/json') !== -1)) {
                      _context.next = 37;
                      break;
                    }

                    _context.prev = 22;
                    _context.next = 25;
                    return res.text();

                  case 25:
                    res.body = _context.sent;

                    res.body = JSON.parse(res.body);
                    _context.next = 35;
                    break;

                  case 29:
                    _context.prev = 29;
                    _context.t1 = _context['catch'](22);

                    if (!(res.headers.get('Content-Type') === 'application/json')) {
                      _context.next = 35;
                      break;
                    }

                    res.err = _this2.parseErr;
                    resolve(res);
                    return _context.abrupt('return');

                  case 35:
                    _context.next = 40;
                    break;

                  case 37:
                    _context.next = 39;
                    return res.text();

                  case 39:
                    res.body = _context.sent;

                  case 40:

                    resolve(res);

                    _context.next = 46;
                    break;

                  case 43:
                    _context.prev = 43;
                    _context.t2 = _context['catch'](0);

                    reject(_context.t2);

                  case 46:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, _this2, [[0, 43], [8, 16], [22, 29]]);
          }));

          return function (_x3, _x4) {
            return _ref.apply(this, arguments);
          };
        }());
      };
    }
  }, {
    key: 'auth',
    value: function auth(creds) {

      if (typeof creds === 'string') {
        var index = creds.indexOf(':');
        if (index !== -1) {
          creds = [creds.substr(0, index), creds.substr(index + 1)];
        }
      }

      if (!Array.isArray(creds)) creds = [].slice.call(arguments);

      switch (creds.length) {
        case 0:
          creds = ['', ''];
          break;
        case 1:
          creds.push('');
          break;
        case 2:
          break;
        default:
          throw new Error('auth option can only have two keys `[user, pass]`');
      }

      if (typeof creds[0] !== 'string') throw new Error('auth option `user` must be a string');

      if (typeof creds[1] !== 'string') throw new Error('auth option `pass` must be a string');

      if (!creds[0] && !creds[1]) delete this.headers.Authorization;else this.headers.Authorization = 'Basic ' + new _buffer.Buffer(creds.join(':')).toString('base64');

      return this;
    }
  }, {
    key: 'jwt',
    value: function jwt(token) {

      if (typeof token === 'string') this.headers.Authorization = 'Bearer ' + token;else throw new Error('jwt token must be a string');

      return this;
    }
  }]);
  return Frisbee;
}();

exports.default = Frisbee;
//# sourceMappingURL=frisbee.js.map