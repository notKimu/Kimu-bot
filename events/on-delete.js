const { Events, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

module.exports = {
    name: Events.MessageDelete,

    async execute(message) {

        const guildIcon = message.guild.iconURL() || "https://cdn.discordapp.com/attachments/1032544028115349564/1090962651661742130/icon.png";

        // Return if it´s empty
        if (message.content === "") {
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

                    con.query('SELECT channel FROM log WHERE guildId = ?', [message.guild.id], function (err, result) {
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
            const logChannel = message.client.channels.cache.find(channel => channel.id === channelSetted);

            // Embed
            const deletedMessage = new EmbedBuilder()
                .setColor('#ff806d')
                .setTitle(`Deleted message at <#${message.channel.id}>`)
                .setDescription(`**Author**: ${message.member}\n**Content**: ${message.content}`)
                .setThumbnail(message.member.displayAvatarURL())
                .setFooter({ text: `${message.guild.name} - Moderation`, iconURL: `${guildIcon}` })
            // Notify
            await logChannel.send({ embeds: [deletedMessage] });
        }).catch(err => console.log("Error on deleted message => " + err));
    }
}