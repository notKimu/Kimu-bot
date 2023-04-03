const { ChannelType, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

var timeoutUsers = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('question')
        .addIntegerOption(option =>
            option.setName('options').setDescription('How many options do the users have to choose? (max 10)').setRequired(true)
        ).addStringOption(option =>
            option.setName('title').setDescription('The title of your question!').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message').setDescription('What do you want to ask?').setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('channel').setDescription('Where do you want to send the question').addChannelTypes(ChannelType.GuildText)
        )
		.setDescription('Ask something and let people choose between a max of 10 options!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

	async execute(interaction) {
		// Check if user is on timeout
		if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Get input
        const questionCount = interaction.options.getInteger('options');
        const title = interaction.options.getString('title');
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const guildIcon = interaction.guild.iconURL() || "https://cdn.discordapp.com/attachments/1032544028115349564/1090962651661742130/icon.png";

        // Maximum number of options is 10 
        if (questionCount <= 0|| questionCount > 10) return await interaction.reply({ content: `The number of options must be between 1 and 10!`, ephemeral: true });

		// Embed
		const iconEmbed = new EmbedBuilder()
			.setColor(interaction.guild.members.me.displayHexColor)
			.setTitle(title)
            .setDescription(message)
			.setFooter({ text: `${interaction.guild.name} - Server`, iconURL: `${guildIcon}` })
		// Reply with the embed and notification
		const poll = await channel.send({ embeds: [iconEmbed] });

        // The number emojis
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        // Loop through the number of options the user indicated
        for (let i = 0; i < questionCount; i++) {
            await poll.react(emojis[i]);
        };

        // Reply with the confirmation
        await interaction.reply({ content: `Done! I sended the question to <#${channel.id}>! <:uwu:1085202610971217940>`, ephemeral: true });

		// Add timeout to the user
		timeoutUsers.push(interaction.user.id);
		setTimeout(() => {
			timeoutUsers.shift();
		}, 10000)
	},
};

/* P E N E */