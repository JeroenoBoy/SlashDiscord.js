require('dotenv').config();
import chalk from 'chalk';
import { Client } from 'discord.js';
import { SlashCommandHandler } from '../../src';

//	Creating the client

const client = new Client();

//	Creating the handler

const handler = new SlashCommandHandler({
	client,
	debug: true
})

//	Creating the commands, please note that this can take up to 1 hour to update

handler.addCommand({
	name: 'hello',
	description: 'Send a Hello World command to the bot.'
})
.run(cmd => {
	cmd.reply('Hello World!');
});


client.once('ready', () => {
	console.log('Logged in as', chalk.green(client.user!.tag))
})

client.login(process.env.TEST_BOT_TOKEN);