import { Client, TextChannel } from "discord.js";
import fetch from 'node-fetch';
import { SlashCommand, ApplicationCommand, Interaction, InteractionResponse, InteractionOption } from ".";
import InteractionResponseTable from './tables/InteractionResponseType';



const apiURL = 'https://discord.com/api/v8';


export interface SlashCommandOptions {

	/**
	 * The Discord.Client or an id and token.
	 */
	client: Client | ClientLike

	/**
	 * If enabled, commands will get patched / deleted / created
	 * @default true
	 */
	registerCommands?: boolean

	/**
	 * If enabled, command will be run. disable when on the ShardingManager.
	 * @default true
	 */
	runCommands?: boolean

	/**
	 * If enabled, commands that no longer exist will get deleted.
	 * @default true
	 */
	deleteUnregisteredCommands?: boolean

	/**
	 * If the ran command hasn't executed any interaction callback, execute a PONG with source.
	 * @default true
	 */
	sendPongIfNoResponse?: boolean

	/**
	 * If enabled, this will automatically parse the options of an interaction.
	 * @warning Must use with a Discord.Client
	 * @default true
	 * 
	 * @example when the flag is user, it will return a User object, if not it will return the user ID.
	 */
	parseInteractionOptions?: boolean;
	
	/**
	 * If enabled, the debug messages will be displayed.
	 * @default false
	 */
	debug?: boolean

	/**
	 * The prefix of the debug messages.
	 * @default [SDJS]
	 */
	debugPrefix?: string

	/**
	 * If enabled, when a command gets executed that isn't recognized it will return a message.
	 * @default true
	 */
	sendNoLongerAvailable?: boolean
	
	/**
	 * The message which should be displayed if sendNoLongerAvailable is true.
	 * @default This command is no longer available.
	 */
	noLongerAvailableMessage?: string
}

export interface ClientLike {
	/**
	 * The token of the client, used for authorization.
	 */
	token: string,
	/**
	 * Id of the client
	 */
	id: string
}


export class SlashCommandHandler {


	private useMethod: 'bot' | 'clientLike';
	/**
	 * The client this handler uses.
	 */
	client?: Client;
	/**
	 * This contains the client token & id, used for making API requests.
	 */
	clientLike?: ClientLike
	/**
	 * The id of the client | clientlike.
	 */
	clientID: string;
	
	//	Request stuff
	private headers: { [key: string]: string }
	private baseURL = apiURL + '/applications'
	
	//	Command data stuff
	private commandData: Map<SlashCommand['id'], SlashCommand> = new Map();
	
	//	Options
	
	/**
	 * If enabled, commands will get patched / deleted / created
	 * @default true
	 */
	registerCommands: boolean;
	/**
	 * If enabled, command will be run. disable when on the ShardingManager.
	 * @default true
	 */
	runCommands: boolean;
	/**
	 * If enabled, commands that no longer exist will get deleted.
	 * @default true
	 */
	deleteUnregisteredCommands: boolean;
	/**
	 * If the ran command hasn't executed any interaction callback, execute a PONG with source.
	 * @default true
	 */
	sendPongIfNoResponse: boolean;
	/**
	 * If enabled, this will automatically parse the options of an interaction.
	 * @warning Must use with a Discord.Client
	 * @default true
	 * 
	 * @example when the flag is user, it will return a User object, if not it will return the user ID.
	 */
	parseInteractionOptions: boolean;
	/**
	 * If enabled, the debug messages will be displayed.
	 * @default false
	 */
	debug: boolean;
	/**
	 * The prefix of the debug messages.
	 * @default [SDJS]
	 */
	debugPrefix: string;
	/**
	 * If enabled, when a command gets executed that isn't recognized it will return a message.
	 * @default true
	 */
	sendNoLongerAvailable: boolean
	/**
	 * The message which should be displayed if sendNoLongerAvailable is true.
	 * @default This command is no longer available.
	 */
	noLongerAvailableMessage: string
	
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

		this.parseInteractionOptions = options.parseInteractionOptions ?? true;
		
		this.debug = options.debug ?? false;
		this.debugPrefix = options.debugPrefix ?? '[SDJS]';

		this.sendNoLongerAvailable = options.sendNoLongerAvailable ?? true;
		this.noLongerAvailableMessage = options.noLongerAvailableMessage ?? 'This command is no longer available.';

		//	Checking if client

		if(isClient(options.client)) {
			this.useMethod = 'bot';
			this.client = options.client;
			
			//	Listening for the ready event on the bot
			
			this.client.once('ready', async () => {
				if(!this.client) return;
				this.clientID = this.client.user!.id;
				
				//	Setting URL and headers
				
				this.baseURL = this.baseURL + '/' + this.client.user!.id;
				this.headers = { 'Authorization': 'Bot ' + this.client.token};

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

			if(!this.registerCommands) continue;

			if((JSON.stringify(registeredCommand.parsedOptions()) != (command.options ? JSON.stringify(command.options) : undefined))
			|| registeredCommand.description != command.description
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
			if(!this.client) return;

			this.client.on('raw', async ({d, t}) => {
				if(t !== 'INTERACTION_CREATE') return;
				if(!this.client) return;

				this.log('Recieved interaction event');
	
				//	Retrieving guild and channel

				const channel = this.client.channels.cache.get(d.channel_id)
					|| await this.client.channels.fetch(d.channel_id);

					
				//	Checking twice

					
				if(!(channel instanceof TextChannel)) throw new Error('Channel isn\'t a TextChannel');
				if(!channel) throw new Error('Channel couldn\'t be resolved in INTERACTION_CREATE');

				//	Making interaction

				const interaction = new Interaction(this.client, this, channel, d);

				//	Getting commands

				const command = this.commandData.get(interaction.data.name);
				if(!command) {
					if(this.sendNoLongerAvailable)
						interaction.reply(this.noLongerAvailableMessage);

					return this.log(`Command ${interaction.data.name} executed but this command isn't defined.`);
				}

				//	Parsing options

				if(this.parseInteractionOptions
				&& this.useMethod === 'bot')
					await interaction.parseOptions(command);

				//	Getting supcommand path

				let done = false;

				if(interaction.data.options
				&& command.subFunctions.size > 0) {

					const subCommand: string[] = [];
					let currentOption: InteractionOption | undefined = interaction.data.options![0];
					
					while(currentOption) {
						subCommand.push(currentOption.name)
	
						if(currentOption.options)
							currentOption = currentOption.options![0]
						else
							currentOption = undefined;
					}
	
					//	Checking if the subcommand path exists, and if it does run it
	
					while(!done && subCommand.length > 0) {
						if(command.subFunctions.has(subCommand.join(' '))) {
							command.subFunctions.get(subCommand.join(' '))!(interaction);
							done = true;
						}
						subCommand.pop();
					}
				}

				//	normal reply
				
				if(!done)
					await command.runFunction(interaction);

				//	Checking if response was send

				if(this.sendPongIfNoResponse
				&& !interaction.reply_send)
					await interaction.pong()

			})
		}
	}


	/**
	 * Respond to an interaction.
	 * @param tokenID The application and tokenID of the interaction
	 * @param response The response this interaction should get
	 */
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


	/**
	 * This is like console.log, except only gets logged when 
	 * @param msg first object
	 * @param optionalParams additional objects
	 */
	log(msg: any, ...optionalParams: any[]) {
		if(this.debug)
			console.log(this.debugPrefix + ' ' + msg, ...optionalParams);
	}

}



function isClient(input: any): input is Client {
	if(input.on) return true;
	return false;
}