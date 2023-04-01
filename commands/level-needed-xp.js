const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Levels = require('discord-xp');

var timeoutUsers = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('needed-xp')
        .addIntegerOption(option =>
            option.setName('level').setDescription('The level you want to know the XP needed for').setRequired(true))
        .setDescription('See how much XP is needed to get a level!'),

    async execute(interaction) {
        // Check if user is on timeout
        if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

        // Variables
        const guildIcon = interaction.guild.iconURL() || "https://cdn.discordapp.com/attachments/1032544028115349564/1090962651661742130/icon.png";
        const level = interaction.options.getInteger('level');
        const target = await Levels.fetch(interaction.user.id, interaction.guild.id);
        let xpLeft;
        if (Levels.xpFor(level) - target.xp <= 0) xpLeft = "You got there!";
        else xpLeft = Levels.xpFor(level) - target.xp;

        if (!target) return await interaction.reply({ content: "You need to talk before using this command '^^", ephemeral: true });

        // Embed
        const neededXp = new EmbedBuilder()
            .setColor(interaction.member.displayHexColor)
            .setTitle("Needed XP for level " + level)
            .setDescription(`You need **${Levels.xpFor(level)}**XP to get to level ${level}!`)
            .addFields(
                {name: "You have:", value: `${target.xp}XP`},
                {name: "You need:", value: `${xpLeft}XP more!`},
            )
            .setFooter({ text: `${interaction.guild.name} - Levels`, iconURL: `${guildIcon}` });


        // Send
        await interaction.reply({ embeds: [neededXp] });

        // Add a timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
            timeoutUsers.shift();
        }, 5000)
    }
}