import { Client, EmbedField, Guild, GuildMember, TextChannel } from "discord.js";
import { SlashCommandHandler } from ".";

export type InteractionFunction = (interaction: Interaction) => any | Promise<any>;

export class Interaction implements IInteraction {
	id: string;
	type: InteractionType;
	data: InteractionData;
	version: number;
	
	guild: Guild;
	channel: TextChannel;
	member: GuildMember;
	

	//	Additional data
	client: Client;
	handler: SlashCommandHandler;

	private token: string
	reply_send: boolean = false;


	constructor(client: Client, handler: SlashCommandHandler, guild: Guild, channel: TextChannel, d: any) {
		this.id = d.id;
		this.version = d.version;
		this.type = d.type;
		this.data = d.data;

		this.guild = guild;
		this.channel = channel;
		this.member = new GuildMember(client, d.member, guild);

		this.client = client;
		this.handler = handler;

		this.token = d.token;
	}


	/**
	 * get a selected option.
	 * @param option the option, example: 'moderation mute user'
	 */
	getOption<T = any>(option: string): InteractionDataOption<T> | undefined {
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
	 * Close the interaction callback
	 * @param showSource to show the command message or not
	 */
	async pong(showSource: boolean = true) {
		if(this.reply_send) throw new Error('Can only execute the callback once.');
		this.reply_send = true;

		await this.handler.respond(this.id + '/' + this.token, {
			type: showSource ? 'AcknowledgeWithSource' : 'Acknowledge'
		});
	}


	/**
	 * Send a message back to the user, this is excluding source
	 * @param msg the message to send
	 */
	async send(msg: string) {
		if(this.reply_send) throw new Error('Can only execute the callback once.');
		this.reply_send = true;

		await this.handler.respond(this.id + '/' + this.token, {
			type: 'ChannelMessage',
			data: {
				content: msg
			}
		});	
	}


	/**
	 * Reply to a interaction, this is including source
	 * @param msg the message to send
	 */
	async reply(msg: string) {
		if(this.reply_send) throw new Error('Can only execute the callback once.');
		this.reply_send = true;

		await this.handler.respond(this.id + '/' + this.token, {
			type: 'ChannelMessageWithSource',
			data: {
				content: msg
			}
		});	
	}
}


export interface IInteraction {
	id: string
	type: InteractionType
	data: InteractionData
	guild: Guild
	channel: TextChannel
	member: GuildMember
	version: Readonly<number>
}


export type InteractionType = 'Ping' | 'ApplicationCommand'

export interface InteractionData {
	id: string
	name: string
	options?: InteractionDataOption[]
}

export interface InteractionDataOption<T = any> {
	name: string
	value?: T
	options?: InteractionDataOption[]
}


//
//	Interaction Response
//


export interface InteractionResponse {
	type: InteractionResponseType,
	data?: InteractionApplicationCommandCallbackData
}


export type InteractionResponseType = 
	'Pong' |
	'Acknowledge' |
	'ChannelMessage' |
	'ChannelMessageWithSource' |
	'AcknowledgeWithSource'
;


export interface InteractionApplicationCommandCallbackData {
	tts?: boolean
	content: string
	embeds?: EmbedField[]
}