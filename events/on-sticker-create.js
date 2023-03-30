const { Events, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

module.exports = {
    name: Events.GuildStickerCreate,

    async execute(sticker) {
        // Variables
        const guild = sticker.guild;
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
                const stickerCreate = new EmbedBuilder()
                    .setColor('#66cc66')
                    .setTitle(`The sticker **${sticker.name}** was created!`)
                    .setDescription(`The new sticker is ${sticker.name}.`)
                    .addFields(
                        { name: "Name:", value: `> ${sticker.name}` },
                        { name: "ID:", value: `> ${sticker.id}` },
                        { name: "Moderator:", value: `> ${executor}` },
                    )
                    .setThumbnail(guild.iconURL())
                    .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guild.iconURL()}` })
                // Notify
                await logChannel.send({ embeds: [stickerCreate], stickers: [sticker] });
            }).catch(err => console.log("Error on created sticker log => " + err));

        }).catch(err => console.log("Error on created sticker => " + err));
    }
}