import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
   const client = new Client({
     intents: [
       GatewayIntentBits.Guilds,
       GatewayIntentBits.GuildMessages,
       GatewayIntentBits.MessageContent,
     ],
   });

   const TOKEN = process.env.BOT_TOKEN;


   const CHANNEL_ID = '1257971301184831530';

   client.once('ready', () => {
     console.log(`Logged in as ${client.user.tag}!`);

     // 봇이 준비되면 바로 메시지 전송
    sendEveryoneMessage();
   });

   client.on('messageCreate', (message) => {
    console.log('message.channelId', message.author)
    console.log(message.content);
     if (message.content === '!hello') {
       message.reply('Hello! I am a bot!');
     }
   });
  
  async function sendEveryoneMessage() {
    try {
      const channel = await client.channels.cache.get(CHANNEL_ID);
      console.log('channel:', channel)
      if (channel) {
        await channel.send('@everyone 안녕하세요! 이것은 전체 멘션 메시지입니다.');
        console.log('Everyone message sent successfully!');
      } else {
        console.log('Channel not found!');
      }

      await client.users.send('1257970705018912921', 'Hello! I am a bot!')
    } catch (error) {
      console.error('Error sending everyone message:', error);
    }
  }
  

   client.login(TOKEN);
   