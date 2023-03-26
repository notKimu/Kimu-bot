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
    if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });
    
    const user = interaction.options.getUser('member') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const target = await Levels.fetch(user.id, interaction.guild.id);
    const regexName = /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])|╏/g;

    if (member.bot) return interaction.reply({ content: 'You can´t se the rank of a bot :c', ephemeral: true });
    if (!target) return interaction.reply({ content: 'Looks like this person still doesn´t have a level :c', ephemeral: true });

    var con = mysql.createPool({
      host: "localhost",
      user: "kami",
      password: process.env.DBPASS,
      database: "kamidb"
    });

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
              resolve(result[0].url);
            } catch {
              resolve('./src/img/profile.png');
            }

          });
        });
      })
    }

    async function getUserDescription() {
      return new Promise((resolve, reject) => {
        con.getConnection(async function (err) {
          if (err) {
            reject(err);
            return;
          }

          con.query(`SELECT description FROM descriptionimg WHERE guildId = '${interaction.guild.id}' AND userId ='${user.id}'`, function (err, result) {
            if (err) {
              reject(err);
              return;
            };
            try {
              resolve(result[0].description);
            } catch {
              resolve('Still empty...');
            }

          });
        });
      })
    }

    getUserImg().then(async result => {
      getUserDescription().then(async description => {

        //Personalización -----------------------------------
        // const accentColor = '#e9a3c2';                /**/
        const wallpaper = result;                       /**/
        //-----------------------------------------------



        //Hace el Canvas
        var perfil = {};
        perfil.create = Canvas.createCanvas(400, 500);
        perfil.context = perfil.create.getContext('2d');

        //Carga la imagen de fondo
        try {
          const background = await Canvas.loadImage(wallpaper);
          perfil.context.drawImage(background, 0, 0, 400, 500);
        } catch {
          const background = await Canvas.loadImage('./src/img/profile.png');
          perfil.context.drawImage(background, 0, 0, 400, 500);
        }

        //El cuadrado que hace de ventana
        perfil.context.globalAlpha = 0.7;
        perfil.context.fillStyle = '#2c2c2c';
        perfil.context.beginPath();
        perfil.context.roundRect(12, 13, 375, 474, [5, 5, 5, 5]);
        perfil.context.fill();
        perfil.context.closePath();

        //El cuadrado que hace información en la ventana
        perfil.context.globalAlpha = 1;
        perfil.context.fillStyle = '#1c1c1c';
        perfil.context.beginPath();
        perfil.context.roundRect(12, 13, 375, 24, [5, 5, 0, 0]);
        perfil.context.fill();
        perfil.context.closePath();

        //Circulitos [¿Bonita apariencia a cambio de rendimiento? Si.]
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

        // Nombre del miembro
        perfil.context.font = '15px consola';
        perfil.context.textAlign = 'left';
        perfil.context.fillStyle = '#ffffff';

        let nombreBarraRaw = member.displayName;
        let nombreBarra = nombreBarraRaw.replace(regexName, '');
        if (nombreBarra.length > 30) nombreBarra = nombreBarra.substring(0, 28) + "...";

        perfil.context.fillText(`${nombreBarra}.md`, 65, 31);

        //Dibujar la foto de perfil
        const avatar = member.displayAvatarURL({ extension: "png", size: 1024 });
        let cargaravatar = await Canvas.loadImage(avatar);
        perfil.context.drawImage(cargaravatar, 25, 50, 128, 128);

        // Nombre del miembro pero en grande
        perfil.context.globalAlpha = 1;
        perfil.context.font = '24px consola';
        perfil.context.fillStyle = '#ffffff';


        let nombreEnServidorRaw = member.displayName;
        let nombreEnServidor = nombreEnServidorRaw.replace(regexName, '')
        if (nombreEnServidor.length > 13) nombreEnServidor = nombreEnServidor.substring(0, 13) + "...";

        perfil.context.fillText(nombreEnServidor, 163, 70);
        // Discriminador
        perfil.context.fillStyle = member.displayHexColor;
        perfil.context.fillText(`#${user.discriminator}`, 163, 100);

        // Barra de nivel
        perfil.context.fillStyle = '#ffffff';
        perfil.context.fillRect(163, 122, 215, 25);

        // Porcentaje a llenar
        /* Momento XP */
        const actualXp = target.xp - Levels.xpFor(target.level);
        const requiredXp = Levels.xpFor(target.level + 1);

        perfil.context.fillStyle = member.displayHexColor;
        perfil.context.beginPath();
        perfil.context.rect(163, 122, (actualXp / requiredXp) * 215, 25);
        perfil.context.fill()
        // Si el usuario es color cum, ponerle un borde negro a la barra
        if (member.displayHexColor == "#ffffff") {
          perfil.context.strokeStyle = 'black';
          perfil.context.lineWidth = 1;
          perfil.context.stroke();
        }
        perfil.context.closePath();
        // Número de niveles
        perfil.context.fillStyle = '#ffffff';
        perfil.context.fillText(target.level, 163, 178);
        perfil.context.textAlign = 'right';
        perfil.context.fillText(target.level + 1, 378, 178);

        // Info y esas cosas
        perfil.context.textAlign = 'left';
        // Fecha de unión
        perfil.context.fillText(`Unión: ${moment.utc(member.joinedAt).format('DD/MM/YY')}`, 25, 220);
        // Rol superior
        let superiorRoleRaw = member.roles.highest.name;
        let superiorRole = superiorRoleRaw.replace(regexName, '').replace('|', '');

        if (superiorRole.length > 15) superiorRole = superiorRole.substring(0, 14) + "...";
        perfil.context.fillText(`Rol Superior: ${superiorRole}`, 25, 264);

        /* Zona de la descripción */
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


        // Descripción
        perfil.context.font = '20px consola';
        perfil.context.fillStyle = '#ffffff';
        perfil.context.fillText(`Descripción:`, 25, 301);
        // Contenido de la descripción
        perfil.context.fillText("> " + description, 25, 338);


        //Cargar la imagen al buffer
        let imagenfinal = new AttachmentBuilder(perfil.create.toBuffer('image/png'), { name: `perfil_${user.id}.png` });
        //Enviar la imagen
        interaction.reply({ files: [imagenfinal] });

        // Add timeout to the command
        timeoutUsers.push(interaction.user.id);
        setTimeout(() => {
          timeoutUsers.shift();
        }, 60000)
      }).catch(err => {
        console.log('[PROFILE] (description) => ' + err);
        return interaction.reply({ content: "Sorry! I had and internal error, please try later '^^", ephemeral: true });
      });
    }).catch(err => {
      console.log('[PROFILE] => ' + err);
      return interaction.reply({ content: "Sorry! I had and internal error, please try later '^^", ephemeral: true });
    });
  },
};