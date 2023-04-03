const { Events } = require('discord.js');
const fs = require('fs');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`I haven´t found any command matching [ ${interaction.commandName} ]`);
			return;
		}

		try {
			await command.execute(interaction, interaction.client);
		} catch (error) {
			console.error(`[WARNING] I had an error executing this command: ${interaction.commandName}`);
			console.error(error);
			fs.appendFile('../src/err/error.log', `/ An error ocurred at ${interaction.commandName} => ${error} /`);
			return interaction.reply({ content: "Sorry! There was an internal error, please try again '^^", ephemeral: true });
		}
	},
};