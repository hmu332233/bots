import axios from 'axios';
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const { BOT_TOKEN, CHANNEL_ID, API_BASE_URL } = process.env;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const userMappings = new Map();

const getRandomQuizQuestion = () => {
  // TODO: api 통해서 가져오는 것으로 변경
  const quizzes = [
    {
      id: "q1",
      question: "대한민국의 수도는?",
      options: ["서울", "부산", "인천", "대구"],
      correctAnswer: "서울"
    },
    {
      id: "q2",
      question: "1 + 1 = ?",
      options: ["1", "2", "3", "4"],
      correctAnswer: "2"
    },
    {
      id: "q3",
      question: "지구에서 가장 가까운 행성은?",
      options: ["금성", "화성", "목성", "토성"],
      correctAnswer: "금성"
    },
    {
      id: "q4",
      question: "물의 화학식은?",
      options: ["H2O", "CO2", "NaCl", "O2"],
      correctAnswer: "H2O"
    },
    {
      id: "q5",
      question: "세계에서 가장 넓은 대륙은?",
      options: ["아시아", "아프리카", "북아메리카", "남아메리카"],
      correctAnswer: "아시아"
    }
  ];

  const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
  
  return {
    id: randomQuiz.id,
    question: randomQuiz.question,
    options: randomQuiz.options,
    answer: randomQuiz.correctAnswer
  };
};

client.once('ready', () => {
  console.log('Bot is ready!');
  sendInitialMessage();
});

const sendInitialMessage = async () => {
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
};

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'start_quiz') {
    await handleStartQuiz(interaction);
  } else if (interaction.customId.startsWith('option_')) {
    await handleAnswer(interaction);
  }
});

const isUserMapped = async (userId) => {
  return userMappings.get(userId) || false;
};

const createMappingUrl = (userId) => {
  return `${API_BASE_URL}/map-discord?v=${userId}`;
};

const handleStartQuiz = async interaction => {
  const userId = interaction.user.id;

  try {
    if (await isUserMapped(userId)) {
      await sendQuizQuestion(interaction);
    } else {
      await sendMappingInstructions(interaction);
    }
  } catch (error) {
    console.error('Error in handleStartQuiz:', error);
    await interaction.reply({ content: '퀴즈 시작 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.', ephemeral: true });
  }
};

const sendMappingInstructions = async interaction => {
  const mappingUrl = createMappingUrl(interaction.user.id);
  
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('구름 계정과 최초 연동이 필요합니다.')
    .setDescription(`[여기를 클릭하여 연동을 완료하세요](${mappingUrl})\n연동 완료 후 다시 "퀴즈 시작" 버튼을 클릭하세요.`);

  await interaction.reply({ embeds: [embed], ephemeral: true });
};

const sendQuizQuestion = async interaction => {
  const quiz = getRandomQuizQuestion();
  
  const rows = [];
  for (let i = 0; i < quiz.options.length; i += 2) {
    const row = new ActionRowBuilder();
    for (let j = i; j < Math.min(i + 2, quiz.options.length); j++) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`option_${quiz.id}_${j}_${quiz.answer}`)
          .setLabel(quiz.options[j])
          .setStyle(ButtonStyle.Primary)
      );
    }
    rows.push(row);
  }

  await interaction.reply({
    content: `문제: ${quiz.question}`,
    components: rows,
    ephemeral: true
  });
};

const handleAnswer = async interaction => {
  const [_, quizId, optionIndex, correctAnswer] = interaction.customId.split('_');
  const selectedOption = interaction.component.label;
  
  if (selectedOption === correctAnswer) {
    await interaction.update({
      content: '정답입니다! 다음 문제를 풀려면 "퀴즈 시작" 버튼을 다시 클릭하세요.',
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('start_quiz')
          .setLabel('퀴즈 시작')
          .setStyle(ButtonStyle.Success)
      )]
    });
  } else {
    await interaction.update({
      content: `틀렸습니다. 정답은 "${correctAnswer}"입니다. 다음 문제를 풀려면 "퀴즈 시작" 버튼을 다시 클릭하세요.`,
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('start_quiz')
          .setLabel('퀴즈 시작')
          .setStyle(ButtonStyle.Danger)
      )]
    });
  }
};

client.on('messageCreate', async message => {
  if (message.content === '!매핑완료') {
    const userId = message.author.id;
    userMappings.set(userId, true);
    await message.reply('매핑이 완료되었습니다. 이제 퀴즈를 시작할 수 있습니다!');
  }
});

client.login(BOT_TOKEN);