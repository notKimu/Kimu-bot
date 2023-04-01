const { Events, EmbedBuilder, AuditLogEvent, GuildBan } = require('discord.js');
const mysql = require('mysql');
const moment = require('moment');

module.exports = {
    name: Events.GuildMemberRemove,

    async execute(GuildMemberRemove) {
        // Get the variables
        const user = GuildMemberRemove.user
        const guild = GuildMemberRemove.guild;
        const guildIcon = guild.iconURL() || "https://cdn.discordapp.com/attachments/1032544028115349564/1090962651661742130/icon.png";


        // DB Connection
        var con = mysql.createPool({
            host: "localhost",
            user: "kami",
            password: process.env.DBPASS,
            database: "kamidb"
        });
        con.getConnection(function (err) {
            if (err) throw err;
        });

        // Get log channel
        function getLogChannel() {
            return new Promise((resolve, reject) => {
                con.getConnection(async function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    con.query('SELECT channel FROM log WHERE guildId = ?', [guild.id], function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        };
                        try {
                            // Get the thingys
                            resolve(result[0].channel);
                        } catch (error) {
                            // If error there is no log channel configured
                            resolve(null);
                        }

                    });
                });
            })
        }

        // Main
        getLogChannel().then(async channelSetted => {
            // Do nothing if there is no log channel set
            if (!channelSetted) return;
            // Fetch the log channel
            const logChannel = guild.client.channels.cache.find(channel => channel.id === channelSetted);

            // Fetch information
            guild.fetchAuditLogs({ limit: 1 }).then(async audit => {
                // Return if action is a ban
                if (audit.entries.first().action === 22) return;

                // Check if the user just left
                if (audit.entries.first().targetId !== user.id && audit.entries.first().actionType !== "Delete") {
                    // The Log
                    let logLeft = new EmbedBuilder()
                        .setColor('#fc0335')
                        .setTitle(`**${user.username} left us**!`)
                        .setDescription(`**${user.username}** left the server\n> Joined at **${moment.utc(user.joinedAt).format('DD/MM/YY')}**`)
                        .setThumbnail(user.avatarURL())
                        .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guildIcon}` });

                    // Send
                    return await logChannel.send({ embeds: [logLeft] });
                }
                // If not, he was probably kicked
                let logKick = new EmbedBuilder()
                    .setColor('#fc0335')
                    .setTitle(`**${user.username} was kicked**!`)
                    .setDescription(`**${user.username}** has been kicked\n> Joined at **${moment.utc(user.joinedAt).format('DD/MM/YY')}**\n> Reason: ${audit.entries.first().reason}\n> Moderator: ${audit.entries.first().executor}`)
                    .setThumbnail(user.avatarURL())
                    .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guildIcon}` });

                // Send
                await logChannel.send({ embeds: [logKick] });
            }).catch(err => console.log("Error on leave log => " + err));

        }).catch(err => console.log("Error on leave log => " + err));
    }
}