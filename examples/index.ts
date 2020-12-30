import figlet from 'figlet';
import chalk from 'chalk';
import PATH from 'path';
import fs from 'fs';
import { Spinner } from 'clui';
import inquirer from 'inquirer';




(async () => {

	//
	//	Pretty stuff
	//

	console.log(chalk.green(figlet.textSync('SlashDiscord.js')));
	console.log('A better way for SlashCommands\n\n');

	console.log('SlashCommands can take up to 2 hours to update.\nYou can kick and re-invite the bot to make testing easier.\n\n');
	
	const spinner = new Spinner('Loading available examples....');
	spinner.start();
	
	//
	//	Loading data
	//
	
	const dirs = fs.readdirSync(__dirname);
	const examples: Info[] = [];
	
	for(const dir of dirs) {
		const path = PATH.join(__dirname, dir);
	
		const stats = fs.lstatSync(path);
		if(!stats.isDirectory()) continue;
	
		examples.push(
			JSON.parse(
				fs.readFileSync(PATH.join(path, 'info.json'), 'utf-8')
			)
		)
	}
	
	
	spinner.stop();
	
	//
	//	Picking example
	//
	
	const { example } = await inquirer.prompt([{
		name: 'example',
		type: 'list',
		message: 'Which example do you want to run?',
		choices: examples.map(e=>e.name + " | " + e.description)
	}]).catch(() => {console.log('Bye!'); process.exit()})

	//
	//	Starting example
	//

	const name = example.split(' |')[0];
	const file = PATH.join(__dirname, examples.find(e=>e.name === name)!.file);
	
	console.log(chalk.green(`\nStarting example ${name}`));
	console.log(chalk.yellow(`File ${file} \n`));

	require(file);
	
})();


//
//	Types
//

interface Info {
	name: string
	description: string
	file: string
}