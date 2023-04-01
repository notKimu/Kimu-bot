const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .addUserOption(option =>
            option.setName('id').setDescription('The ID of the user you want to unban :D').setRequired(true))
        .addStringOption(string =>
            string.setName('reason').setDescription('Why are you going to unban this user'))
        .setDescription('Pardon the sins of a banned user')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction, client) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return await interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Get user input
        const user = interaction.options.getUser('id');
        const reason = interaction.options.getString("reason");
        const guildIcon = interaction.guild.iconURL() || "https://cdn.discordapp.com/attachments/1032544028115349564/1090962651661742130/icon.png";

        // Funy stuff
        if (user.id === interaction.user.id) {
            return await interaction.reply({ content: "Ok... Wait you are not banned.", ephemeral: true });
        } else if (user.id === interaction.guild.ownerId) {
            return await interaction.reply({ content: "Why you want to unban the owner?... <:WHAT:1085202011198328862>", ephemeral: true });
        } else if (user.id === client.user.id) {
            return await interaction.reply({ content: "I´m not banned...", ephemeral: true });
        }


        // U N B A N
        await interaction.guild.members.unban(user.id, reason).catch(async () => {
            return await interaction.reply({ content: "Something went wrong while unbanning the user, is he really banned?!", ephemeral: true });
        });

        // The embed
        const unbannedUser = new EmbedBuilder()
            .setColor('#fc0335')
            .setTitle(`Unbanned **${user.username}**!`)
            .setDescription(`**${user.username}** was unbanned\n> Reason: ${reason}`)
            .setThumbnail(user.avatarURL())
            .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${guildIcon}` });


        // Send the log and confirmation
        await interaction.reply({ embeds: [unbannedUser], ephemeral: true });

        // Add the timeout
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 10000)
    },
};