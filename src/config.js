const { ActivityType, PresenceUpdateStatus } = require('discord.js');
// Description: Config file for Cadence Discord bot.

// General options for information about the bot.
module.exports.botOptions = {
    name: 'RedBot',
    websiteUrl: 'https://facebook.com/2level.v',
    botInviteUrl: 'https://redemancy.net',
    serverInviteUrl: 'https://redemancy.net'
};

// Sharding options for the bot.
// See https://old.discordjs.dev/#/docs/discord.js/main/typedef/ShardingManagerOptions for valid options.
// Do not change if you don't know what you are doing.
module.exports.shardingOptions = {
    totalShards: 'auto',
    shardList: 'auto',
    mode: 'process',
    respawn: true
};

// Logging options for the bot, can set logging level to file and console separately.
module.exports.loggerOptions = {
    minimumLogLevel: 'debug',
    minimumLogLevelConsole: 'info'
};

// systemGuildIds: Array of guild ids where system commands should be available.
// systemMessageChannelId: Channel id where system messages should be sent, such as error events.
// systemUserId: User id of the system administrator, used for pining on certain system messages.
module.exports.systemOptions = {
    systemGuildIds: ['680087826372755511'],
    systemMessageChannelId: '915071369035788318',
    systemUserId: '894972997914464256'
};

// Options for presence/activity status. You can change from watching to listening, playing, etc.
// See https://discord-api-types.dev/api/discord-api-types-v10/enum/ActivityType for valid activity types.
// See https://discord-api-types.dev/api/discord-api-types-v10/enum/PresenceUpdateStatus for valid presence status.
module.exports.presenceStatusOptions = {
    status: PresenceUpdateStatus.DoNotDisturb,
    activities: [
        {
            name: "you!",
            type: ActivityType.Watching,
	    url: "https://twitch.tv/ESLCS",
        }
    ]
};

// Options for embed messages, like colors and custom emojis.
module.exports.embedOptions = {
    colors: {
        success: '#a10247',
        warning: '#F0B232',
        error: '#F23F43',
        info: '#e8ff00',
        note: '#e8ff00'
    },
    icons: {
        logo: '🤖',
        beta: '`beta`',
        new: '`new`',
        rule: '📒',
        support: '❓',
        bot: '🤖',
        server: '🖥️',
        discord: '🌐',
        audioPlaying: '🎶',
        audioStartedPlaying: '🎶',
        success: '✅',
        error: '⚠️',
        warning: '⚠️',
        disable: '🚫',
        enable: '✅',
        disabled: '✅',
        enabled: '✅',
        nextTrack: '⏭️',
        previousTrack: '⏮️',
        pauseResumeTrack: '⏯️',
        shuffleQueue: '🔀',
        loop: '🔁',
        loopAction: '🔁',
        autoplay: '♾️',
        autoplayAction: '♾️',
        looping: '🔁',
        autoplaying: '♾️',
        skipped: '⏭️',
        back: '⏮️',
        pauseResumed: '⏯️',
        shuffled: '🔀',
        volume: '🔊',
        volumeIsMuted: '🔇',
        volumeChanged: '🔊',
        volumeMuted: '🔇',
        queue: '🎶',
        sourceArbitrary: '🎵',
        sourceAppleMusic: '🎵',
        sourceYouTube: '🎵',
        sourceSoundCloud: '🎵',
        sourceSpotify:':spotify:'
    }
};

// Options for the discord-player player.
module.exports.playerOptions = {
    leaveOnEmpty: true,
    leaveOnEmptyCooldown: 600_000,
    leaveOnEnd: true,
    leaveOnEndCooldown: 600_000,
    leaveOnStop: false,
    leaveOnStopCooldown: 300_000,
    defaultVolume: 50,
    maxQueueSize: 1_000,
    maxHistorySize: 100,
    bufferingTimeout: 3_000,
    connectionTimeout: 30_000,
    progressBar: {
        length: 14,
        timecodes: false,
        separator: '┃',
        indicator: '🔘',
        leftChar: '▬',
        rightChar: '▬'
    }
};

// Options to be used by the ffmpeg, and available ffmpeg filters shown in filter commands.
module.exports.ffmpegFilterOptions = {
    threadAmount: '2',
    filterList: [
        {
            label: 'Bass boost',
            value: 'bassboost_low',
            description: 'Boost the bass of the audio.',
            emoji: '🔉'
        },
        {
            label: 'Bass boost high',
            value: 'bassboost',
            description: 'Boost the bass of the audio a lot.',
            emoji: '🔊'
        },
        {
            label: 'Night core',
            value: 'nightcore',
            description: 'Speed up the audio (higher pitch).',
            emoji: '🐱'
        },
        {
            label: 'Lo-fi',
            value: 'lofi',
            description: 'Low fidelity effect (lower quality).',
            emoji: '📻'
        },
        {
            label: 'Vaporwave',
            value: 'vaporwave',
            description: 'Slow down the audio (lower pitch).',
            emoji: '🌸'
        },
        {
            label: 'Ear rape',
            value: 'earrape',
            description: 'Extremely loud and distorted audio.',
            emoji: '👂'
        },
        {
            label: '8D',
            value: '8D',
            description: 'Simulate 8D audio effect (surround).',
            emoji: '🎧'
        },
        {
            label: 'Treble',
            value: 'treble',
            description: 'Increase the high frequencies.',
            emoji: '🎼'
        },
        {
            label: 'Normalizer',
            value: 'normalizer',
            description: 'Normalize the audio (avoid distortion).',
            emoji: '🎶'
        }
    ]
};
