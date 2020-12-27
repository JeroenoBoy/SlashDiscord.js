import { Client, TextChannel } from "discord.js";
import fetch from 'node-fetch';
import { SlashCommand, ApplicationCommand, Interaction, InteractionResponse } from ".";
import InteractionResponseTable from './tables/InteractionResponseType';



const apiURL = 'https://discord.com/api/v8';


export interface SlashCommandOptions {
	client: Client | ClientLike
	registerCommands?: boolean
	runCommands?: boolean
	deleteUnregisteredCommands?: boolean
	sendPongIfNoResponse?: boolean
	debug?: boolean
	debugPrefix?: string
}

export interface ClientLike {
	token: string,
	id: string
}


export class SlashCommandHandler {


	private useMethod: 'bot' | 'clientLike';
	bot?: Client;
	clientLike?: ClientLike
	clientID: string;
	
	//	Request stuff
	private headers: { [key: string]: string }
	private baseURL = apiURL + '/applications'
	
	//	Command data stuff
	private commandData: Map<SlashCommand['id'], SlashCommand> = new Map();
	
	//	Options
	registerCommands: boolean;
	runCommands: boolean;
	deleteUnregisteredCommands: boolean;
	sendPongIfNoResponse: boolean;
	
	debug: boolean;
	debugPrefix: string;
	
	/**
	 * Create a new SlashCommandHandler instance
	 * 
	 * @param options Options assigned to this instance
	 */

	constructor(options: SlashCommandOptions) {
		if(options.client == undefined) throw new Error('Option Client must be defined.');

		//	Options

		this.registerCommands = options.registerCommands ?? true;
		this.runCommands = options.runCommands ?? true;
		this.sendPongIfNoResponse = options.sendPongIfNoResponse ?? true;
		this.deleteUnregisteredCommands = options.deleteUnregisteredCommands ?? true;

		this.debug = options.debug ?? false;
		this.debugPrefix = options.debugPrefix ?? '[SDJS]';

		//	Checking if client

		if(isClient(options.client)) {
			this.useMethod = 'bot';
			this.bot = options.client;
			
			//	Listening for the ready event on the bot
			
			this.bot.once('ready', async () => {
				if(!this.bot) return;
				this.clientID = this.bot.user!.id;
				
				//	Setting URL and headers
				
				this.baseURL = this.baseURL + '/' + this.bot.user!.id;
				this.headers = { 'Authorization': 'Bot ' + this.bot.token};

				//	Registering commands

				this.start();
			})
		}

		//	User is not using a Discord.Client instance

		else {
			this.useMethod = 'clientLike';
			this.clientLike = options.client;
			this.clientID = this.clientLike.id;
			this.baseURL = this.baseURL + '/' + this.clientID;

			//	Setting headers

			this.headers = { 'Authorization': 'Bot ' + options.client.token}
		}
	}


	/**
	 * Create and register a new Command.
	 * @param command The new command data
	 */
	addCommand(command: ApplicationCommand): SlashCommand {
		const cmd = new SlashCommand(command, this);
		this.commandData.set(cmd.name, cmd);
		return cmd;
	}


