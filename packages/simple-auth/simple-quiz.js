import 'dotenv/config';
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

const TOKEN = process.env.BOT_TOKEN;


const CHANNEL_ID = '1257971301184831530';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const userMappings = new Map();
const userProgress = new Map();

// 퀴즈 문제들
const quizzes = [
  {
    id: "quiz1",
    question: "대한민국의 수도는?",
    options: ["서울", "부산", "인천", "대구", "광주"],
    answer: "서울"
  },
  {
    id: "quiz2",
    question: "1 + 1 = ?",
    options: ["1", "2", "3", "4", "5"],
    answer: "2"
  },
  // 추가 퀴즈...
];

client.once('ready', () => {
  console.log('Bot is ready!');
  sendInitialMessage();
});

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

  if (interaction.customId === 'start_quiz') {
    await handleStartQuiz(interaction);
  } else if (interaction.customId.startsWith('option_')) {
    await handleAnswer(interaction);
  }
});

async function handleStartQuiz(interaction) {
  const userId = interaction.user.id;

  if (userMappings.has(userId)) {
    userProgress.set(userId, { currentQuizIndex: 0, score: 0 });
    await sendQuizQuestion(interaction, userId);
  } else {
    await sendMappingInstructions(interaction);
  }
}

async function sendMappingInstructions(interaction) {
  const mappingUrl = `https://your-mapping-site.com/map?userId=${interaction.user.id}&guildId=${interaction.guild.id}`;
  
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('사용자 매핑이 필요합니다')
    .setDescription(`[여기를 클릭하여 매핑을 완료하세요](${mappingUrl})\n매핑 완료 후 '!매핑완료' 명령어를 입력해주세요.`);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function sendQuizQuestion(interaction, userId) {
  const progress = userProgress.get(userId);
  if (progress.currentQuizIndex >= quizzes.length) {
    await endQuiz(interaction, userId);
    return;
  }

  const currentQuiz = quizzes[progress.currentQuizIndex];
  const rows = [];

  for (let i = 0; i < currentQuiz.options.length; i += 2) {
    const row = new ActionRowBuilder();
    for (let j = i; j < Math.min(i + 2, currentQuiz.options.length); j++) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`option_${currentQuiz.id}_${j}`)
          .setLabel(currentQuiz.options[j])
          .setStyle(ButtonStyle.Primary)
      );
    }
    rows.push(row);
  }

  await interaction.reply({
    content: `문제 ${progress.currentQuizIndex + 1}/${quizzes.length}: ${currentQuiz.question}`,
    components: rows,
    ephemeral: true
  });
}

async function handleAnswer(interaction) {
  const [_, quizId, optionIndex] = interaction.customId.split('_');
  const userId = interaction.user.id;
  const progress = userProgress.get(userId);
  const currentQuiz = quizzes[progress.currentQuizIndex];

  if (currentQuiz.id !== quizId) {
    await interaction.reply({ content: '오류가 발생했습니다. 퀴즈를 다시 시작해주세요.', ephemeral: true });
    return;
  }

  const selectedOption = currentQuiz.options[parseInt(optionIndex)];
  
  if (selectedOption === currentQuiz.answer) {
    progress.score += 1;
    await interaction.update({
      content: '정답입니다!',
      components: []
    });
  } else {
    await interaction.update({
      content: `틀렸습니다. 정답은 "${currentQuiz.answer}"입니다.`,
      components: []
    });
  }

  progress.currentQuizIndex += 1;
  userProgress.set(userId, progress);

  // 잠시 대기 후 다음 문제 또는 결과 표시
  setTimeout(async () => {
    if (progress.currentQuizIndex < quizzes.length) {
      await sendQuizQuestion(interaction, userId);
    } else {
      await endQuiz(interaction, userId);
    }
  }, 2000);
}

async function endQuiz(interaction, userId) {
  const progress = userProgress.get(userId);
  await interaction.editReply({
    content: `퀴즈가 종료되었습니다!\n최종 점수: ${progress.score}/${quizzes.length}`,
    components: []
  });
  userProgress.delete(userId);
}

client.on('messageCreate', async message => {
  if (message.content === '!매핑완료') {
    const userId = message.author.id;
    userMappings.set(userId, true);
    await message.reply('매핑이 완료되었습니다. 이제 퀴즈를 시작할 수 있습니다!');
  }
});

client.login(TOKEN);