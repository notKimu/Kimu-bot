const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.MessageUpdate,

	async execute(oldMessage, newMessage) {
        try {
            const logChannel = newMessage.client.channels.cache.find(channel => channel.id == process.env.LOGS);

            // Return if message is the same or if they are empty
            if (oldMessage.content === newMessage.content || oldMessage.content === "" || newMessage.content === "") {
                return;
            }
    
            // Embed
            const editedMessage = new EmbedBuilder()
                .setColor(newMessage.guild.members.me.displayHexColor)
                .setTitle(`Edited message at ${newMessage.channel.name}`)
                .setDescription(`**Author**: ${newMessage.author}\n**Old Message**: ${oldMessage.content}\n**New message**: ${newMessage.content}`)
                .setFooter({ text: `${newMessage.guild.name} - Moderation`, iconURL: `${newMessage.guild.iconURL()}` })
            // Notify
            await logChannel.send({embeds: [editedMessage]});
        } catch (err) {
            // Error
            console.log("Error logging edited message => " + err);
        }
       }
	}