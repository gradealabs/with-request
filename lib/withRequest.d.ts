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
export default function withRequest(request: any, { prefix, defaultResponse, overlapStrategy }?: {
    prefix?: string;
    defaultResponse?: any;
    overlapStrategy?: string;
}): any;
export declare function withCallRequestOnMount(execRequest: any): any;
export declare function withCallRequestOnChange(shouldCall: any, execRequest: any): any;
export declare function withConsolidatedRequestProps(prefixes: any, removeOriginals?: boolean): any;
