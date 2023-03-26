const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

var timeoutUsers = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.addMentionableOption(option =>
			option.setName('member').setDescription('The member you want to unban c:').setRequired(true))
		.setDescription('Unban a member of the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute(interaction) {

        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

		const member = interaction.options.getMentionable("member");


        const unbannedUser = new EmbedBuilder()
        .setColor('#fc0335')
        .setTitle(`Unbanned ${member.displayName}!`)
        .setDescription(`${member.displayName} was unbanned`)
        .setThumbnail(member.displayAvatarURL())
        .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${interaction.guild.iconURL()}` });

        try {
            await member.unban();

        } catch {
            return await interaction.reply( { content: "I had an error performing the command! Is the user banned...?", ephemeral: true });
        }
        interaction.reply( { embeds: [unbannedUser], ephemeral: true });


        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 10000)
	},
};