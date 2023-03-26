const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');
const dotenv = require('dotenv').config();

var timeoutUsers = [];
var bannedStrings = ["'", '"', "-", "`"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile-description')
        .addStringOption(option =>
            option.setName('description').setDescription('The description you want in your profile').setRequired(true))
        .setDescription('Set a description for your profile!'),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });
        
        //Get user input
        var description = interaction.options.getString('description');
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Check if the description is valid and add lines
        function isAcceptable() {
            if (description.length > 0 && description.length < 90) {
                descriptionSplit = description.match(/.{1,23}/g);
                description = descriptionSplit.join("\n​");
                return true
            } // 23
            else return false;
        }

        // Do the insert thingys
        if (isAcceptable()) {
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

            // Avoid SQL Injection
            description = description.replace(/"|'|-|;/g, '');
            try {
                // Insert in DB
                let setDescription = `INSERT INTO descriptionimg (guildId, userId, description) VALUES ('${guildId}', '${userId}', '${description}') ON DUPLICATE KEY UPDATE description = '${description}';`;
                con.query(setDescription, function (err, result) {
                    if (err) throw err;
                })
            } catch {
                // Error
                return interaction.reply({ content: "There was an error in your request, please try again '^^", ephemeral: true });
            }


            // Add a timeout to the command
            timeoutUsers.push(interaction.user.id);
            setTimeout(() => {
                timeoutUsers.shift();
            }, 120000)
            // Send confirmation
            return await interaction.reply({ content: "Description recorded in the database :D", ephemeral: true });

        } else {
            // If description is too long
            return interaction.reply({ content: "The description must be between 1 and 90 characters!", ephemeral: true });
        }
    }

}