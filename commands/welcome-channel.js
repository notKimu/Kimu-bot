const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const mysql = require('mysql');
const dotenv = require('dotenv').config();

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-channel')
        .addChannelOption(option =>
            option.setName('channel').setDescription('The channel where the welcome cards will be sent').setRequired(true))
        .setDescription('Set where you want the welcome messages to appear!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        //Get user input
        var channel = interaction.options.getChannel('channel');

        // Database Connection
        var con = mysql.createPool({
            host: "localhost",
            user: "kami",
            password: process.env.DBPASS,
            database: "kamidb"
        });
        con.getConnection(function (err) {
            if (err) throw err;
        });


        // Insert in DB
        con.query('INSERT INTO welcome (guildId, channel) VALUES (?, ?) ON DUPLICATE KEY UPDATE channel = ?', [interaction.guild.id, channel.id, channel.id], function (err, result) {
            if (err) throw err;
        })


        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 120000)
        // Send confirmation
        return await interaction.reply({ content: `Now the welcome messages will be sent to <#${channel.id}> <:uwu:1085202610971217940>`, ephemeral: true });
    }
}