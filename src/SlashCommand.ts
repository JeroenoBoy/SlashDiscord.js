import chalk from "chalk"
import fetch from 'node-fetch';
import { InteractionFunction, SlashCommandHandler } from "."
import ApplicationCommandOptionTable from "./tables/ApplicationCommandType"


export class SlashCommand implements ApplicationCommand {

	/**
	 * The ID of this command.
	 */
	id?: string

	/**
	 * If this command is for a specific guild.
	 */
	guildID?: string

	/**
	 * The ID of the application.
	 */
	application_id?: string

	/**
	 * This command's name
	 */
	name: string

	/**
	 * This command's description.
	 */
	description: string

	/**
	 * The options of this command.
	 */
	options?: ApplicationCommandOption[]

	/**
	 * The handler used.
	 */
	handler: SlashCommandHandler

	/**
	 * All the subcommand functions.
	 */
	functionMap: Map<string, InteractionFunction> = new Map<string, InteractionFunction>()

	constructor(command: ApplicationCommand, handler: SlashCommandHandler) {
		this.id = command.id;
		this.application_id = command.application_id;
		this.name = command.name.toLowerCase();
		this.description = command.description;
		this.options = command.options;

		this.handler = handler;

		this.functionMap.set('', () => {})
	}


	/**
	 * Set the main InteractionFunction.
	 * @param callback the function being ran when executed.
	 */
	run(callback: InteractionFunction): SlashCommand;

	/**
	 * Execute a specific option.
	 * @param option the option to listen to. 
	 * @param callback the function being ran when executed
	 */
	run(option: string, callback: InteractionFunction): SlashCommand;


	run(callbackOrOption: string | InteractionFunction, callback?: InteractionFunction): SlashCommand {
		if(typeof callbackOrOption === 'string') {
			if(typeof callback !== 'function') throw new Error('callback must be of type function.');
			this.functionMap.set(callbackOrOption, callback);
		}
		else
			this.functionMap.set('', callbackOrOption);

		return this;
	}


	/**
	 * @deprecated
	 * Run a sub command, for example: 'example ping user'.
	 * @param subcommand the subcommand which should be executed
	 * @param callback function that executes this command
	 */
	runSub(subcommand: string, callback: InteractionFunction): SlashCommand {
		console.log(chalk.yellow('SlashDiscord.js ') + chalk.red('DeprecationWarning: SlashCommand.runSub(option, callback) is deprecated, please use SlashCommand.run(option, callback)'));
		this.functionMap.set(subcommand, callback);
		return this;
	}


	parsedOptions(): ApplicationCommandOption[] | undefined {
		if(!this.options) return;
		const cloned = JSON.parse(JSON.stringify(this.options));

		this.parsedown(cloned);
		return cloned;
	}
	private parsedown(options: any[]) {
		for(const option of options) {
			option.type = ApplicationCommandOptionTable.to(option.type);
			
			if(option.options)
				this.parsedown(option.options)
		}
	}


	/**
	 * Return this command as a stringified version used for sending patch requests.
	 */
	toJSON(): string {
		const a: ApplicationCommand = {
			id: this.id,
			application_id: this.application_id,
			name: this.name,
			description: this.description,
			options: this.parsedOptions(),
		};
		return JSON.stringify(a);
	}


	//
	//	Command actions
	//


	/**
	 * Send the request to save this command.
	 */
	async save() {
		this.handler.log('Patching command', this.name);

		const urlAdd = this.guildID ? `/guilds/${this.guildID}` : ''
		await fetch(this.handler.baseURL + urlAdd + `/commands/${this.id}`, {
			method: 'PATCH',
			headers: { ...this.handler.headers, 'Content-Type': 'application/json'},
			body: this.toJSON()
		})
		.then((res) => this.handler.checkFetchError(res))
	}


	/**
	 * Send the request to delete this command.
	 */
	async delete() {
		this.handler.log('Deleting command', this.name);

		const urlAdd = this.guildID ? `/guilds/${this.guildID}` : ''
		await fetch(this.handler.baseURL + urlAdd + `/commands/${this.id}`, {
			method: 'DELETE',
			headers: this.handler.headers
		})
		.then((res) => this.handler.checkFetchError(res))
	}


	/**
	 * Send the request to create this command.
	 */
	async create() {
		this.handler.log('Creating command', this.name);

		const urlAdd = this.guildID ? `/guilds/${this.guildID}` : ''
		const data = await fetch(this.handler.baseURL + urlAdd + `/commands`, {
			method: 'POST',
			headers: { ...this.handler.headers, 'Content-Type': 'application/json'},
			body: this.toJSON()
		})
		.then((res) => this.handler.checkFetchError(res));

		this.id = data.id;
		this.application_id = data.application_id;
	}
}


export interface ApplicationCommand {
	/**
	 * ID of this command.
	 */
	id?: string
	/**
	 * The application this command uses.
	 */
	application_id?: string
	/**
	 * This command's name.
	 */
	name: string
	/**
	 * This command's description.
	 */
	description: string
	/**
	 * The options used by this command.
	 */
	options?: ApplicationCommandOption[]
}


export interface ApplicationCommandOption {
	/**
	 * The type of this application command.
	 */
	type: ApplicationCommandType
	/**
	 * This option's name.
	 */
	name: string
	/**
	 * This option's description.
	 */
	description: string
	/**
	 * The default propperty of this option.
	 */
	default?: boolean
	/**
	 * If this is true, the option can be left out.
	 */
	required?: boolean
	/**
	 * The available choices for this option.
	 */
	choices?: ApplicationCommandChoice[]
	/**
	 * The child options.
	 */
	options?: ApplicationCommandOption[]
}


export interface ApplicationCommandChoice {
	/**
	 * This option's name.
	 */
	name: string
	/**
	 * This option's value.
	 */
	value: number | string
}


export type ApplicationCommandType =
	'SUB_COMMAND' |
	'SUB_COMMAND_GROUP' |
	'STRING' |
	'INTEGER' |
	'BOOLEAN' |
	'USER' |
	'CHANNEL' |
	'ROLE'
;