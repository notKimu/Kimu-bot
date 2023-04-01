const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Niveles = require('discord-xp');

var timeoutUsers = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
        .setDescription('Watch the progress of the top 10 users!'),

	async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });
        
        // Get the guild icon, cause discord
        const guildIcon = interaction.guild.iconURL() || "https://cdn.discordapp.com/attachments/1032544028115349564/1090962651661742130/icon.png";

        // Get the guild leaderboard
        const rankingRaw = await Niveles.fetchLeaderboard(interaction.guild.id, 10);
        if (rankingRaw.length < 1) return interaction.reply({ content: 'This server doesn´t have a leaderboard, for now...', ephemeral: true});

        // Compute leaderboard
        const ranking = await Niveles.computeLeaderboard(
            interaction.client,
            rankingRaw,
            true
        );

        // Map the users
        const rankingFinal = ranking.map(
            (e) => `${e.position} - **${e.username}**\n> Level: **${e.level}** - XP: **${e.xp}**`
        )

        // Embed
        const embedLeaderboard = new EmbedBuilder()
            .setTitle(`**${interaction.guild.name}'s leaderboard**`)
            .setColor(interaction.guild.members.me.displayHexColor)
            .setDescription(`\n${rankingFinal.join('\n\n')}`)
            .setThumbnail(guildIcon)
            .setFooter({ text: `${interaction.guild.name} - Levels`, iconURL: `${guildIcon}` });
        // Send the embed
        await interaction.reply({ embeds: [embedLeaderboard] });

        // Add timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
          timeoutUsers.shift();
        }, 20000)
        
	},
};