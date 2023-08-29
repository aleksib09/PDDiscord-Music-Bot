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
        .setName('ping')
        .setDescription('Show the bot latency.')
        .setDMPermission(false)
        .setNSFW(false),
    execute: async ({ interaction, client }) => {

	const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`:bar_chart: **Client**: \`${ping}\` ms.\n:globe_with_meridians: **Websocket**: \`${client.ws.ping}\` ms.`)
                    .setColor(embedOptions.colors.info)
            ]
        });
    }
};
