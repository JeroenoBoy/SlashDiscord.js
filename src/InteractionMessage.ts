import { Interaction, InteractionMessageType } from ".";
import { apiURL } from "./SlashCommandHandler";
import fetch from 'node-fetch';


export class InteractionMessage {

	/**
	 * the id of this interaction.
	 */
	id: string

	/**
	 * The interaction of this message.
	 */
	interaction: Interaction;

	constructor(interaction: Interaction, id: string = '@original') {
		this.interaction = interaction;
		this.id = id;
	}


	/**
	 * Edit the interaction message.
	 * @param messages the new messages payload
	 */
	async edit(...messages: InteractionMessageType[]) {
		await fetch(apiURL + `/webhooks/${this.interaction.handler.clientID}/${this.interaction.token}/messages/${this.id}`, {
			method: 'PATCH',
			headers: { ...this.interaction.handler.headers, 'Content-Type': 'application/json'},
			body: JSON.stringify(Interaction.parseMessages(messages))
		})
	}


	/**
	 * Delete the interaction message.
	 */
	async delete() {
		await fetch(apiURL + `/webhooks/${this.interaction.handler.clientID}/${this.interaction.token}/messages/${this.id}`, {
			method: 'DELETE',
			headers: { ...this.interaction.handler.headers, 'Content-Type': 'application/json'},
		})
	}
}