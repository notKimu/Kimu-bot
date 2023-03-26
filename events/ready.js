const { Events } = require('discord.js');
const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv').config();
const fs = require('node:fs');


module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
        const commands = [];
        // Read all commands
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
	        const command = require(`../commands/${file}`);
	        commands.push(command.data.toJSON());
        }

        // REST Module
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        // D E P L O Y
        (async () => {
	    try {
		    console.log(`Refreshing ${commands.length} (/) commands, hold on...`);

		    // Refresh commands
		    const data = await rest.put(
                Routes.applicationCommands(process.env.clientId),
                { body: commands },
            );

		    console.log(`I have successfully refreshed ${data.length} (/) commands c:`);
	        } catch (error) {
		        // errores
		        console.error(error);
	        }
        })();

		console.log(`¡${client.user.tag} is on and ready!`);
	},
};