import { SlashCommand } from ".";
import { SlashCommandHandler } from "./SlashCommandHandler";
import { ApplicationCommand } from "./SlashCommand";
export declare class SlashGuild {
    id: string;
    handler: SlashCommandHandler;
    private commandData;
    private commandById;
    constructor(guildID: string, handler: SlashCommandHandler);
    addCommand(command: ApplicationCommand): SlashCommand;
    load(): Promise<void>;
    hasName: (name: string) => boolean;
    getName: (name: string) => SlashCommand | undefined;
    hasID: (id: string) => boolean;
    getID: (id: string) => SlashCommand | undefined;
}
