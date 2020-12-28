import { InteractionFunction, SlashCommandHandler } from "."
import ApplicationCommandOptionTable from "./tables/ApplicationCommandOptionType"

export class SlashCommand implements ApplicationCommand {

	id?: string
	application_id?: string
	name: string
	description: string
	options?: ApplicationCommandOption[]

	handler: SlashCommandHandler

	runFunction: InteractionFunction = () => {}
	subFunctions: Map<string, InteractionFunction> = new Map<string, InteractionFunction>()

	constructor(command: ApplicationCommand, handler: SlashCommandHandler) {
		this.id = command.id;
		this.application_id = command.application_id;
		this.name = command.name.toLowerCase();
		this.description = command.description;
		this.options = command.options;

		this.handler = handler;
	}

	run(callback: InteractionFunction): SlashCommand {
		this.runFunction = callback;
		return this;
	}


	runSub(subcommand: string, callback: InteractionFunction): SlashCommand {
		this.subFunctions.set(subcommand, callback);
		return this;
	}


	parsedOptions(): ApplicationCommandOption[] {
		if(!this.options) return [];
		const cloned = JSON.parse(JSON.stringify(this.options));

		this.parsedown(cloned);
		return cloned;
	}


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

	
	private parsedown(options: any[]) {
		for(const option of options) {
			option.type = ApplicationCommandOptionTable.to(option.type);
			
			if(option.options)
				this.parsedown(option.options)
		}
	}
}


export interface ApplicationCommand {
	id?: string
	application_id?: string
	name: string
	description: string
	options?: ApplicationCommandOption[]
}


export interface ApplicationCommandOption {
	type: ApplicationCommandOptionType
	name: string
	description: string
	default?: boolean
	required?: boolean
	choices?: ApplicationCommandOptionChoice[]
	options?: ApplicationCommandOption[]
}


export interface ApplicationCommandOptionChoice {
	name: string
	value: number | string
}


export type ApplicationCommandOptionType =
	'SUB_COMMAND' |
	'SUB_COMMAND_GROUP' |
	'STRING' |
	'INTEGER' |
	'BOOLEAN' |
	'USER' |
	'CHANNEL' |
	'ROLE'
;