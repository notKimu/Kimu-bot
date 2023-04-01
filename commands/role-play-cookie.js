const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
//Base de datos del Roleo
const arrayRoleo = require("../src/json/roleo.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cookie')
        .setDescription('Give a cookie to someone to make them feel better :D')
        .addUserOption(option =>
            option.setName('member').setDescription('Member to which you want to give the cookie').setRequired(true)),


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
        }

        if (member == interaction.member) return interaction.reply({ content: 'No te puedes dar una galletita a tí mism@', ephemeral: true });

        //Obtener la lista del array en el JSON
        let gifsGalletitas = arrayRoleo[0].fotos.galletitas;

        //El embed con el gif correspondiente
        const galletitasEmbed = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setImage(gifsGalletitas[randomValue(0, gifsGalletitas.length)])
            .setFooter({ text: `${interaction.guild.name} - Roleo`, iconURL: `${interaction.guild.iconURL()}` });

        await interaction.reply({ content: `**${interaction.member.displayName}** ha dado una galletita a ${member} owo`, embeds: [galletitasEmbed] });
    },
};