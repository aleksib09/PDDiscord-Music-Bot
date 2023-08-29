const { embedOptions, botOptions } = require('../../config');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show a list of commands and their usage.')
        .setDMPermission(false)
        .setNSFW(false),
    execute: async ({ interaction, client }) => {
        const commandList = client.commands
            .filter((command) => {
                // don't include system commands
                if (command.isSystemCommand) {
                    return false;
                }
                return true;
            })
            .map((command) => {
                let params = command.data.options[0] ? `**\`${command.data.options[0].name}\`**` + ' ' : '';
                let beta = command.isBeta ? `${embedOptions.icons.beta} ` : '';
                let newCommand = command.isNew ? `${embedOptions.icons.new} ` : '';
                return `- **\`/${command.data.name}\`** ${params}- ${beta}${newCommand}${command.data.description}`;
            });

        const commandListString = commandList.join('\n');

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
		    .setTitle(`<a:emoji_101:1035354179771830292> Available commands`)
                    .setDescription(`${commandListString}`)
		    .setFooter({ text:`Created by electroNic#2199`, iconUrl: ''})
		    .setTimestamp()
                    .setColor(embedOptions.colors.info)
            ]
        });

        /*
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `${embedOptions.icons.rule} **Available commands**\n` +
                            '- **`/play` `query`** - Add a track or playlist to the queue by url or search.\n' +
                            '- **`/pause`** - Pause or resume the current track.\n' +
                            '- **`/queue` `[page]`** - Show the list of tracks added to the queue.\n' +
                            '- **`/nowplaying`** - Show information about the track currently playing.\n' +
                            '- **`/seek` `duration`** - Seek to a specified duration in the current track.\n' +
                            `- **\`/loop\` \`mode\`** - ${embedOptions.icons.beta} Toggle looping a song, queue or autoplay.\n` +
                            `- **\`/filters\`** - ${embedOptions.icons.beta} Toggle various audio filters during playback.\n` +
                            '- **`/volume` `[percentage]`** - Show or set the playback volume for tracks.\n' +
                            '- **`/skip` `[tracknumber]`** - Skip to next or specified track.\n' +
                            '- **`/remove` `tracknumber`** - Remove specified track from the queue.\n' +
                            `- **\`/pause\`** - ${embedOptions.icons.new} Temporarily pause the song.\n` +
                            '- **`/leave`** - Clear the queue and remove the bot from voice channel.\n\n' +
                            `${embedOptions.icons.support} **Support server**\nJoin the support server for help or suggestions: \n**${botOptions.serverInviteUrl}**\n\n` +
                            `${embedOptions.icons.bot} **Enjoying ${botOptions.name}?**\nAdd me to another server: \n**[Click me!](${botOptions.botInviteUrl})**`
                    )
                    .setColor(embedOptions.colors.info)
            ]
        });
        */
    }
};
