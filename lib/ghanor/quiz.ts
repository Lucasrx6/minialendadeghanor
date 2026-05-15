export type AttrKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type ClassKey = 'barbaro' | 'bardo' | 'bucaneiro' | 'cacador' | 'cavaleiro' | 'clerigo' | 'druida' | 'ladino' | 'mago' | 'nobre' | 'soldado';
export type Tag = 'corajoso' | 'astuto' | 'piedoso' | 'cinico' | 'protetor' | 'curioso' | 'leal' | 'individualista' | 'sombrio' | 'jovial' | 'pragmatico' | 'idealista' | 'rude' | 'refinado' | 'selvagem' | 'erudito';

export type Payload = {
  attrs?: Partial<Record<AttrKey, number>>;
  classes?: Partial<Record<ClassKey, number>>;
  skills?: Partial<Record<string, number>>;   // chave = perícia em snake_case
  tags?: Tag[];
};

export type Option = { id: 'a' | 'b' | 'c' | 'd'; label: string; payload: Payload };
export type Question = { id: number; act: 1 | 2 | 3; scene: string; prompt: string; options: Option[] };

export const QUESTIONS: Question[] = [
  // ATO I — Sua origem
  {
    id: 1, act: 1,
    scene: "Você fecha os olhos e pensa no lugar onde cresceu. Os cheiros e sons voltam com força.",
    prompt: "Onde foi?",
    options: [
      { id: 'a', label: "Numa fazenda ou aldeia rural, ouvindo o vento nos campos.", payload: { attrs: { con: 1, wis: 1 }, skills: { sobrevivencia: 1, adestramento: 1 }, tags: ['leal', 'pragmatico'] } },
      { id: 'b', label: "Nas ruas estreitas de uma cidade grande, aprendendo a se virar.", payload: { attrs: { dex: 1, cha: 1 }, skills: { furtividade: 1, ladinagem: 1 }, tags: ['astuto', 'cinico'] } },
      { id: 'c', label: "Em uma propriedade nobre, com mestres e professores particulares.", payload: { attrs: { int: 1, cha: 1 }, skills: { nobreza: 1, diplomacia: 1 }, tags: ['refinado', 'erudito'] } },
      { id: 'd', label: "Nas matas e ermos, longe da civilização.", payload: { attrs: { str: 1, wis: 1 }, skills: { sobrevivencia: 1, atletismo: 1 }, tags: ['selvagem', 'individualista'] } },
    ]
  },
  {
    id: 2, act: 1,
    scene: "Há uma cena que volta toda vez que você fecha os olhos. A primeira vez que viu sangue.",
    prompt: "O que você fez naquele momento?",
    options: [
      { id: 'a', label: "Avancei. Tinha alguém em perigo e eu não pensei duas vezes — só corri para frente.", payload: { attrs: { str: 1, con: 1 }, classes: { cavaleiro: 2, soldado: 2, barbaro: 1 }, skills: { luta: 1, fortitude: 1 }, tags: ['corajoso', 'protetor'] } },
      { id: 'b', label: "Me escondi e observei. Aprendi mais ali, parado, do que se tivesse me metido.", payload: { attrs: { dex: 1, int: 1 }, classes: { ladino: 2, cacador: 1, mago: 1 }, skills: { furtividade: 1, percepcao: 1 }, tags: ['astuto', 'cinico'] } },
      { id: 'c', label: "Corri atrás de ajuda. Sabia que sozinho eu não resolveria, mas conhecia quem resolveria.", payload: { attrs: { dex: 1, cha: 1 }, classes: { bardo: 1, nobre: 2, bucaneiro: 1 }, skills: { atletismo: 1, diplomacia: 1 }, tags: ['pragmatico', 'leal'] } },
      { id: 'd', label: "Rezei. Pedi que algum santo cuidasse daquilo, porque eu sozinho não daria conta.", payload: { attrs: { wis: 2, cha: 1 }, classes: { clerigo: 2, druida: 1 }, skills: { religiao: 1, vontade: 1 }, tags: ['piedoso', 'idealista'] } },
    ]
  },
  {
    id: 3, act: 1,
    scene: "Sua família — ou quem te criou — sustentava a casa fazendo o quê?",
    prompt: "O ofício da família",
    options: [
      { id: 'a', label: "Trabalhavam com terra, animais ou ferramentas. Mãos calejadas, dia inteiro de serviço.", payload: { attrs: { str: 1, con: 1 }, skills: { oficio: 1, atletismo: 1 }, tags: ['rude', 'pragmatico'] } },
      { id: 'b', label: "Comerciavam, negociavam, viajavam com mercadorias. Lábia era o capital.", payload: { attrs: { cha: 1, int: 1 }, skills: { diplomacia: 1, intuicao: 1 }, classes: { bucaneiro: 1, nobre: 1 }, tags: ['astuto', 'jovial'] } },
      { id: 'c', label: "Curavam, ensinavam, copiavam livros, serviam a um santo. Trabalho da mente e do espírito.", payload: { attrs: { int: 1, wis: 1 }, skills: { cura: 1, conhecimento: 1, religiao: 1 }, classes: { clerigo: 1, mago: 2 }, tags: ['erudito', 'piedoso'] } },
      { id: 'd', label: "Lutavam. Mercenários, guardas, soldados. Espada era ferramenta de trabalho.", payload: { attrs: { str: 1, dex: 1 }, skills: { luta: 1, pontaria: 1, guerra: 1 }, classes: { soldado: 2, cavaleiro: 1 }, tags: ['leal', 'corajoso'] } },
    ]
  },
  {
    id: 4, act: 1,
    scene: "Existe um objeto, pequeno, que ainda hoje está com você. Não vale muito para os outros, mas para você é precioso.",
    prompt: "Como ele veio parar nas suas mãos?",
    options: [
      { id: 'a', label: "Um cavaleiro velho me deu, antes de morrer. Disse que eu tinha 'olhar para o certo'.", payload: { attrs: { con: 1, cha: 1 }, classes: { cavaleiro: 2, nobre: 1, soldado: 1 }, skills: { vontade: 1 }, tags: ['idealista', 'leal'] } },
      { id: 'b', label: "Achei abandonado em ruínas que eu não devia estar explorando.", payload: { attrs: { dex: 1, int: 1 }, classes: { ladino: 2, mago: 1, cacador: 1 }, skills: { investigacao: 1, ladinagem: 1 }, tags: ['curioso', 'individualista'] } },
      { id: 'c', label: "Tirei do bolso de alguém que merecia perder.", payload: { attrs: { dex: 2, cha: 1 }, classes: { ladino: 2, bucaneiro: 2 }, skills: { furtividade: 1, ladinagem: 1 }, tags: ['cinico', 'astuto'] } },
      { id: 'd', label: "Ganhei numa cerimônia. Foi entregue com palavras solenes. Eu não esqueço daquelas palavras.", payload: { attrs: { wis: 1, cha: 1 }, classes: { clerigo: 2, druida: 1, cavaleiro: 1 }, skills: { religiao: 1, nobreza: 1 }, tags: ['piedoso', 'leal'] } },
    ]
  },
  {
    id: 5, act: 1,
    scene: "Houve alguém — só uma pessoa — que mudou o jeito que você olha o mundo.",
    prompt: "Quem era?",
    options: [
      { id: 'a', label: "Um veterano com cicatrizes que sentava em silêncio na taverna e, quando falava, todos ouviam.", payload: { attrs: { str: 1, wis: 1 }, classes: { soldado: 2, barbaro: 1, cavaleiro: 1 }, skills: { intimidacao: 1, fortitude: 1 }, tags: ['rude', 'leal'] } },
      { id: 'b', label: "Uma feiticeira solitária que vivia fora da vila e sabia coisas que ninguém mais sabia.", payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 2, druida: 2, clerigo: 1 }, skills: { misticismo: 1, conhecimento: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'c', label: "Um artista errante que apareceu uma vez, contou três histórias, e nunca mais voltou.", payload: { attrs: { cha: 2, int: 1 }, classes: { bardo: 3, bucaneiro: 1 }, skills: { atuacao: 1, conhecimento: 1 }, tags: ['curioso', 'jovial'] } },
      { id: 'd', label: "Um amigo da minha idade que morreu cedo demais. Eu juro que vivo por nós dois.", payload: { attrs: { con: 2, cha: 1 }, classes: { cavaleiro: 2, clerigo: 1, soldado: 1 }, skills: { vontade: 1, fortitude: 1 }, tags: ['idealista', 'sombrio'] } },
    ]
  },
  {
    id: 6, act: 1,
    scene: "Um dia você fez as malas e foi embora. Não por capricho.",
    prompt: "Por quê?",
    options: [
      { id: 'a', label: "Algo terrível aconteceu com minha família ou minha vila. Eu não podia ficar.", payload: { attrs: { con: 1, wis: 1 }, classes: { cavaleiro: 1, clerigo: 1, barbaro: 1 }, tags: ['sombrio', 'protetor'], skills: { vontade: 1 } } },
      { id: 'b', label: "Eu precisava ver o mundo. Ficar onde nasci era morrer aos poucos.", payload: { attrs: { dex: 1, cha: 1 }, classes: { bardo: 2, bucaneiro: 2, cacador: 1 }, tags: ['curioso', 'jovial'], skills: { atletismo: 1 } } },
      { id: 'c', label: "Tive uma visão. Uma voz. Um chamado que ninguém mais ouviu.", payload: { attrs: { wis: 2, cha: 1 }, classes: { clerigo: 3, druida: 2, mago: 1 }, tags: ['piedoso', 'idealista'], skills: { religiao: 1, misticismo: 1 } } },
      { id: 'd', label: "Tinha gente atrás de mim. Não dava mais para ficar parado num só lugar.", payload: { attrs: { dex: 2, con: 1 }, classes: { ladino: 2, bucaneiro: 1, cacador: 1 }, tags: ['cinico', 'individualista'], skills: { furtividade: 1, reflexos: 1 } } },
    ]
  },

  // ATO II — Como você age
  {
    id: 7, act: 2,
    scene: "Estrada quase deserta, fim de tarde. Você vê uma pessoa caída, ferida, sangrando bastante. Os bandidos que fizeram aquilo podem ainda estar por perto.",
    prompt: "O que você faz?",
    options: [
      { id: 'a', label: "Pego a pessoa no colo, custe o que custar, e levo até a próxima vila. Os bandidos que tentem.", payload: { attrs: { str: 2, con: 1 }, classes: { cavaleiro: 2, barbaro: 1, soldado: 1 }, skills: { atletismo: 1, fortitude: 1 }, tags: ['protetor', 'corajoso'] } },
      { id: 'b', label: "Corro até a vila mais próxima e volto com ajuda. Sozinho não resolvo, mas rápido sim.", payload: { attrs: { dex: 2, con: 1 }, classes: { bucaneiro: 1, cacador: 1, bardo: 1 }, skills: { atletismo: 1, reflexos: 1 }, tags: ['pragmatico', 'leal'] } },
      { id: 'c', label: "Examino os ferimentos com calma. Sei como estancar sangue. Faço o que dá ali mesmo.", payload: { attrs: { wis: 2, int: 1 }, classes: { clerigo: 2, druida: 1, mago: 1 }, skills: { cura: 2 }, tags: ['piedoso', 'pragmatico'] } },
      { id: 'd', label: "Primeiro reviso a área. Quem fez isso pode estar perto. Não vou virar a próxima vítima por descuido.", payload: { attrs: { dex: 1, wis: 2 }, classes: { ladino: 2, cacador: 2 }, skills: { percepcao: 1, furtividade: 1 }, tags: ['astuto', 'cinico'] } },
    ]
  },
  {
    id: 8, act: 2,
    scene: "Você entra numa taverna cheia. Dois homens grandes brigam com alguém menor que claramente apanhou demais. Ninguém intervém.",
    prompt: "Você…",
    options: [
      { id: 'a', label: "Vou direto pra cima dos dois. Onde tem injustiça eu não passo reto.", payload: { attrs: { str: 2, cha: 1 }, classes: { cavaleiro: 2, barbaro: 2, soldado: 1 }, skills: { intimidacao: 1, luta: 1 }, tags: ['protetor', 'corajoso'] } },
      { id: 'b', label: "Subo numa mesa, conto uma piada alta, viro a atenção da sala. Briga acaba sem golpe.", payload: { attrs: { cha: 2, dex: 1 }, classes: { bardo: 3, bucaneiro: 1 }, skills: { atuacao: 1, enganacao: 1 }, tags: ['jovial', 'astuto'] } },
      { id: 'c', label: "Compro uma rodada para os brigões. Sento na mesa deles. Em três minutos, eles me ouvem.", payload: { attrs: { cha: 2, wis: 1 }, classes: { nobre: 2, bardo: 1, clerigo: 1 }, skills: { diplomacia: 2 }, tags: ['refinado', 'pragmatico'] } },
      { id: 'd', label: "Espero. Quando saírem, sigo eles. Resolvo lá fora, do meu jeito, sem plateia.", payload: { attrs: { dex: 2, wis: 1 }, classes: { ladino: 2, cacador: 2 }, skills: { furtividade: 2 }, tags: ['cinico', 'sombrio'] } },
    ]
  },
  {
    id: 9, act: 2,
    scene: "Uma masmorra antiga. Você está no meio do caminho e há uma porta de carvalho reforçada, trancada. Atrás dela, algo importante.",
    prompt: "Como você passa?",
    options: [
      { id: 'a', label: "Empurro. Chuto. A porta cede ou eu cedo, mas tem que ter um vencedor.", payload: { attrs: { str: 2, con: 1 }, classes: { barbaro: 2, soldado: 1, cavaleiro: 1 }, skills: { atletismo: 2 }, tags: ['rude', 'corajoso'] } },
      { id: 'b', label: "Ajoelho com minhas ferramentas. Fechadura é só um quebra-cabeça pra mãos rápidas.", payload: { attrs: { dex: 2, int: 1 }, classes: { ladino: 3, bucaneiro: 1 }, skills: { ladinagem: 2 }, tags: ['astuto', 'pragmatico'] } },
      { id: 'c', label: "Examino a moldura, os pontos fracos, gravuras estranhas. Toda porta tem segredo.", payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 2, ladino: 1 }, skills: { investigacao: 2, misticismo: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'd', label: "Um sussurro, um gesto, uma palavra antiga. A porta abre por conta própria.", payload: { attrs: { int: 1, cha: 2 }, classes: { mago: 3, clerigo: 1, bardo: 1 }, skills: { misticismo: 2 }, tags: ['erudito', 'individualista'] } },
    ]
  },
  {
    id: 10, act: 2,
    scene: "Você precisa convencer um capitão amargurado a transportar você e seu grupo num barco mercante. Ele diz que não.",
    prompt: "Como você muda a opinião dele?",
    options: [
      { id: 'a', label: "Olho nos olhos, falo baixo, faço ele entender que eu não estou pedindo de novo.", payload: { attrs: { cha: 1, str: 1 }, classes: { barbaro: 1, soldado: 1, nobre: 1 }, skills: { intimidacao: 2 }, tags: ['rude', 'corajoso'] } },
      { id: 'b', label: "Conto uma história. Algo que toque ele. Tem sempre uma trinca onde a história entra.", payload: { attrs: { cha: 2, wis: 1 }, classes: { bardo: 3, bucaneiro: 1 }, skills: { atuacao: 1, diplomacia: 1 }, tags: ['jovial', 'astuto'] } },
      { id: 'c', label: "Apelo à honra ou ao bem comum. Quem é homem de palavra entende a urgência.", payload: { attrs: { cha: 1, wis: 1 }, classes: { cavaleiro: 2, clerigo: 2, nobre: 2 }, skills: { diplomacia: 2 }, tags: ['idealista', 'leal'] } },
      { id: 'd', label: "Descubro o que ele quer mesmo. Não o que ele diz que quer. E uso isso.", payload: { attrs: { int: 1, cha: 2 }, classes: { ladino: 2, bucaneiro: 2, mago: 1 }, skills: { enganacao: 2, intuicao: 1 }, tags: ['astuto', 'cinico'] } },
    ]
  },
  {
    id: 11, act: 2,
    scene: "Você ouve falar de um dragão antigo dormindo sobre uma pilha de ouro numa montanha distante. A maioria das pessoas evita o assunto.",
    prompt: "O que passa pela sua cabeça?",
    options: [
      { id: 'a', label: "Curiosidade. Não pelo ouro, mas pelo dragão. Quero saber tudo sobre ele — cor, idade, onde dorme, o que come.", payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 2, druida: 1, cacador: 1 }, skills: { conhecimento: 2, misticismo: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'b', label: "O ouro é o que importa. Posso comprar muito reino com isso. Vamos planejar.", payload: { attrs: { dex: 1, cha: 1 }, classes: { bucaneiro: 2, ladino: 2, nobre: 1 }, skills: { ladinagem: 1, guerra: 1 }, tags: ['pragmatico', 'jovial'] } },
      { id: 'c', label: "Glória. Matar um dragão é virar lenda. Eu vou tentar.", payload: { attrs: { str: 2, con: 1 }, classes: { barbaro: 2, cavaleiro: 2, soldado: 2 }, skills: { luta: 1, vontade: 1 }, tags: ['corajoso', 'idealista'] } },
      { id: 'd', label: "Dragões são parte do mundo. Se está dormindo, deixe dormir. Quem mexer com aquilo merece o que vier.", payload: { attrs: { wis: 2, con: 1 }, classes: { druida: 3, clerigo: 1 }, skills: { sobrevivencia: 1, intuicao: 1 }, tags: ['selvagem', 'pragmatico'] } },
    ]
  },
  {
    id: 12, act: 2,
    scene: "Alguém que você confiava traiu o grupo. Você descobre tudo antes deles agirem. Tem a noite inteira para decidir o que fazer.",
    prompt: "O que decide?",
    options: [
      { id: 'a', label: "Confronto direto, antes do amanhecer. Cara a cara. Ele que se explique.", payload: { attrs: { str: 1, cha: 1 }, classes: { cavaleiro: 2, barbaro: 1, soldado: 1 }, skills: { intimidacao: 1, intuicao: 1 }, tags: ['corajoso', 'leal'] } },
      { id: 'b', label: "Conto pro resto do grupo, em segredo. Montamos uma armadilha juntos.", payload: { attrs: { int: 1, wis: 1 }, classes: { nobre: 2, bardo: 1, mago: 1, ladino: 1 }, skills: { diplomacia: 1, guerra: 1 }, tags: ['astuto', 'leal'] } },
      { id: 'c', label: "Não digo nada pra ninguém. Resolvo sozinho, do meu jeito, sem testemunha.", payload: { attrs: { dex: 2, wis: 1 }, classes: { ladino: 3, cacador: 2 }, skills: { furtividade: 2 }, tags: ['sombrio', 'individualista'] } },
      { id: 'd', label: "Dou uma chance. Pergunto, em particular, se ele quer voltar atrás. Algumas pessoas se perdem; nem todas estão perdidas.", payload: { attrs: { wis: 2, cha: 1 }, classes: { clerigo: 2, druida: 1, cavaleiro: 1 }, skills: { intuicao: 2, vontade: 1 }, tags: ['piedoso', 'idealista'] } },
    ]
  },
  {
    id: 13, act: 2,
    scene: "Um dia raro de paz. Sem missão, sem perigo, sem pressa.",
    prompt: "Como você passa essa tarde?",
    options: [
      { id: 'a', label: "Treinando. Espada, arco, postura. Paz é o intervalo entre lutas; tenho que estar pronto.", payload: { attrs: { str: 1, dex: 1 }, classes: { soldado: 2, cavaleiro: 1, cacador: 1 }, skills: { luta: 1, pontaria: 1 }, tags: ['leal', 'pragmatico'] } },
      { id: 'b', label: "Lendo, escrevendo, decifrando algo antigo que ninguém mais decifrou.", payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 3, clerigo: 1 }, skills: { conhecimento: 2, misticismo: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'c', label: "Caminhando na mata, ouvindo os pássaros, cuidando das pequenas coisas.", payload: { attrs: { wis: 2, con: 1 }, classes: { druida: 3, cacador: 1 }, skills: { sobrevivencia: 2, percepcao: 1 }, tags: ['selvagem', 'piedoso'] } },
      { id: 'd', label: "Numa taverna cheia, contando histórias, fazendo amigos, bebendo o que aparecer.", payload: { attrs: { cha: 2, con: 1 }, classes: { bardo: 3, bucaneiro: 2, nobre: 1 }, skills: { atuacao: 1, diplomacia: 1 }, tags: ['jovial', 'curioso'] } },
    ]
  },

  // ATO III — No que você acredita
  {
    id: 14, act: 3,
    scene: "Você ouve dois desconhecidos discutindo sobre os reinos. Um diz que Zamir foi o pior tirano que Ghanor já viu. Outro diz que pior do que Zamir são os pequenos tiranos de hoje.",
    prompt: "Qual deles você acha que tem mais razão?",
    options: [
      { id: 'a', label: "O primeiro. Tirano é tirano. Quanto maior, pior. Ainda bem que Ruff Ghanor o derrotou.", payload: { attrs: { wis: 1, cha: 1 }, classes: { cavaleiro: 1, clerigo: 1, nobre: 1 }, skills: { nobreza: 1, religiao: 1 }, tags: ['idealista', 'leal'] } },
      { id: 'b', label: "O segundo. Zamir era um só. Os tiranos pequenos estão em toda esquina, e ninguém canta sobre eles.", payload: { attrs: { int: 1, wis: 1 }, classes: { ladino: 1, bardo: 1, druida: 1 }, skills: { intuicao: 1, investigacao: 1 }, tags: ['cinico', 'astuto'] } },
      { id: 'c', label: "Nenhum dos dois. O problema é o povo que aceita ser dominado, seja por quem for.", payload: { attrs: { str: 1, cha: 1 }, classes: { barbaro: 2, nobre: 1 }, skills: { intimidacao: 1, vontade: 1 }, tags: ['individualista', 'rude'] } },
      { id: 'd', label: "Sei lá. Eu me preocupo com quem eu posso ajudar hoje. Política dos reinos não me cabe.", payload: { attrs: { con: 1, wis: 1 }, classes: { clerigo: 1, druida: 1, soldado: 1 }, skills: { cura: 1, sobrevivencia: 1 }, tags: ['pragmatico', 'protetor'] } },
    ]
  },
  {
    id: 15, act: 3,
    scene: "Três aventureiros se encontram numa encruzilhada: uma maga estudiosa, uma clériga de São Arnaldo, e um soldado veterano. Cada um diz que sua via é a verdadeira força do mundo.",
    prompt: "De qual você se senta mais perto, para ouvir?",
    options: [
      { id: 'a', label: "Da maga. Conhecimento muda mais do mundo do que qualquer espada. Magia é só conhecimento bem aplicado.", payload: { attrs: { int: 3 }, classes: { mago: 4, bardo: 1 }, skills: { misticismo: 2, conhecimento: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'b', label: "Da clériga. Fé move montanhas. Os santos enxergam o que os homens não enxergam.", payload: { attrs: { wis: 2, cha: 1 }, classes: { clerigo: 4, druida: 1 }, skills: { religiao: 2, vontade: 1 }, tags: ['piedoso', 'idealista'] } },
      { id: 'c', label: "Do soldado. Lindas as palavras, mas no fim alguém tem que segurar a linha. Aço é honesto.", payload: { attrs: { str: 2, con: 1 }, classes: { soldado: 3, cavaleiro: 2, barbaro: 1 }, skills: { luta: 2, fortitude: 1 }, tags: ['leal', 'pragmatico'] } },
      { id: 'd', label: "Dos três. Sento no meio. Cada um sabe um pedaço. Quem só tem martelo só enxerga prego.", payload: { attrs: { cha: 2, int: 1 }, classes: { bardo: 3, nobre: 2, bucaneiro: 1 }, skills: { diplomacia: 1, atuacao: 1, conhecimento: 1 }, tags: ['curioso', 'pragmatico'] } },
    ]
  },
  {
    id: 16, act: 3,
    scene: "Você está caminhando por uma região afetada pelo óleo negro do Devorador. Algumas pessoas tocaram ele e se tornaram aberrantes. Você encontra uma família escondida, com uma filha pequena que claramente foi alterada — pele rochosa, sentidos estranhos. Os pais imploram que você não conte a ninguém.",
    prompt: "Você…",
    options: [
      { id: 'a', label: "Prometo. Sigo em frente. O que os outros não souberem não vai feri-la.", payload: { attrs: { wis: 1, cha: 1 }, classes: { ladino: 1, druida: 1, clerigo: 1 }, skills: { furtividade: 1, intuicao: 1 }, tags: ['protetor', 'piedoso'] } },
      { id: 'b', label: "Ofereço ajuda. Conheço gente que pode acolhê-los longe, onde ela vai poder crescer em paz.", payload: { attrs: { wis: 1, cha: 2 }, classes: { clerigo: 2, nobre: 2, bardo: 1 }, skills: { diplomacia: 1, cura: 1 }, tags: ['idealista', 'protetor'] } },
      { id: 'c', label: "Estudo a criança, com permissão. Aberrantes são mistério; cada caso é uma página nova do mundo.", payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 3, druida: 1 }, skills: { misticismo: 1, cura: 1, conhecimento: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'd', label: "Sigo viagem sem prometer nada. Vou guardar a informação, mas não vou mentir se alguém perguntar.", payload: { attrs: { int: 1, wis: 1 }, classes: { cavaleiro: 1, soldado: 1, cacador: 1 }, skills: { vontade: 1, intuicao: 1 }, tags: ['leal', 'pragmatico'] } },
    ]
  },
  {
    id: 17, act: 3,
    scene: "Se um bardo, daqui a cinquenta anos, fosse compor uma canção sobre você...",
    prompt: "Qual a primeira frase que você gostaria que ela tivesse?",
    options: [
      { id: 'a', label: '"Ele segurou a linha quando ninguém mais segurava."', payload: { attrs: { con: 2, str: 1 }, classes: { cavaleiro: 3, soldado: 2 }, skills: { fortitude: 1, vontade: 1 }, tags: ['leal', 'protetor'] } },
      { id: 'b', label: '"Ela enxergou o que os outros não enxergaram."', payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 2, ladino: 1, cacador: 1 }, skills: { investigacao: 1, percepcao: 1 }, tags: ['astuto', 'erudito'] } },
      { id: 'c', label: '"Ninguém riu tanto, nem fez tanta gente rir."', payload: { attrs: { cha: 2, dex: 1 }, classes: { bardo: 3, bucaneiro: 2 }, skills: { atuacao: 1, enganacao: 1 }, tags: ['jovial', 'curioso'] } },
      { id: 'd', label: '"Quando ele passou pela cidade, ninguém esqueceu."', payload: { attrs: { cha: 2, str: 1 }, classes: { nobre: 3, barbaro: 1, bucaneiro: 1 }, skills: { intimidacao: 1, diplomacia: 1 }, tags: ['refinado', 'individualista'] } },
    ]
  },
  {
    id: 18, act: 3,
    scene: "Um sábio velho te oferece um dom, antes da sua primeira aventura de verdade. Você só pode escolher um.",
    prompt: "Qual?",
    options: [
      { id: 'a', label: "Um corpo que não cansa nunca.", payload: { attrs: { con: 3, str: 1 }, classes: { barbaro: 2, soldado: 2, cavaleiro: 1 }, skills: { fortitude: 2 }, tags: ['rude', 'corajoso'] } },
      { id: 'b', label: "Mãos rápidas que erram pouco.", payload: { attrs: { dex: 3 }, classes: { ladino: 2, bucaneiro: 2, cacador: 1 }, skills: { ladinagem: 1, pontaria: 1, reflexos: 1 }, tags: ['astuto', 'individualista'] } },
      { id: 'c', label: "Uma mente que entende tudo que lê.", payload: { attrs: { int: 3 }, classes: { mago: 3, bardo: 1 }, skills: { conhecimento: 2, misticismo: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'd', label: "Um coração que sabe a hora certa de falar.", payload: { attrs: { cha: 2, wis: 2 }, classes: { bardo: 1, clerigo: 2, nobre: 2 }, skills: { diplomacia: 1, intuicao: 2 }, tags: ['piedoso', 'refinado'] } },
    ]
  }
];
