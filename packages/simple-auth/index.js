import 'dotenv/config';
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
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
    // sendEveryoneMessage();
   });

  //  client.on('messageCreate', (message) => {
  //   console.log('message.channelId', message.author)
  //   console.log(message.content);
  //    if (message.content === '!hello') {
  //      message.reply('Hello! I am a bot!');
  //    }
  //  });
  
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
// 버튼 생성
const button = new ButtonBuilder()
  .setCustomId('my_button')
  .setLabel('클릭하세요!')
  .setStyle(ButtonStyle.Primary);

// 액션 로우에 버튼 추가
const row = new ActionRowBuilder()
  .addComponents(button);

// 메시지 전송 예시
client.on('messageCreate', async message => {
  if (message.content === '!button') {
    await message.channel.send({
      content: '이 메시지에는 버튼이 있습니다!',
      components: [row]
    });
  }
});

// 버튼 클릭 이벤트 처리
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'my_button') {
    console.log('interaction.user', interaction.user.id)
    await interaction.reply({
      content: '버튼이 클릭되었습니다!',
      ephemeral: true
    });
  }
});
  

   client.login(TOKEN);
   