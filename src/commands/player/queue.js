const logger = require('../../services/logger');
const { embedOptions, playerOptions } = require('../../config');
const { notInVoiceChannel } = require('../../utils/validation/voiceChannelValidator');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    isNew: false,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the list of tracks added to the queue.')
        .setDMPermission(false)
        .setNSFW(false)
        .addNumberOption((option) => option.setName('page').setDescription('Page number of the queue').setMinValue(1)),
    execute: async ({ interaction }) => {
        if (await notInVoiceChannel(interaction)) {
            return;
        }

        const queue = useQueue(interaction.guild.id);
        const pageIndex = (interaction.options.getNumber('page') || 1) - 1;
        let queueString = '';

        if (!queue) {
            if (pageIndex >= 1) {
                logger.debug(
                    `[Shard ${interaction.guild.shardId}] User used command ${interaction.commandName} but there was no queue.`
                );
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `Page \`${
                                    pageIndex + 1
                                }\` is not a valid page number.\n\nThe queue is currently empty, first add some tracks with **\`/play\`**!`
                            )
                            .setColor(embedOptions.colors.warning)
                    ]
                });
            }

            logger.debug(
                `[Shard ${interaction.guild.shardId}] User used command ${interaction.commandName} but there was no queue.`
            );
            queueString = 'Use \`\/play\` to add some songs';
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
			.setTitle('There is no song in queue')
                        .setDescription(`${queueString}`)
                        .setTimestamp()
			.setColor(embedOptions.colors.info)
                ]
            });
        }

        const queueLength = queue.tracks.data.length;
        const totalPages = Math.ceil(queueLength / 10) || 1;

        if (pageIndex > totalPages - 1) {
            logger.debug(
                `[Shard ${interaction.guild.shardId}] User used command ${interaction.commandName} but page was higher than total pages.`
            );

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `Page \`${
                                pageIndex + 1
                            }\` is not a valid page number.\n\nThere are only a total of \`${totalPages}\` pages in the queue.`
                        )
                        .setColor(embedOptions.colors.warning)
                ]
            });
        }

        if (queue.tracks.data.length === 0) {
            queueString = 'There is no song in queue';
        } else {
            queueString = queue.tracks.data
                .slice(pageIndex * 10, pageIndex * 10 + 10)
                .map((track, index) => {
                    let durationFormat =
                        track.raw.duration === 0 || track.duration === '0:00' ? '' : `\`${track.duration}\``;

                    return `**${pageIndex * 10 + index + 1}.** **${track.title}-${track.author}** (${durationFormat})`;
                })
                .join('\n');
        }

        let currentTrack = queue.currentTrack;

        const loopModesFormatted = new Map([
            [0, 'disabled'],
            [1, 'track'],
            [2, 'queue'],
            [3, 'autoplay']
        ]);

        const loopModeUserString = loopModesFormatted.get(queue.repeatMode);

        let repeatModeString = `${
            queue.repeatMode === 0
                ? ''
                : `**${
                    queue.repeatMode === 3 ? embedOptions.icons.autoplay : embedOptions.icons.loop
                } Looping**\nLoop mode is set to ${loopModeUserString}. You can change it with **\`/loop\`**.\n\n`
        }`;

        if (!currentTrack) {
            logger.debug(
                `[Shard ${interaction.guild.shardId}] User used command ${interaction.commandName} but there was no current track.`
            );

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `${repeatModeString}` + `**${embedOptions.icons.queue} Tracks in queue**\n${queueString}`
                        )
                        .setFooter({
                            text: `Page ${pageIndex + 1}/${totalPages} (${queueLength} songs)`
                        })
                        .setColor(embedOptions.colors.info)
                ]
            });
        } else {
            const timestamp = queue.node.getTimestamp();
            let bar = `**\`${timestamp.current.label}\`** ${queue.node.createProgressBar({
                queue: false,
                length: playerOptions.progressBar.length ?? 12,
                timecodes: playerOptions.progressBar.timecodes ?? false,
                indicator: playerOptions.progressBar.indicator ?? '🔘',
                leftChar: playerOptions.progressBar.leftChar ?? '▬',
                rightChar: playerOptions.progressBar.rightChar ?? '▬'
            })} **\`${timestamp.total.label}\`**`;

            if (currentTrack.raw.duration === 0 || currentTrack.duration === '0:00') {
                bar = '_No duration available._';
            }

            logger.debug(
                `[Shard ${interaction.guild.shardId}] User used command ${interaction.commandName} and got queue in reply with current track.`
            );
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
			.setTitle(`${embedOptions.icons.queue} Songs queue of \`${queue.channel.name}\``)
                        .setDescription(
                                `${queueString}`
                        )
                        .setTimestamp()
                        .setColor(embedOptions.colors.info)
                ]
            });
        }
    }
};
