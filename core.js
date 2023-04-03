// Cute logo thingy, yes, it´s more important than the rest!
console.log("    __ __ ______  _____  __   ____  _____ ______");
console.log("   / //_//  _/  |/  / / / /  / __ )/ __  /_  __/");
console.log("  / ,<   / // /|_/ / / / /  / __  / / / / / /   ");
console.log(" / /| |_/ // /  / / /_/ /  / /_/ / /_/ / / /    ");
console.log("/_/ |_/___/_/  /_/_____/  /_____/\_____/ /_/    ");
console.log("                                 Beta 0.3 -w-   ");
console.log("                                                ");
/* ----------------------------------------------- */

const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js')
const mongoose = require('./database/mondongo.js');
const dbcheck = require('./database/database-checkup');
const Niveles = require('discord-xp');
const dotenv = require('dotenv').config();

// Create the client instance
const client = new Client({
	intents: [GatewayIntentBits.DirectMessages,
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildPresences,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildEmojisAndStickers,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildModeration,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.DirectMessageTyping]
});



// Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


// Commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} doesn´t have a necessary "data" or "execute" property.`);
	}
}

//MONDONGO DB Connection
Niveles.setURL(process.env.MONDONGO);
mongoose.init();

// Log in to Discord ----------------
client.login(process.env.TOKEN); // |
// ---------------------------------