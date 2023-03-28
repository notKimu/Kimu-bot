const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const moment = require('moment');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .addUserOption(option =>
            option.setName('member').setDescription('The member you want to ban >:o').setRequired(true))
        .addIntegerOption(option =>
            option.setName('days-delete').setDescription('How many days of messages you want to delete [max 7]'))
        .addStringOption(string =>
            string.setName('reason').setDescription('Reason why you are going to ban this user'))
        .setDescription('Ban a member of the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction, client) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Get user input
        // Return if user is not from the server
        const user = interaction.options.getUser('member') || interaction.user;
        try {
            var member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            return await interaction.reply({ content: "I don´t think that user is from this server! <:michiru_toast:1087450095047409734>", ephemeral: true });
        }
        let deleteMessageDays = interaction.options.getInteger("days-delete");
        if (!deleteMessageDays) deleteMessageDays = 0;
        const reason = interaction.options.getString("reason");


        // Funy stuff
        if (interaction.member.roles.highest.position <= member.roles.highest.position && interaction.user.id != interaction.guild.ownerId) {
            return await interaction.reply({ content: "You can´t ban a user with a role equal or higher than yours! <:michiru_toast:1087450095047409734>", ephemeral: true });
        } else if (member.id === interaction.user.id) {
            return await interaction.reply({ content: "DONT´T DO IT <:angry_cry:1085200458144026644>", ephemeral: true });
        } else if (member.id === interaction.guild.ownerId) {
            return await interaction.reply({ content: "You can´t ban the owner... <:WHAT:1085202011198328862>", ephemeral: true });
        } else if (member.id === client.user.id) {
            return await interaction.reply({ content: "But why... :c", ephemeral: true });
        } else if (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position) {
            return await interaction.reply({ content: "I can´t ban someone with a role higher than me! <:quevrga:1090016365554970634>", ephemeral: true });
        }

        // B A N
        await member.ban({ reason: reason, days: deleteMessageDays }).catch(async () => {
            return await interaction.reply({ content: "Something went wrong while banning the user!", ephemeral: true });
        });

        // The embed
        const bannedUser = new EmbedBuilder()
            .setColor('#fc0335')
            .setTitle(`Banned ${member.displayName}!`)
            .setDescription(`${member.displayName} was banned\n> Joined on **${moment.utc(member.joinedAt).format('DD/MM/YY')}**\n> Reason: ${reason}\n> Days of messages deleted: ${deleteMessageDays}`)
            .setThumbnail(member.displayAvatarURL())
            .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${interaction.guild.iconURL()}` });


        // Send the log and confirmation
        await interaction.reply({ embeds: [bannedUser], ephemeral: true });


        // Add the timeout
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 10000)
    },
};