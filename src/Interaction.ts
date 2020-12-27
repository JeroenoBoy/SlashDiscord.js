import { Client, EmbedField, Guild, GuildMember, TextChannel } from "discord.js";
import { SlashCommandHandler } from ".";

export type InteractionFunction = (interaction: Interaction) => void | Promise<void>;


export class Interaction implements IInteraction {
	id: string;
	type: InteractionType;
	data: ApplicationCommandInteractionData;
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


	async pong() {
		if(this.reply_send) throw new Error('A Response has already been send');
		this.reply_send = true;

		await this.handler.respond(this.id + '/' + this.token, {
			type: 'AcknowledgeWithSource'
		});
	}


	async reply(msg: string) {
		if(this.reply_send) throw new Error('A Response has already been send');
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
	data: ApplicationCommandInteractionData
	guild: Guild
	channel: TextChannel
	member: GuildMember
	version: Readonly<number>
}


export type InteractionType = 'Ping' | 'ApplicationCommand'

export interface ApplicationCommandInteractionData {
	id: string
	name: string
	options?: ApplicationCommandInteractionDataOption[]
}

export interface ApplicationCommandInteractionDataOption {
	name: string
	value?: any
	options?: ApplicationCommandInteractionDataOption[]
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