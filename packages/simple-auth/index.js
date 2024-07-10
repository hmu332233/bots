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


client.on('messageCreate', async message => {
  if (message.content === '!personalized') {
    const button = new ButtonBuilder()
      .setCustomId('show_personalized')
      .setLabel('개인화된 메시지 보기')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
      .addComponents(button);

    await message.channel.send({
      content: '이 버튼을 클릭하면 개인화된 메시지를 볼 수 있습니다!',
      components: [row]
    });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'show_personalized') {
    // 사용자 ID를 기반으로 개인화된 메시지 생성
    const userId = interaction.user.id;
    let personalizedMessage = `안녕하세요, <@${userId}>님! 이것은 당신만을 위한 개인화된 메시지입니다.`;

    // 특정 사용자 ID에 따라 다른 메시지 제공 (예시)
    if (userId === '특정_사용자_ID') {
      personalizedMessage += ' 당신은 VIP 회원입니다!';
    }

    // 새로운 버튼 생성 (옵션)
    const newButton = new ButtonBuilder()
      .setCustomId('acknowledge')
      .setLabel('확인')
      .setStyle(ButtonStyle.Success);

    const newRow = new ActionRowBuilder()
      .addComponents(newButton);

    // 개인화된 ephemeral 메시지 전송
    await interaction.reply({ 
      content: personalizedMessage, 
      components: [newRow],
      ephemeral: true  // 이 옵션으로 인해 메시지는 상호작용한 사용자에게만 보입니다
    });
  }

  // 확인 버튼에 대한 처리 (옵션)
  if (interaction.customId === 'acknowledge') {
    await interaction.update({ 
      content: '확인되었습니다. 감사합니다!', 
      components: [] 
    });
  }
});

// 특정 채널에 버튼 메세지 전송
// 버튼 클릭시 유저 맵핑이 된 유저인지 체크
// - 맞다면, 다음 단계
// - 아니라면, 유저 맵핑을 하는 수단 전송
// - - 유저 맵핑이 되면 가능하다면 메세지로 다시 리다이렉트

// 문제 출제하는 메세지 전송
// 정답일 경우 다음 이벤트
// 오답일 경우 메세지 전송과 함께 그대로 종료

// 특정 채널에 버튼 메세지 전송하는 방법
// 버튼 클릭시 이벤트 처리하는 방법
// 특정 웹페이지에서 discord로 redirect 시키는 방법
// 이미 보낸 메세지를 특정 유저 기준에서만 수정하는 방법 (또는 삭제하는 방법)
  

   client.login(TOKEN);
   