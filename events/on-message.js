const { Events, EmbedBuilder } = require('discord.js');
const Levels = require('discord-xp');
const mysql = require('mysql');
const messages = require('../src/json/level-up-msg.json');
const emojis = require('../src/json/emojis.json');
require('dotenv').config();

module.exports = {
        name: Events.MessageCreate,
        async execute(message) {
                // Don´t continue if is a bot or MD
                if (message.author.bot) return;
                if (!message.guild) return;

                // Random function
                function randomNumber(min, max) {
                        min = Math.ceil(min);
                        max = Math.floor(max);
                        return Math.floor(Math.random() * (max - min) + min);
                };

                // Some randomization -w-
                const littleMessage = messages[randomNumber(0, messages.length)];
                const littleFaces = emojis[randomNumber(0, emojis.length)];

                const xpMin = 1; // Min XP
                const xpMax = 10; // Max XP
                const randomXp = randomNumber(xpMin, xpMax); // Gets a random number between those 2

                // Append the XP
                const newLevel = await Levels.appendXp(message.author.id, message.guild.id, randomXp);


                // Get the levels of user
                const user = await Levels.fetch(message.author.id, message.guild.id);

                // Levels data
                const levelNum = [5, 10, 20, 30, 40, 50, 60];
                const levelIds = ["1085224623102251149", "1085225534159597588", "1085225797574475926",
                        "1085226035580244068", "1085226424060882954", "1085226727380373654", "1085226838529409045"];


                // Send level up messages
                if (newLevel) {
                        // Database Connection
                        var con = mysql.createPool({
                                host: "localhost",
                                user: "kami",
                                password: process.env.DBPASS,
                                database: "kamidb"
                        });
                        con.getConnection(function (err) {
                                if (err) throw err;
                        });

                        function getLevelChannel() {
                                return new Promise((resolve, reject) => {
                                        con.getConnection(async function (err) {
                                                if (err) {
                                                        reject(err);
                                                        return;
                                                }

                                                con.query('SELECT channel FROM levelup WHERE guildId = ?', [message.guild.id], function (err, result) {
                                                        if (err) {
                                                                reject(err);
                                                                return;
                                                        };
                                                        try {
                                                                // Get the URL
                                                                resolve(result[0].channel);
                                                        } catch (error) {
                                                                // If error use default image
                                                                resolve(message.guild.systemChannel.id);
                                                        }

                                                });
                                        });
                                })
                        }

                        getLevelChannel().then(async result => {
                                const levelChannel = message.client.channels.cache.find(channel => channel.id === result);

                                for (let i = 0; i < levelNum.length; i++) {
                                        // If new level and new role
                                        if (newLevel && user.level == levelNum[i]) {

                                                let roleID = levelIds[i];

                                                let roleGive = message.member.guild.roles.cache.find(role => role.id === roleID);
                                                message.member.roles.add(roleGive);

                                                const subirNivelEmbed = new EmbedBuilder()
                                                        .setTitle('Sudo apt-get upgrade')
                                                        .setDescription(`${message.member} got upgraded to level **${user.level}** and got access to the role <@&${roleID}>\n` + littleMessage + " " + littleFaces)
                                                        .setColor(message.member.displayHexColor)
                                                        .setFooter({ text: `${message.guild.name} - Levels`, iconURL: `${message.guild.iconURL()}` });
                                                // Send
                                                return await levelChannel.send({ content: `${message.author}`, embeds: [subirNivelEmbed] })
                                        }
                                }
                                // Normal level up
                                const subirNivelEmbed = new EmbedBuilder()
                                        .setTitle('Sudo apt-get update')
                                        .setDescription(`${message.member} got updated to level **${user.level}**\n` + littleMessage + " " + littleFaces)
                                        .setColor(message.member.displayHexColor)
                                        .setFooter({ text: `${message.guild.name} - Levels`, iconURL: `${message.guild.iconURL()}` });
                                // Send
                                return await levelChannel.send({ content: `${message.author}`, embeds: [subirNivelEmbed] });
                        }).catch(error => {
                                console.log("Error proccesing a message => " + error);
                        })

                }
        }
}