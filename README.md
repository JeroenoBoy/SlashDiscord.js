# SlashDiscord.js
 An advanced slash command handler for discord
 Docs: [WIP](https://app.gitbook.com/@jeroenoboy/s/slashdiscord-js/)


```bash
npm i SlashDiscord.js
```
or
```bash
yarn add SlashDiscord.js
```

## Example

Here is a simple command handler to get you started

```js
const { Client } = require('discord.js');
const { SlashCommandHandler } = require('slashdiscord.js');

const client = new Client();
const handler = new SlashCommandHandler({
	client
});

handler.addCommand({
	name: 'Hello',
	description: 'My first command.'
})
.run(interaction => {
	interaction.reply('Hello World!')
})


client.login('YOUR_BOT_TOKEN');
```


## Testing
1. run npm i or yarn install
2. Duplicate the .example.env file and call it .env
3. fill in your bot token and client id in the .env file
4. execute the command npm test or yarn test
