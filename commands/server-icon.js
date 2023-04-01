const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

var timeoutUsers = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server-icon')
		.setDescription('Whatch the icon of the server in all it´s glory!'),

	async execute(interaction) {
		// Check if user is on timeout
		if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

		// Get the guild icon, cause discord
        const guildIcon = interaction.guild.iconURL() || "https://cdn.discordapp.com/attachments/1032544028115349564/1090962651661742130/icon.png";

		// Embed
		const iconEmbed = new EmbedBuilder()
			.setColor(interaction.guild.members.me.displayHexColor)
			.setTitle(`This is the icon of ${interaction.guild.name}!`)
            .setDescription(`[PNG](${interaction.guild.iconURL({ extension: "png", size: 1024 })}) | [JPG](${interaction.guild.iconURL({ extension: "jpg", size: 1024 })}) | [GIF](${interaction.guild.iconURL({ extension: "gif", size: 1024 })})`)
			.setImage(interaction.guild.iconURL({ extension: "png", size: 1024 }))
			.setFooter({ text: `${interaction.guild.name} - Server`, iconURL: `${guildIcon}` })
		// Reply with the embed
		await interaction.reply({ embeds: [iconEmbed] });

		// Add timeout to the user
		timeoutUsers.push(interaction.user.id);
		setTimeout(() => {
			timeoutUsers.shift();
		}, 30000)
	},
};

/* P E N E */