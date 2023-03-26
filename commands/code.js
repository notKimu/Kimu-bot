const axios = require("axios");
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

var timeoutUsers = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('compiler')
        .setDescription("Compile code using a command!")
        .addStringOption(option =>
            option.setName('lang')
                .setDescription("The programming language you want to code in, use ''")
                .setRequired(true)
                .addChoices(
                    { name: 'Java', value: '62' },
                    { name: 'JavaScript', value: '63' },
                    { name: 'Python', value: '71' },
                    { name: 'Rust', value: '73' },
                ))
        .addStringOption(string => 
            string.setName('code').setDescription('Type your code here!').setRequired(true))
		.setDescription('Ban a member of the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute(interaction) {
        const lan = interaction.options.getString('lan');
        const codeRaw = interaction.options.getString('code');
        const code = codeRaw.replace(/'/g, '"');


        const options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions',
            params: {base64_encoded: 'true', fields: '*'},
            headers: {
              'content-type': 'application/json',
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': 'a02f9f4462msh71d9ca51c530a4bp1086aajsn4e98f572671b',
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            data: `'language_id':${lan},'source_code':"I2luY2x1ZGUgPHN0ZGlvLmg+CgppbnQgbWFpbih2b2lkKSB7CiAgY2hhciBuYW1lWzEwXTsKICBzY2FuZigiJXMiLCBuYW1lKTsKICBwcmludGYoImhlbGxvLCAlc1xuIiwgbmFtZSk7CiAgcmV0dXJuIDA7Cn0=','stdin':'${code}'}`
          };
          
          axios.request(options).then(async function (response) {
              await interaction.reply(response);
          }).catch(async function (error) {
              await interaction.reply("Error with the request");
              console.error(error);
          });
	},
};