const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const jsonfile = require('jsonfile');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reward-status')
        .setDescription('See what roles are given as a reward for levelling up!'),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Try to write to existing file or create it
        try {
            // Read the guild roles JSON, YES, JSOOOON
            let levelData = jsonfile.readFileSync(`./src/json/guild-roles/${interaction.guild.id}.json`);

            // Get the data
            let levels = Object.keys(levelData[0]);
            let roles = Object.values(levelData[0]);

            if (levels.length === 0 || roles.length === 0) return await interaction.reply({ content: `This server does not have any rewards configured! <:troste:1085262695445573754>`, ephemeral: true });

            let levelRewards = "", count = 0;
            for (index in levels) {
                levelRewards += `> Level ${levels[index]}: <@&${roles[index]}>\n`
            }
            
            await interaction.reply({ content: `This are the role rewards of **${interaction.guild.name}**:\n${levelRewards}` });
        } catch (error) {
            console.log(error)
            return await interaction.reply({ content: `This server does not have any rewards configured! <:troste:1085262695445573754>`, ephemeral: true });
        };

        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 6000);
    }
}