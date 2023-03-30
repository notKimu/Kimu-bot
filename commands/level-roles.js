const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-config')
        .addStringOption(option =>
            option.setName('config').setDescription('Use: <"levelNumber": "roleId", "levelNumber": "roleId", ...>').setRequired(true))
        .setDescription('Choose what roles to give at the levels you want!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        //Get user input
        if (interaction.options.getString('config') === "delete") {
            fs.unlinkSync(`./src/json/guild-roles/${interaction.guild.id}.json`);
            return await interaction.reply({ content: `I removed all the level roles!`, ephemeral: true });
        }
        const userInput = `[{${interaction.options.getString('config')}}]`;
        let configRaw;
        try {
            configRaw = JSON.parse(userInput);
        } catch (error) {
            return await interaction.reply({ content: `Invalid configuration! Please check the docs to better understand this command, I know it´s sketchy '^^`, ephemeral: true });
        }
        try {
            // The level config keys and values
            const levelData = configRaw;
            const levelNum = Object.keys(levelData[0]);
            const levelIds = Object.values(levelData[0]);

            // Check if it´s valid and prepare the reply
            let roles = "";
            for (index in levelNum) {
                console.log(await interaction.guild.roles.cache.find(role => role.id === levelIds[index]))
                if (await interaction.guild.roles.cache.find(role => role.id === levelIds[index]) === undefined) return await interaction.reply({ content: `Hmmmm... I think '${levelIds[index]}' is not a valid role!`, ephemeral: true });
                if (isNaN(levelNum[index]) || levelNum[index] > 200 || levelNum[index] <= 0) return await interaction.reply({ content: `Hmmmm... I think '${levelNum[index]}' is not a valid level! [Level must be a number between 1 and 200!]`, ephemeral: true });
    
                roles += `> Level ${levelNum[index]}: <@&${levelIds[index]}>\n`;
            }

            // Try to write the config
            try {
                fs.writeFileSync(`./src/json/guild-roles/${interaction.guild.id}.json`, JSON.stringify(configRaw));
                fs.readFileSync(`./src/json/guild-roles/${interaction.guild.id}.json`);
            } catch (error) {
                return await interaction.reply({ content: `Invalid configuration! Please check the docs to better understand this command, I know it´s sketchy '^^`, ephemeral: true });
            }
            // Notification
            await interaction.reply({ content: `Done! This is the new role configuration:\n${roles}`, ephemeral: true })
        } catch (error) {
            // Bad config
            return await interaction.reply({ content: `Invalid configuration! Please check the docs to better understand this command, I know it´s sketchy '^^`, ephemeral: true });
        }


        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 60000);
    }
}