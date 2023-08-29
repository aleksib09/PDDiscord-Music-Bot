require('dotenv').config();
const logger = require('./services/logger');
const { registerEventListeners } = require('./utils/registerEventListeners.js');
const { registerClientCommands } = require('./utils/registerClientCommands.js');
const { createClient } = require('./utils/factory/createClient.js');
const { createPlayer } = require('./utils/factory/createPlayer.js');

(async () => {
    const client = await createClient();
    const player = await createPlayer(client);
    client.on('mesageCreate', (message) => {
		if (message.content === 'why u peek') {
		message.reply('I said don\'t peek noob!. Why u so noob?'); }
		if (message.content === 'why u cheat') {
		mesage.reply('U noob');}
                if (message.content === 'cheater dog') {
                mesage.reply('I\'m not cheating, u noob dog');}
	});
    client.on('allShardsReady', async () => {
        registerEventListeners(client, player);
        registerClientCommands(client);
        client.emit('ready', client);
    });

    client.login(process.env.DISCORD_BOT_TOKEN);
})().catch((error) => {
    logger.error(error);
});
