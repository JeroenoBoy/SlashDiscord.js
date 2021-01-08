require('dotenv').config();
import chalk from 'chalk';
import { Client, MessageEmbed } from 'discord.js';
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
	name: 'ping',
	description: 'Get the ping in a nice embed.',
	options: [{
		type: 'BOOLEAN',
		required: false,
		default: false,
		name: 'extend',
		description: 'This is an extended test'
	}]
})
.run(interaction => {
	const { member } = interaction;

	interaction.reply(new MessageEmbed()
		.setAuthor(member.displayName, member.user.avatarURL() ?? undefined)
		.setDescription(`API Ping: ${client.ws.ping}ms`)
		.setColor('#00aaff')
	);
})
.run('extend', interaction => {
	const { member } = interaction;

	interaction.reply(
		'Extending the test...',
		
		new MessageEmbed()
			.setAuthor(member.displayName, member.user.avatarURL() ?? undefined)
			.setDescription(`API Ping: ${client.ws.ping}ms`)
			.setColor('#00aaff')
		,
		'\nThis syntax is a tad weird though.',

		new MessageEmbed()
			.setTitle('Last one')
			.setDescription('This should be the last embed.')
	);

})

//	Logging in and a nice ready message

client.once('ready', () => {
	console.log('Logged in as', chalk.green(client.user!.tag))
})

client.login(process.env.TEST_BOT_TOKEN);