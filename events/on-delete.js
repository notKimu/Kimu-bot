const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,

    async execute(message) {
        try {
            // Return if it´s empty
            if (message.content === "") {
                return;
            };

            // get the log channel
            const logChannel = message.client.channels.cache.find(channel => channel.id == process.env.LOGS);
            
            // Embed
            const deletedMessage = new EmbedBuilder()
                .setColor(message.guild.members.me.displayHexColor)
                .setTitle(`Deleted message at ${message.channel.name}`)
                .setDescription(`**Author**: ${message.author}\n**Content**: ${message.content}`)
                .setFooter({ text: `${message.guild.name} - Moderation`, iconURL: `${message.guild.iconURL()}` })
            // Notify
            await logChannel.send({ embeds: [deletedMessage] });
            
        } catch (err) {
            // Error
            console.log("Error logging deleted message => " + err);
        }
    }
}