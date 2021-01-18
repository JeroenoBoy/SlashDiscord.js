import { SlashCommand } from ".";
import fetch from 'node-fetch';
import { SlashCommandHandler } from "./SlashCommandHandler";
import { ApplicationCommand } from "./SlashCommand";

export class SlashGuild {


	/**
	 * The id of this guild
	 */
	id: string

	/**
	 * The handler this guild is assigned to
	 */
	handler: SlashCommandHandler

	
	//	Command data stuff
	private commandData: Map<SlashCommand['name'], SlashCommand> = new Map();
	private commandById: Map<SlashCommand['id'], SlashCommand['name']> = new Map();


	constructor(guildID: string, handler: SlashCommandHandler) {
		this.id = guildID;
		this.handler = handler;
	}


	/**
	 * Add a command to this guild.
	 * @param command The command to add to this guild
	 */
	addCommand(command: ApplicationCommand): SlashCommand {
		const cmd = new SlashCommand(command!, this.handler);
		cmd.guildID = this.id;
		this.commandData.set(command.name, cmd);

		return cmd;
	}


	/**
	 * Load the commands.
	 */
	async load() {
		this.handler.log(`Getting commands for guild ${this.id}`);

		//	Retrieving commands

		const commands = await fetch(`${this.handler.baseURL}/guilds/${this.id}/commands`, { headers: this.handler.headers })
			.then((res) => this.handler.checkFetchError(res))

		if(!commands) throw new Error('Didn\'t recieve any commands');
		this.handler.log(`Recieved ${commands.length} command`, commands.lengt > 1 ? 's' : '');

		//	Parsing commands
		
		const foundCommands: string[] = [];
		for(const i in commands) {
			const command = commands[i];
			const registeredCommand = this.commandData.get(command.name);
			
			//	Deleting command
			
			if(!registeredCommand) {
				
				//	Deleting the command
				
				if(this.handler.deleteUnregisteredCommands
				&& this.handler.registerCommands)
					await this.handler.deleteCommand(command);

				continue;
			}
			
			//	applying extra data
			
			foundCommands.push(command.name);
			registeredCommand.id = command.id;
			registeredCommand.application_id = this.handler.clientID;
			this.commandById.set(command.id, command.name);

			//	Checking for updates

			if(!this.handler.registerCommands) continue;

			if((JSON.stringify(registeredCommand.parsedOptions()) != (command.options ? JSON.stringify(command.options) : undefined))
			|| registeredCommand.description != command.description
			) {
				await registeredCommand.save();
				continue;
			}

		}
		
		//	Adding new commands

		for(const [ name, command ] of this.commandData) {

			if(foundCommands.find(c=>c==name)) continue;
			if(!this.handler.registerCommands) continue;
			
			//	Creating the command

			await command.create();
			this.commandById.set(command.id, command.name);
		}

		this.handler.log(`Finished parsing commands for guild ${this.id}`);
	}

	//	Extending some mapping stuff

	hasName = (name: string) => this.commandData.has(name);
	getName = (name: string) => this.commandData.get(name);
	hasID = (id: string) => this.commandById.has(id);
	getID = (id: string) => this.commandData.get(this.commandById.get(id)!);

}