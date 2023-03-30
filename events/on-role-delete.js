const { AuditLogEvent, Events, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');
const fs = require('node:fs')

module.exports = {
    name: Events.GuildRoleDelete,

    async execute(role) {
        // Variables
        const guild = role.guild;
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
                const channelCreate = new EmbedBuilder()
                    .setColor(role.color)
                    .setTitle(`The role **${role.name}** was deleted!`)
                    .setDescription(`Role **${role.name}** was fatally killed.`)
                    .addFields(
                        { name: "Name:", value: `> ${role.name}` },
                        { name: "ID:", value: `> ${role.id}` },
                        { name: "Moderator:", value: `> ${executor}` },
                    )
                    .setThumbnail(guild.iconURL())
                    .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guild.iconURL()}` })
                // Notify
                await logChannel.send({ embeds: [channelCreate] });
            }).catch(err => console.log("Error on updated channel log => " + err));

        }).catch(err => console.log("Error on updated channel => " + err));
    }
}