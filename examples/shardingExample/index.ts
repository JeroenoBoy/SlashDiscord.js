import chalk from "chalk";
import { ShardingManager } from "discord.js"
import { SlashCommandHandler } from "../../src";


(async () => {


	const manager = new ShardingManager('examples/shardingExample/bot.ts', {
		token: process.env.TEST_BOT_TOKEN!,
		execArgv: process.execArgv
	});

	
	// ========================== \\
	console.log('Loading commands');
	// ========================== \\
		
	const handler = new SlashCommandHandler({
		client: {
			token: process.env.TEST_BOT_TOKEN!,
			id: process.env.TEST_CLIENT_ID!
		},
		debug: true,
	});


	handler.addCommand({
		name: 'Hello',
		description: 'Send a Hello World command to the bot.'
	});


	await handler.start();


	// ======================== \\
	console.log('Spawning shard');
	// ======================== \\
	
	manager.spawn();
})()
.catch(err => {
	console.log(chalk.red('Unexpected Error'));
	console.error(err);
	process.exit(2);
});