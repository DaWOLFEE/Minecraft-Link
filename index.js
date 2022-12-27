require('dotenv').config();
const { readdir } = require('fs');
const { Client, Collection, GatewayIntentBits, InteractionType } = require('discord.js');

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

readdir(`./handlers`, (error, files) => {
    if (error) {
        console.trace(error);
        return process.exit(1);
    } else files.forEach(file => require(`./handlers/${file}`)(bot));
});

global.InteractionType = InteractionType;
global.bot = bot;

bot.interactions = new Collection();
bot.login(process.env.TOKEN);