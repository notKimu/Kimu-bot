const { Events, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

module.exports = {
    name: Events.MessageUpdate,

    async execute(oldMessage, newMessage) {

        // Return if message is the same or if they are empty
        if (oldMessage.content === newMessage.content || oldMessage.content === "" || newMessage.content === "") {
            return;
        };

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

                    con.query('SELECT channel FROM log WHERE guildId = ?', [newMessage.guild.id], function (err, result) {
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
            const logChannel = newMessage.client.channels.cache.find(channel => channel.id === channelSetted);

            // Embed
            const editedMessage = new EmbedBuilder()
                .setColor('#ffb780')
                .setTitle(`Edited message at ${newMessage.channel.name}`)
                .setDescription(`**Author**: ${newMessage.member}\n**Old Message**: ${oldMessage.content}\n**New message**: ${newMessage.content}`)
                .setThumbnail(newMessage.member.displayAvatarURL())
                .setFooter({ text: `${newMessage.guild.name} - Moderation`, iconURL: `${newMessage.guild.iconURL()}` })
            // Notify
            await logChannel.send({ embeds: [editedMessage] });
        }).catch(err => console.log("Error on edited message => " + err));
    }
}