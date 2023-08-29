const logger = require('../services/logger');
const fs = require('node:fs');
const path = require('node:path');

exports.registerEventListeners = (client, player) => {
    logger.debug(`[Shard ${client.shard.ids[0]}] Registering event listeners...`);

    const eventFolders = fs.readdirSync(path.resolve('./src/events'));
    for (const folder of eventFolders) {
        const eventFiles = fs
            .readdirSync(path.resolve(`./src/events/${folder}`))
            .filter((file) => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`../events/${folder}/${file}`);
            switch (folder) {
                case 'client':
                    logger.debug(`[Shard ${client.shard.ids[0]}] Registering client event listener ${event.name}...`);
                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(...args));
                    } else {
                        if (!event.isDebug || process.env.MINIMUM_LOG_LEVEL === 'debug') {
                            client.on(event.name, (...args) => event.execute(...args));
                        }
                    }
                    break;

                case 'interactions':
                    logger.debug(
                        `[Shard ${client.shard.ids[0]}] Registering interactions event listener ${event.name}...`
                    );
                    client.on(event.name, (...args) => event.execute(...args, { client }));
                    break;

                case 'process':
                    logger.debug(`[Shard ${client.shard.ids[0]}] Registering process event listener ${event.name}...`);
                    process.on(event.name, (...args) => event.execute(...args));
                    break;

                case 'player':
                    logger.debug(`[Shard ${client.shard.ids[0]}] Registering player event listener ${event.name}...`);
                    if (
                        !event.isDebug ||
                        process.env.NODE_ENV === 'development' ||
                        process.env.MINIMUM_LOG_LEVEL === 'debug'
                    ) {
                        if (event.isPlayerEvent) {
                            player.events.on(event.name, (...args) => event.execute(...args));
                            break;
                        } else {
                            player.on(event.name, (...args) => event.execute(...args));
                        }
                    }
                    break;

                default:
                    logger.error(
                        `[Shard ${client.shard.ids[0]}] Unknown event folder '${folder}' while trying to register events.`
                    );
            }
        }
    }
};
