const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');
const dotenv = require('dotenv').config();

var timeoutUsers = [];
const imageTypes = ['image/png', 'image/jpg', 'image/jpeg'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile-image')
        .addStringOption(option =>
            option.setName('image').setDescription('Paste the link to the image you want as a background on your profile card').setRequired(true))
        .setDescription('Set a background image for your /rank card! [400px x 500px preferred]'),

    async execute(interaction) {

        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        const url = interaction.options.getString('image');
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const urlPattern = /^(http|https):\/\/[^ "]+$/;

        try {
            if (urlPattern.test(url)) {
                fetch(url, { method: 'HEAD' }).then(async res => {
                    if (!res.ok) return interaction.reply({ content: "I can´t access that website! <:sob:1085192644512206868>", ephemeral: true });

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

                    if (res.headers.get('Content-Type') == 'image/gif') return interaction.reply({ content: "Sorry! I don´t accept GIFs (for now) '^^", ephemeral: true });
                    let isImage = imageTypes.includes(res.headers.get('Content-Type'));

                    if (isImage) {
                        let removeImg = `DELETE FROM profileimg WHERE guildId = '${guildId}' AND userId = '${userId}';`;
                        con.query(removeImg, function (err, result) {
                            if (err) throw err;
                        });

                        // Avoid SQL Injection
                        url = url.replace(/"|'|-|;/g, '');

                        let setImg = `INSERT INTO profileimg (guildId, userId, url) VALUES ('${guildId}', '${userId}', '${url}');`
                        con.query(setImg, function (err, result) {
                            if (err) throw err;
                        })

                        // Add a timeout to the command
                        timeoutUsers.push(interaction.user.id);
                        setTimeout(() => {
                            timeoutUsers.shift();
                        }, 60000)

                        return interaction.reply({ content: "Image recorded in the database :D", ephemeral: true });

                    } else {
                        return interaction.reply({ content: "That doesn´t look like an image to me. (maybe I can´t access the url!) <:confused:1085200665443311757>", ephemeral: true })
                    }

                }).catch(error => {
                    console.log("Error in fetch call => " + error);
                    return interaction.reply({ content: "An error ocurred, please try again! <:naisu:1085263429415215236>", ephemeral: true });
                });
            } else {
                return interaction.reply({ content: "That doesn´t look like an URL to me. (maybe I can´t access the url!) <:confused:1085200665443311757>", ephemeral: true });
            }
        } catch (err) {
            console.log('[RANK-IMG] => ' + err);
            return interaction.reply({ content: "Sorry! There was an internal error, please try again '^^", ephemeral: true });
        }
    }

}