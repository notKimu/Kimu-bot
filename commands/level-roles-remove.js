const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const jsonfile = require('jsonfile');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reward-remove')
        .addIntegerOption(option =>
            option.setName('level').setDescription('The level at which the role is given').setRequired(true))
        .setDescription('Disable the role that is given to a user when he reaches a level!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        //Get user input
        const level = interaction.options.getInteger('level');
        // Max is 200
        if (level > 200) return await interaction.reply({ content: `The maximum level is 200! <:sob:1085192644512206868>`, ephemeral: true });


        // Check if the file exists and if not notify it
        try {
            // The level config keys and values
            let levelData = [];

            // Read the guild roles JSON, YES, JSOOOON
            levelData = jsonfile.readFileSync(`./src/json/guild-roles/${interaction.guild.id}.json`);

            // Return if the level is not recorded
            if (levelData[0][`${level}`] === undefined) return await interaction.reply({ content: `I think that level is not in the configuration <:nom:1085203918931365960>`, ephemeral: true });

            // Remove the level config
            delete levelData[0][`${level}`];

            // Write it to the file
            jsonfile.writeFileSync(
                `./src/json/guild-roles/${interaction.guild.id}.json`,
                levelData,
            );
        } catch {
            // If there is an error the level probably didn´t exist
            return await interaction.reply({ content: `But the server does not have any roles configured! <:nom:1085203918931365960>`, ephemeral: true });
        };

        // Notification
        await interaction.reply({ content: `Done! I deleted the role given at level ${level}!`, ephemeral: true });

        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 10000);
    }
}