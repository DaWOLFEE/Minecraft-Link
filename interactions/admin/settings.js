const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    command: new SlashCommandBuilder()
        .setName('settings')
        .setDescription(`Update server-specific features`),
    run: async (interaction, args) => {
        
    }
}