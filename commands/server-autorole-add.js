const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const jsonfile = require('jsonfile');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole-add')
        .addRoleOption(option =>
            option.setName('role').setDescription('The role you want to give when a user joins the server').setRequired(true))
        .setDescription('Give a role when a user joins the server!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        //Get user input
        const role = interaction.options.getRole('role');

        // If role is higher than my role return a warning
        if (role.position > interaction.guild.members.me.roles.highest.position) return await interaction.reply({ content: `Hey! Looks like that role is higher than my role in the role list, I can´t give it to the user <:kom_momida:1090650398194401311>`, ephemeral: true });


        // Try to write to existing file or create it
        try {
            // Read the guild autoroles JSON, YES, JSOOOON
            let autoRoleData = jsonfile.readFileSync(`./src/json/guild-autoroles/${interaction.guild.id}.json`);


            // Add the new role
            autoRoleData.push(role.id);

            // Write it to the file
            jsonfile.writeFileSync(
                `./src/json/guild-autoroles/${interaction.guild.id}.json`,
                autoRoleData,
            );
        } catch {
            // Make the new config into an object
            let newConfig = [role.id]

            // Create and write the guild roles file
            jsonfile.writeFileSync(
                `./src/json/guild-autoroles/${interaction.guild.id}.json`,
                newConfig
            );
        };

        // Notification
        await interaction.reply({ content: `Done! Now I will give the role ${role} when a user joins the server!`, ephemeral: true });

        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 5000);
    }
}