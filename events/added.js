const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,

    async execute(guild) {

        const owner = await guild.members.fetch(guild.ownerId);

        const heyEmbed = new EmbedBuilder()
            .setColor('#bd62c9')
            .setTitle(`I´ve been added to ${guild.name} ^^`)
            .setDescription(`
                Hey **<@${guild.ownerId}>**, i´ve been added to one of your servers!\n
                I hope I can help you make your server a better place! <3\n
                Let´s get started, I recommend that you read the docs so I can give you the best experience possible, if you need any help go over to my server so my developers can help you!
            `)
            .addFields(
                {name: "Docs:", value: "> [Github wiki](https://github.com/KomradeFMX/Kimu-bot/wiki)"},
                {name: "Server:", value: "> [./Kaskade.sv](https://discord.gg/NfeXrQdXdE)"},
                {name: "Donate:", value: "> [Ko-fi](https://ko-fi.com/kimu_)"},
            )
            .setThumbnail('https://cdn.discordapp.com/avatars/1084944569872941247/de61a556efbad0bfda1c3a55ba930351.webp?size=1024')
            .setFooter({ text: `Thanks for trusting me ^^`, iconURL: 'https://cdn.discordapp.com/avatars/1084944569872941247/de61a556efbad0bfda1c3a55ba930351.webp?size=1024' });

        owner.send({ embeds: [heyEmbed]});
    }
};