const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// The role play array
const rolePlayArray = require("../src/json/roleplay.json");

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Kiss someone to show how much you love them!')
        .addUserOption(option =>
            option.setName('member').setDescription('Who do you want to kiss c:').setRequired(true)),


    async execute(interaction) {

        // Check if user is on cooldown
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Function to get a random value
        function randomValue(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        };

        // Get the member to kiss
        const user = interaction.options.getUser('member');
        try {
            var member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            return await interaction.reply({ content: "I don´t think that user is from this server! <:michiru_toast:1087450095047409734>", ephemeral: true });
        };

        if (member === interaction.member) return interaction.reply({ content: 'You sure you want to kiss yourself?', ephemeral: true });
        if (member.bot) return interaction.reply({ content: 'You can´t kiss a bot, I mean you can... But no', ephemeral: true });

        // Get the gifs from the aray
        let kissGifs = rolePlayArray[0].images.kisses;

        // The embed with a random gif
        const kissEmbed = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setImage(kissGifs[randomValue(0, kissGifs.length)])
            .setFooter({ text: `${interaction.guild.name} - Role Play`, iconURL: `${interaction.guild.iconURL()}` });
        // Reply
        await interaction.reply({ content: `**${interaction.member.displayName}** kissed ${member} ewe`, embeds: [kissEmbed] });


        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 30000)
    },
};