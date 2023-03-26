const { Events, EmbedBuilder } = require('discord.js');
const Levels = require('discord-xp');
const messages = require('../src/json/level-up-msg.json');
const emojis = require('../src/json/emojis.json');
require('dotenv').config();

module.exports = {
	name: Events.MessageCreate,
	async execute (message) {
                try {
                        if (message.author.bot) return;
                        if (!message.guild) return;

                        function randomNumber(min, max) {
                                min = Math.ceil(min);
                                max = Math.floor(max);
                                return Math.floor(Math.random() * (max - min) + min);
                        };

                        const littleMessage = messages[randomNumber(0, messages.length)];
                        const littleFaces = emojis[randomNumber(0, emojis.length)];

                        const xpMin = 1;
                        const xpMax = 10;
                        const randomXp = randomNumber(xpMin, xpMax);

                        const newLevel = await Levels.appendXp(message.author.id, message.guild.id, randomXp);

                        //El canal al que se enviarán los mensajes al subir nivel
                        var levelChannel = message.client.channels.cache.find(channel => channel.id == process.env.LEVELS)

                        // Get the levels of user
                        const user = await Levels.fetch(message.author.id, message.guild.id);

                        // Levels data
                        var levelNum = [5, 10, 20, 30, 40, 50, 60];
                        var levelIds = ["1085224623102251149", "1085225534159597588", "1085225797574475926",
                        "1085226035580244068", "1085226424060882954", "1085226727380373654", "1085226838529409045"];


                        // Send level up messages
                        if (newLevel) {
                                for (let i = 0; i < levelNum.length; i++) {
                                        if (newLevel && user.level == levelNum[i]) {

                                                let roleID = levelIds[i];

                                                let roleGive = message.member.guild.roles.cache.find(role => role.id == roleID);
                                                message.member.roles.add(roleGive);
                                
                                                const subirNivelEmbed = new EmbedBuilder()
                                                        .setTitle('Sudo apt-get upgrade')
                                                        .setDescription(`${message.member} got upgraded to level **${user.level}** and got access to the role <@&${roleID}>\n` + littleMessage + " " + littleFaces)
                                                        .setColor(message.member.displayHexColor)
                                                        .setFooter({ text: `${message.guild.name} - Levels`, iconURL: `${message.guild.iconURL()}` });
                                
                                                levelChannel.send({ content: `${message.author}`, embeds: [subirNivelEmbed]})
                                                return;
                                        }
                                }
                        
                                const subirNivelEmbed = new EmbedBuilder()
                                        .setTitle('Sudo apt-get update')
                                        .setDescription(`${message.member} got updated to level **${user.level}**\n` + littleMessage + " " + littleFaces)
                                        .setColor(message.member.displayHexColor)
                                        .setFooter({ text: `${message.guild.name} - Levels`, iconURL: `${message.guild.iconURL()}` });
                                        
                                levelChannel.send({ content: `${message.author}`, embeds: [subirNivelEmbed]});
                        }
                } catch (err) {
                        console.log("Error proccesing a message => " + err);
                }
        }
}