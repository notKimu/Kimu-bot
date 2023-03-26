const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
} = require("discord.js");

const Canvas = require('canvas');
const moment = require('moment');
const Levels = require('discord-xp')
const mysql = require('mysql');
const dotenv = require('dotenv').config();

var timeoutUsers = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .addMentionableOption(option =>
      option.setName('member').setDescription('Member from which you want to see the profile'))
    .setDescription("See your server profile or someone else's!"),

  async execute(interaction) {
    // Check if user is on timeout
    if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });

    // Get user input
    const user = interaction.options.getUser('member') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const target = await Levels.fetch(user.id, interaction.guild.id);
    // Remove emojis and thingys
    const regexName = /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])|╏/g;

    // Return if user is a bot or if there is no level
    if (member.bot) return interaction.reply({ content: 'You can´t se the rank of a bot :c', ephemeral: true });
    if (!target) return interaction.reply({ content: 'Looks like this person still doesn´t have a level :c', ephemeral: true });

    // Create pool
    var con = mysql.createPool({
      host: "localhost",
      user: "kami",
      password: process.env.DBPASS,
      database: "kamidb"
    });

    // Get the URL
    async function getUserImg() {
      return new Promise((resolve, reject) => {
        con.getConnection(async function (err) {
          if (err) {
            reject(err);
            return;
          }

          con.query(`SELECT url FROM profileimg WHERE guildId = '${interaction.guild.id}' AND userId ='${user.id}'`, function (err, result) {
            if (err) {
              reject(err);
              return;
            };
            try {
              // Get the URL
              resolve(result[0].url);
            } catch {
              // If there is an error use the default image
              resolve('./src/img/profile.png');
            }

          });
        });
      })
    }

    // Make the description
    async function getUserDescription() {
      return new Promise((resolve, reject) => {
        con.getConnection(async function (err) {
          if (err) {
            reject(err);
            return;
          }
          // Search description
          con.query(`SELECT description FROM descriptionimg WHERE guildId = '${interaction.guild.id}' AND userId ='${user.id}'`, function (err, result) {
            if (err) {
              reject(err);
              return;
            };
            try {
              // Get description
              resolve(result[0].description);
            } catch {
              // If error use the default description
              resolve('Still empty...');
            }

          });
        });
      })
    }

    // Main
    getUserImg().then(async result => {
      getUserDescription().then(async description => {

        // Personalization -----------------------------------
        // const accentColor = '#e9a3c2';                /**/
        const wallpaper = result;                       /**/
        //-----------------------------------------------



        // Make the canvas
        var perfil = {};
        perfil.create = Canvas.createCanvas(400, 500);
        perfil.context = perfil.create.getContext('2d');

        // Load background image
        try {
          const background = await Canvas.loadImage(wallpaper);
          perfil.context.drawImage(background, 0, 0, 400, 500);
        } catch {
          const background = await Canvas.loadImage('./src/img/profile.png');
          perfil.context.drawImage(background, 0, 0, 400, 500);
        }

        // The window
        perfil.context.globalAlpha = 0.7;
        perfil.context.fillStyle = '#2c2c2c';
        perfil.context.beginPath();
        perfil.context.roundRect(12, 13, 375, 474, [5, 5, 5, 5]);
        perfil.context.fill();
        perfil.context.closePath();

        // The upper frame of the window
        perfil.context.globalAlpha = 1;
        perfil.context.fillStyle = '#1c1c1c';
        perfil.context.beginPath();
        perfil.context.roundRect(12, 13, 375, 24, [5, 5, 0, 0]);
        perfil.context.fill();
        perfil.context.closePath();

        // Circle thingys, yep, looks > performance
        perfil.context.beginPath();
        perfil.context.fillStyle = '#ed3838';
        perfil.context.arc(25, 25, 5, 0, Math.PI * 2, true);
        perfil.context.fill();
        perfil.context.closePath();

        perfil.context.beginPath();
        perfil.context.fillStyle = '#ed8d38';
        perfil.context.arc(40, 25, 5, 0, Math.PI * 2, true);
        perfil.context.fill();
        perfil.context.closePath();

        perfil.context.beginPath();
        perfil.context.fillStyle = '#abed38';
        perfil.context.arc(55, 25, 5, 0, Math.PI * 2, true);
        perfil.context.fill();
        perfil.context.closePath();

        // Member name
        perfil.context.font = '15px consola';
        perfil.context.textAlign = 'left';
        perfil.context.fillStyle = '#ffffff';

        let nombreBarraRaw = member.displayName;
        let nombreBarra = nombreBarraRaw.replace(regexName, '');
        if (nombreBarra.length > 30) nombreBarra = nombreBarra.substring(0, 28) + "...";

        perfil.context.fillText(`${nombreBarra}.md`, 65, 31);

        // Draw member avatar
        const avatar = member.displayAvatarURL({ extension: "png", size: 1024 });
        let cargaravatar = await Canvas.loadImage(avatar);
        perfil.context.drawImage(cargaravatar, 25, 50, 128, 128);

        // Member name in BIG
        perfil.context.globalAlpha = 1;
        perfil.context.font = '24px consola';
        perfil.context.fillStyle = '#ffffff';


        let nombreEnServidorRaw = member.displayName;
        let nombreEnServidor = nombreEnServidorRaw.replace(regexName, '')
        if (nombreEnServidor.length > 13) nombreEnServidor = nombreEnServidor.substring(0, 13) + "...";

        perfil.context.fillText(nombreEnServidor, 163, 70);
        // Discriminator
        perfil.context.fillStyle = member.displayHexColor;
        perfil.context.fillText(`#${user.discriminator}`, 163, 100);

        // Level bar
        perfil.context.fillStyle = '#ffffff';
        perfil.context.fillRect(163, 122, 215, 25);

        // How much of the bar to fill
        /* XP moment */
        const actualXp = target.xp - Levels.xpFor(target.level);
        const requiredXp = Levels.xpFor(target.level + 1);

        perfil.context.fillStyle = member.displayHexColor;
        perfil.context.beginPath();
        perfil.context.rect(163, 122, (actualXp / requiredXp) * 215, 25);
        perfil.context.fill()
        // If user color is white add an outline
        if (member.displayHexColor == "#ffffff") {
          perfil.context.strokeStyle = 'black';
          perfil.context.lineWidth = 1;
          perfil.context.stroke();
        }
        perfil.context.closePath();
        // Level numbers
        perfil.context.fillStyle = '#ffffff';
        perfil.context.fillText(target.level, 163, 178);
        perfil.context.textAlign = 'right';
        perfil.context.fillText(target.level + 1, 378, 178);

        // Info thingys
        perfil.context.textAlign = 'left';
        // Join date
        perfil.context.fillText(`Unión: ${moment.utc(member.joinedAt).format('DD/MM/YY')}`, 25, 220);
        // Highest role
        let superiorRoleRaw = member.roles.highest.name;
        let superiorRole = superiorRoleRaw.replace(regexName, '').replace('|', '');

        if (superiorRole.length > 15) superiorRole = superiorRole.substring(0, 14) + "...";
        perfil.context.fillText(`Rol Superior: ${superiorRole}`, 25, 264);

        /* Description zone */
        perfil.context.globalAlpha = 0.7;
        perfil.context.fillStyle = '#2c2c2c';
        perfil.context.beginPath();
        perfil.context.roundRect(23, 279, 353, 193, [5, 5, 5, 5]);
        perfil.context.fill();
        perfil.context.closePath();

        perfil.context.globalAlpha = 1;
        perfil.context.fillStyle = '#1c1c1c';
        perfil.context.beginPath();
        perfil.context.roundRect(23, 278, 353, 34, [5, 5, 0, 0]);
        perfil.context.fill();
        perfil.context.closePath();


        // Description
        perfil.context.font = '20px consola';
        perfil.context.fillStyle = '#ffffff';
        perfil.context.fillText(`Descripción:`, 25, 301);
        // Description content
        perfil.context.fillText("> " + description, 25, 338);


        // Load image to buffer
        let imagenfinal = new AttachmentBuilder(perfil.create.toBuffer('image/png'), { name: `perfil_${user.id}.png` });
        // Send the image
        interaction.reply({ files: [imagenfinal] });

        // Add timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
          timeoutUsers.shift();
        }, 60000)
      }).catch(err => {
        // Error
        console.log('[PROFILE] (description) => ' + err);
        return interaction.reply({ content: "Sorry! I had and internal error, please try later '^^", ephemeral: true });
      });
    }).catch(err => {
      // Error
      console.log('[PROFILE] (image) => ' + err);
      return interaction.reply({ content: "Sorry! I had and internal error, please try later '^^", ephemeral: true });
    });
  },
};