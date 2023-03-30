const { ChannelType, Events, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,

    async execute(guild) {

        const owner = await guild.members.fetch(guild.ownerId);

        const heyEmbed = new EmbedBuilder()
            .setColor('#bd62c9')
            .setTitle(`I´ve been added to ${guild.name} ^^`)
            .setDescription(`
                Hey **<@${guild.ownerId}>**, i´ve been added to one of your servers!\n\nI hope I can help you make your server a better place! <3\n\nLet´s get started, I recommend that you read the docs so I can give you the best experience possible, if you need any help go over to my server so my developers can help you!`)
            .addFields(
                {name: "Docs:", value: "> [Github wiki](https://github.com/KomradeFMX/Kimu-bot/wiki)"},
                {name: "Server:", value: "> [./Kaskade.sv](https://discord.gg/NfeXrQdXdE)"},
                {name: "Donate:", value: "> [Ko-fi](https://ko-fi.com/kimu_)"},
            )
            .setThumbnail(guild.members.me.avatarURL())
            .setFooter({ text: `Thanks for trusting me ^^`, iconURL: guild.members.me.avatarURL() });

        
        await owner.send({ embeds: [heyEmbed]})


        const configEmbed = new EmbedBuilder()
        .setColor('#bd62c9')
        .setTitle(`Hi admins of ${guild.name} ^^`)
        .setDescription(`Thanks for letting me be part of your server! I want to help you get started...\nTo activate my logs use **/log-channel** and choose a channel!\n\nBy default both welcome messages and level up messages are sent to ${guild.systemChannel}, if you want to change that you can use **/welcome-channel** and **/level-channel**\n\nTalking about roles... If you want to set custom roles when a user reaches a level use the **/level-config**!\n\nI hope I can help here, thanks again!!`)
        .addFields(
            {name: "Docs:", value: "> [Github wiki](https://github.com/KomradeFMX/Kimu-bot/wiki)"},
            {name: "Server:", value: "> [./Kaskade.sv](https://discord.gg/NfeXrQdXdE)"},
            {name: "Donate:", value: "> [Ko-fi](https://ko-fi.com/kimu_)"},
        )
        .setThumbnail(guild.members.me.avatarURL())
        .setFooter({ text: `Thanks for trusting me ^^`, iconURL: guild.members.me.avatarURL() });


        // Channel
        await guild.channels.create({
            name: "kimu-config",
            type: ChannelType.GuildText,
            position: 1,
            permissionOverwrites: [{
                id: guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            }]
        }).then(channel => {
            channel.send({ embeds: [configEmbed] })
        }).catch(err => console.log("Error on guild add welcome channel => " + err));

    }
};