export const name = 'messageCreate';
export function execute(message) {
    if (message.author.bot) return;
    
    if (message.content.toLowerCase() === 'ping') {
        message.reply('Pong!');
    }
}