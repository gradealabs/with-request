"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var recompose_1 = require("recompose");
var lodash_omitby_1 = require("lodash.omitby");
/**
 * Prepares a set of props used to help with making asynchronous request and
 * easily obtaining request/response state as props.
 *
 * Props created by withRequest:
 *
 * - request: function
 * - response?: any
 * - pending: bool (true when the request is in process)
 * - error?: Error
 * - clearError (): void
 *
 * If the `prefix` option is specified then all props will be prefixed
 * with this value.
 * Example `${prefix}Request`, `${prefix}Response`, `${prefix}Pending`, etc.
 *
 * @example withRequest(props => (filter) => asyncAction(props.id, filter), { prefix: 'items', defaultResponse: [] })(Component)
 * @param {{ (props: Object): (params) => Promise<any> }} request The request function that accepts props
 * @param {{ prefix?: string, defaultResponse?: any, overlapStrategy?: 'cancel' }} [options] The options used when constructing the HOC
 */
var AbortablePromise = /** @class */ (function (_super) {
    __extends(AbortablePromise, _super);
    function AbortablePromise(fn) {
        var _this = this;
        var init = null;
        var wrap = function (resolve, reject) {
            var aborted = false;
            var resolveWrapper = function (response) { return !aborted && resolve(response); };
            var rejectWrapper = function (error) { return !aborted && reject(error); };
            init = function (self) {
                self.abort = function () {
                    if (aborted) {
                        throw new Error('AbortablePromise already aborted');
                    }
                    aborted = true;
                    resolve(AbortablePromise.ABORTED);
                };
            };
            fn(resolveWrapper, rejectWrapper);
        };
        _this = _super.call(this, wrap) || this;
        if (init) {
            init(_this);
        }
        return _this;
    }
    AbortablePromise.ABORTED = {};
    return AbortablePromise;
}(Promise));
function withRequest(request, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.prefix, prefix = _c === void 0 ? '' : _c, _d = _b.defaultResponse, defaultResponse = _d === void 0 ? undefined : _d, _e = _b.overlapStrategy, overlapStrategy = _e === void 0 ? 'cancel' : _e;
    var _f;
    if (typeof request !== 'function') {
        throw new Error('withRequest expects first argument `request` to be a function');
    }
    if (typeof prefix !== 'string') {
        throw new Error('withRequest expects optional parameter `prefix` to be a string');
    }
    if (typeof overlapStrategy !== 'string' || ['cancel'].indexOf(overlapStrategy) !== -1) {
        throw new Error('withRequest expects optional parameter `overlapStrategy` to be a string and one of the following: "cancel"');
    }
    return recompose_1.compose(recompose_1.withStateHandlers({
        pendingPromise: null,
        response: defaultResponse,
        error: null
    }, {
        setPendingPromise: function (props) { return function (pendingPromise) { return ({
            pendingPromise: pendingPromise
        }); }; },
        setResponse: function (props) { return function (response) { return ({
            response: response
        }); }; },
        setError: function (props) { return function (error) { return ({
            error: error
        }); }; }
    }), recompose_1.withHandlers({
        clearError: function (props) { return function () { return props.setError(null); }; },
        request: function (props) { return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var pendingPromise = props.pendingPromise, setResponse = props.setResponse, setPendingPromise = props.setPendingPromise, setError = props.setError;
            if (pendingPromise) {
                pendingPromise.abort();
            }
            var promise = new AbortablePromise(function (resolve) { return resolve(request(props).apply(void 0, args)); });
            promise
                .then(function (response) {
                setPendingPromise(null);
                if (response === AbortablePromise.ABORTED)
                    return;
                setResponse(response);
            })
                .catch(function (error) {
                setPendingPromise(null);
                setError(error);
            });
            setPendingPromise(promise);
            return promise;
        }; }
    }), recompose_1.mapProps(function (_a) {
        var pendingPromise = _a.pendingPromise, otherProps = __rest(_a, ["pendingPromise"]);
        return (__assign({ pending: !!pendingPromise }, otherProps));
    }), recompose_1.branch(function () { return !!prefix; }, recompose_1.compose(recompose_1.withHandlers((_f = {},
        _f[prefix + "Request"] = function (_a) {
            var request = _a.request;
            return request;
        },
        _f[prefix + "ClearError"] = function (_a) {
            var clearError = _a.clearError;
            return clearError;
        },
        _f)), recompose_1.mapProps(function (_a) {
        var pending = _a.pending, response = _a.response, error = _a.error, request = _a.request, clearError = _a.clearError, rest = __rest(_a, ["pending", "response", "error", "request", "clearError"]);
        var _b;
        return (__assign((_b = {}, _b[prefix + "Pending"] = pending, _b[prefix + "Response"] = response, _b[prefix + "Error"] = error, _b), rest));
    }))));
}
exports.default = withRequest;
// Convenience function for calling a particular request on component lifecycle
// during the mount stage (i.e. initial "page" load)
function withCallRequestOnMount(execRequest) {
    if (typeof execRequest !== 'function') {
        throw new Error('withCallRequestOnMount expects execRequest to be a function');
    }
    return recompose_1.lifecycle({
        componentDidMount: function () {
            this.handle = execRequest(this.props);
        },
        componentWillUnmount: function () {
            if (this.handle && this.handle.abort) {
                this.handle.abort();
            }
        }
    });
}
exports.withCallRequestOnMount = withCallRequestOnMount;
// Convenience function to call the request based on a props vs nextProps
// comparison
function withCallRequestOnChange(shouldCall, execRequest) {
    if (typeof execRequest !== 'function') {
        throw new Error('withCallRequestOnChange expects execRequest to be a function');
    }
    return recompose_1.lifecycle({
        componentDidUpdate: function (prevProps) {
            if (!shouldCall(prevProps, this.props)) {
                // Don't request unless shouldCall says we should. Notice that we do
                // this check in componentDidUpdate instead of shouldComponentUpdate.
                // We need to perform the request as a side-effect, because if we were
                // to return false from shouldComponentUpdate, it may prevent rendering
                // completely.
                return;
            }
            this.handle = execRequest(this.props);
        },
        componentWillUnmount: function () {
            if (this.handle && this.handle.abort) {
                this.handle.abort();
            }
        }
    });
}
exports.withCallRequestOnChange = withCallRequestOnChange;
// Consolidates multiple prefixed request results into single `error`,
// `clearError`, and `pending` props. Other props aren't consolidated.
// - `error` is combined into an array of all errors
// - `clearError` is combined into a single function which calls all clearErrors
// - `pending` is combined into a boolean resulting from an AND of all pendings
function withConsolidatedRequestProps(prefixes, removeOriginals) {
    if (removeOriginals === void 0) { removeOriginals = false; }
    if (prefixes === undefined || !Array.isArray(prefixes)) {
        throw new Error('withConsolidatedRequestProps expects prefixes to be an array of string prefixes');
    }
    return recompose_1.mapProps(function (props) {
        var remainder = removeOriginals
            ? lodash_omitby_1.default(props, function (value, key) {
                return prefixes.some(function (prefix) {
                    return (key === prefix + "Error" ||
                        key === prefix + "ClearError" ||
                        key === prefix + "Pending");
                });
            })
            : props;
        var error = prefixes.map(function (prefix) { return props[prefix + "Error"]; });
        var clearError = function () { return prefixes.forEach(function (prefix) { return props[prefix + "ClearError"](); }); };
        var pending = prefixes.some(function (prefix) { return props[prefix + "Pending"]; });
        return __assign({ error: error,
            clearError: clearError,
            pending: pending }, remainder);
    });
}
exports.withConsolidatedRequestProps = withConsolidatedRequestProps;
