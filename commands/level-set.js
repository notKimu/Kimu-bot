const { SlashCommandBuilder, PermissionFlagsBits, DiscordAPIError } = require('discord.js');
const Levels = require('discord-xp');
const jsonfile = require('jsonfile');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-set')
        .addUserOption(option =>
            option.setName('member').setDescription('The member whose level you want to edit').setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('What you want to adjust')
                .setRequired(true)
                .addChoices(
                    { name: 'XP', value: 'XP' },
                    { name: 'level', value: 'level' },
                ))
        .addStringOption(option =>
            option.setName('action')
                .setDescription('What action you want to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'add', value: 'add' },
                    { name: 'adjust', value: 'adjust' },
                    { name: 'subtract', value: 'subtract' },
                ))
        .addIntegerOption(option =>
            option.setName('value')
                .setDescription('What value do you want to use').setRequired(true))

        .setDescription('Edit the level and XP from a user!')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('member');
        if (user.bot) return await interaction.editReply({ content: "Bots can´t have levels!", ephemeral: true })
        try {
            var member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            return await interaction.editReply({ content: "I don´t think that user is from this server! <:michiru_toast:1087450095047409734>", ephemeral: true });
        }
        const target = await Levels.fetch(member.id, interaction.guild.id)
        //Si no encuentra al usuario en la DB devolver
        if (!target) return interaction.editReply({ content: 'Parece que ese usuario no tiene un level aún', ephemeral: true });

        const category = interaction.options.getString('type');
        const action = interaction.options.getString('action');
        const value = interaction.options.getInteger('value');

        let editReply;



        // If the user wants to modify XP
        if (category == "XP") {
            if (action == "add") {
                try {
                    await Levels.appendXp(member.id, interaction.guild.id, value);
                    editReply = `I added **${value}**XP to <@${member.id}>`;
                } catch (err) {
                    console.log('Error adding XP to a user' + err);
                    return await interaction.editReply({ content: "There was an error with the database '^^", ephemeral: true });
                }
            }
            else if (action == "adjust") {
                try {
                    await Levels.setXp(member.id, interaction.guild.id, value);
                    editReply = `<@${member.id}> now has **${value}**XP`;
                } catch (err) {
                    console.log('Error adjusting the XP to a user' + err);
                    return await interaction.editReply({ content: "There was an error with the database '^^", ephemeral: true });
                }
            }
            else if (action == "subtract") {
                try {
                    await Levels.subtractXp(member.id, interaction.guild.id, value);
                    editReply = `I subtracted **${value}**XP from <@${member.id}>`;
                } catch (err) {
                    console.log('Error subtracting XP to a user' + err);
                    return await interaction.editReply({ content: "There was an error with the database '^^", ephemeral: true });
                }
            }
        }

        // If the user wants to modify the level
        if (category == "level") {
            if (action == "add") {
                try {
                    await Levels.appendLevel(member.id, interaction.guild.id, value);
                    editReply = `I added **${value}** levels to <@${member.id}>`;
                } catch (err) {
                    console.log('Error adding levels to a user' + err);
                    return await interaction.editReply({ content: "There was an error with the database '^^", ephemeral: true });
                }
            }
            else if (action == "adjust") {
                try {
                    await Levels.setLevel(member.id, interaction.guild.id, value);
                    editReply = `<@${member.id}> now has level **${value}**`;
                } catch (err) {
                    console.log('Error setting the level to a user' + err);
                    return await interaction.editReply({ content: "There was an error with the database '^^", ephemeral: true });
                }
            }
            else if (action == "subtract") {
                try {
                    await Levels.subtractLevel(member.id, interaction.guild.id, value);
                    editReply = `I subtracted **${value}** levels to <@${member.id}>`;
                } catch (err) {
                    console.log('Error subtracting levels to a user' + err);
                    return await interaction.editReply({ content: "There was an error with the database '^^", ephemeral: true });
                }
            }
        }


        // Try to add roles
        try {
            const levelData = jsonfile.readFileSync(`./src/json/guild-roles/${interaction.guild.id}.json`);
            if (!levelData) return await interaction.editReply({ content: `${editReply}`, ephemeral: true }); 
            const levelNum = Object.keys(levelData[0]);
            const levelIds = Object.values(levelData[0]);
            const targetReload = await Levels.fetch(member.id, interaction.guild.id).then((target) => {
                // Remove all level roles
                try {
                    member.roles.remove(levelIds);
                } catch (error) {
                    return interaction.editReply({ content: `Looks like some of the user roles are over my role '^^`, ephemeral: true });
                }

                // Get the roles that the user will have
                let hehe = 0; // Not a "pro" thing but it does the job and I love it -w-
                let rolesToAdd = [];

                for (let i = 0; hehe < target.level; i++) {
                    if (levelNum[i] > target.level || levelNum[i] === undefined) break;
                    hehe = levelNum[i];
                    rolesToAdd.push(levelIds[i]);
                }

                try {
                    member.roles.add(rolesToAdd);
                } catch (error) {
                    return interaction.editReply({ content: `Looks like some of the user roles are over my role '^^`, ephemeral: true });
                }
        
            }).catch(async (err) => {
                console.log(err);
                return await interaction.editReply({ content: `I had an internal error, sorry '^^`, ephemeral: true });

            });;

        } catch (error) {
            // Add a timeout to the command
            timeoutUsers.push(interaction.user.id);
            setTimeout(() => {
                timeoutUsers.shift();
            }, 120000)

            return await interaction.editReply({ content: `${editReply} but I failed to add the roles, is my role higher than the level roles in the role list? '^^`, ephemeral: true });
        }


        await interaction.editReply({ content: `${editReply}`, ephemeral: true });

        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 120000);
    }
}