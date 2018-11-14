// NOTE: we can't use TypeScript to extend Promise. Instead, we wrap it.
// Reference: https://github.com/Microsoft/TypeScript/issues/15397

export default class AbortablePromise<T> {
  public static ABORTED = {}

  private promise: any
  private aborted: boolean = false

  constructor (executor: Function) {
    this.promise = new Promise((resolve, reject) => {
      executor(resolve, reject)
    })
  }

  then (onFulfilled: any, onRejected?: any) {
    return this.promise.then(value => {
      onFulfilled(this.aborted ? AbortablePromise.ABORTED : value)
    }, reason => {
      if (onRejected) {
        onRejected(this.aborted ? AbortablePromise.ABORTED : reason)
      } else {
        throw this.aborted ? AbortablePromise.ABORTED : reason
      }
    })
  }

  catch (onRejected: any) {
    return this.promise.catch(reason => {
      onRejected(this.aborted ? AbortablePromise.ABORTED : reason)
    })
  }

  abort (): void {
    if (this.aborted) {
      throw new Error('AbortablePromise already aborted')
    }

    this.aborted = true
  }
}
