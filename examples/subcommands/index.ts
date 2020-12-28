import chalk from 'chalk';
import { Client } from 'discord.js';
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
	name: 'test',
	description: 'The test command.',
	options: [
		{
			type: 'SUB_COMMAND',
			name: 'ping',
			description: 'Ping the bot.',
		},
		{
			type: 'SUB_COMMAND',
			name: 'hello',
			description: 'Say hello to the bot.',
		},
		{
			type: 'SUB_COMMAND_GROUP',
			name: 'moderation',
			description: 'Say hello to the bot.',
			options: [
				{
					type: 'SUB_COMMAND',
					name: 'mute',
					description: 'Mute a rulebreaker.',
					options: [{ type: 'USER', name: 'user', description: 'User to mute' }]
				},
				{
					type: 'SUB_COMMAND',
					name: 'kick',
					description: 'Kick a rulebreaker',
					options: [{ type: 'USER', name: 'user', description: 'User to kick' }]
				},
				{
					type: 'SUB_COMMAND',
					name: 'ban',
					description: 'Ban a rulebreaker',
					options: [{ type: 'USER', name: 'user', description: 'User to ban' }]
				}
			]
		}
	]
})
.runSub('moderation mute user', async interaction => {
	const interactionData = interaction.getOption<String>('moderation mute user');
	
	interaction.reply(`Oops! i can\'t actually mute <@${interactionData!.value}>.`);
})
.runSub('moderation mute', async interaction => {
	interaction.reply('Oops! i can\'t actually mute.');
})
.runSub('moderation', async interaction => {
	interaction.reply('I can\'t actually ban or kick someone.');
})
.runSub('ping', async interaction => {

	//	run command callback without origin message
	interaction.pong(false);

	//	Simple ping command
	const then = Date.now();
	const msg = await interaction.channel.send('Please wait....');
	msg.edit(`Latency: ${Date.now()-then}ms.\nAPI latency: ${Math.round(client.ws.ping)}ms.`);
})
.runSub('hello', async interaction => {

	//	This is my own testing :P
	await interaction.send('Hello');
	await interaction.send('Hello x2');
})
.run(async interaction => {

	//	Respond with no message
	await interaction.reply('Test');
});


client.once('ready', () => {
	console.log('Logged in as', chalk.green(client.user!.tag))
})

client.login(process.env.TEST_BOT_TOKEN);