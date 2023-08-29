const logger = require('../../services/logger');
const { embedOptions, playerOptions, botOptions } = require('../../config');
const { notInVoiceChannel } = require('../../utils/validation/voiceChannelValidator');
const { cannotJoinVoiceOrTalk } = require('../../utils/validation/permissionValidator');
const { transformQuery } = require('../../utils/validation/searchQueryValidator');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');

module.exports = {
    isNew: false,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Add a track or playlist to the queue by searching or url.')
        .setDMPermission(false)
        .setNSFW(false)
        .addStringOption((option) =>
            option
                .setName('query')
                .setDescription('Search query or URL.')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(500)
                .setAutocomplete(true)
        ),
    autocomplete: async ({ interaction }) => {
        const player = useMainPlayer();
        const query = interaction.options.getString('query', true);
        if (query.length < 2) {
            return;
        }
        const searchResults = await player.search(query);

        logger.debug(`[Shard ${interaction.guild.shardId}] Autocomplete search responded for query: ${query}`);

        let response = searchResults.tracks.slice(0, 5).map((track) => ({
            name:
                `${track.title} [Author: ${track.author}]`.length > 100
                    ? `${track.title}`.slice(0, 100)
                    : `${track.title} [Author: ${track.author}]`,
            value: track.url
        }));

        return interaction.respond(response);
    },
    execute: async ({ interaction }) => {
        if (await notInVoiceChannel(interaction)) {
            return;
        }

        if (await cannotJoinVoiceOrTalk(interaction)) {
            return;
        }

        const player = useMainPlayer();
        const query = interaction.options.getString('query');

        const transformedQuery = await transformQuery(query);

        let searchResult;

        try {
            searchResult = await player.search(transformedQuery, {
                requestedBy: interaction.user
            });
        } catch (error) {
            logger.error('[Shard ${interaction.guild.shardId}] Failed to search for track with player.search()');
            logger.error(error);
        }

        if (!searchResult || searchResult.tracks.length === 0) {
            logger.debug(`[Shard ${interaction.guild.shardId}] No results found for query: ${query}`);

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**No track found**\nNo results found for \`${transformedQuery}\`. If you specified a URL, please make sure it is valid and public.`
                        )
                        .setColor(embedOptions.colors.warning)
                ]
            });
        }

        if (
            searchResult.tracks[0].raw.live &&
            searchResult.tracks[0].raw.duration === 0 &&
            searchResult.tracks[0].source === 'youtube'
        ) {
            logger.debug(
                `[Shard ${interaction.guild.shardId}] Unsupported audio source. Query: ${query}. Track is live, 0 duration and from YouTube.`
            );

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**Unsupported audio source**\nYouTube live streams are currently not supported. This is due to issues with extracting audio from the livestream.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                        )
                        .setColor(embedOptions.colors.warning)
                ]
            });
        }

        let track;

        try {
            ({ track } = await player.play(interaction.member.voice.channel, searchResult, {
                requestedBy: interaction.user,
                nodeOptions: {
                    leaveOnEmpty: playerOptions.leaveOnEmpty ?? true,
                    leaveOnEmptyCooldown: playerOptions.leaveOnEmptyCooldown ?? 300_000,
                    leaveOnEnd: playerOptions.leaveOnEnd ?? true,
                    leaveOnEndCooldown: playerOptions.leaveOnEndCooldown ?? 300_000,
                    leaveOnStop: playerOptions.leaveOnStop ?? true,
                    leaveOnStopCooldown: playerOptions.leaveOnStopCooldown ?? 300_000,
                    maxSize: playerOptions.maxQueueSize ?? 1000,
                    maxHistorySize: playerOptions.maxHistorySize ?? 100,
                    volume: playerOptions.defaultVolume ?? 50,
                    bufferingTimeout: playerOptions.bufferingTimeout ?? 3000,
                    connectionTimeout: playerOptions.connectionTimeout ?? 30000,
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.client,
                        requestedBy: interaction.user,
                        track: searchResult.tracks[0]
                    }
                }
            }));

            logger.debug(`[Shard ${interaction.guild.shardId}] player.play() successful. Query: ${query}.`);
        } catch (error) {
            if (error.message.includes('Sign in to confirm your age')) {
                logger.debug(
                    `[Shard ${interaction.guild.shardId}] Found track but failed to retrieve audio due to age confirmation warning.`
                );
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.warning} Cannot retrieve audio for track**\nThis audio source is age restricted and requires login to access. Because of this I cannot retrieve the audio for the track.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                            )
                            .setColor(embedOptions.colors.warning)
                    ]
                });
            }

            if (error.message.includes('The following content may contain graphic or violent imagery')) {
                logger.debug(
                    `[Shard ${interaction.guild.shardId}] Found track but failed to retrieve audio due to graphic or violent imagery warning.`
                );
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.warning} Cannot retrieve audio for track**\nThis audio source cannot be played as the video source has a warning for graphic or violent imagery. It requires a manual confirmation to to play the video, and because of this I am unable to extract the audio for this source.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                            )
                            .setColor(embedOptions.colors.warning)
                    ]
                });
            }

            if (
                (error.type === 'TypeError' &&
                    (error.message.includes('Cannot read properties of null (reading \'createStream\')') ||
                        error.message.includes('Failed to fetch resources for ytdl streaming'))) ||
                error.message.includes('Could not extract stream for this track')
            ) {
                logger.debug(
                    error,
                    `[Shard ${interaction.guild.shardId}] Found track but failed to retrieve audio. Query: ${query}.`
                );

                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nAfter finding a result, I was unable to retrieve audio for the track.\n\nYou can try to perform the command again.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                            )
                            .setColor(embedOptions.colors.error)
                    ]
                });
            }

            if (error.message === 'Cancelled') {
                logger.debug(error, `[Shard ${interaction.guild.shardId}] Operation cancelled. Query: ${query}.`);

                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nSomething unexpected happened and the operation was cancelled.\n\nYou can try to perform the command again.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                            )
                            .setColor(embedOptions.colors.error)
                    ]
                });
            }

            logger.error(
                error,
                '[Shard ${interaction.guild.shardId}] Failed to play track with player.play(), unhandled error.'
            );
        }

        let queue = useQueue(interaction.guild.id);

        if (!queue) {
            logger.warn(
                `[Shard ${interaction.guild.shardId}] After player.play(), queue is undefined. Query: ${query}.`
            );

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nThere was an issue adding this track to the queue.\n\nYou can try to perform the command again.\n\n_If this problem persists, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                        )
                        .setColor(embedOptions.colors.error)
                ]
            });
        }

        if (track.source === 'arbitrary') {
            track.thumbnail =
                'https://cdn.discordapp.com/avatars/1048160883848790096/53766ec0120e13a64c9acf699cc3eb4d.webp?size=256';
        }

        let durationFormat = track.raw.duration === 0 || track.duration === '0:00' ? '' : `\`${track.duration}\``;

        if (searchResult.playlist && searchResult.tracks.length > 1) {
            logger.debug(
                `[Shard ${interaction.guild.shardId}] Playlist found and added with player.play(). Query: ${query}.`
            );
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**Added playlist [${
                                track.title
                            }](${track.url})**\n\nAnd **${
                                searchResult.tracks.length - 1
                            }** more tracks... **\`/queue\`** to view all.`
                        )
                        .setThumbnail(track.thumbnail)
                        .setColor(embedOptions.colors.success)
                ]
            });
        }

        if (queue.currentTrack === track && queue.tracks.data.length === 0) {
            logger.debug(
                `[Shard ${interaction.guild.shardId}] Track found and added with player.play(), started playing. Query: ${query}.`
            );

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(
                        `Started playing **${track.title}**`
                  )
                    .setColor(interaction.member.displayColor)
                ]
            });
        }

        logger.debug(
            `[Shard ${interaction.guild.shardId}] Track found and added with player.play(), added to queue. Query: ${query}.`
        );
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `Added **${track.title}** to queue`
                    )
                    .setColor(embedOptions.colors.success)
            ]
        });
    }
};
