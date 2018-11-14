"use strict";
// NOTE: we can't use TypeScript to extend Promise. Instead, we wrap it.
// Reference: https://github.com/Microsoft/TypeScript/issues/15397
Object.defineProperty(exports, "__esModule", { value: true });
var AbortablePromise = /** @class */ (function () {
    function AbortablePromise(executor) {
        this.aborted = false;
        this.promise = new Promise(function (resolve, reject) {
            executor(resolve, reject);
        });
    }
    AbortablePromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        return this.promise.then(function (value) {
            onFulfilled(_this.aborted ? AbortablePromise.ABORTED : value);
        }, function (reason) {
            if (onRejected) {
                onRejected(_this.aborted ? AbortablePromise.ABORTED : reason);
            }
            else {
                throw reason;
            }
        });
    };
    AbortablePromise.prototype.catch = function (onRejected) {
        var _this = this;
        return this.promise.catch(function (reason) {
            onRejected(_this.aborted ? AbortablePromise.ABORTED : reason);
        });
    };
    AbortablePromise.prototype.abort = function () {
        if (this.aborted) {
            throw new Error('AbortablePromise already aborted');
        }
        this.aborted = true;
    };
    AbortablePromise.ABORTED = {};
    return AbortablePromise;
}());
exports.default = AbortablePromise;
