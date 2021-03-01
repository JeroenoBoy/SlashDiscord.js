import { Client, Guild, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { SlashCommandHandler, SlashCommand } from ".";
import { InteractionMessage } from "./InteractionMessage";
export declare type InteractionFunction = (interaction: Interaction) => any | Promise<any>;
export declare class Interaction implements IInteraction {
    id: string;
    type: InteractionType;
    data: InteractionData;
    guild: Guild;
    channel: TextChannel;
    member: GuildMember;
    client: Client;
    handler: SlashCommandHandler;
    token: string;
    reply_send: boolean;
    constructor(client: Client, handler: SlashCommandHandler, channel: TextChannel, d: any);
    option<T = any>(option: string | string[]): T | undefined | null;
    getOption<T = any>(option: string): InteractionOption<T> | undefined;
    parseOptions(command: SlashCommand): Promise<void>;
    private _parseOptions;
    pong(showSource?: boolean): Promise<void>;
    send(...messages: InteractionMessageType[]): Promise<InteractionMessage>;
    reply(...messages: InteractionMessageType[]): Promise<InteractionMessage>;
    static parseMessages(_messages: InteractionMessageType[]): InteractionCallbackData;
}
export interface IInteraction {
    id: string;
    type: InteractionType;
    data: InteractionData;
    guild: Guild;
    channel: TextChannel;
    member: GuildMember;
}
export declare type InteractionType = 'Ping' | 'ApplicationCommand';
export interface InteractionData {
    id: string;
    name: string;
    options?: InteractionOption[];
}
export interface InteractionOption<T = any> {
    name: string;
    value?: T;
    options?: InteractionOption[];
}
export declare type InteractionMessageType = string | MessageEmbed;
export interface InteractionResponse {
    type: InteractionResponseType;
    data?: InteractionCallbackData;
}
export declare type InteractionResponseType = 'Pong' | 'Acknowledge' | 'ChannelMessage' | 'ChannelMessageWithSource' | 'AcknowledgeWithSource';
export interface InteractionCallbackData {
    tts?: boolean;
    content: string;
    embeds?: object[];
}
