const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .addUserOption(option =>
            option.setName('member').setDescription('The member you want to mute c:<').setRequired(true))
        .addIntegerOption(option =>
            option.setName('time-unit')
                .setDescription('The unit of time you want to use')
                .setRequired(true)
                .addChoices(
                    { name: 'Minutes', value: 60 },
                    { name: 'Hours', value: 3600 },
                    { name: 'Days', value: 86400 },
                ).setRequired(true))
        .addIntegerOption(string =>
            string.setName('time').setDescription('How many > minutes < you want to mute the member').setRequired(true))
        .addStringOption(string =>
            string.setName('reason').setDescription('Why you want to mute the user'))
        .setDescription('Shut up a member for an ammount of time!')
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

    async execute(interaction, client) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Get user input
        const user = interaction.options.getUser('member') || interaction.user;
        // Return if user is not from the server
        try {
            var member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            return await interaction.reply({ content: "I don´t think that user is from this server! <:michiru_toast:1087450095047409734>", ephemeral: true });
        }
        const time = interaction.options.getInteger("time");
        const timeUnit = interaction.options.getInteger("time-unit");
        const reason = interaction.options.getString("reason");

        // Max is 20 days and minimum 1 of something
        if (time * timeUnit * 1000 > "1728000000") {
            return await interaction.reply({ content: "You can´t timeout for more than 20 days!", ephemeral: true });
        } else if (time * timeUnit * 1000 === 0) {
            return await interaction.reply({ content: "You can´t timeout for less than 0 something!??", ephemeral: true });
        };

        // Funy stuff
        if (interaction.member.roles.highest.position <= member.roles.highest.position && interaction.user.id != interaction.guild.ownerId) {
            return await interaction.reply({ content: "You can´t mute a user with a role equal or higher than yours! <:michiru_toast:1087450095047409734>", ephemeral: true });
        } else if (member.id === interaction.user.id) {
            return await interaction.reply({ content: "DONT´T DO IT <:angry_cry:1085200458144026644>", ephemeral: true });
        } else if (member.id === interaction.guild.ownerId) {
            return await interaction.reply({ content: "You can´t mute the owner... <:WHAT:1085202011198328862>", ephemeral: true });
        } else if (member.id === client.user.id) {
            return await interaction.reply({ content: "...nou :c", ephemeral: true });
        } else if (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position) {
            return await interaction.reply({ content: "I can´t mute someone with a role higher than me! <:quevrga:1090016365554970634>", ephemeral: true });
        }


        // M U T E
        await member.timeout(time * timeUnit * 1000, reason).catch(async () => {
            return await interaction.reply({ content: "Something went wrong while muting the user!", ephemeral: true });
        });

        // Get the time unit
        let timeAmmount = "";
        if (timeUnit === 60) {
            timeAmmount = "minutes";
        } else if (timeUnit === 3600) {
            timeAmmount = "hours";
        } else {
            timeAmmount = "days";
        };

        // The embed
        const mutedMember = new EmbedBuilder()
            .setColor('#fc0335')
            .setTitle(`Muted ${member.displayName} for **${time}** ${timeAmmount}!`)
            .setDescription(`${member.displayName} was muted\n> Muted for **${time}** ${timeAmmount}\n> Reason: ${reason}`)
            .setThumbnail(member.displayAvatarURL())
            .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${interaction.guild.iconURL()}` });


        // Fetch the log channel if there is one configured
        await interaction.reply({ embeds: [mutedMember], ephemeral: true });

        // Add the timeout
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 10000)
    },
};