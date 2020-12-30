import chalk from "chalk";


export default class ResponseError extends Error {

	constructor(msg: string, output?: any | undefined) {
		super();

		Error.captureStackTrace(this, this.constructor);
		this.name = this.constructor.name;

		if(output != undefined)
			this.message = '\n' + chalk.red(msg) + '\n' + this.prettifyData(output);
		else
			this.message = msg;
	}



	prettifyData(output: any, str = '', prefix: string = 'command'): string {

		if(output._errors) {
			for(const i in output._errors) {
				const d = output._errors[i];
	
				str += chalk.bold(chalk.yellow(prefix)) + '\n';
				str += chalk.red('code: ') + d.code + '\n';
				str += chalk.red('message: ') + d.message + '\n\n';
			}
	
			delete output._errors;
		}
	
		for(const i in output) {
			const option = output[i]
			const d = isNaN(parseInt(i)) ? `.${i}`: `[${i}]`;
			
			str = this.prettifyData(option, str, prefix + d);
		}
	
	
		return str;
	}
}