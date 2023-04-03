const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const jsonfile = require('jsonfile');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole-remove')
        .addRoleOption(option =>
            option.setName('role').setDescription('The role you want to stop giving when a user').setRequired(true))
        .setDescription('Remeove a role given when a user joins the server!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        //Get user input
        const role = interaction.options.getRole('role');


        // Check if the file exists and if not notify it
        try {
            // The level config keys and values
            let levelData = [];

            // Read the guild roles JSON, YES, JSOOOON
            levelData = jsonfile.readFileSync(`./src/json/guild-autoroles/${interaction.guild.id}.json`);

            // Get the index of the role and delete it
            const indexOfRole = levelData.indexOf(role.id);
            if (indexOfRole !== -1) {
                levelData.splice(indexOfRole, 1);
            } else {
                // If is -1 the role is not in the autorole JSON so just return
                return await interaction.reply({ content: `The role ${role.id} is not configured as an autorole! <:nom:1085203918931365960>`, ephemeral: true });
            }

            // Write it to the file
            jsonfile.writeFileSync(
                `./src/json/guild-autoroles/${interaction.guild.id}.json`,
                levelData,
            );
        } catch {
            // If there is an error the level probably didn´t exist
            return await interaction.reply({ content: `But the server does not have any autoroles configured! <:nom:1085203918931365960>`, ephemeral: true });
        };

        // Notification
        await interaction.reply({ content: `Done! I deleted the autorole ${role}!`, ephemeral: true });

        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 10000);
    }
}