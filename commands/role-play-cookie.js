const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
//Base de datos del Roleo
const rolePlayArray = require("../src/json/roleplay.json");

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cookie')
        .setDescription('Give a cookie to someone to make them feel better :D')
        .addUserOption(option =>
            option.setName('member').setDescription('Member to which you want to give the cookie').setRequired(true)),


    async execute(interaction) {

        // Check if user is on cooldown
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Function to get a random value
        function randomValue(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        };

        // Get the member to give a cookie
        const user = interaction.options.getUser('member');
        try {
            var member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            return await interaction.reply({ content: "I don´t think that user is from this server! <:michiru_toast:1087450095047409734>", ephemeral: true });
        }

        let gaveMeACookie = "";
        if (member == interaction.guild.members.me) gaveMeACookie = "Thanks <3"; // Thank the user if they give me a cookie -w-
        if (member == interaction.member) return interaction.reply({ content: 'You can´t give a cookie to yourself, that´s very selfish!', ephemeral: true });
        if (member.bot) return interaction.reply({ content: 'You can´t give a cookie to a bot, they can´t eat, goofy!', ephemeral: true });

        // Get the gifs from the array
        let cookieGifs = rolePlayArray[0].images.cookies;

        // The embed with a random gif
        const cookieEmbed = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setImage(cookieGifs[randomValue(0, cookieGifs.length)])
            .setFooter({ text: `${interaction.guild.name} - Role Play`, iconURL: `${interaction.guild.iconURL()}` });

        await interaction.reply({ content: `**${interaction.member.displayName}** gave a cookie to ${member} ${gaveMeACookie} owo`, embeds: [cookieEmbed] });

        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 30000)
    },
};