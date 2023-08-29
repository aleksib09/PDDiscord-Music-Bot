const logger = require('../../services/logger');
const { embedOptions } = require('../../config');
const { notInVoiceChannel } = require('../../utils/validation/voiceChannelValidator');
const { queueDoesNotExist } = require('../../utils/validation/queueValidator');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    isNew: false,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a specific track from the queue.')
        .setDMPermission(false)
        .setNSFW(false)
        .addNumberOption((option) =>
            option
                .setName('tracknumber')
                .setDescription('Track number to remove from queue.')
                .setMinValue(1)
                .setRequired(true)
        ),
    execute: async ({ interaction }) => {
        if (await notInVoiceChannel(interaction)) {
            return;
        }

        const queue = useQueue(interaction.guild.id);

        if (await queueDoesNotExist(interaction, queue)) {
            return;
        }

        const removeTrackNumber = interaction.options.getNumber('tracknumber');

        if (removeTrackNumber > queue.tracks.data.length) {
            logger.debug(
                `[Shard ${interaction.guild.shardId}] User used command ${interaction.commandName} but track number was higher than total tracks.`
            );

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**${embedOptions.icons.warning} Oops!**\nTrack \`${removeTrackNumber}\` is not a valid track number. There are a total of\`${queue.tracks.data.length}\` tracks in the queue.\n\nView tracks added to the queue with **\`/queue\`**.`
                        )
                        .setColor(embedOptions.colors.warning)
                ]
            });
        }

        // Remove specified track number from queue
        const removedTrack = queue.node.remove(removeTrackNumber - 1);
        let durationFormat =
            removedTrack.raw.duration === 0 || removedTrack.duration === '0:00' ? '' : `\`${removedTrack.duration}\``;

        logger.debug(
            `[Shard ${interaction.guild.shardId}] User used command ${interaction.commandName} and removed track.`
        );
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: interaction.member.nickname || interaction.user.username,
                        iconURL: interaction.user.avatarURL()
                    })
                    .setDescription(
                        `**${embedOptions.icons.success} Removed track**\n**${durationFormat} [${removedTrack.title}](${removedTrack.url})**`
                    )
                    .setThumbnail(removedTrack.thumbnail)
                    .setColor(embedOptions.colors.success)
            ]
        });
    }
};
