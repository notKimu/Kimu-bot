const { Events, EmbedBuilder, AuditLogEvent, GuildBan } = require('discord.js');
const mysql = require('mysql');
const moment = require('moment');

module.exports = {
    name: Events.GuildBanAdd,

    async execute(GuildBan) {
        // Get the variables
        const user = GuildBan.user
        const guild = GuildBan.guild;
        
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

            guild.fetchAuditLogs({ type: AuditLogEvent.MemberBan }).then(async audit => {
                // The Log
                const logBan = new EmbedBuilder()
                    .setColor('#fc0335')
                    .setTitle(`**${user.username} was banned**!`)
                    .setDescription(`**${user.username}** has been banned\n> Joined at **${moment.utc(user.joinedAt).format('DD/MM/YY')}**\n> Reason: ${audit.entries.first().reason}\n> Moderator: ${audit.entries.first().executor}`)
                    .setThumbnail(user.avatarURL())
                    .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guild.iconURL()}` });

                // Send
                await logChannel.send({ embeds: [logBan] });
            }).catch(err => console.log("Error on ban log => " + err));

        }).catch(err => console.log("Error on ban log => " + err));
    }
}