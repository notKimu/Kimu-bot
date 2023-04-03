const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole-disable')
        .setDescription('Stops giving roles when a user joins the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // try to remove the guild role rewards and if not notify it
        try {
            // Remove the guild roles
            levelData = fs.unlinkSync(`./src/json/guild-autoroles/${interaction.guild.id}.json`);
        } catch {
            // If there is an error the guild roles probably didn´t exist
            return await interaction.reply({ content: `The autoroles are alreade disabled! <a:vibe:1085264003820945498>`, ephemeral: true });
        };


        // Notification
        await interaction.reply({ content: `Okay! The autoroles have been disabled! <a:happi_dance:1085261790511906926>`, ephemeral: true });


        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 60000);
    }
}