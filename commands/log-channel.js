const { ChannelType, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const mysql = require('mysql');
const dotenv = require('dotenv').config();

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log-channel')
        .addChannelOption(option =>
            option.setName('channel').setDescription('Activate and select a channel for the log system!').setRequired(true).addChannelTypes(ChannelType.GuildText))
        .setDescription('Set where you want the log messages to be sent')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        //Get user input
        const channel = interaction.options.getChannel('channel');
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
        con.query('INSERT INTO log (guildId, channel) VALUES (?, ?) ON DUPLICATE KEY UPDATE channel = ?', [interaction.guild.id, channel.id, channel.id], function (err, result) {
            if (err) throw err;
        })


        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 60000)
        // Send confirmation
        return await interaction.reply({ content: `The log system is now active at <#${channel.id}> <:ta_potente:1085193115926790144>`, ephemeral: true });
    }
}