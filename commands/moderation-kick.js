const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .addMentionableOption(option =>
            option.setName('member').setDescription('The member you want to kick >:o').setRequired(true))
        .addStringOption(string =>
            string.setName('reason').setDescription('Reason why you are going to kick this user'))
        .setDescription('kick a member out of the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction, client) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Get user input
		const user = interaction.options.getUser('member') || interaction.user;
        // Return if user is not from the server
        try {
            var member = await interaction.guild.members.fetch(user.id);
          } catch (error) {
            return await interaction.reply({ content: "I don´t think that user is from this server! <:michiru_toast:1087450095047409734>", ephemeral: true });
          }
        const reason = interaction.options.getString("reason");


        // Funy stuff
        if (interaction.member.roles.highest.position <= member.roles.highest.position && interaction.user.id != interaction.guild.ownerId) {
            return await interaction.reply({ content: "You can´t kick a user with a role equal or higher than yours! <:michiru_toast:1087450095047409734>", ephemeral: true });
        } else if (member.id === interaction.user.id) {
            return await interaction.reply({ content: "DONT´T DO IT <:angry_cry:1085200458144026644>", ephemeral: true });
        } else if (member.id === interaction.guild.ownerId) {
            return await interaction.reply({ content: "You can´t kick the owner... <:WHAT:1085202011198328862>", ephemeral: true });
        } else if (member.id === client.user.id) {
            return await interaction.reply({ content: "... :c", ephemeral: true });
        } else if (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position) {
            return await interaction.reply({ content: "I can´t kick someone with a role higher than me! <:quevrga:1090016365554970634>", ephemeral: true });
        }

        // DB Connection
        var con = mysql.createPool({
            host: "localhost",
            user: "kami",
            password: process.env.DBPASS,
            database: "kamidb"
        });
        con.getConnection(function (err) {
            if (err) throw err;
        });

        // Get log channel
        function getLogChannel() {
            return new Promise((resolve, reject) => {
                con.getConnection(async function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    con.query('SELECT channel FROM log WHERE guildId = ?', [interaction.guild.id], function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        };
                        try {
                            // Get the thingys
                            resolve(result[0].channel);
                        } catch (error) {
                            // If error there is no log channel configured
                            resolve(false);
                        }

                    });
                });
            })
        }

        // Main
        getLogChannel().then(async channelSetted => {
            try {
                // K I C K
                await member.kick(reason);
            } catch {
                // Error
                return interaction.reply({ content: "Something went wrong while kicking the user, try again!", ephemeral: true });
            }

            // The embed
            const kickedUser = new EmbedBuilder()
                .setColor('#fc0335')
                .setTitle(`Kicked ${member.displayName}!`)
                .setDescription(`${member.displayName} was kicked\n> Joined on <t:${member.joinedAt}:R>\n> Reason: ${reason}`)
                .setThumbnail(member.displayAvatarURL())
                .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${interaction.guild.iconURL()}` });


            // Fetch the log channel if there is one configured
            await interaction.reply({ embeds: [kickedUser], ephemeral: true });

            // Send log if there is log channel setted
            if (channelSetted) {
                // Fetch log channel
                const logChannel = interaction.guild.client.channels.cache.find(channel => channel.id === channelSetted);
                // The Log
                const logKick = new EmbedBuilder()
                    .setColor('#fc0335')
                    .setTitle(`Kicked ${member.displayName}!`)
                    .setDescription(`${member.displayName} was kicked\n> Joined on <t:${member.joinedAt}:R>\n> Reason: ${reason}\nModerator: <@${interaction.member.id}>`)
                    .setThumbnail(member.displayAvatarURL())
                    .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${interaction.guild.iconURL()}` });
                // Send
                await logChannel.send({ embeds: [logKick] });
            }


            // Add the timeout
            timeoutUsers.push(interaction.user.id);
            setTimeout(() => {
                timeoutUsers.shift();
            }, 10000)
        }).catch(err => console.log("Error on kick => " + err));
    },
};