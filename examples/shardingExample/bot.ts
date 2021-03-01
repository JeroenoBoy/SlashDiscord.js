import chalk from 'chalk';
import { Client } from 'discord.js';
import { SlashCommandHandler } from '../../dist';

//	Creating the client

const client = new Client();

//	Creating the handler

const handler = new SlashCommandHandler({
	client,
	debug: true,
	debugPrefix: '[SHARD SDJS]',
	registerCommands: false
})

//	Creating the commands, please note that this can take up to 1 hour to update

handler.addCommand({
	name: 'shard',
	description: 'Get the shard this bot is running from...'
})
.run(interaction => {
	interaction.reply(`This guild is using shard #${client.shard!.ids[0]}`);
});


client.once('ready', () => {
	console.log(`[${client.shard!.ids[0]}] Logged in as ${chalk.green(client.user!.tag)}`)
})

client.login();