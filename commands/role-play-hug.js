const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// The role play array
const rolePlayArray = require("../src/json/roleo.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Hug someone and make them feel loved!')
        .addUserOption(option =>
            option.setName('member').setDescription('Who do you want to hug c:').setRequired(true)),


    async execute(interaction) {

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
        };

        if (member === interaction.member) return interaction.reply({ content: 'It´s very sad to hug yourself :c', ephemeral: true });

        //Obtener la lista del array en el JSON
        let hugGifs = rolePlayArray[0].images.hugs;

        //El embed con el gif correspondiente
        const abrazoEmbed = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setImage(hugGifs[randomValue(0, hugGifs.length)])
            .setFooter({ text: `${interaction.guild.name} - Role Play`, iconURL: `${interaction.guild.iconURL()}` });

        await interaction.reply({ content: `**${interaction.member.displayName}** gave a hug to ${member} iwi`, embeds: [abrazoEmbed] });
    },
};