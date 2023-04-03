const { SlashCommandBuilder } = require('discord.js');
const jsonfile = require('jsonfile');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole-status')
        .setDescription('See what roles are given when a user joins the server!'),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Try to write to existing file or create it
        try {
            // Read the guild autoroles JSON, YES, JSOOOON
            let levelData = jsonfile.readFileSync(`./src/json/guild-autoroles/${interaction.guild.id}.json`);

            // If the json is empty return
            if (levelData.length === 0) return await interaction.reply({ content: `This server does not have any autoroles configured! <:troste:1085262695445573754>`, ephemeral: true });
            
            // Loop through the roles in the array and  add them to a string
            let autorolesConfigured = "";
            for (role of levelData) {
                autorolesConfigured += `> Role: <@&${role}>\n`
            };
            
            // Send it
            await interaction.reply({ content: `This are the autoroles of **${interaction.guild.name}**:\n${autorolesConfigured}`, ephemeral: true });
        } catch (error) {
            // If the file doesn´t exist return
            console.log(error)
            return await interaction.reply({ content: `This server does not have any autoroles configured! <:troste:1085262695445573754>`, ephemeral: true });
        };

        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 6000);
    }
}