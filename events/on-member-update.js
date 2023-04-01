const { Events, EmbedBuilder, AuditLogEvent, GuildBan } = require('discord.js');
const mysql = require('mysql');
const moment = require('moment');

module.exports = {
    name: Events.GuildMemberUpdate,

    async execute(oldMember, newMember) {
        console.log("v")
        // Get the variables
        const guild = newMember.guild;
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

            guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate }).then(async audit => {
                let rolesChanged = true;
                let nickChaged = true;
                let timeoutSet = true;

                // Roles
                oldRoles = oldMember._roles.map(x => "<@&" + x + ">");
                newRoles = newMember._roles.map(x => "<@&" + x + ">");
                if (JSON.stringify(oldRoles) === JSON.stringify(newRoles)) rolesChanged = false;

                // Nicknames
                oldNick = oldMember.nickname;
                newNick = newMember.nickname;
                if (oldNick === null) oldNick = "Not set";
                if (newNick === null) newNick = "Not set";
                if (oldNick === newNick) nickChaged = false;

                // Timeout
                oldTimeout = oldMember.communicationDisabledUntilTimestamp;
                newTimeout = newMember.communicationDisabledUntilTimestamp; // When the timeout ends

                let timeout;
                let timeoutAction = [];
                try {
                    timeoutRaw = newTimeout.toString().substring(0, newTimeout.toString().length - 3); // Dirty hehehe
                    timeout = "<t:" + timeoutRaw + ":R>"
                    timeoutAction = ["muted", "Mute ends:"]
                } catch (error) {
                    timeout = null;
                }
                if (oldTimeout === newTimeout) timeoutSet = false;
                else if (timeout === null) {
                    timeout = "Timeout has been removed!";
                    timeoutAction = ["unmuted", "Feel the freedom!"]
                }


                // Embeds
                let updatedMember;

                // If roles changed
                if (rolesChanged) {
                    updatedMember = new EmbedBuilder()
                        .setColor(newMember.displayHexColor)
                        .setTitle(`${newMember.displayName}'s roles where changed!`)
                        .addFields(
                            { name: "Old roles:", value: `> ${oldRoles}` },
                            { name: "New roles:", value: `> ${newRoles}` },
                        )
                        .setThumbnail(newMember.displayAvatarURL())
                        .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guildIcon}` });

                // If nickname changed
                } else if (nickChaged) {
                    updatedMember = new EmbedBuilder()
                        .setColor(newMember.displayHexColor)
                        .setTitle(`${newMember.displayName}'s nickname was changed!`)
                        .addFields(
                            { name: "Old nickname:", value: `> ${oldNick}` },
                            { name: "New nickname:", value: `> ${newNick}` },
                        )
                        .setThumbnail(newMember.displayAvatarURL())
                        .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guildIcon}` });

                // If timeout changed
                } else if (timeoutSet) {
                    updatedMember = new EmbedBuilder()
                        .setColor(newMember.displayHexColor)
                        .setTitle(`${newMember.displayName} was ${timeoutAction[0]}!`)
                        .addFields(
                            { name: timeoutAction[1], value: `> **${timeout}**` },
                        )
                        .setThumbnail(newMember.displayAvatarURL())
                        .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guildIcon}` });
                // Else
                } else {
                    console.log("AJAS")
                    guild.fetchAuditLogs().then(async audit => {
                        // Variables
                        const changes = audit.entries.first().changes;
                        const executor = audit.entries.first().executor;
                        // What changed
                        let changedValues = changes.map(c => `> **${c.key}** was changed from **${c.old}** to **${c.new}**`).join('\n');

                        // Embed
                        updatedMember = new EmbedBuilder()
                            .setColor(newMember.displayHexColor)
                            .setTitle(`A member was edited!`)
                            .setDescription(`Something in ${newMember} was changed.`)
                            .addFields(
                                { name: "Changes:", value: `${changedValues}` },
                                { name: "ID:", value: `> ${newMember.id}` },
                                { name: "Moderator:", value: `> ${executor}` },
                            )
                            .setThumbnail(guildIcon)
                            .setFooter({ text: `${guild.name} - Moderation`, iconURL: `${guildIcon}` })
                    }).catch(err => console.log("Error on updated member log => " + err));
                }

                // Send
                return await logChannel.send({ embeds: [updatedMember] });
            }).catch(err => console.log("Error on update member log => " + err));

        }).catch(err => console.log("Error on update member log => " + err));
    }
}