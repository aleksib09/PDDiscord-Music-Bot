const logger = require('../../services/logger');
const { embedOptions } = require('../../config');
const { getUptimeFormatted } = require('../../utils/system/getUptimeFormatted');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const osu = require('node-os-utils');
const { version } = require('../../../package.json');

module.exports = {
    isNew: true,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Show user\'s avatar.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Select user you want to view avatar.')
                .setRequired(false))
        .setDMPermission(false)
        .setNSFW(false),
        execute: async ({message, interaction, client }) =>  {
            const username = interaction.options.getUser('user') || interaction.user;
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
			.setTimestamp()
			.setFooter({
	                text: `Requested by ${interaction.member.nickname || interaction.user.username}`,
                        iconURL: interaction.user.avatarURL()}
)
			.setDescription(`**Here is ${interaction.options.getUser('user') || interaction.user} avatar**:`)
                        .setImage(await username.displayAvatarURL({size: 1024, dynamic: true }))
                        .setColor(embedOptions.colors.info)
                ]
            });
        }
    };
