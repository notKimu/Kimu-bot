const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .addMentionableOption(option =>
            option.setName('member').setDescription('The member you want to ban >:o').setRequired(true))
        .addStringOption(string =>
            string.setName('reason').setDescription('Reason why you are going to ban this user'))
        .setDescription('Ban a member of the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction, client) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Get user input
        // Return if user is not from the server
		const user = interaction.options.getUser('member') || interaction.user;
        try {
            var member = await interaction.guild.members.fetch(user.id);
          } catch (error) {
            return await interaction.reply({ content: "I don´t think that user is from this server! <:michiru_toast:1087450095047409734>", ephemeral: true });
          }
        const reason = interaction.options.getString("reason");


        // Funy stuff
        if (interaction.member.roles.highest.position <= member.roles.highest.position && interaction.user.id != interaction.guild.ownerId) {
            return await interaction.reply({ content: "You can´t ban a user with a role equal or higher than yours! <:michiru_toast:1087450095047409734>", ephemeral: true });
        } else if (member.id === interaction.user.id) {
            return await interaction.reply({ content: "DONT´T DO IT <:angry_cry:1085200458144026644>", ephemeral: true });
        } else if (member.id === interaction.guild.ownerId) {
            return await interaction.reply({ content: "You can´t ban the owner... <:WHAT:1085202011198328862>", ephemeral: true });
        } else if (member.id === client.user.id) {
            return await interaction.reply({ content: "But why... :c", ephemeral: true });
        } else if (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position) {
            return await interaction.reply({ content: "I can´t ban someone with a role higher than me! <:quevrga:1090016365554970634>", ephemeral: true });
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
                // B A N
                await member.ban(reason);
            } catch (err) {
                // Error
                console.log(err)
                return interaction.reply({ content: "Something went wrong while banning the user, try again!", ephemeral: true });
            }

            // The embed
            const bannedUser = new EmbedBuilder()
                .setColor('#fc0335')
                .setTitle(`Banned ${member.displayName}!`)
                .setDescription(`${member.displayName} was banned\n> Joined on <t:${member.joinedAt}:R>\n> Reason: ${reason}`)
                .setThumbnail(member.displayAvatarURL())
                .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${interaction.guild.iconURL()}` });


            // Send the log and confirmation
            await interaction.reply({ embeds: [bannedUser], ephemeral: true });
            // Send log if the log channel is configured
            if (channelSetted) {
                // Fetch log channel
                const logChannel = interaction.guild.client.channels.cache.find(channel => channel.id === channelSetted);
                // The Log
                const logBan = new EmbedBuilder()
                    .setColor('#fc0335')
                    .setTitle(`Banned ${member.displayName}!`)
                    .setDescription(`${member.displayName} was banned\n> Joined on <t:${member.joinedAt}:R>\n> Reason: ${reason}\nModerator: <@${interaction.member.id}>`)
                    .setThumbnail(member.displayAvatarURL())
                    .setFooter({ text: `${interaction.guild.name} - Moderation`, iconURL: `${interaction.guild.iconURL()}` });
                // Send
                await logChannel.send({ embeds: [logBan] });
            }


            // Add the timeout
            timeoutUsers.push(interaction.user.id);
            setTimeout(() => {
                timeoutUsers.shift();
            }, 10000)
        }).catch(err => console.log("Error on ban => " + err));
    },
};