const { Events, EmbedBuilder, AuditLogEvent, GuildBan } = require('discord.js');
const mysql = require('mysql');
const moment = require('moment');

module.exports = {
    name: Events.Guil,

    async execute(GuildMemberRemove) {
        // Get the variables
        const user = GuildMemberRemove.user
        const guild = GuildMemberRemove.guild;
        
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

            
            console.log("left");
        }).catch(err => console.log("Error on leave log => " + err));
    }
}