const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const mysql = require('mysql');

module.exports = {
    name: Events.ChannelDelete,

    async execute(channel) {
        
        const guildIcon = channel.guild.iconURL() || "https://cdn.discordapp.com/attachments/1032544028115349564/1090962651661742130/icon.png";

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

                    con.query('SELECT channel FROM log WHERE guildId = ?', [channel.guild.id], function (err, result) {
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
            const logChannel = channel.guild.client.channels.cache.find(channel => channel.id === channelSetted);

            // Check channel type [OH SHIT SPAGHETTI]
            let channelType = "Undefined";
            if (channel.type === 0) {
                channelType = "Text Channel"
            } else if (channel.type === 2) {
                channelType = "Voice Channel"
            } else if (channel.type === 15) {
                channelType = "Forum Channel"
            } else if (channel.type === 4) {
                channelType = "Category"
            } else if (channel.type === 5) {
                channelType = "Server Announcements"
            } else if (channel.type === 13) {
                channelType = "Voice Stage"
            } else if (channel.type === 14) {
                channelType = "Server Directory"
            };

            // Get who made the channel
            channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete }).then(async audit => {
                // Embed
                const channelCreate = new EmbedBuilder()
                    .setColor('#ff806d')
                    .setTitle(`A channel was deleted! ${channel.name}`)
                    .setDescription(`Channel **${channel.name}** was deleted from the <#${channel.parentId}> category`)
                    .addFields(
                        { name: "Type:", value: `> ${channelType}` },
                        { name: "ID:", value: `> ${channel.id}` },
                        { name: "Moderator:", value: `> ${audit.entries.first().executor}` },
                    )
                    .setThumbnail(guildIcon)
                    .setFooter({ text: `${channel.guild.name} - Moderation`, iconURL: `${guildIcon}` })
                // Notify
                await logChannel.send({ embeds: [channelCreate] });
            }).catch(err => console.log("Error on deleted channel => " + err));

        }).catch(err => console.log("Error on deleted channel => " + err));
    }
}