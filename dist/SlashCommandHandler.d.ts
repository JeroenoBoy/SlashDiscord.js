import { Client, Guild } from "discord.js";
import { Response } from 'node-fetch';
import { SlashCommand, ApplicationCommand, InteractionResponse } from ".";
import { SlashGuild } from "./SlashGuild";
export declare const apiURL = "https://discord.com/api/v8";
export interface SlashCommandOptions {
    client: Client | ClientLike;
    registerCommands?: boolean;
    runCommands?: boolean;
    deleteUnregisteredCommands?: boolean;
    sendPongIfNoResponse?: boolean;
    parseInteractionOptions?: boolean;
    debug?: boolean;
    debugPrefix?: string;
    sendNoLongerAvailable?: boolean;
    noLongerAvailableMessage?: string;
}
export interface ClientLike {
    token: string;
    id: string;
}
export declare class SlashCommandHandler {
    private useMethod;
    client?: Client;
    clientLike?: ClientLike;
    clientID: string;
    headers: {
        [key: string]: string;
    };
    baseURL: string;
    private commandData;
    private commandById;
    guilds: Map<Guild['id'], SlashGuild>;
    registerCommands: boolean;
    runCommands: boolean;
    deleteUnregisteredCommands: boolean;
    sendPongIfNoResponse: boolean;
    parseInteractionOptions: boolean;
    debug: boolean;
    debugPrefix: string;
    sendNoLongerAvailable: boolean;
    noLongerAvailableMessage: string;
    constructor(options: SlashCommandOptions);
    addCommand(command: ApplicationCommand): SlashCommand;
    addCommand(guildID: string, command: ApplicationCommand): SlashCommand;
    private getById;
    start(): Promise<void>;
    deleteCommand(command: ApplicationCommand, guild?: string): Promise<void>;
    createGuild(guildID: string): void;
    getGuild(guildID: string): SlashGuild;
    respond(interactionID: string, tokenID: string, response: InteractionResponse): Promise<Response>;
    log(msg: any, ...optionalParams: any[]): void;
    checkFetchError<T = any>(res: Response): Promise<T | undefined>;
}
