const { Events } = require('discord.js');

export const name = Events.ClientReady;
export const once = true;
export function execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('명령어를 기다리는 중', { type: 'PLAYING' });
}