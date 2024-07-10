import 'dotenv/config';
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

const TOKEN = process.env.BOT_TOKEN;


const CHANNEL_ID = '1257971301184831530';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const userMappings = new Map();

const quiz = {
  question: "1 + 1 = ?",
  answer: "2"
};

client.once('ready', () => {
  console.log('Bot is ready!');
  sendInitialMessage();
});

// 특정 채널에 초기 버튼 메시지 전송
async function sendInitialMessage() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  const button = new ButtonBuilder()
    .setCustomId('start_quiz')
    .setLabel('퀴즈 시작')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  await channel.send({
    content: '퀴즈를 시작하려면 버튼을 클릭하세요!',
    components: [row]
  });
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  switch (interaction.customId) {
    case 'start_quiz':
      await handleStartQuiz(interaction);
      break;
    case 'submit_answer':
      await handleSubmitAnswer(interaction);
      break;
  }
});

async function handleStartQuiz(interaction) {
  const userId = interaction.user.id;

  if (userMappings.has(userId)) {
    await sendQuizQuestion(interaction);
  } else {
    await sendMappingInstructions(interaction);
  }
}

async function sendMappingInstructions(interaction) {
  const mappingUrl = `https://your-mapping-site.com/map?userId=${interaction.user.id}`;
  
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('사용자 매핑이 필요합니다')
    .setDescription(`[여기를 클릭하여 매핑을 완료하세요](${mappingUrl})\n매핑 완료 후 다시 시도해주세요.`);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function sendQuizQuestion(interaction) {
  const button = new ButtonBuilder()
    .setCustomId('submit_answer')
    .setLabel('답변 제출')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  await interaction.reply({
    content: `문제: ${quiz.question}\n답변을 입력한 후 버튼을 클릭하세요.`,
    components: [row],
    ephemeral: true
  });
}

async function handleSubmitAnswer(interaction) {
  const answer = interaction.message.content.split('\n')[1]; // 사용자가 입력한 답변을 가정
  
  if (answer === quiz.answer) {
    await interaction.update({
      content: '정답입니다! 다음 단계로 진행합니다.',
      components: []
    });
    // 여기에 다음 이벤트 로직 추가
  } else {
    await interaction.update({
      content: '틀렸습니다. 퀴즈가 종료됩니다.',
      components: []
    });
  }
}

// 웹페이지에서 Discord로 리다이렉트 후 매핑 완료 처리
client.on('messageCreate', async message => {
  console.log(message)
  if (message.content.startsWith('!완료 ')) {
    const userId = message.content.split(' ')[1];
    userMappings.set(userId, true);
    await message.channel.send(`<@${userId}> 매핑이 완료되었습니다. 퀴즈를 다시 시작해주세요!`);
  }
});

client.login(TOKEN);