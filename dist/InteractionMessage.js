"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionMessage = void 0;
const _1 = require(".");
const SlashCommandHandler_1 = require("./SlashCommandHandler");
const node_fetch_1 = __importDefault(require("node-fetch"));
class InteractionMessage {
    constructor(interaction, id = '@original') {
        this.interaction = interaction;
        this.id = id;
    }
    async edit(...messages) {
        await node_fetch_1.default(SlashCommandHandler_1.apiURL + `/webhooks/${this.interaction.handler.clientID}/${this.interaction.token}/messages/${this.id}`, {
            method: 'PATCH',
            headers: Object.assign(Object.assign({}, this.interaction.handler.headers), { 'Content-Type': 'application/json' }),
            body: JSON.stringify(_1.Interaction.parseMessages(messages))
        });
    }
    async delete() {
        await node_fetch_1.default(SlashCommandHandler_1.apiURL + `/webhooks/${this.interaction.handler.clientID}/${this.interaction.token}/messages/${this.id}`, {
            method: 'DELETE',
            headers: Object.assign(Object.assign({}, this.interaction.handler.headers), { 'Content-Type': 'application/json' }),
        });
    }
}
exports.InteractionMessage = InteractionMessage;
