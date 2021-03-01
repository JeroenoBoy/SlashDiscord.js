"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interaction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const InteractionMessage_1 = require("./InteractionMessage");
const SlashCommandHandler_1 = require("./SlashCommandHandler");
const node_fetch_1 = __importDefault(require("node-fetch"));
class Interaction {
    constructor(client, handler, channel, d) {
        this.reply_send = false;
        this.id = d.id;
        this.type = d.type;
        this.data = d.data;
        this.guild = channel.guild;
        this.channel = channel;
        this.member = new discord_js_1.GuildMember(client, d.member, this.guild);
        this.client = client;
        this.handler = handler;
        this.token = d.token;
    }
    option(option) {
        const optionSplitted = typeof option === 'string'
            ? option.split(' ')
            : option;
        let options = this.data.options;
        while (options != undefined) {
            const option = options.find(o => o.name.toLowerCase() === optionSplitted[0].toLowerCase());
            if (!option)
                return null;
            if (optionSplitted.length <= 1) {
                return option.value;
            }
            optionSplitted.shift();
            options = option.options;
        }
    }
    getOption(option) {
        console.log(chalk_1.default.yellow('SlashDiscord.js ') + chalk_1.default.red('DeprecationWarning: Interaction.getOption(option) is deprecated, please use Interaction.option(option)'));
        const optionSplitted = option.split(' ');
        let options = this.data.options;
        while (options != undefined) {
            const option = options.find(o => o.name === optionSplitted[0]);
            if (!option)
                return undefined;
            if (optionSplitted.length <= 1)
                return option;
            optionSplitted.shift();
            options = option.options;
        }
    }
    async parseOptions(command) {
        const cmdOptions = command.options;
        const options = this.data.options;
        if (!cmdOptions)
            return;
        if (!options)
            return;
        await this._parseOptions(options, cmdOptions);
    }
    async _parseOptions(options, commandOptions) {
        for (const option of options) {
            const cmdOption = commandOptions.find(o => o.name === option.name);
            if (!cmdOption)
                continue;
            switch (cmdOption.type) {
                case 'CHANNEL':
                    option.value = this.client.channels.cache.get(option.value)
                        || await this.client.channels.fetch(option.value);
                    break;
                case 'ROLE':
                    option.value = this.guild.roles.cache.get(option.value)
                        || await this.guild.roles.fetch(option.value);
                    break;
                case 'USER':
                    option.value = this.client.users.cache.get(option.value)
                        || await this.client.users.fetch(option.value);
                    break;
            }
            if (option.options && cmdOption.options)
                this._parseOptions(option.options, cmdOption.options);
        }
    }
    async pong(showSource = true) {
        if (this.reply_send)
            throw new Error('Can only execute the callback once.');
        this.reply_send = true;
        await this.handler.respond(this.id, this.token, {
            type: showSource ? 'AcknowledgeWithSource' : 'Acknowledge'
        });
    }
    async send(...messages) {
        let id = '@original';
        if (this.reply_send) {
            const data = await node_fetch_1.default(SlashCommandHandler_1.apiURL + `/webhooks/${this.handler.clientID}/${this.token}`, {
                method: 'POST',
                headers: Object.assign(Object.assign({}, this.handler.headers), { 'Content-Type': 'application/json' }),
                body: JSON.stringify(Interaction.parseMessages(messages))
            }).then(r => r.json());
            id = data.id;
        }
        else
            await this.handler.respond(this.id, this.token, {
                type: 'ChannelMessage',
                data: Interaction.parseMessages(messages)
            });
        this.reply_send = true;
        return new InteractionMessage_1.InteractionMessage(this, id);
    }
    async reply(...messages) {
        if (this.reply_send)
            return await this.send(...messages);
        this.reply_send = true;
        await this.handler.respond(this.id, this.token, {
            type: 'ChannelMessageWithSource',
            data: Interaction.parseMessages(messages)
        });
        return new InteractionMessage_1.InteractionMessage(this);
    }
    static parseMessages(_messages) {
        const messages = [];
        const embeds = [];
        for (const message of _messages) {
            if (typeof message === 'string')
                messages.push(message);
            else
                embeds.push(message.toJSON());
        }
        return {
            content: messages.join(' '),
            embeds: embeds
        };
    }
}
exports.Interaction = Interaction;
