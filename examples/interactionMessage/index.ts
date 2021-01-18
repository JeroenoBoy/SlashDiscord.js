require('dotenv').config();
import chalk from 'chalk';
import { Client } from 'discord.js';
import { SlashCommandHandler } from '../../src';

//	Sleep function

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

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
	description: 'Send a Hello World command to the bot.',
	options: [{
		type: 'STRING',
		name: 'test',
		description: 'just a test.',
		required: false
	}]
})
.run('test', async cmd => {
	const msg = await cmd.send('test!', cmd.member.toString());

	await sleep(1000);
	await msg.edit('Edited!');

	await sleep(1000);
	await msg.delete();
})
.run(async cmd => {
	await sleep(50);
	cmd.reply('Hello World!');
});


client.once('ready', () => {
	console.log('Logged in as', chalk.green(client.user!.tag))
})

client.login(process.env.TEST_BOT_TOKEN);