const { Events, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

module.exports = {
    name: Events.GuildUpdate,

    async execute(oldGuild, newGuild) {

        let difference = Object.values(oldChannel)
                 .filter(x => !Object.values(channel).includes(x))
                 .concat(Object.values(channel).filter(x => !Object.values(oldChannel).includes(x)));
        console.log(difference); 
        
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

                    con.query('SELECT channel FROM log WHERE guildId = ?', [newGuild.id], function (err, result) {
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
            const logChannel = newGuild.client.channels.cache.find(channel => channel.id === channelSetted);

            // Embed
            const channelCreate = new EmbedBuilder()
                .setColor('#66cdcc')
                .setTitle(`The guild was updated!`)
                .setDescription(`Something in the guild config has been changed`)
                .addFields(
                    {name: "Old name:", value: `> ${oldChannel.name}`},
                    {name: "Old category:", value: `> <#${oldChannel.parentId}>`},
                    {name: "Type:", value: `> ${channelType}`},
                    {name: "NSFW:", value: `> ${channel.nsfw}`},
                )
                .setThumbnail(channel.guild.iconURL())
                .setFooter({ text: `${newGuild.name} - Moderation`, iconURL: `${newGuild.iconURL()}` })
            // Notify
            await logChannel.send({ embeds: [channelCreate] });
        }).catch(err => console.log("Error on updated channel => " + err));
    }
}