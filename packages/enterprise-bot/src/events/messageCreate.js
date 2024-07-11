const { Events } = require('discord.js');

export const name = Events.MessageCreate;
export function execute(message) {
    if (message.author.bot) return;
    
    if (message.content.toLowerCase() === 'ping') {
        message.reply('Pong!');
    }
}