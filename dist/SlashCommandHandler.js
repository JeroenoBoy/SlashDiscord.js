"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommandHandler = exports.apiURL = void 0;
const discord_js_1 = require("discord.js");
const node_fetch_1 = __importDefault(require("node-fetch"));
const _1 = require(".");
const ResponseError_1 = __importDefault(require("./errors/ResponseError"));
const SlashGuild_1 = require("./SlashGuild");
const InteractionResponseType_1 = __importDefault(require("./tables/InteractionResponseType"));
exports.apiURL = 'https://discord.com/api/v8';
class SlashCommandHandler {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.baseURL = exports.apiURL + '/applications';
        this.commandData = new Map();
        this.commandById = new Map();
        this.guilds = new Map();
        this.getById = (id) => this.commandData.get(this.commandById.get(id));
        if (options.client == undefined)
            throw new Error('Option Client must be defined.');
        this.registerCommands = (_a = options.registerCommands) !== null && _a !== void 0 ? _a : true;
        this.runCommands = (_b = options.runCommands) !== null && _b !== void 0 ? _b : true;
        this.sendPongIfNoResponse = (_c = options.sendPongIfNoResponse) !== null && _c !== void 0 ? _c : true;
        this.deleteUnregisteredCommands = (_d = options.deleteUnregisteredCommands) !== null && _d !== void 0 ? _d : true;
        this.parseInteractionOptions = (_e = options.parseInteractionOptions) !== null && _e !== void 0 ? _e : true;
        this.debug = (_f = options.debug) !== null && _f !== void 0 ? _f : false;
        this.debugPrefix = (_g = options.debugPrefix) !== null && _g !== void 0 ? _g : '[SDJS]';
        this.sendNoLongerAvailable = (_h = options.sendNoLongerAvailable) !== null && _h !== void 0 ? _h : true;
        this.noLongerAvailableMessage = (_j = options.noLongerAvailableMessage) !== null && _j !== void 0 ? _j : 'This command is no longer available.';
        if (isClient(options.client)) {
            this.useMethod = 'bot';
            this.client = options.client;
            this.client.once('ready', async () => {
                if (!this.client)
                    return;
                this.clientID = this.client.user.id;
                this.baseURL = this.baseURL + '/' + this.client.user.id;
                this.headers = { 'Authorization': 'Bot ' + this.client.token };
                this.start();
            });
        }
        else {
            this.useMethod = 'clientLike';
            this.clientLike = options.client;
            this.clientID = this.clientLike.id;
            this.baseURL = this.baseURL + '/' + this.clientID;
            this.headers = { 'Authorization': 'Bot ' + options.client.token };
        }
    }
    addCommand(guildIDOrCommand, command) {
        let cmd;
        if (typeof guildIDOrCommand === 'string') {
            if (!this.guilds.has(guildIDOrCommand))
                this.createGuild(guildIDOrCommand);
            cmd = this.guilds.get(guildIDOrCommand).addCommand(command);
        }
        else {
            cmd = new _1.SlashCommand(guildIDOrCommand, this);
            this.commandData.set(cmd.name, cmd);
        }
        return cmd;
    }
    async start() {
        this.log('Started parsing commands');
        for (const [_, guild] of this.guilds)
            await guild.load();
        this.log('Getting commands');
        const commands = await node_fetch_1.default(`${this.baseURL}/commands`, { headers: this.headers })
            .then((res) => this.checkFetchError(res));
        if (!commands)
            throw new Error('Didn\'t recieve any commands');
        this.log(`Recieved ${commands.length} command`, commands.lengt > 1 ? 's' : '');
        const foundCommands = [];
        for (const i in commands) {
            const command = commands[i];
            const registeredCommand = this.commandData.get(command.name);
            if (!registeredCommand) {
                if (this.deleteUnregisteredCommands
                    && this.registerCommands)
                    await this.deleteCommand(command);
                continue;
            }
            foundCommands.push(command.name);
            registeredCommand.id = command.id;
            registeredCommand.application_id = this.clientID;
            this.commandById.set(command.id, command.name);
            if (!this.registerCommands)
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
            if (!this.registerCommands)
                continue;
            await command.create();
            this.commandById.set(command.id, command.name);
        }
        this.log('Finished parsing commands');
        if (this.useMethod === 'bot'
            && this.runCommands) {
            if (!this.client)
                return;
            this.client.on('raw', async ({ d, t }) => {
                var _a;
                if (t !== 'INTERACTION_CREATE')
                    return;
                if (!this.client)
                    return;
                this.log('Recieved interaction event');
                const channel = this.client.channels.cache.get(d.channel_id)
                    || await this.client.channels.fetch(d.channel_id);
                if (!(channel instanceof discord_js_1.TextChannel))
                    throw new Error('Channel isn\'t a TextChannel');
                if (!channel)
                    throw new Error('Channel couldn\'t be resolved in INTERACTION_CREATE');
                const interaction = new _1.Interaction(this.client, this, channel, d);
                const command = ((_a = this.guilds.get(interaction.guild.id)) === null || _a === void 0 ? void 0 : _a.getID(interaction.data.id)) || this.getById(interaction.data.id);
                if (!command) {
                    if (this.sendNoLongerAvailable)
                        interaction.reply(this.noLongerAvailableMessage);
                    return this.log(`Command ${interaction.data.name} executed but this command isn't defined.`);
                }
                if (this.parseInteractionOptions
                    && this.useMethod === 'bot')
                    await interaction.parseOptions(command);
                let done = false;
                if (interaction.data.options
                    && command.functionMap.size > 0) {
                    const subCommand = [];
                    let currentOption = interaction.data.options[0];
                    while (currentOption) {
                        subCommand.push(currentOption.name);
                        if (currentOption.options)
                            currentOption = currentOption.options[0];
                        else
                            currentOption = undefined;
                    }
                    while (!done && subCommand.length > 0) {
                        if (command.functionMap.has(subCommand.join(' '))) {
                            await command.functionMap.get(subCommand.join(' '))(interaction);
                            done = true;
                        }
                        subCommand.pop();
                    }
                }
                if (!done)
                    await command.functionMap.get('')(interaction);
                if (this.sendPongIfNoResponse
                    && !interaction.reply_send)
                    await interaction.pong();
            });
        }
    }
    async deleteCommand(command, guild) {
        this.log('Deleting command', command.name);
        const urlAdd = (guild ? `/guilds/${guild}` : '') + `/commands/${command.id}`;
        await node_fetch_1.default(this.baseURL + urlAdd, {
            method: 'DELETE',
            headers: this.headers
        })
            .then((res) => this.checkFetchError(res));
    }
    createGuild(guildID) {
        this.guilds.set(guildID, new SlashGuild_1.SlashGuild(guildID, this));
    }
    getGuild(guildID) {
        if (!this.guilds.has(guildID))
            this.createGuild(guildID);
        return this.guilds.get(guildID);
    }
    async respond(interactionID, tokenID, response) {
        const res = {
            type: InteractionResponseType_1.default.to(response.type),
            data: response.data
        };
        this.log('Responded to Interaction with type', response.type);
        return await node_fetch_1.default(exports.apiURL + `/interactions/${interactionID}/${tokenID}/callback`, {
            method: 'POST',
            headers: Object.assign(Object.assign({}, this.headers), { 'Content-Type': 'application/json' }),
            body: JSON.stringify(res)
        });
    }
    log(msg, ...optionalParams) {
        if (this.debug)
            console.log(this.debugPrefix + ' ' + msg, ...optionalParams);
    }
    async checkFetchError(res) {
        const data = await res.json()
            .catch(() => {
            return { instaReturn: true };
        });
        if (data.instaReturn)
            return;
        if (data.code != undefined) {
            if (data.message)
                throw new ResponseError_1.default('Error while making request: ' + data.message, data.errors);
        }
        return data;
    }
}
exports.SlashCommandHandler = SlashCommandHandler;
function isClient(input) {
    if (input.on)
        return true;
    return false;
}
