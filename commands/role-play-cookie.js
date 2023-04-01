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

        //Función para escoger un número entre dos valores (min y max)
        function randomValue(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        };

        //Obtener al member que se quiere abrazar
        const user = interaction.options.getUser('member');
        try {
            var member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            return await interaction.reply({ content: "I don´t think that user is from this server! <:michiru_toast:1087450095047409734>", ephemeral: true });
        }

        if (member == interaction.member) return interaction.reply({ content: 'No te puedes dar una galletita a tí mism@', ephemeral: true });

        //Obtener la lista del array en el JSON
        let cookieGifs = rolePlayArray[0].images.cookies;

        //El embed con el gif correspondiente
        const cookieEmbed = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setImage(cookieGifs[randomValue(0, cookieGifs.length)])
            .setFooter({ text: `${interaction.guild.name} - Role Play`, iconURL: `${interaction.guild.iconURL()}` });

        await interaction.reply({ content: `**${interaction.member.displayName}** gave a cookie to ${member} owo`, embeds: [cookieEmbed] });

        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 30000)
    },
};