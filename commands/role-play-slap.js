const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// The role play array
const rolePlayArray = require("../src/json/roleplay.json");

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slap')
        .setDescription('Slap someone and give them a taste of their own medicine c:<')
        .addUserOption(option =>
            option.setName('member').setDescription('The person you want to slap').setRequired(true)),


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

        // If they want to slap me
        if (member === interaction.guild.members.me) return await interaction.reply({ content: "Good try but no hehe", ephemeral: true });
        if (member === interaction.member) return interaction.reply({ content: 'You want to slap yourself?!?', ephemeral: true });
        if (member.bot) return interaction.reply({ content: 'You can´t slap a bot, that´s very dangerous! Trust me.', ephemeral: true });

        // Get the gifs from the aray
        const slapGifs = rolePlayArray[0].images.slaps;

        // The embed with a random gif
        const patEmbed = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setImage(slapGifs[randomValue(0, slapGifs.length)])
            .setFooter({ text: `${interaction.guild.name} - Role Play`, iconURL: `${interaction.guild.iconURL()}` });
        // Reply
        await interaction.reply({ content: `**${interaction.member.displayName}** slapped ${member} c:<`, embeds: [patEmbed] });


        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 30000)
    },
};