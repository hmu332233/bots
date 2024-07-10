import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const { BOT_TOKEN, CHANNEL_ID } = process.env;

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

const handleStartQuiz = async interaction => {
  const userId = interaction.user.id;

  if (userMappings.has(userId)) {
    await sendQuizQuestion(interaction);
  } else {
    await sendMappingInstructions(interaction);
  }
};

const sendMappingInstructions = async interaction => {
  const mappingUrl = `https://your-mapping-site.com/map?userId=${interaction.user.id}&guildId=${interaction.guild.id}`;
  
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('사용자 매핑이 필요합니다')
    .setDescription(`[여기를 클릭하여 매핑을 완료하세요](${mappingUrl})\n매핑 완료 후 '!매핑완료' 명령어를 입력해주세요.`);

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