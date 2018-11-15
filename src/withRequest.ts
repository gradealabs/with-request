import { withHandlers, lifecycle, compose, mapProps, branch, withStateHandlers } from 'recompose'
import omitBy from 'lodash.omitby'
import CancellablePromise from 'cancelable-promise'

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
 * @param {{ (props: Object): (params) => AbortablePromise<any> }} request The request function that accepts props
 * @param {{ prefix?: string, defaultResponse?: any, overlapStrategy?: 'cancel' }} [options] The options used when constructing the HOC
 */

export default function withRequest (request, { prefix = '', defaultResponse = undefined, overlapStrategy = 'cancel' } = {}) {
  if (typeof request !== 'function') {
    throw new Error('withRequest expects first argument `request` to be a function')
  }

  if (typeof prefix !== 'string') {
    throw new Error('withRequest expects optional parameter `prefix` to be a string')
  }

  if (typeof overlapStrategy !== 'string' || ['cancel'].indexOf(overlapStrategy) === -1) {
    throw new Error('withRequest expects optional parameter `overlapStrategy` to be a string and one of the following: "cancel"')
  }

  return compose(
    withStateHandlers({
      pendingPromise: null,
      response: defaultResponse,
      error: null
    }, {
      setPendingPromise: props => pendingPromise => ({
        pendingPromise
      }),
      setResponse: props => response => ({
        response
      }),
      setError: props => error => ({
        error
      })
    }),
    withHandlers({
      clearError: props => () => props.setError(null),
      request: props => (...args) => {
        const {
          pendingPromise,
          setResponse,
          setPendingPromise,
          setError
        } = props

        if (pendingPromise) {
          pendingPromise.cancel()
        }

        const promise = new CancellablePromise(resolve => resolve(request(props)(...args)))

        promise
          .then(response => {
            setPendingPromise(null)
            setResponse(response)
          })
          .catch(error => {
            setPendingPromise(null)
            setError(error)
          })

        setPendingPromise(promise)

        return promise
      }
    }),
    mapProps(({ pendingPromise, ...otherProps }) => ({ pending: !!pendingPromise, ...otherProps })),
    branch(
      () => !!prefix,
      compose(
        withHandlers({
          [`${prefix}Request`]: ({ request }) => request,
          [`${prefix}ClearError`]: ({ clearError }) => clearError
        }),
        mapProps(({ pending, response, error, request, clearError, ...rest }) => ({
          [`${prefix}Pending`]: pending,
          [`${prefix}Response`]: response,
          [`${prefix}Error`]: error,
          ...rest
        }))
      )
    )
  )
}

// Convenience function for calling a particular request on component lifecycle
// during the mount stage (i.e. initial "page" load)
export function withCallRequestOnMount (execRequest) {
  if (typeof execRequest !== 'function') {
    throw new Error('withCallRequestOnMount expects execRequest to be a function')
  }

  return lifecycle({
    componentDidMount () {
      this.cancellablePromise = execRequest(this.props)
    },
    componentWillUnmount () {
      if (this.cancellablePromise && this.cancellablePromise.cancel) {
        this.cancellablePromise.cancel()
      }
    }
  })
}

// Convenience function to call the request based on a props vs nextProps
// comparison
export function withCallRequestOnChange (shouldCall, execRequest) {
  if (typeof execRequest !== 'function') {
    throw new Error('withCallRequestOnChange expects execRequest to be a function')
  }

  return lifecycle({
    componentDidUpdate (prevProps) {
      if (!shouldCall(prevProps, this.props)) {
        // Don't request unless shouldCall says we should. Notice that we do
        // this check in componentDidUpdate instead of shouldComponentUpdate.
        // We need to perform the request as a side-effect, because if we were
        // to return false from shouldComponentUpdate, it may prevent rendering
        // completely.
        return
      }

      this.cancellablePromise = execRequest(this.props)
    },
    componentWillUnmount () {
      if (this.cancellablePromise && this.cancellablePromise.cancel) {
        this.cancellablePromise.cancel()
      }
    }
  })
}

// Consolidates multiple prefixed request results into single `error`,
// `clearError`, and `pending` props. Other props aren't consolidated.
// - `error` is combined into an array of all errors
// - `clearError` is combined into a single function which calls all clearErrors
// - `pending` is combined into a boolean resulting from an AND of all pendings
export function withConsolidatedRequestProps (prefixes, removeOriginals = false) {
  if (prefixes === undefined || !Array.isArray(prefixes)) {
    throw new Error('withConsolidatedRequestProps expects prefixes to be an array of string prefixes')
  }

  return mapProps(props => {
    const remainder = removeOriginals
      ? omitBy(props, (value, key) => {
        return prefixes.some(prefix => {
          return (
            key === `${prefix}Error` ||
            key === `${prefix}ClearError` ||
            key === `${prefix}Pending`
          )
        })
      })
      : props

    const error = prefixes.map(prefix => props[`${prefix}Error`])
    const clearError = () => prefixes.forEach(prefix => props[`${prefix}ClearError`]())
    const pending = prefixes.some(prefix => props[`${prefix}Pending`])

    return {
      error,
      clearError,
      pending,
      ...remainder
    }
  })
}
