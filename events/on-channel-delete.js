const { Events, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

module.exports = {
    name: Events.ChannelDelete,

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
                            return;
                        }

                    });
                });
            })
        }

        // Main
        getLogChannel().then(async channelSetted => {
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
            // Embed
            const channelDelete = new EmbedBuilder()
                .setColor('#ff806d')
                .setTitle(`A channel was deleted! **${channel.name}**`)
                .setDescription(`Channel **${channel.name}** was deleted from the **<#${channel.parentId}>** category`)
                .addFields(
                    { name: "Type:", value: `${channelType}` },
                )
                .setThumbnail(channel.guild.iconURL())
                .setFooter({ text: `${channel.guild.name} - Moderation`, iconURL: `${channel.guild.iconURL()}` })
            // Notify
            await logChannel.send({ embeds: [channelDelete] });
        }).catch(err => console.log("Error on deleted channel => " + err));
    }
}