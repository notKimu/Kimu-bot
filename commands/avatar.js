const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

var timeoutUsers = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.addUserOption(option =>
			option.setName('member').setDescription('The member of which you want to see the avatar'))
		.setDescription('See your avatar or someone´s else!'),

	async execute(interaction) {
		// Check if user is on timeout
		if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

		// Get input
		const user = interaction.options.getUser('member') || interaction.user;
		const member = await interaction.guild.members.fetch(user.id)

		// Return if user is bot
        if (user.bot) return await interaction.reply({content: 'You can´t see the avatar of a bot!', ephemeral: true});

		// Embed
		const avatarEmbed = new EmbedBuilder()
			.setColor(member.displayHexColor)
			.setTitle(`This is the avatar of ${member.user.username}!`)
            .setDescription(`[PNG](${member.displayAvatarURL({ extension: "png", size: 1024 })}) | [JPG](${member.displayAvatarURL({ extension: "jpg", size: 1024 })}) | [GIF](${member.displayAvatarURL({ extension: "gif", size: 1024 })})`)
			.setImage(member.displayAvatarURL({ extension: "png", size: 1024 }))
			.setFooter({ text: `${interaction.guild.name} - Members`, iconURL: `${interaction.guild.iconURL()}` })
		// Reply
		await interaction.reply({ embeds: [avatarEmbed] });

		// Add user to timeout
		timeoutUsers.push(interaction.user.id);
		setTimeout(() => {
			timeoutUsers.shift();
		}, 30000)
	},
};

/* P E N E */