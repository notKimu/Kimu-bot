const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

var timeoutUsers = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.addMentionableOption(option =>
			option.setName('user').setDescription('The user you want to unban c:').setRequired(true))
		.setDescription('Unban a user of the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Banusers),

	async execute(interaction) {
        // Ckeck if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });
        // Get the user
		const user = interaction.options.getMentionable("user");


        const unbannedUser = new EmbedBuilder()
        .setColor('#fc0335')
        .setTitle(`Unbanned ${user.displayName}!`)
        .setDescription(`${user.displayName} was unbanned`)
        .setThumbnail(user.avatarURL())
        .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${interaction.guild.iconURL()}` });

        try {
            // Unban
            await user.unban();

        } catch {
            // Error
            return await interaction.reply( { content: "I had an error performing the command! Is the user banned...?", ephemeral: true });
        }
        // Notify the user
        interaction.reply( { embeds: [unbannedUser], ephemeral: true });

        // Add timeout
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 10000)
	},
};