	/**
	 * Start the command handler.
	 * 
	 * NOTE: You don't need to execute this function IF the user is running a Discord.Client instance
	 */
	async start() {
		this.log('Getting commands');

		//	Retrieving commands
		const commands = await fetch(this.baseURL + '/commands', { headers: this.headers })
			.then(res=>res.json())
			.then(data => {
				if(data.message) throw new Error('Error while gathering commands ' + JSON.stringify(data))
				return data;
			})
		if(!commands) throw new Error('Didn\'t recieve any commands');
		
		this.log(`Recieved ${commands.length} commands`);

		
		//	Parsing commands
		
		const foundCommands: string[] = [];
		for(const i in commands) {
			const command = commands[i];
			const registeredCommand = this.commandData.get(command.name);
			
			foundCommands.push(command.name);
			
			//	Deleting command
			
			if(!registeredCommand) {
				
				//	Deleting the command
				
				if(this.deleteUnregisteredCommands
				&& this.registerCommands) {
					this.log('Deleting command', command.name);
				
					await fetch(this.baseURL + '/commands/' + command.id, {
						method: 'DELETE',
						headers: this.headers
					})
						.then(res => res.json())
						.then(data => {
							if(data.message)
								throw new Error('Error while deleting command ' +  command.name + ' ' + JSON.stringify(data));
						});
				}
				continue;
			}
			
			//	applying extra data
			
			registeredCommand.id = command.id;
			registeredCommand.application_id = this.clientID;

			//	Checking for updates

			if((registeredCommand.parsedOptions().toString() != command.options ? undefined : command.options.toString()
			|| registeredCommand.description != command.description)
			&& this.registerCommands
			) {

				this.log('Patching command', command.name);

				await fetch(this.baseURL + '/commands/' + command.id, {
					method: 'PATCH',
					headers: { ...this.headers, 'Content-Type': 'application/json'},
					body: registeredCommand.toJSON()
				})
				continue;
			}
		}
		
		//	Adding new commands


		for(const [ name, command ] of this.commandData) {

			if(foundCommands.find(c=>c==name)) continue;
			if(!this.registerCommands) continue;
			this.log('Creating command');

			//	Sending request to discord

			await fetch(this.baseURL + '/commands', {
				method: 'POST',
				headers: { ...this.headers, 'Content-Type': 'application/json'},
				body: command.toJSON()
			})
				.then(res => res.json())
				.then(data => {
					if(data.message)
						throw new Error('Error while creating command ' +  command.name + ' ' + JSON.stringify(data));

					command.id = data.id;
					command.application_id = data.application_id;
				})

		}

		this.log('Finished parsing commands');

		//
		//	Listening to the interaction event
		//
		
		if(this.useMethod === 'bot'
		&& this.runCommands) {
			if(!this.bot) return;

			this.bot.on('raw', async ({d, t}) => {
				if(t !== 'INTERACTION_CREATE') return;
				if(!this.bot) return;

				this.log('Recieved interaction event');
	
				//	Retrieving guild and channel

				const guild = this.bot.guilds.resolve(d.guild_id)
					|| await this.bot.guilds.fetch(d.guild_id);
				const channel = this.bot.channels.resolve(d.channel_id)
					|| await this.bot.channels.fetch(d.guild_id);

				if(!(channel instanceof TextChannel)) throw new Error('Channel is not a TextChannel');

				//	Checking twice

				if(!guild) throw new Error('Guild couldn\'t be resolved in INTERACTION_CREATE');
				if(!channel) throw new Error('Channel couldn\'t be resolved in INTERACTION_CREATE');

				//	Making interaction

				const interaction = new Interaction(this.bot, this, guild, channel, d);

				//	Getting commands

				const command = this.commandData.get(interaction.data.name);
				if(!command) return this.log(`Command ${interaction.data.name} executed but this command isn't defined.`)

				//	Execute interaction

				await command.execute(interaction);

				//	Checking if response was send

				if(this.sendPongIfNoResponse
				&& !interaction.reply_send)
					await interaction.pong()

			})
		}
	}



	async respond(tokenID: string, response: InteractionResponse) {

		const res = {
			type: InteractionResponseTable.to(response.type),
			data: response.data
		}

		this.log('Responded to Interaction with type', response.type);

		await fetch(apiURL + '/interactions/' + tokenID + '/callback', {
			method: 'POST',
			headers: { ...this.headers, 'Content-Type': 'application/json'},
			body: JSON.stringify(res)
		})
	}



	log(msg: string, ...optionalParams: any[]) {
		if(this.debug)
			console.log(this.debugPrefix + ' ' + msg, ...optionalParams);
	}

}



function isClient(input: any): input is Client {
	if(input.on) return true;
	return false;
}