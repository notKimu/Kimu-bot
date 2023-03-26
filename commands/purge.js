const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

var timeoutUsers = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.addIntegerOption(option =>
			option.setName('messages').setDescription('Ammount of messages to delete').setRequired(true))
		.setDescription('Bulk delete messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

	async execute(interaction) {
        // Check if user is on cooldown
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });
        // Get input
		const ammountMessages = interaction.options.getInteger('messages');

        // Avoid deleting too much messages or 0
        if (ammountMessages > 100 || ammountMessages < 1) {
            return interaction.reply({content: '¡You must choose a number between **1** and **100**!', ephemeral: true});
        }

        // Delete the messages and if there is an error send it
        await interaction.channel.bulkDelete(ammountMessages).catch(err => {
            return interaction.reply({content: 'I couldn´t delete all that messages, blame it on discord :c', ephemeral: true});
        })

        // Notify user
        await interaction.reply({content: `¡I´ve deleted **${ammountMessages}** messages!`, ephemeral: true})

        // Add timeout
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 10000)
	},
};