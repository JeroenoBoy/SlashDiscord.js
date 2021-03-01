require('dotenv').config();
import chalk from 'chalk';
import { Client } from 'discord.js';
import { SlashCommandHandler } from '../../src';

const guildID = '605459377620516910'

//	Creating the client

const client = new Client();
client.once('ready', () => {
	console.log('Logged in as', chalk.green(client.user!.tag))
})

//	Creating the handler

const handler = new SlashCommandHandler({
	client,
	debug: true
})

//	Double commands

handler.addCommand({
	name: 'hello',
	description: 'Send a Hello World command to the bot.',
})
.run(async cmd => {
	const msg = await cmd.reply('Hello World!');
	const msg2 = await cmd.reply('Test!');

	await msg.delete();
	await msg2.delete();

})

handler.addCommand(guildID, {
	name: 'bye',
	description: '(GUILD) Send a Hello World command to the bot.',
})
.run(c => c.reply('Hello Guild!'))

//	Alternative way to set a guild command.

const slashGuild = handler.getGuild(guildID);
slashGuild.addCommand({
	name: 'guild',
	description: 'This command only appears here.'
})
.run(c => c.reply('This is a command only for this guild.'))

//	Logging in the bot

client.login(process.env.TEST_BOT_TOKEN);