const { Events, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

module.exports = {
    name: Events.MessageDelete,

    async execute(message) {

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
                            return;
                        }

                    });
                });
            })
        }

        // Main
        getLogChannel().then(async channelSetted => {
            // Fetch the log channel
            const logChannel = message.client.channels.cache.find(channel => channel.id === channelSetted);

            // Embed
            const deletedMessage = new EmbedBuilder()
                .setColor('#ff806d')
                .setTitle(`Deleted message at ${message.channel.name}`)
                .setDescription(`**Author**: ${message.member}\n**Content**: ${message.content}`)
                .setThumbnail(message.member.displayAvatarURL())
                .setFooter({ text: `${message.guild.name} - Moderation`, iconURL: `${message.guild.iconURL()}` })
            // Notify
            await logChannel.send({ embeds: [deletedMessage] });
        }).catch(err => console.log("Error on deleted message => " + err));
    }
}