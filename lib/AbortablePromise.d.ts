export default class AbortablePromise<T> {
    static ABORTED: {};
    private promise;
    private aborted;
    constructor(executor: Function);
    then(onFulfilled: any, onRejected?: any): any;
    catch(onRejected: any): any;
    abort(): void;
}
