import { Client, Guild, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { SlashCommandHandler, SlashCommand } from ".";
import { ApplicationCommandOption } from "./SlashCommand";

export type InteractionFunction = (interaction: Interaction) => any | Promise<any>;

export class Interaction implements IInteraction {

	/**
	 * ID of this interaction
	 */
	id: string;
	/**
	 * The type of interaction.
	 */
	type: InteractionType;
	/**
	 * The data used by this interaction.
	 */
	data: InteractionData;
	/**
	 * The guild this command has been executed in.
	 */
	guild: Guild;
	/**
	 * The channel this command has been executed in.
	 */
	channel: TextChannel;
	/**
	 * The member that executed this command.
	 */
	member: GuildMember;
	/**
	 * The client this interaction uses.
	 */
	client: Client;
	/**
	 * The command handler this interaction uses.
	 */
	handler: SlashCommandHandler;

	private token: string

	/**
	 * Used to check if a reply has already been send.
	 * There can only be a maximum of 1 reply each interaction.
	 */
	reply_send: boolean = false;


	constructor(client: Client, handler: SlashCommandHandler, channel: TextChannel, d: any) {
		this.id = d.id;
		this.type = d.type;
		this.data = d.data;

		this.guild = channel.guild;
		this.channel = channel;
		this.member = new GuildMember(client, d.member, this.guild);

		this.client = client;
		this.handler = handler;

		this.token = d.token;
	}


	/**
	 * Get a selected option.
	 * @param option the option, example: 'moderation mute user'
	 */
	getOption<T = any>(option: string): InteractionOption<T> | undefined {
		const optionSplitted = option.split(' ');
		
		let options = this.data.options;
		while(options != undefined) {
			const option = options.find(o=>o.name === optionSplitted[0]);

			if(!option)
				return undefined;
			if(optionSplitted.length <= 1)
				return option;

			optionSplitted.shift();
			options = option.options;
		}
	}


	/**
	 * Parse the options.
	 * @param command command this interaction uses.
	 */
	async parseOptions(command: SlashCommand) {
		const cmdOptions = command.options;
		const options = this.data.options;

		if(!cmdOptions) return;
		if(!options) return;
		
		await this._parseOptions(options, cmdOptions)
	}


	private async _parseOptions(options: InteractionOption[], commandOptions: ApplicationCommandOption[]) {

		for(const option of options) {
			const cmdOption = commandOptions.find(o=>o.name === option.name)
			if(!cmdOption) continue;

			// Parsing options

			switch(cmdOption.type) {
				case 'CHANNEL':
					option.value = this.client.channels.cache.get(option.value)
						||	await this.client.channels.fetch(option.value)
					break;
				case 'ROLE':
					option.value = this.guild.roles.cache.get(option.value)
						||	await this.guild.roles.fetch(option.value)
					break;
				case 'USER':
					option.value = this.client.users.cache.get(option.value)
						||	await this.client.users.fetch(option.value)
					break;
			}

			//	Parsing embedded options

			if(option.options && cmdOption.options) this._parseOptions(option.options, cmdOption.options);
		}

	}

	/**
	 * Close the interaction callback.
	 * @param showSource to show the command message or not
	 */
	async pong(showSource: boolean = true) {
		if(this.reply_send) throw new Error('Can only execute the callback once.');
		this.reply_send = true;

		await this.handler.respond(this.id, this.token, {
			type: showSource ? 'AcknowledgeWithSource' : 'Acknowledge'
		});
	}


	/**
	 * Send a message back to the user, this is excluding source.
	 * @param msg the message to send
	 */
	async send(...messages: InteractionMessage[]) {
		if(this.reply_send) throw new Error('Can only execute the callback once.');
		this.reply_send = true;

		await this.handler.respond(this.id, this.token, {
			type: 'ChannelMessage',
			data: this.parseMessages(messages)
		});
	}


	/**
	 * Reply to a interaction, this is including source.
	 * @param msg the message to send
	 */
	async reply(...messages: InteractionMessage[]) {
		if(this.reply_send) throw new Error('Can only execute the callback once.');
		this.reply_send = true;

		await this.handler.respond(this.id, this.token, {
			type: 'ChannelMessageWithSource',
			data: this.parseMessages(messages)
		});	
	}


	/**
	 * Parse the message to a InteractionCallbackData object
	 */
	private parseMessages(_messages: InteractionMessage[]): InteractionCallbackData {
		const messages: string[] = [];
		const embeds: object[] = [];

		for(const message of _messages) {
			if(typeof message === 'string') messages.push(message);
			else embeds.push(message.toJSON());
		}

		return {
			content: messages.join(' '),
			embeds: embeds
		}
	}
}


export interface IInteraction {
	/**
	 * ID of this interaction.
	 */
	id: string
	/**
	 * The type of interaction.
	 */
	type: InteractionType
	/**
	 * The data used by this interaction.
	 */
	data: InteractionData
	/**
	 * The guild this command has been executed in.
	 */
	guild: Guild
	/**
	 * The channel this command has been executed in.
	 */
	channel: TextChannel
	/**
	 * The command handler this interaction uses.
	 */
	member: GuildMember
}


export type InteractionType = 'Ping' | 'ApplicationCommand'

export interface InteractionData {
	/**
	 * ID of the ApplicationCommand of this interaction.
	 */
	id: string
	/**
	 * Name of the ApplicationCommand of this interaction.
	 */
	name: string
	/**
	 * The options of this interaction.
	 */
	options?: InteractionOption[]
}

export interface InteractionOption<T = any> {
	/**
	 * The name of this option.
	 */
	name: string
	/**
	 * The value of this option.
	 */
	value?: T
	/**
	 * The child options of this option.
	 */
	options?: InteractionOption[]
}

export type InteractionMessage = string | MessageEmbed;


//
//	Interaction Response
//


export interface InteractionResponse {
	type: InteractionResponseType,
	data?: InteractionCallbackData
}


export type InteractionResponseType = 
	'Pong' |
	'Acknowledge' |
	'ChannelMessage' |
	'ChannelMessageWithSource' |
	'AcknowledgeWithSource'
;


export interface InteractionCallbackData {
	tts?: boolean
	content: string
	embeds?: object[]
}