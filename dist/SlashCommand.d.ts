import { InteractionFunction, SlashCommandHandler } from ".";
export declare class SlashCommand implements ApplicationCommand {
    id?: string;
    guildID?: string;
    application_id?: string;
    name: string;
    description: string;
    options?: ApplicationCommandOption[];
    handler: SlashCommandHandler;
    functionMap: Map<string, InteractionFunction>;
    constructor(command: ApplicationCommand, handler: SlashCommandHandler);
    run(callback: InteractionFunction): SlashCommand;
    run(option: string, callback: InteractionFunction): SlashCommand;
    runSub(subcommand: string, callback: InteractionFunction): SlashCommand;
    parsedOptions(): ApplicationCommandOption[] | undefined;
    private parsedown;
    toJSON(): string;
    save(): Promise<void>;
    delete(): Promise<void>;
    create(): Promise<void>;
}
export interface ApplicationCommand {
    id?: string;
    application_id?: string;
    name: string;
    description: string;
    options?: ApplicationCommandOption[];
}
export interface ApplicationCommandOption {
    type: ApplicationCommandType;
    name: string;
    description: string;
    default?: boolean;
    required?: boolean;
    choices?: ApplicationCommandChoice[];
    options?: ApplicationCommandOption[];
}
export interface ApplicationCommandChoice {
    name: string;
    value: number | string;
}
export declare type ApplicationCommandType = 'SUB_COMMAND' | 'SUB_COMMAND_GROUP' | 'STRING' | 'INTEGER' | 'BOOLEAN' | 'USER' | 'CHANNEL' | 'ROLE';
