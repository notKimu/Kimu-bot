const { Events, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

module.exports = {
    name: Events.ChannelCreate,

    async execute(channel) {

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
            channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate }).then(async audit => {
                // Embed
                const channelCreate = new EmbedBuilder()
                    .setColor('#66cc66')
                    .setTitle(`New channel created! <#${channel.id}>`)
                    .setDescription(`Channel <#${channel.id}> was created in the <#${channel.parentId}> category`)
                    .addFields(
                        { name: "Type:", value: `> ${channelType}` },
                        { name: "ID:", value: `> ${channel.id}` },
                        { name: "Moderator:", value: `> ${audit.entries.first().executor}` },
                    )
                    .setThumbnail(channel.guild.iconURL())
                    .setFooter({ text: `${channel.guild.name} - Moderation`, iconURL: `${channel.guild.iconURL()}` })
                // Notify
                await logChannel.send({ embeds: [channelCreate] });
            }).catch(err => console.log("Error on created channel => " + err));

        }).catch(err => console.log("Error on created channel => " + err));
    }
}