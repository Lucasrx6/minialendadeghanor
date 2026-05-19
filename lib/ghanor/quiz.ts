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

export const ACT_LABELS: Record<1 | 2 | 3, string> = {
  1: "Como você funciona",
  2: "Como você lida com gente e pressão",
  3: "O que te move",
};

export const QUESTIONS: Question[] = [
  // ATO I — Como você funciona
  {
    id: 1, act: 1,
    scene: "Segunda-feira, 7h da manhã. O despertador tocou. Como começa o seu dia, no melhor cenário possível?",
    prompt: "Como é a sua manhã ideal?",
    options: [
      { id: 'a', label: "Acordo antes do despertador, treino, tomo café com calma. Gosto do dia já encaixado quando saio de casa.", payload: { attrs: { str: 1, con: 1 }, classes: { soldado: 2, cavaleiro: 2, barbaro: 1 }, skills: { atletismo: 1, fortitude: 1 }, tags: ['leal', 'pragmatico'] } },
      { id: 'b', label: "Acordo correndo, café no caminho, resolvo no improviso. Dia bom é dia que rolou.", payload: { attrs: { dex: 1, cha: 1 }, classes: { bucaneiro: 2, ladino: 1, bardo: 1 }, skills: { reflexos: 1, atletismo: 1 }, tags: ['astuto', 'jovial'] } },
      { id: 'c', label: "Demoro um tempo no sofá, café e celular. Pegar ritmo no meu tempo me deixa mais inteiro pro resto.", payload: { attrs: { wis: 1, int: 1 }, classes: { druida: 2, mago: 1, clerigo: 1 }, skills: { percepcao: 1, intuicao: 1 }, tags: ['selvagem', 'pragmatico'] } },
      { id: 'd', label: "Já abro o e-mail e a agenda na cama. Quero saber o que me espera antes de pisar fora do quarto.", payload: { attrs: { int: 2, cha: 1 }, classes: { nobre: 2, mago: 2 }, skills: { investigacao: 1, conhecimento: 1 }, tags: ['refinado', 'erudito'] } },
    ]
  },
  {
    id: 2, act: 1,
    scene: "Pensa na última vez que algo realmente te tirou do sério. Não algo grande, só uma coisa que te fez perder a linha por uns minutos. Como foi?",
    prompt: "Como você reage quando perde a linha?",
    options: [
      { id: 'a', label: "Explodi na hora. Falei o que tinha que falar. Depois passa, mas naquele momento eu não engulo.", payload: { attrs: { str: 2, con: 1 }, classes: { barbaro: 3, soldado: 1 }, skills: { intimidacao: 1, luta: 1 }, tags: ['rude', 'corajoso'] } },
      { id: 'b', label: "Engoli na frente das pessoas. Depois fui processar sozinho, no banho ou caminhando.", payload: { attrs: { wis: 2, con: 1 }, classes: { clerigo: 1, druida: 2, cavaleiro: 1 }, skills: { vontade: 2 }, tags: ['leal', 'sombrio'] } },
      { id: 'c', label: "Fui sarcástico. Fiz uma piada bem afiada e a pessoa percebeu que eu estava puto.", payload: { attrs: { cha: 2, int: 1 }, classes: { bardo: 2, ladino: 2, bucaneiro: 1 }, skills: { enganacao: 1, atuacao: 1 }, tags: ['cinico', 'astuto'] } },
      { id: 'd', label: "Não perco a linha fácil. Tirar alguém do sério é um esporte que poucos jogam comigo.", payload: { attrs: { wis: 1, cha: 2 }, classes: { nobre: 3, clerigo: 1 }, skills: { diplomacia: 1, vontade: 1 }, tags: ['refinado', 'idealista'] } },
    ]
  },
  {
    id: 3, act: 1,
    scene: "Domingo, 22h. A semana começa amanhã. O que você está fazendo?",
    prompt: "Qual é o seu domingo à noite?",
    options: [
      { id: 'a', label: "Lendo, jogando ou vendo um documentário. Coisa que me ensina algo, mesmo que pequeno.", payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 3, druida: 1 }, skills: { conhecimento: 2, investigacao: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'b', label: "Falando com alguém — chamada de vídeo, áudio longo, mensagem que vira papo de 2h.", payload: { attrs: { cha: 2, wis: 1 }, classes: { bardo: 2, nobre: 2, clerigo: 1 }, skills: { diplomacia: 1, intuicao: 1 }, tags: ['jovial', 'leal'] } },
      { id: 'c', label: "Já dormi. Acordo cedo, então sigo a rotina mesmo no domingo.", payload: { attrs: { con: 2, str: 1 }, classes: { soldado: 2, cavaleiro: 1, barbaro: 1 }, skills: { fortitude: 1, vontade: 1 }, tags: ['leal', 'pragmatico'] } },
      { id: 'd', label: "Em algum lugar que não é minha casa. Casa de amigo, virando a esquina, dando uma volta. Domingo só é domingo se for esticado.", payload: { attrs: { dex: 1, cha: 2 }, classes: { bucaneiro: 3, bardo: 1, ladino: 1 }, skills: { atletismo: 1, atuacao: 1 }, tags: ['individualista', 'jovial'] } },
    ]
  },
  {
    id: 4, act: 1,
    scene: "Tem um objeto na sua casa que ninguém mais entende por que você guarda. Caixa, gaveta, prateleira — tem alguma coisa ali há anos. O que é, mais ou menos?",
    prompt: "O que você guarda que ninguém entende?",
    options: [
      { id: 'a', label: "Algo que alguém me deu antes de uma despedida importante. Não é o objeto em si — é o momento.", payload: { attrs: { cha: 1, wis: 1 }, classes: { cavaleiro: 2, clerigo: 2, nobre: 1 }, skills: { vontade: 1, diplomacia: 1 }, tags: ['idealista', 'leal'] } },
      { id: 'b', label: "Algo de uma fase minha que já passou — adolescência, antigo trabalho, ex. Lembra de quem eu fui.", payload: { attrs: { wis: 1, cha: 1 }, classes: { bardo: 1, ladino: 2, druida: 1 }, skills: { atuacao: 1, intuicao: 1 }, tags: ['sombrio', 'curioso'] } },
      { id: 'c', label: "Um objeto técnico ou raro. Algo que pegou tempo pra eu conseguir, ou que tem uma história curiosa por trás.", payload: { attrs: { int: 2, dex: 1 }, classes: { mago: 2, cacador: 1, ladino: 1 }, skills: { conhecimento: 1, investigacao: 1, oficio: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'd', label: "Honestamente não sou muito de guardar. Se algo não tem uso, vai embora. Casa leve, cabeça leve.", payload: { attrs: { wis: 2, con: 1 }, classes: { druida: 2, cacador: 2, barbaro: 2 }, skills: { sobrevivencia: 1, percepcao: 1 }, tags: ['pragmatico', 'individualista'] } },
    ]
  },
  {
    id: 5, act: 1,
    scene: "Sem pensar muito: quem é a primeira pessoa que veio na sua cabeça quando perguntei 'quem mudou o jeito que você vê o mundo?'.",
    prompt: "Quem foi essa pessoa?",
    options: [
      { id: 'a', label: "Alguém que via tudo e falava pouco. Quando abria a boca, todo mundo prestava atenção.", payload: { attrs: { wis: 2, str: 1 }, classes: { soldado: 2, cavaleiro: 1, barbaro: 1 }, skills: { intuicao: 1, intimidacao: 1 }, tags: ['rude', 'leal'] } },
      { id: 'b', label: "Alguém com uma cabeça diferente do resto. Lia coisas estranhas, sabia coisas que ninguém mais sabia, e me ensinou que tem muita coisa fora do óbvio.", payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 3, druida: 1 }, skills: { misticismo: 1, conhecimento: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'c', label: "Alguém que tinha um jeito de contar histórias e fazer rir. Aprendi com ela que graça também é inteligência.", payload: { attrs: { cha: 2, int: 1 }, classes: { bardo: 3, bucaneiro: 1, druida: 2 }, skills: { atuacao: 1, conhecimento: 1 }, tags: ['jovial', 'curioso'] } },
      { id: 'd', label: "Alguém que passou junto comigo por uma fase difícil. Não sei se eu sairia inteiro sem essa pessoa.", payload: { attrs: { con: 2, cha: 1 }, classes: { cavaleiro: 2, clerigo: 2, soldado: 1 }, skills: { fortitude: 1, vontade: 1 }, tags: ['leal', 'sombrio'] } },
    ]
  },
  {
    id: 6, act: 1,
    scene: "Pensa numa vez que você mudou de cidade, de trabalho, de relacionamento, de qualquer coisa importante. Por que você foi?",
    prompt: "O que te fez partir?",
    options: [
      { id: 'a', label: "Algo ruim me empurrou pra fora. Não era saudável continuar onde eu estava, e eu precisei tomar uma decisão antes que piorasse.", payload: { attrs: { con: 1, wis: 1 }, classes: { cavaleiro: 1, clerigo: 1, barbaro: 2 }, skills: { vontade: 1, fortitude: 1 }, tags: ['sombrio', 'protetor'] } },
      { id: 'b', label: "Curiosidade pura. Apareceu uma chance e eu sabia que se não fosse, ia ficar pensando 'e se' pelo resto da vida.", payload: { attrs: { dex: 1, cha: 1 }, classes: { bardo: 2, bucaneiro: 2, cacador: 1 }, skills: { atletismo: 1, sobrevivencia: 1 }, tags: ['curioso', 'jovial'] } },
      { id: 'c', label: "Tive uma sensação muito forte de que era hora. Difícil explicar, mas era um chamado pra alguma coisa nova.", payload: { attrs: { wis: 2, cha: 1 }, classes: { clerigo: 2, druida: 2, mago: 1 }, skills: { religiao: 1, intuicao: 1 }, tags: ['piedoso', 'idealista'] } },
      { id: 'd', label: "Tinha gente ou problemas me cobrando demais. Não cabia mais ficar e fingir.", payload: { attrs: { dex: 2, con: 1 }, classes: { ladino: 2, bucaneiro: 1, cacador: 1 }, skills: { furtividade: 1, reflexos: 1 }, tags: ['cinico', 'individualista'] } },
    ]
  },

  // ATO II — Como você lida com gente e pressão
  {
    id: 7, act: 2,
    scene: "Grupo de WhatsApp da família, do trabalho ou de amigos. Duas pessoas estão discutindo feio, e tá ficando chato pra todo mundo. Você lê tudo e...",
    prompt: "O que você faz?",
    options: [
      { id: 'a', label: "Mando um áudio de 3 minutos pondo ordem na situação. Alguém precisa segurar a barra, e geralmente sou eu.", payload: { attrs: { str: 1, cha: 1 }, classes: { cavaleiro: 2, soldado: 1, barbaro: 1 }, skills: { intimidacao: 1, vontade: 1 }, tags: ['protetor', 'corajoso'] } },
      { id: 'b', label: "Mando um meme bem colocado. Quando funciona, a briga acaba porque todo mundo ri.", payload: { attrs: { cha: 2, dex: 1 }, classes: { bardo: 3, bucaneiro: 1 }, skills: { atuacao: 1, enganacao: 1 }, tags: ['jovial', 'astuto'] } },
      { id: 'c', label: "Saio do grupo, em silêncio. Quando voltar (se voltar), já passou.", payload: { attrs: { wis: 2, dex: 1 }, classes: { druida: 2, ladino: 1, cacador: 1 }, skills: { furtividade: 1, intuicao: 1 }, tags: ['individualista', 'pragmatico'] } },
      { id: 'd', label: "Chamo os dois separados no privado. Tento entender o que tá acontecendo de verdade, antes de tomar qualquer lado.", payload: { attrs: { wis: 2, cha: 1 }, classes: { clerigo: 2, nobre: 2, bardo: 1 }, skills: { diplomacia: 2, intuicao: 1 }, tags: ['piedoso', 'idealista'] } },
    ]
  },
  {
    id: 8, act: 2,
    scene: "Você chegou numa festa onde só conhece quem te convidou. Ela sumiu pra falar com outras pessoas. Você está parado, copo de refrigerante na mão, sem saber pra onde ir. E aí?",
    prompt: "O que você faz sozinho na festa?",
    options: [
      { id: 'a', label: "Puxo papo com a pessoa do meu lado. Em meia hora já estou no centro de um círculo de gente nova.", payload: { attrs: { cha: 3 }, classes: { bardo: 3, nobre: 2, bucaneiro: 1 }, skills: { atuacao: 1, diplomacia: 1 }, tags: ['jovial', 'refinado'] } },
      { id: 'b', label: "Vou pra cozinha ou pra um canto mais tranquilo. Encontro alguém que também tá meio fora, e a gente conversa.", payload: { attrs: { wis: 2, cha: 1 }, classes: { ladino: 1, druida: 1, clerigo: 2 }, skills: { intuicao: 2, percepcao: 1 }, tags: ['individualista', 'piedoso'] } },
      { id: 'c', label: "Observo. Curioso de ver as dinâmicas. Quem é o líder do grupo, quem tá com quem, quem tá fingindo se divertir.", payload: { attrs: { wis: 1, int: 2 }, classes: { ladino: 2, mago: 2, cacador: 1 }, skills: { percepcao: 2, investigacao: 1 }, tags: ['astuto', 'curioso'] } },
      { id: 'd', label: "Achei estranho ela sumir. Vou atrás dela, ou então saio. Não vou ficar sozinho de pé numa festa.", payload: { attrs: { str: 1, con: 1 }, classes: { barbaro: 1, soldado: 1, cavaleiro: 1 }, skills: { atletismo: 1, fortitude: 1 }, tags: ['rude', 'leal'] } },
    ]
  },
  {
    id: 9, act: 2,
    scene: "Você precisa aprender uma coisa nova e complicada — pode ser uma língua, uma ferramenta no trabalho, uma receita, sei lá. Como você aprende?",
    prompt: "Qual é o seu jeito de aprender?",
    options: [
      { id: 'a', label: "Quebro a cabeça sozinho até entender. Posso ficar horas na mesma página até clicar.", payload: { attrs: { int: 3 }, classes: { mago: 3, ladino: 1 }, skills: { conhecimento: 2, investigacao: 1 }, tags: ['erudito', 'individualista'] } },
      { id: 'b', label: "Vou pelo erro. Faço, erro, corrijo, faço de novo. Aprendo com o corpo, não com a cabeça.", payload: { attrs: { dex: 2, con: 1 }, classes: { bucaneiro: 3, soldado: 2, barbaro: 1 }, skills: { atletismo: 1, oficio: 1, reflexos: 1 }, tags: ['pragmatico', 'rude'] } },
      { id: 'c', label: "Procuro alguém que já sabe e pergunto direto. Não tem por que reinventar a roda.", payload: { attrs: { cha: 2, wis: 1 }, classes: { nobre: 2, bardo: 1, clerigo: 1 }, skills: { diplomacia: 2 }, tags: ['refinado', 'pragmatico'] } },
      { id: 'd', label: "Vou pelo manual ou tutorial. Leio tudo do começo, depois aplico. Gosto do método claro.", payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 2, cavaleiro: 1, soldado: 1 }, skills: { conhecimento: 1, oficio: 1 }, tags: ['erudito', 'leal'] } },
    ]
  },
  {
    id: 10, act: 2,
    scene: "Você precisa muito que uma pessoa diga sim pra você — pode ser um chefe pedindo uma folga, um cliente, um pai, um amigo. Você já tentou educadamente e não rolou. Como você muda o jogo?",
    prompt: "Como você convence alguém resistente?",
    options: [
      { id: 'a', label: "Aumento a pressão. Falo firme, olho nos olhos, deixo claro que não tô brincando. Funciona quase sempre.", payload: { attrs: { cha: 1, str: 2 }, classes: { barbaro: 1, soldado: 1, nobre: 1 }, skills: { intimidacao: 2 }, tags: ['rude', 'corajoso'] } },
      { id: 'b', label: "Conto uma história. Faço a pessoa rir, ou se identificar comigo. Quando ela baixa a guarda, faço o pedido de novo.", payload: { attrs: { cha: 3 }, classes: { bardo: 3, bucaneiro: 1 }, skills: { atuacao: 2, diplomacia: 1 }, tags: ['jovial', 'astuto'] } },
      { id: 'c', label: "Apelo pro lado dela. Argumento por que isso também é bom pra ela ou pro grupo. Não pra mim.", payload: { attrs: { cha: 1, wis: 2 }, classes: { cavaleiro: 2, clerigo: 2, nobre: 1 }, skills: { diplomacia: 2 }, tags: ['idealista', 'leal'] } },
      { id: 'd', label: "Descubro o que ela quer mesmo — não o que ela diz que quer. E uso isso de forma elegante.", payload: { attrs: { int: 1, cha: 2 }, classes: { ladino: 2, bucaneiro: 2, mago: 1 }, skills: { enganacao: 2, intuicao: 1 }, tags: ['astuto', 'cinico'] } },
    ]
  },
  {
    id: 11, act: 2,
    scene: "Quarta-feira, 17h. Você tem que entregar algo importante até sexta. É difícil, mas é possível. Como você toca?",
    prompt: "Como você lida com prazo apertado?",
    options: [
      { id: 'a', label: "Faço plano detalhado, divido em blocos. Quinta à noite já estou revisando, sexta de manhã eu entrego antes da hora.", payload: { attrs: { int: 1, con: 2 }, classes: { soldado: 3, cavaleiro: 1, nobre: 1 }, skills: { oficio: 1, vontade: 1 }, tags: ['leal', 'pragmatico'] } },
      { id: 'b', label: "Trabalho a noite inteira na quinta. Café, mais café, e na sexta de manhã estou acabado mas com o material pronto.", payload: { attrs: { con: 2, str: 1 }, classes: { barbaro: 3, soldado: 1, mago: 1 }, skills: { fortitude: 2 }, tags: ['corajoso', 'pragmatico'] } },
      { id: 'c', label: "Peço ajuda. Divido tarefas, delego, peço opinião. Sozinho até dá, mas em grupo sai melhor.", payload: { attrs: { cha: 2, int: 1 }, classes: { nobre: 3, bardo: 1, clerigo: 1 }, skills: { diplomacia: 1, guerra: 1 }, tags: ['refinado', 'leal'] } },
      { id: 'd', label: "Vou improvisando. Tenho confiança que entrego — sempre entreguei — mas o caminho é meio caótico até chegar lá.", payload: { attrs: { dex: 2, cha: 1 }, classes: { bucaneiro: 3, bardo: 1, ladino: 1, druida: 2 }, skills: { reflexos: 1, atuacao: 1 }, tags: ['jovial', 'individualista'] } },
    ]
  },
  {
    id: 12, act: 2,
    scene: "Uma pessoa próxima fez algo que te machucou. Você não esperava aquilo dela. Tem uma semana pra decidir o que fazer. O que decide?",
    prompt: "O que você faz quando alguém próximo te magoa?",
    options: [
      { id: 'a', label: "Confronto direto. Cara a cara, sem rodeios. A pessoa que se explique.", payload: { attrs: { str: 1, cha: 1 }, classes: { cavaleiro: 2, barbaro: 1, soldado: 1 }, skills: { intimidacao: 1, intuicao: 1 }, tags: ['corajoso', 'leal'] } },
      { id: 'b', label: "Converso com gente próxima primeiro, pra entender se eu não estou louco. Depois decido com cabeça mais fria.", payload: { attrs: { int: 1, wis: 1 }, classes: { nobre: 2, bardo: 1, mago: 1, ladino: 1 }, skills: { diplomacia: 1, intuicao: 1 }, tags: ['astuto', 'leal'] } },
      { id: 'c', label: "Sumo. Diminuo a frequência, paro de responder. Não vou explicar nada — quem quiser entender, que entenda.", payload: { attrs: { dex: 2, wis: 1 }, classes: { ladino: 3, cacador: 3 }, skills: { furtividade: 2 }, tags: ['sombrio', 'individualista'] } },
      { id: 'd', label: "Dou uma chance pra ela se explicar. Em privado, sem palco. As pessoas se perdem; nem todas estão perdidas.", payload: { attrs: { wis: 2, cha: 1 }, classes: { clerigo: 2, druida: 1, cavaleiro: 1 }, skills: { intuicao: 2, vontade: 1 }, tags: ['piedoso', 'idealista'] } },
    ]
  },
  {
    id: 13, act: 2,
    scene: "A reunião de hoje foi cancelada. Você ganhou 4 horas de folga, sem aviso, no meio do dia. O que faz com esse tempo?",
    prompt: "O que você faz com tempo livre inesperado?",
    options: [
      { id: 'a', label: "Treino, corro, vou pra academia. Tempo livre é tempo de cuidar do corpo.", payload: { attrs: { str: 2, dex: 1 }, classes: { barbaro: 2, soldado: 2, cacador: 1 }, skills: { atletismo: 2, luta: 1 }, tags: ['rude', 'corajoso'] } },
      { id: 'b', label: "Vou ler, estudar, terminar um curso parado. Adoro tempo extra pra mergulhar em algo.", payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 3, clerigo: 1 }, skills: { conhecimento: 2, misticismo: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'c', label: "Saio de casa. Caminho num parque, marco um almoço, encontro alguém. Tempo bom é tempo fora das paredes.", payload: { attrs: { wis: 2, con: 1 }, classes: { druida: 2, cacador: 2, bardo: 1 }, skills: { sobrevivencia: 1, percepcao: 1 }, tags: ['selvagem', 'jovial'] } },
      { id: 'd', label: "Café, padaria, casa de alguém — qualquer lugar com gente pra conversar. Quatro horas é muito tempo pra ficar sozinho.", payload: { attrs: { cha: 2, con: 1 }, classes: { bardo: 2, bucaneiro: 2, nobre: 1 }, skills: { atuacao: 1, diplomacia: 1 }, tags: ['jovial', 'individualista'] } },
    ]
  },

  // ATO III — O que te move
  {
    id: 14, act: 3,
    scene: "Sem filtro: que tipo de comportamento, em qualquer pessoa, te dá raiva imediata? Não é coisa pequena — é algo que te tira do sério toda vez.",
    prompt: "O que mais te irrita no mundo?",
    options: [
      { id: 'a', label: "Gente que abusa de quem é mais fraca. Chefe que humilha funcionário, motorista que fecha pedestre, esse tipo de coisa.", payload: { attrs: { str: 1, cha: 1 }, classes: { cavaleiro: 3, clerigo: 1, barbaro: 1 }, skills: { intimidacao: 1, vontade: 1 }, tags: ['protetor', 'corajoso'] } },
      { id: 'b', label: "Hipocrisia. Pessoa que prega uma coisa e faz outra. Não suporto.", payload: { attrs: { wis: 1, int: 1 }, classes: { ladino: 1, druida: 1, bardo: 1 }, skills: { intuicao: 2 }, tags: ['cinico', 'astuto'] } },
      { id: 'c', label: "Preguiça intelectual. Gente que fala com convicção sobre coisas que não estudou. Falta de curiosidade me chateia.", payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 3, clerigo: 1 }, skills: { conhecimento: 1, investigacao: 1 }, tags: ['erudito', 'individualista'] } },
      { id: 'd', label: "Sei lá. Tento não gastar energia com isso. Cada um lida com a sua, e raiva não resolve nada.", payload: { attrs: { wis: 2, con: 1 }, classes: { druida: 2, clerigo: 1, soldado: 1 }, skills: { vontade: 1, intuicao: 1 }, tags: ['pragmatico', 'piedoso'] } },
    ]
  },
  {
    id: 15, act: 3,
    scene: "Três amigos discutem o que mais define quem somos. Um diz que é a cabeça (o que você sabe). Outro diz que é o coração (no que você acredita). Outro diz que são as mãos (o que você faz). De qual você se senta mais perto?",
    prompt: "O que mais define uma pessoa?",
    options: [
      { id: 'a', label: "Da cabeça. O que você sabe muda como você enxerga tudo. Quem não estuda fica refém.", payload: { attrs: { int: 3 }, classes: { mago: 4, bardo: 1 }, skills: { conhecimento: 2, misticismo: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'b', label: "Do coração. No fim do dia, o que sobra é no que você acreditou e em quem você cuidou.", payload: { attrs: { wis: 2, cha: 1 }, classes: { clerigo: 4, druida: 1 }, skills: { religiao: 1, vontade: 2 }, tags: ['piedoso', 'idealista'] } },
      { id: 'c', label: "Das mãos. Bonito é discutir teoria, mas alguém precisa fazer. No fim, conta o que ficou pronto.", payload: { attrs: { str: 2, con: 1 }, classes: { soldado: 3, cavaleiro: 2, barbaro: 1 }, skills: { luta: 1, oficio: 1, fortitude: 1 }, tags: ['pragmatico', 'leal'] } },
      { id: 'd', label: "Dos três. Sento no meio. Cada um sabe um pedaço, e quem só tem um lado tá fazendo conta errada.", payload: { attrs: { cha: 2, int: 1 }, classes: { bardo: 3, nobre: 2, bucaneiro: 1 }, skills: { diplomacia: 1, conhecimento: 1, atuacao: 1 }, tags: ['curioso', 'pragmatico'] } },
    ]
  },
  {
    id: 16, act: 3,
    scene: "Você vê algo errado acontecendo no seu trabalho, no seu prédio, ou no seu bairro. Não te afeta diretamente. Mas tá errado. Você...",
    prompt: "O que você faz quando vê algo errado que não é seu problema?",
    options: [
      { id: 'a', label: "Falo. Em voz alta, pra quem precisa ouvir. Mesmo que me crie problema.", payload: { attrs: { cha: 1, str: 1 }, classes: { cavaleiro: 2, nobre: 1, clerigo: 1, barbaro: 1 }, skills: { intimidacao: 1, diplomacia: 1 }, tags: ['corajoso', 'idealista'] } },
      { id: 'b', label: "Documento e levo pra alguém com poder de resolver. Sem barulho, mas com prova.", payload: { attrs: { int: 2, cha: 1 }, classes: { ladino: 2, mago: 1, nobre: 1, bucaneiro: 1 }, skills: { investigacao: 2, intuicao: 1 }, tags: ['astuto', 'pragmatico'] } },
      { id: 'c', label: "Ajudo quem tá sofrendo, mesmo que eu não consiga mudar o sistema. O que eu posso fazer agora, eu faço.", payload: { attrs: { wis: 2, cha: 1 }, classes: { clerigo: 3, druida: 1 }, skills: { cura: 2, diplomacia: 1 }, tags: ['protetor', 'piedoso'] } },
      { id: 'd', label: "Não me meto. Tenho meus problemas. Quem tem que resolver, que resolva.", payload: { attrs: { wis: 1, dex: 1 }, classes: { ladino: 1, cacador: 3, soldado: 1 }, skills: { furtividade: 1, sobrevivencia: 1 }, tags: ['cinico', 'individualista'] } },
    ]
  },
  {
    id: 17, act: 3,
    scene: "Daqui a 30 anos, no seu velório (perdão pelo tom, mas é importante), você queria que alguém dissesse o quê? Qual a primeira frase?",
    prompt: "Como você quer ser lembrado?",
    options: [
      { id: 'a', label: '"Quando eu chamava, todo mundo sabia que podia contar."', payload: { attrs: { con: 2, str: 1 }, classes: { cavaleiro: 3, soldado: 2 }, skills: { fortitude: 1, vontade: 1 }, tags: ['leal', 'protetor'] } },
      { id: 'b', label: '"Tinha um jeito de enxergar as coisas que ninguém mais tinha."', payload: { attrs: { int: 2, wis: 1 }, classes: { mago: 2, ladino: 1, cacador: 1 }, skills: { investigacao: 1, percepcao: 1 }, tags: ['astuto', 'erudito'] } },
      { id: 'c', label: '"Ninguém riu tanto, nem fez tanta gente rir."', payload: { attrs: { cha: 2, dex: 1 }, classes: { bardo: 3, bucaneiro: 2 }, skills: { atuacao: 1, enganacao: 1 }, tags: ['jovial', 'curioso'] } },
      { id: 'd', label: '"Quando ele entrava num lugar, todo mundo notava — e quando saía, ninguém esquecia."', payload: { attrs: { cha: 2, str: 1 }, classes: { nobre: 3, barbaro: 1, bucaneiro: 1 }, skills: { intimidacao: 1, diplomacia: 1 }, tags: ['refinado', 'individualista'] } },
    ]
  },
  {
    id: 18, act: 3,
    scene: "Você ganhou um super poder pequeno. Não é virar invisível nem voar. É algo bem específico. Qual desses você prefere?",
    prompt: "Qual super poder você escolheria?",
    options: [
      { id: 'a', label: "Nunca cansar fisicamente. Posso correr o dia inteiro, ficar em pé, carregar peso, sem fadiga.", payload: { attrs: { con: 3, str: 1 }, classes: { barbaro: 2, soldado: 2, cavaleiro: 1 }, skills: { fortitude: 2 }, tags: ['rude', 'corajoso'] } },
      { id: 'b', label: "Aprender qualquer coisa em metade do tempo. Língua, instrumento, conceito difícil — eu pego rápido.", payload: { attrs: { int: 3 }, classes: { mago: 3, bardo: 1 }, skills: { conhecimento: 2, misticismo: 1 }, tags: ['erudito', 'curioso'] } },
      { id: 'c', label: "Saber sempre o que falar pra acalmar alguém. Em qualquer situação tensa, eu tenho as palavras.", payload: { attrs: { cha: 2, wis: 2 }, classes: { clerigo: 2, bardo: 1, nobre: 2 }, skills: { diplomacia: 2, intuicao: 1 }, tags: ['piedoso', 'refinado'] } },
      { id: 'd', label: "Ser invisível por uns minutos quando preciso. Não pra fazer mal — só pra sumir quando o rolê tá ruim.", payload: { attrs: { dex: 3 }, classes: { ladino: 3, bucaneiro: 2, cacador: 3 }, skills: { furtividade: 2, reflexos: 1 }, tags: ['astuto', 'individualista'] } },
    ]
  },
];
