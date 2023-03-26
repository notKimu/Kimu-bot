const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Levels = require('discord-xp')
const Canvas = require('canvas');
const mysql = require('mysql');
const { resolve } = require("path");
const dotenv = require('dotenv').config();

var timeoutUsers = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .addUserOption(option =>
      option.setName('member').setDescription('Member of which you want to see the rank'))
    .setDescription('Watch your progress or someone´s else'),

  async execute(interaction) {

    const user = interaction.options.getUser('member') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const target = await Levels.fetch(user.id, interaction.guild.id);


    if (timeoutUsers.includes(interaction.user.id)) return interaction.reply({ content: 'You have to wait before using this command again! <:nose:1085261670043103232>', ephemeral: true });
    if (member.bot) return interaction.reply({ content: 'You can´t se the rank of a bot :c', ephemeral: true });
    if (!target) return interaction.reply({ content: 'Looks like this person still doesn´t have a rank :c', ephemeral: true });

    async function getUserImg() {
      var con = mysql.createPool({
        host: "localhost",
        user: "kami",
        password: process.env.DBPASS,
        database: "kamidb"
      });

      return new Promise((resolve, reject) => {
        con.getConnection(async function (err) {
          if (err) {
            reject(err);
            return;
          }

          con.query(`SELECT url FROM rankimg WHERE guildId = '${interaction.guild.id}' AND userId ='${user.id}'`, function (err, result) {
            if (err) {
              reject(err);
              return;
            };
            try {
              resolve(result[0].url);
            } catch (error) {
              resolve('./src/img/level.png');
            }
            
          });
        });
      })
    }

    getUserImg().then(async result => {

      //Personalización -----------------------------------
      const accentColor = '#e9a3c2';                   /**/
      const wallpaper = result;                       /**/
      //-----------------------------------------------



      //Hace el Canvas
      var level = {};
      level.crear = Canvas.createCanvas(1000, 300);
      level.context = level.crear.getContext('2d');
      //Carga la imagen de background
      try {
        const background = await Canvas.loadImage(wallpaper);
        level.context.drawImage(background, 0, 0, 1000, 300);
      } catch {
        const background = await Canvas.loadImage('./src/img/level.png');
        level.context.drawImage(background, 0, 0, 1000, 300);
      }
      

      Canvas.registerFont(resolve("./src/fonts/CONSOLA.TTF"), { family: "consola" });

      //El cuadrado donde va la pfp
      level.context.globalAlpha = 0.7;
      level.context.fillStyle = '#2c2c2c';
      level.context.beginPath();
      level.context.roundRect(13, 13, 275, 275, [5, 5, 5, 5]);
      level.context.fill();
      level.context.closePath();

      //El cuadrado donde va la info
      level.context.beginPath();
      level.context.roundRect(305, 13, 675, 275, [5, 5, 5, 5]);
      level.context.fill();
      level.context.closePath();

      //El que va encima del de la pfp
      level.context.globalAlpha = 1;
      level.context.fillStyle = accentColor;
      level.context.beginPath();
      level.context.roundRect(13, 13, 275, 25, [5, 5, 0, 0]);
      level.context.fill();
      level.context.closePath();

      //El que va encima de la info
      level.context.beginPath();
      level.context.roundRect(305, 13, 675, 25, [5, 5, 0, 0]);
      level.context.fill();
      level.context.closePath();

      //Linea negra encima de las ventanas
      level.context.globalAlpha = 0.7;
      level.context.strokeStyle = 'black';
      level.context.beginPath();
      level.context.roundRect(13, 13, 275, 275, [5, 5, 5, 5]);
      level.context.roundRect(305, 13, 675, 275, [5, 5, 5, 5]);
      level.context.moveTo(13, 39); // Move the pen to (30, 50)
      level.context.lineTo(288, 39); // Draw a line to (150, 100)
      level.context.moveTo(305, 39); // Move the pen to (30, 50)
      level.context.lineTo(980, 39); // Draw a line to (150, 100)
      level.context.stroke();
      level.context.closePath();



      //Circulitos
      level.context.globalAlpha = 1;
      level.context.beginPath();
      level.context.fillStyle = '#ed3838';
      level.context.arc(37, 26, 5, 0, Math.PI * 2, true);
      level.context.arc(329, 26, 5, 0, Math.PI * 2, true);
      level.context.fill();
      level.context.closePath();

      level.context.beginPath();
      level.context.fillStyle = '#ed8d38';
      level.context.arc(52, 26, 5, 0, Math.PI * 2, true);
      level.context.arc(344, 26, 5, 0, Math.PI * 2, true);
      level.context.fill();
      level.context.closePath();

      level.context.beginPath();
      level.context.fillStyle = '#abed38';
      level.context.arc(67, 26, 5, 0, Math.PI * 2, true);
      level.context.arc(359, 26, 5, 0, Math.PI * 2, true);
      level.context.fill();
      level.context.closePath();

      //Pasar el avatar a png y hacer que esté en alta resolución
      const avatar = member.displayAvatarURL({ extension: "png", size: 1024 });
      let cargaravatar = await Canvas.loadImage(avatar);
      //Dibujar la foto de perfil
      level.context.drawImage(cargaravatar, 38, 50, 225, 225);

      //Nombre de archivos (cursiladas)
      level.context.font = '14px consola';
      level.context.textAlign = 'left';
      level.context.fillStyle = '#ffffff';

      level.context.fillText('image.png', 82, 30);
      level.context.fillText('XP-Level.db', 375, 30);

      //Información de usuario
      level.context.font = '36px consola';
      //Nombre y tag
      level.context.fillText(`${member.user.tag}`, 328, 118);

      level.context.font = '30px consola';


      //ZONA DE Levels
      //Variables
      var actualLevel = target.level;
      var levelAnterior = actualLevel - 1;
      if (levelAnterior == -1) {
        levelAnterior = 0;
      };

      var xpNextLev = Levels.xpFor(target.level + 1);
      var xpLev = Levels.xpFor(target.level);
      const actualXp = target.xp - Levels.xpFor(target.level);
      const requiredXp = Levels.xpFor(target.level + 1);

      //XP actual / necesaria
      level.context.fillText(`${actualXp} / ${xpNextLev - xpLev}`, 328, 170);
      //level
      level.context.textAlign = 'right';
      level.context.fillText(`level ${actualLevel}`, 955, 170);
      //Barra que contiene la XP total
      level.context.fillStyle = '#ffffff';
      level.context.beginPath();
      level.context.roundRect(328, 184, 629, 50, [5, 5, 5, 5]);
      level.context.fill();
      level.context.closePath();
      //Barra que contiene la XP actual
      level.context.fillStyle = `${member.displayHexColor}`;
      //Calcula lo ancha que tiene que ser la barra
      const porcentaje = actualXp / requiredXp;
      const anchoBarraXp = porcentaje * 629;
      level.context.beginPath();
      level.context.roundRect(328, 184, anchoBarraXp, 50, [5, 5, 5, 5]);
      level.context.fill();

      if (member.displayHexColor == "#ffffff") {
        level.context.fillStyle = '#000000';
        level.context.lineWidth = 1;
        level.context.stroke();
      }

      level.context.closePath();


      //Cargar la imagen al buffer
      let imagenfinal = new AttachmentBuilder(level.crear.toBuffer('image/png'), { name: `level_${member.id}.png` });
      //Canal en el que quieres enviar los mensajes de bienvenida
      //Enviar el texto y la foto
      await interaction.reply({ files: [imagenfinal] });
      level.context.clearRect(0, 0, 1000, 300);

      // Add a timeout to the command
      timeoutUsers.push(interaction.user.id);
      setTimeout(() => {
        timeoutUsers.shift();
      }, 60000)
    }).catch(err => {
      console.log('[RANK] => ' + err);
      return interaction.reply({ content: "Sorry! I had and internal error, please try later '^^", ephemeral: true });
    });
  },
};