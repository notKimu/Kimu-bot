const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// The role play array
const rolePlayArray = require("../src/json/roleplay.json");

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('Comfort someone by patting them ^^')
        .addUserOption(option =>
            option.setName('member').setDescription('The person you want to pat c:').setRequired(true)),


    async execute(interaction) {

        // Check if user is on cooldown
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Function to get a random value
        function randomValue(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        };

        // Get the member to pat
        const user = interaction.options.getUser('member');
        try {
            var member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            return await interaction.reply({ content: "I don´t think that user is from this server! <:michiru_toast:1087450095047409734>", ephemeral: true });
        };

        if (member === interaction.member) return interaction.reply({ content: 'You want to pat yourself??', ephemeral: true });
        if (member.bot) return interaction.reply({ content: 'You can´t pat a bot, that´s dangerous!', ephemeral: true });

        // Get the gifs from the aray
        let patGifs = rolePlayArray[0].images.pats;

        // The embed with a random gif
        const patEmbed = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setImage(patGifs[randomValue(0, patGifs.length)])
            .setFooter({ text: `${interaction.guild.name} - Role Play`, iconURL: `${interaction.guild.iconURL()}` });
        // Reply
        await interaction.reply({ content: `**${interaction.member.displayName}** pats ${member} uwu`, embeds: [patEmbed] });


        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 30000)
    },
};