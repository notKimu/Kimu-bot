const { Events, EmbedBuilder, AuditLogEvent, GuildBan } = require('discord.js');
const mysql = require('mysql');
const moment = require('moment');

module.exports = {
    name: Events.GuildBanRemove,

    async execute(GuildUnban) {
        // Get the variables
        const user = GuildUnban.user
        const guild = GuildUnban.guild;
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
            // Do anything if there is no log channel set
            if (!channelSetted) return;

            // Fetch the log channel
            const logChannel = guild.client.channels.cache.find(channel => channel.id === channelSetted);

            guild.fetchAuditLogs({ type: AuditLogEvent.MemberUnban }).then(async audit => {
                // The Log
                const logUnban = new EmbedBuilder()
                    .setColor('#fc0335')
                    .setTitle(`**${user.username} was unbanned**!`)
                    .setDescription(`**${user.username}** has been pardoned\n> Reason: ${audit.entries.first().reason}\n> Moderator: ${audit.entries.first().executor}`)
                    .setThumbnail(user.avatarURL())
                    .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guildIcon}` });

                // Send
                await logChannel.send({ embeds: [logUnban] });
            }).catch(err => console.log("Error on unban log => " + err));

        }).catch(err => console.log("Error on unban log => " + err));
    }
}