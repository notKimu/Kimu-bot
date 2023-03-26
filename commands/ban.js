const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

var timeoutUsers = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.addMentionableOption(option =>
			option.setName('member').setDescription('The member you want to ban >:o').setRequired(true))
        .addStringOption(string => 
            string.setName('reason').setDescription('Reason why yo are going to ban this user'))
		.setDescription('Ban a member of the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute(interaction, client) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Get user input
		const member = interaction.options.getMentionable("member");
		const reason = interaction.options.getString("reason");

        // The embed
        const bannedUser = new EmbedBuilder()
        .setColor('#fc0335')
        .setTitle(`Banned ${member.displayName}!`)
        .setDescription(`${member.displayName} was banned\n> Joined on <t:${member.joinedAt}:R>\n> Reason: ${reason}`)
        .setThumbnail(member.displayAvatarURL())
        .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${interaction.guild.iconURL()}` });

        try {
            // Funy stuff
            if (interaction.member.roles.highest.position <= member.roles.highest.position && interaction.user.id != interaction.guild.ownerId) {
                return await interaction.reply( { content: "You can´t ban a user with a role equal or higher than yours! <:michiru_toast:1087450095047409734>", ephemeral: true });
            } else if (member.id === interaction.user.id) {
                return await interaction.reply( { content: "DONT´T DO IT <:angry_cry:1085200458144026644>", ephemeral: true });
            } else if (member.id === interaction.guild.ownerId) {
                return await interaction.reply( { content: "You can´t ban the owner... <:WHAT:1085202011198328862>", ephemeral: true });
            } else if (member.id === client.user.id) {
                return await interaction.reply( { content: "But why... :c", ephemeral: true });
            }
            // B A N
            await member.ban(reason);
        } catch {
            // Error
            return interaction.reply( { content: "Something went wrong while banning the user, try again! ", ephemeral: true });
        }
        // Send the embed
        interaction.reply( { embeds: [bannedUser], ephemeral: true });

        // Add the timeout
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 10000)
	},
};