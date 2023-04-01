const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .addIntegerOption(option =>
            option.setName('messages').setDescription('Ammount of messages to delete').setRequired(true))
        .setDescription('Bulk delete messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        // Check if user is on cooldown
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });
        // Get input
        const ammountMessages = interaction.options.getInteger('messages');
        const guildIcon = interaction.guild.iconURL() || "https://cdn.discordapp.com/attachments/1032544028115349564/1090962651661742130/icon.png";

        // Avoid deleting too much messages or 0
        if (ammountMessages > 100 || ammountMessages < 1) {
            return interaction.reply({ content: 'You must choose a number between **1** and **100**!', ephemeral: true });
        }

        // DB Connection
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

                    con.query('SELECT channel FROM log WHERE guildId = ?', [interaction.guild.id], function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        };
                        try {
                            // Get the thingys
                            resolve(result[0].channel);
                        } catch (error) {
                            // If error there is no log channel configured
                            resolve(false);
                        }

                    });
                });
            })
        }

        // Main
        getLogChannel().then(async channelSetted => {
            // Delete the messages and if there is an error send it
            await interaction.channel.bulkDelete(ammountMessages).catch(async () => {
                return await interaction.reply({ content: 'I couldn´t delete all that messages, blame it on discord :c', ephemeral: true });
            })

            // Notify and log
            await interaction.reply({ content: `¡I´ve deleted **${ammountMessages}** messages!`, ephemeral: true });
            // Send log if the log channel is configured
            if (channelSetted) {
                // Fetch log channel
                const logChannel = interaction.guild.client.channels.cache.find(channel => channel.id === channelSetted);
                // The Log
                const logPurge = new EmbedBuilder()
                    .setColor('#fc0335')
                    .setTitle(`Bulk delete at <#${interaction.channel.id}>!`)
                    .setDescription(`Moderator: <@${interaction.member.id}>\nAmmount: **${ammountMessages}** messages deleted`)
                    .setThumbnail(interaction.member.displayAvatarURL())
                    .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${guildIcon}` });
                // Send
                await logChannel.send({ embeds: [logPurge] });
            }

            // Add timeout
            timeoutUsers.push(interaction.user.id);
            setTimeout(() => {
                timeoutUsers.shift();
            }, 10000)
        }).catch(err => console.log("Error on bulk delete => " + err));
    },
};