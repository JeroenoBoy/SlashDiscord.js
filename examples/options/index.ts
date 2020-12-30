require('dotenv').config();
import chalk from 'chalk';
import { Client, User } from 'discord.js';
import { SlashCommandHandler } from '../../src';

//	Creating the client

const client = new Client();

//	Creating the handler

const handler = new SlashCommandHandler({
	client,
	debug: true,
})

//	Creating the commands, please note that this can take up to 1 hour to update

handler.addCommand({
	name: 'Hello',
	description: 'Send a Hello World command to the bot.',
	options: [{
		type: 'USER',
		required: false,
		name: 'user',
		description: 'Ping a user for show :D'
	}]
})
.runSub('user', interaction => {
	const option = interaction.getOption<User>('user');
	
	if((!option) || (!option.value))
		return interaction.reply('Hello World!');

	interaction.reply(`Hello <@${option.value.id}>!`);
})
.run(interaction => {
	interaction.reply('Hello World!');
});


client.once('ready', () => {
	console.log('Logged in as', chalk.green(client.user!.tag))
})

client.login(process.env.TEST_BOT_TOKEN);




