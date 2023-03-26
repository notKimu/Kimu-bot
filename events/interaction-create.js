const { Events } = require('discord.js');

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
			return interaction.reply("Sorry! There was an internal error, please try again '^^");
		}
	},
};