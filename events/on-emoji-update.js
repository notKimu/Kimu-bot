const { Events, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

module.exports = {
    name: Events.GuildEmojiUpdate,

    async execute(oldEmoji, emoji) {
        // Variables
        const guild = emoji.guild;
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

            guild.fetchAuditLogs().then(async audit => {
                // Variables
                const executor = audit.entries.first().executor;

                // Embed
                const emojiCreate = new EmbedBuilder()
                    .setColor('#66cdcc')
                    .setTitle(`The emoji **${oldEmoji.name}** was updated!`)
                    .setDescription(`The new emoji is ${emoji.name} ${emoji}`)
                    .addFields(
                        { name: "New name:", value: `> ${emoji.name}` },
                        { name: "ID:", value: `> ${emoji.id}` },
                        { name: "Moderator:", value: `> ${executor}` },
                    )
                    .setThumbnail(guild.iconURL())
                    .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guild.iconURL()}` })
                // Notify
                await logChannel.send({ embeds: [emojiCreate] });
            }).catch(err => console.log("Error on emoji update log => " + err));

        }).catch(err => console.log("Error on emoji update log => " + err));
    }
}