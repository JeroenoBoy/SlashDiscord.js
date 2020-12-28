import { InteractionFunction, SlashCommandHandler } from "."
import ApplicationCommandOptionTable from "./tables/ApplicationCommandType"

export class SlashCommand implements ApplicationCommand {

	/**
	 * The ID of this command.
	 */
	id?: string

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
	 * The main function ran by this command.
	 */
	runFunction: InteractionFunction = () => {}

	/**
	 * All the subcommand functions.
	 */
	subFunctions: Map<string, InteractionFunction> = new Map<string, InteractionFunction>()

	constructor(command: ApplicationCommand, handler: SlashCommandHandler) {
		this.id = command.id;
		this.application_id = command.application_id;
		this.name = command.name.toLowerCase();
		this.description = command.description;
		this.options = command.options;

		this.handler = handler;
	}


	/**
	 * Set the main InteractionFunction.
	 * @param callback the function called upon execution
	 */
	run(fn: InteractionFunction): SlashCommand {
		this.runFunction = fn;
		return this;
	}


	/**
	 * Run a sub command, for example: 'example ping user'.
	 * @param subcommand the subcommand which should be executed
	 * @param fn function that executes this command
	 */
	runSub(subcommand: string, fn: InteractionFunction): SlashCommand {
		this.subFunctions.set(subcommand, fn);
		return this;
	}


	/**
	 * 
	 */
	parsedOptions(): ApplicationCommandOption[] {
		if(!this.options) return [];
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