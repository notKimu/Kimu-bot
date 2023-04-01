const { AuditLogEvent, Events, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');
const fs = require('node:fs')

module.exports = {
    name: Events.GuildRoleCreate,

    async execute(role) {
        // Variables
        const guild = role.guild;
        const guildIcon = guild.iconURL() || "https://cdn.discordapp.com/attachments/1032544028115349564/1090962651661742130/icon.png";

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
                    .setColor('#66cc66')
                    .setTitle(`The role **${role.name}** was created!`)
                    .setDescription(`The new role is named ${role}.`)
                    .addFields(
                        { name: "Name:", value: `> ${role.name}` },
                        { name: "ID:", value: `> ${role.id}` },
                        { name: "Moderator:", value: `> ${executor}` },
                    )
                    .setThumbnail(guildIcon)
                    .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guildIcon}` })
                // Notify
                await logChannel.send({ embeds: [channelCreate] });
            }).catch(err => console.log("Error on updated channel log => " + err));

        }).catch(err => console.log("Error on updated channel => " + err));
    }
}