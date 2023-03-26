const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const mysql = require('mysql');
const dotenv = require('dotenv').config();

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-message')
        .addStringOption(option =>
            option.setName('message').setDescription('The message you want to set').setRequired(true))
        .setDescription('Set a custom message for when someone joins')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        //Get user input
        const message = interaction.options.getString('message');

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
        con.query('INSERT INTO welcome (guildId, message) VALUES (?, ?) ON DUPLICATE KEY UPDATE message = ?', [interaction.guild.id, message, message], function (err, result) {
            if (err) throw err;
        })


        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 120000)
        // Send confirmation
        return await interaction.reply({ content: `The new welcome message will be "${message}" <:howdy:1085203009333637170>`, ephemeral: true });
    }
}