const logger = require('../../services/logger');
const { embedOptions } = require('../../config');
const { notInVoiceChannel } = require('../../utils/validation/voiceChannelValidator');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    isNew: true,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Stop playing audio and clear the track queue.')
        .setDMPermission(false)
        .setNSFW(false),
    execute: async ({ interaction }) => {
        if (await notInVoiceChannel(interaction)) {
            return;
        }

        const queue = useQueue(interaction.guild.id);

        if (!queue) {
            logger.debug(
                `[Shard ${interaction.guild.shardId}] User used command ${interaction.commandName} but there was no queue.`
            );
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `I'm not in a voice channel`
                        )
                        .setColor(embedOptions.colors.warning)
                ]
            });
        }

        if (!queue.deleted) {
            queue.setRepeatMode(0);
            queue.clear();
            queue.node.stop();
            logger.debug(
                `[Shard ${interaction.guild.shardId}] User used command ${interaction.commandName} and cleared the queue.`
            );
        }

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                      `Queue has been cleared. Use **\`/play\`** command to add some songs`
                    )
                    .setColor(embedOptions.colors.success)
            ]
        });
    }
};
