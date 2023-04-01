const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const jsonfile = require('jsonfile');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reward-add')
        .addIntegerOption(option =>
            option.setName('level').setDescription('The level at which you want to give the role').setRequired(true))
        .addRoleOption(option =>
            option.setName('role').setDescription('The role you want to give').setRequired(true))
        .setDescription('Give a role when a user reaches a level!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        //Get user input
        const level = interaction.options.getInteger('level');
        const role = interaction.options.getRole('role');

        // Max is 200
        if (level > 200 || level < 1) return await interaction.reply({ content: `The level must be between 1 and 200! <:sob:1085192644512206868>`, ephemeral: true });

        // Try to write to existing file or create it
        try {
            // Read the guild roles JSON, YES, JSOOOON
            let levelData = jsonfile.readFileSync(`./src/json/guild-roles/${interaction.guild.id}.json`);

            // If role is higher than my role return a warning
            if (role.position > interaction.guild.members.me.roles.highest.position) return await interaction.reply({ content: `Hey! Looks like that role is higher than my role in the role list, I can´t give it to the user <:kom_momida:1090650398194401311>`, ephemeral: true });

            // Add the new role
            levelData[0][`${level}`] = `${role.id}`;

            // Write it to the file
            jsonfile.writeFileSync(
                `./src/json/guild-roles/${interaction.guild.id}.json`,
                levelData,
            );
        } catch {
            // Make the new config into an object
            let newConfig = [{
                [`${level}`]: `${role.id}`,
            }];

            // Create and write the guild roles file
            jsonfile.writeFileSync(
                `./src/json/guild-roles/${interaction.guild.id}.json`,
                newConfig
            );
        };

        // Notification
        await interaction.reply({ content: `Done! I added the role ${role} to the level ${level}!`, ephemeral: true });

        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 5000);
    }
}