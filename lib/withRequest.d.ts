export default function withRequest(request: any, { prefix, defaultResponse, overlapStrategy }?: {
    prefix?: string;
    defaultResponse?: any;
    overlapStrategy?: string;
}): any;
export declare function withCallRequestOnMount(execRequest: any): any;
export declare function withCallRequestOnChange(shouldCall: any, execRequest: any): any;
export declare function withConsolidatedRequestProps(prefixes: any, removeOriginals?: boolean): any;
