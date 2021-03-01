"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashGuild = void 0;
const _1 = require(".");
const node_fetch_1 = __importDefault(require("node-fetch"));
class SlashGuild {
    constructor(guildID, handler) {
        this.commandData = new Map();
        this.commandById = new Map();
        this.hasName = (name) => this.commandData.has(name);
        this.getName = (name) => this.commandData.get(name);
        this.hasID = (id) => this.commandById.has(id);
        this.getID = (id) => this.commandData.get(this.commandById.get(id));
        this.id = guildID;
        this.handler = handler;
    }
    addCommand(command) {
        const cmd = new _1.SlashCommand(command, this.handler);
        cmd.guildID = this.id;
        this.commandData.set(command.name, cmd);
        return cmd;
    }
    async load() {
        this.handler.log(`Getting commands for guild ${this.id}`);
        const commands = await node_fetch_1.default(`${this.handler.baseURL}/guilds/${this.id}/commands`, { headers: this.handler.headers })
            .then((res) => this.handler.checkFetchError(res));
        if (!commands)
            throw new Error('Didn\'t recieve any commands');
        this.handler.log(`Recieved ${commands.length} command`, commands.lengt > 1 ? 's' : '');
        const foundCommands = [];
        for (const i in commands) {
            const command = commands[i];
            const registeredCommand = this.commandData.get(command.name);
            if (!registeredCommand) {
                if (this.handler.deleteUnregisteredCommands
                    && this.handler.registerCommands)
                    await this.handler.deleteCommand(command, this.id);
                continue;
            }
            foundCommands.push(command.name);
            registeredCommand.id = command.id;
            registeredCommand.application_id = this.handler.clientID;
            this.commandById.set(command.id, command.name);
            if (!this.handler.registerCommands)
                continue;
            if ((JSON.stringify(registeredCommand.parsedOptions()) != (command.options ? JSON.stringify(command.options) : undefined))
                || registeredCommand.description != command.description) {
                await registeredCommand.save();
                continue;
            }
        }
        for (const [name, command] of this.commandData) {
            if (foundCommands.find(c => c == name))
                continue;
            if (!this.handler.registerCommands)
                continue;
            await command.create();
            this.commandById.set(command.id, command.name);
        }
        this.handler.log(`Finished parsing commands for guild ${this.id}`);
    }
}
exports.SlashGuild = SlashGuild;
