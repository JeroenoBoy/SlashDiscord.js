"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const ApplicationCommandType_1 = __importDefault(require("./tables/ApplicationCommandType"));
class SlashCommand {
    constructor(command, handler) {
        this.functionMap = new Map();
        this.id = command.id;
        this.application_id = command.application_id;
        this.name = command.name.toLowerCase();
        this.description = command.description;
        this.options = command.options;
        this.handler = handler;
        this.functionMap.set('', () => { });
    }
    run(callbackOrOption, callback) {
        if (typeof callbackOrOption === 'string') {
            if (typeof callback !== 'function')
                throw new Error('callback must be of type function.');
            this.functionMap.set(callbackOrOption, callback);
        }
        else
            this.functionMap.set('', callbackOrOption);
        return this;
    }
    runSub(subcommand, callback) {
        console.log(chalk_1.default.yellow('SlashDiscord.js ') + chalk_1.default.red('DeprecationWarning: SlashCommand.runSub(option, callback) is deprecated, please use SlashCommand.run(option, callback)'));
        this.functionMap.set(subcommand, callback);
        return this;
    }
    parsedOptions() {
        if (!this.options)
            return;
        const cloned = JSON.parse(JSON.stringify(this.options));
        this.parsedown(cloned);
        return cloned;
    }
    parsedown(options) {
        for (const option of options) {
            option.type = ApplicationCommandType_1.default.to(option.type);
            if (option.options)
                this.parsedown(option.options);
        }
    }
    toJSON() {
        const a = {
            id: this.id,
            application_id: this.application_id,
            name: this.name,
            description: this.description,
            options: this.parsedOptions(),
        };
        return JSON.stringify(a);
    }
    async save() {
        this.handler.log('Patching command', this.name);
        const urlAdd = this.guildID ? `/guilds/${this.guildID}` : '';
        await node_fetch_1.default(this.handler.baseURL + urlAdd + `/commands/${this.id}`, {
            method: 'PATCH',
            headers: Object.assign(Object.assign({}, this.handler.headers), { 'Content-Type': 'application/json' }),
            body: this.toJSON()
        })
            .then((res) => this.handler.checkFetchError(res));
    }
    async delete() {
        this.handler.log('Deleting command', this.name);
        const urlAdd = this.guildID ? `/guilds/${this.guildID}` : '';
        await node_fetch_1.default(this.handler.baseURL + urlAdd + `/commands/${this.id}`, {
            method: 'DELETE',
            headers: this.handler.headers
        })
            .then((res) => this.handler.checkFetchError(res));
    }
    async create() {
        this.handler.log('Creating command', this.name);
        const urlAdd = this.guildID ? `/guilds/${this.guildID}` : '';
        const data = await node_fetch_1.default(this.handler.baseURL + urlAdd + `/commands`, {
            method: 'POST',
            headers: Object.assign(Object.assign({}, this.handler.headers), { 'Content-Type': 'application/json' }),
            body: this.toJSON()
        })
            .then((res) => this.handler.checkFetchError(res));
        this.id = data.id;
        this.application_id = data.application_id;
    }
}
exports.SlashCommand = SlashCommand;
