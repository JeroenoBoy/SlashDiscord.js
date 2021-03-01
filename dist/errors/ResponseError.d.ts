export default class ResponseError extends Error {
    constructor(msg: string, output?: any | undefined);
    prettifyData(output: any, str?: string, prefix?: string): string;
}
