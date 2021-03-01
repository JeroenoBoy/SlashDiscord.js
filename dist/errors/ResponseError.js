"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
class ResponseError extends Error {
    constructor(msg, output) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        if (output != undefined)
            this.message = '\n' + chalk_1.default.red(msg) + '\n' + this.prettifyData(output);
        else
            this.message = msg;
    }
    prettifyData(output, str = '', prefix = 'command') {
        if (output._errors) {
            for (const i in output._errors) {
                const d = output._errors[i];
                str += chalk_1.default.bold(chalk_1.default.yellow(prefix)) + '\n';
                str += chalk_1.default.red('code: ') + d.code + '\n';
                str += chalk_1.default.red('message: ') + d.message + '\n\n';
            }
            delete output._errors;
        }
        for (const i in output) {
            const option = output[i];
            const d = isNaN(parseInt(i)) ? `.${i}` : `[${i}]`;
            str = this.prettifyData(option, str, prefix + d);
        }
        return str;
    }
}
exports.default = ResponseError;
