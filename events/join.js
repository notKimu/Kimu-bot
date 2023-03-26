const { Events, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const { resolve } = require("path");
const welcomeMessages = require('../src/json/welcome-msg.json');

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member) {
        try {
            // Get the welcome channel
            const welcomeChannel = member.guild.systemChannel;

            // Random values
            function random(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min) + min);
            };

            // Register the goddamn fonts hehe
            Canvas.registerFont(resolve("./src/fonts/UpheavalPro.ttf"), { family: "Upheaval" });
            Canvas.registerFont(resolve("./src/fonts/Kanit-Light.ttf"), { family: "Kanit" });

            // Create canvas
            var welcome = {};
            welcome.create = Canvas.createCanvas(700, 343);
            welcome.context = welcome.create.getContext('2d');
            // Load bg image
            const background = await Canvas.loadImage('./src/img/cherry_pixel_art.png')
            welcome.context.drawImage(background, 0, 0, 700, 343);

            // Rectangle overlay
            welcome.context.fillStyle = '#3e2c3e';
            welcome.context.globalAlpha = 0.8;

            welcome.context.beginPath();
            welcome.context.moveTo(0, 0);
            welcome.context.lineTo(0, 343);
            welcome.context.lineTo(700, 343);
            welcome.context.lineTo(700, 213);
            welcome.context.lineTo(248, 213);
            welcome.context.lineTo(248, 0);
            welcome.context.closePath();
            welcome.context.fill();

            // "Avatar´s frame"
            welcome.context.lineWidth = 2;
            welcome.context.globalAlpha = 0.6;
            welcome.context.fillStyle = '#a3a3a3';
            welcome.context.beginPath();
            welcome.context.roundRect(30, 12, 187, 187, 5);
            welcome.context.closePath();
            welcome.context.stroke();
            welcome.context.globalAlpha = 1;

            // Avatar
            const avatar = member.displayAvatarURL({ extension: "png", size: 1024 });
            let loadAvatar = await Canvas.loadImage(avatar);
            welcome.context.drawImage(loadAvatar, 34, 16, 179, 179);

            // The user name
            welcome.context.font = '58px Upheaval';
            welcome.context.textAlign = 'left';
            welcome.context.fillStyle = '#2a1f33';

            welcome.context.fillText(member.user.username, 259, 77);
            welcome.context.fillStyle = '#3b3660';
            welcome.context.fillText(`#${member.user.discriminator}`, 259, 123);

            // Check user presence status and use it
            try {
                const presence = member.presence.status;
                var presenceText = "";
                if (presence === "online") {
                    welcome.context.fillStyle = '#4cff71';
                    presenceText = "Online";
                } else if (presence === "idle") {
                    welcome.context.fillStyle = '#4cff71';
                    presenceText = "Idle";
                } else if (presence === "dnd") {
                    welcome.context.fillStyle = '#be0d0d';
                    presenceText = "DnD";
                }
            } catch {
                welcome.context.fillStyle = '#4b4b4b';
                presenceText = "Offline"
            }

            welcome.context.beginPath();
            welcome.context.arc(49, 250, 15, 0, 2 * Math.PI);
            welcome.context.closePath();
            welcome.context.fill();

            welcome.context.fillStyle = '#e8ad21';
            welcome.context.beginPath();
            welcome.context.arc(49, 291, 15, 0, 2 * Math.PI);
            welcome.context.closePath();
            welcome.context.fill();

            // Info
            welcome.context.font = '38px Upheaval';
            welcome.context.fillStyle = '#ffffff';
            welcome.context.fillText(presenceText, 81, 260);

            const memberSize = member.guild.memberCount;
            welcome.context.fillText(`ID_${memberSize}`, 81, 301);

            // Random message
            welcome.context.font = '27px Kanit';
            welcome.context.fillText(welcomeMessages[random(0, welcomeMessages.length)], 258, 257);


            //Cargar la imagen al buffer
            let finalImage = new AttachmentBuilder(welcome.create.toBuffer('image/png'), { name: `log_${member.user.id}.png` });

            //Enviar el texto y la foto
            welcomeChannel.send({
                content: `You are registered as ./${member}\nCheck out <#1084616008322523157> to log in! `,
                files: [finalImage]
            });
            welcome.context.clearRect(0, 0, 700, 343);
        } catch (err) {
            // Error
            console.log("Error with welcome image" + err);
        }
    },
};