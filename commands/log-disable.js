const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const mysql = require('mysql');
const dotenv = require('dotenv').config();

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log-disable')
        .setDescription('[WARNING] This disables the log system!!!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Database Connection
        var con = mysql.createPool({
            host: "localhost",
            user: "kami",
            password: process.env.DBPASS,
            database: "kamidb"
        });

        // Get log channel
        function getLogChannel() {
            return new Promise((resolve, reject) => {
                con.getConnection(async function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    con.query('SELECT channel FROM log WHERE guildId = ?;', [interaction.guild.id], async function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        }
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

        getLogChannel().then(async channelSetted => {
            if (!channelSetted) return await interaction.reply({ content: "But the log system is offline! <:abueno:1085200136461893753>", ephemeral: true });

            // Insert in DB
            con.query('DELETE FROM log WHERE guildId = ?;', [interaction.guild.id], async function (err, result) {
                if (err) throw err;
                try {
                    // Send confirmation
                    return await interaction.reply({ content: `The log system is now offline <:adolfmir:1085261413863403560>`, ephemeral: true });
                } catch (error) {
                    return;
                }
            })

            // Add a timeout to the command
            timeoutUsers.push(interaction.user.id);
            setTimeout(() => {
                timeoutUsers.shift();
            }, 60000)
        });
    }
}