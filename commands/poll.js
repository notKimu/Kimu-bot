const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

var timeoutUsers = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
        .addStringOption(option =>
            option.setName('title').setDescription('The title of your poll!').setRequired(true)
        ).addStringOption(option =>
            option.setName('message').setDescription('What do you want to ask?').setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('channel').setDescription('Where do you want to send the poll')
        )
		.setDescription('Let people decide something!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

	async execute(interaction) {
		// Check if user is on timeout
		if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Get input
        const title = interaction.options.getString('title');
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        // Only text channels
        if (channel.type !== 0) {
            return await interaction.reply({ content: `Sorry but the channel must be a text channel! <a:bobo_bobo:1090018396902535199>`, ephemeral: true });
        };

		// Embed
		const iconEmbed = new EmbedBuilder()
			.setColor(interaction.guild.members.me.displayHexColor)
			.setTitle(title)
            .setDescription(message)
			.setFooter({ text: `${interaction.guild.name} - Server`, iconURL: `${interaction.guild.iconURL()}` })
		// Reply with the embed and notification
		const poll = await channel.send({ embeds: [iconEmbed] });
        poll.react('🅰️');
        poll.react('🅱️');
        await interaction.reply({ content: `I sen´t the notification to <#${channel.id}>! <:uwu:1085202610971217940>`, ephemeral: true });

		// Add timeout to the user
		timeoutUsers.push(interaction.user.id);
		setTimeout(() => {
			timeoutUsers.shift();
		}, 30000)
	},
};

/* P E N E */