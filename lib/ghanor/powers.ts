import type { ClassId } from "./types";
import type { Tier } from "./leveling";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PowerType = "geral" | "combate" | "classe" | "origem" | "raca";
export type PowerActivation = "passivo" | "ação" | "ação rápida" | "reação" | "livre";

export type Power = {
  id: string;
  name: string;
  type: PowerType;
  class?: ClassId;
  tier?: Tier;
  activation: PowerActivation;
  prerequisite?: string;
  description: string;
  uses_per_scene?: number;
  mp_cost?: number;
  dice?: string;
};

// ─── Catálogo ─────────────────────────────────────────────────────────────────

export const powers: Power[] = [

  // ── Poderes Gerais ─────────────────────────────────────────────────────────

  {
    id: "sortudo",
    name: "Sortudo",
    type: "geral",
    activation: "livre",
    uses_per_scene: 1,
    description:
      "Uma vez por cena, quando falhar em um teste de ataque, perícia ou resistência, você pode realizar " +
      "novamente o teste e usar o resultado mais favorável.",
  },
  {
    id: "vontade_de_ferro",
    name: "Vontade de Ferro",
    type: "geral",
    activation: "passivo",
    description:
      "+5 em testes de Vontade e em testes para resistir a medo, encantamento e efeitos mentais.",
  },
  {
    id: "iniciativa_aprimorada",
    name: "Iniciativa Aprimorada",
    type: "geral",
    activation: "passivo",
    description: "+10 no teste de Iniciativa. Você age antes dos inimigos na maioria das situações.",
  },
  {
    id: "esquiva",
    name: "Esquiva",
    type: "geral",
    activation: "reação",
    description:
      "Uma vez por rodada, como reação, você pode se esquivar de um ataque recebendo +5 de Defesa contra " +
      "ele. Não pode ser usada com armadura pesada ou se estiver imóvel.",
  },
  {
    id: "sentidos_agucados",
    name: "Sentidos Aguçados",
    type: "geral",
    activation: "passivo",
    description: "+5 em testes de Percepção. Você não pode ser surpreendido enquanto estiver consciente.",
  },
  {
    id: "mais_um_folego",
    name: "Mais um Fôlego",
    type: "geral",
    activation: "ação rápida",
    uses_per_scene: 1,
    description:
      "Uma vez por cena, como ação rápida, você recupera pontos de vida iguais ao seu nível multiplicado por 2.",
  },
  {
    id: "foco_em_magia",
    name: "Foco em Magia",
    type: "geral",
    activation: "passivo",
    description: "+2 nos testes de ataque mágico e nas rolagens de dano das suas magias.",
  },
  {
    id: "armas_e_magias",
    name: "Armas e Magias",
    type: "geral",
    activation: "passivo",
    description:
      "Você pode conjurar magias enquanto segura uma arma em uma das mãos, sem precisar de mãos livres.",
  },

  // ── Poderes de Combate ─────────────────────────────────────────────────────

  {
    id: "combate_defensivo",
    name: "Combate Defensivo",
    type: "combate",
    activation: "passivo",
    description:
      "Ao declarar postura defensiva no início do seu turno, você recebe –2 nos testes de ataque mas ganha " +
      "+4 de Defesa até o início do próximo turno.",
  },
  {
    id: "estilo_de_arma_e_escudo",
    name: "Estilo de Arma e Escudo",
    type: "combate",
    activation: "passivo",
    description: "Ao empunhar um escudo, você recebe +2 de Defesa adicional ao bônus normal do escudo.",
  },
  {
    id: "foco_em_arma",
    name: "Foco em Arma",
    type: "combate",
    activation: "passivo",
    description: "Escolha um tipo de arma. Você recebe +2 nos testes de ataque ao usar essa arma.",
  },
  {
    id: "disparo_preciso",
    name: "Disparo Preciso",
    type: "combate",
    activation: "passivo",
    description:
      "Você pode usar armas de ataque à distância sem penalidade quando há um inimigo adjacente, " +
      "e pode ignorar cobertura parcial ao atirar.",
  },
  {
    id: "dois_ataques",
    name: "Dois Ataques",
    type: "combate",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "Patamar Veterano",
    description:
      "Você pode realizar dois ataques no lugar de um ao usar sua ação de ataque, mas ambos sofrem " +
      "–4 nos testes de ataque.",
  },
  {
    id: "golpe_de_escudo",
    name: "Golpe de Escudo",
    type: "combate",
    activation: "ação rápida",
    dice: "1d4",
    description:
      "Como ação rápida, você ataca com seu escudo causando 1d4 de dano. Não sofre penalidade por dupla empunhadura.",
  },
  {
    id: "carga",
    name: "Carga",
    type: "combate",
    activation: "ação",
    dice: "+1d6",
    description:
      "Você avança até o dobro do seu deslocamento em linha reta e realiza um ataque. Se acertar, causa +1d6 de dano adicional.",
  },
  {
    id: "saque_rapido",
    name: "Saque Rápido",
    type: "combate",
    activation: "livre",
    description: "Você pode sacar e guardar armas como ação livre em vez de ação rápida.",
  },
  {
    id: "ataque_poderoso",
    name: "Ataque Poderoso",
    type: "combate",
    activation: "passivo",
    description:
      "Ao fazer um ataque corpo a corpo, você pode aceitar –2 no teste de ataque para ganhar +4 de dano. " +
      "A penalidade e o bônus dobram no patamar Veterano e triplicam no patamar Campeão.",
  },
  {
    id: "impulso",
    name: "Ímpeto",
    type: "combate",
    activation: "passivo",
    mp_cost: 1,
    description:
      "Você pode gastar 1 PM para aumentar seu deslocamento em +6m por uma rodada.",
  },
  {
    id: "destruidor",
    name: "Destruidor",
    type: "combate",
    activation: "passivo",
    prerequisite: "For 1",
    description:
      "Quando causa dano com uma arma corpo a corpo de duas mãos, você pode rolar novamente qualquer resultado 1 ou 2 das rolagens de dano da arma.",
  },
  {
    id: "ambidestria",
    name: "Ambidestria",
    type: "combate",
    activation: "passivo",
    prerequisite: "Des 2",
    description:
      "Se estiver empunhando duas armas (e pelo menos uma delas for leve) e fizer a ação agredir, você pode fazer dois ataques, um com cada arma. Se fizer isso, sofre –2 em todos os testes de ataque até seu próximo turno.",
  },
  {
    id: "arqueiro",
    name: "Arqueiro",
    type: "combate",
    activation: "passivo",
    prerequisite: "Sab 1",
    description:
      "Se estiver usando uma arma de ataque à distância, você soma sua Sabedoria nas rolagens de dano (limitado pelo seu nível).",
  },
  {
    id: "esgrimista",
    name: "Esgrimista",
    type: "combate",
    activation: "passivo",
    prerequisite: "Int 1",
    description:
      "Quando usa uma arma corpo a corpo leve ou ágil, você soma sua Inteligência nas rolagens de dano (limitado pelo seu nível).",
  },

  // ── Poderes de Classe — Bárbaro ────────────────────────────────────────────

  {
    id: "furia",
    name: "Fúria",
    type: "classe",
    class: "barbaro",
    activation: "ação rápida",
    mp_cost: 2,
    description:
      "Você pode gastar 2 PM para invocar uma fúria selvagem: recebe +2 em testes de ataque e rolagens de dano corpo a corpo, mas não pode fazer ações que exijam calma e concentração. A cada cinco níveis, pode gastar +1 PM para aumentar os bônus em +1.",
  },
  {
    id: "alma_de_bronze",
    name: "Alma de Bronze",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    description:
      "Quando entra em fúria, você recebe uma quantidade de pontos de vida temporários igual a seu nível + sua Força.",
  },
  {
    id: "brado_assustador",
    name: "Brado Assustador",
    type: "classe",
    class: "barbaro",
    activation: "ação",
    mp_cost: 1,
    prerequisite: "Treinado em Intimidação",
    description:
      "Você pode gastar uma ação de movimento e 1 PM para soltar um berro feroz. Todos os inimigos em alcance curto ficam vulneráveis até o fim da cena. Medo.",
  },
  {
    id: "cicatrizes_ritualisticas",
    name: "Cicatrizes Ritualisticas",
    type: "classe",
    class: "barbaro",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "5º nível de bárbaro, treinado em Vontade",
    description:
      "+2 em Intimidação e redução de dano 2. Pré-requisitos: 5º nível de bárbaro, treinado em Vontade.",
  },
  {
    id: "critico_brutal",
    name: "Crítico Brutal",
    type: "classe",
    class: "barbaro",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "6º nível de bárbaro",
    description:
      "Seu multiplicador de crítico com armas corpo a corpo e de arremesso aumenta em +1. Por exemplo, um machado de batalha (normalmente x3) fica x4.",
  },
  {
    id: "furia_do_deserto",
    name: "Fúria do Deserto",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    description:
      "Seu deslocamento aumenta em +3m. Quando usa Fúria, você aplica o bônus em ataque e dano também a armas de arremesso.",
  },
  {
    id: "furia_raivosa",
    name: "Fúria Raivosa",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    mp_cost: 1,
    description:
      "Se sua Fúria for terminar por você não ter atacado nem sido alvo de um efeito hostil, você pode pagar 1 PM para continuar em fúria nesta rodada.",
  },
  {
    id: "golpe_poderoso_barbaro",
    name: "Golpe Poderoso",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    mp_cost: 1,
    description:
      "Ao acertar um ataque corpo a corpo, você pode gastar 1 PM para causar um dado de dano extra do mesmo tipo.",
  },
  {
    id: "investida_imprudente",
    name: "Investida Imprudente",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    dice: "+1d12",
    description:
      "Quando faz uma investida, você pode aumentar sua penalidade em Defesa para −5 a fim de receber +1d12 na rolagem de dano deste ataque.",
  },
  {
    id: "pele_de_ferro",
    name: "Pele de Ferro",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    description:
      "Você recebe +4 na Defesa, mas apenas se não estiver usando armadura pesada.",
  },
  {
    id: "pele_de_aco",
    name: "Pele de Aço",
    type: "classe",
    class: "barbaro",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "Pele de Ferro, 8º nível de bárbaro",
    description:
      "O bônus de Pele de Ferro aumenta para +8. Pré-requisitos: Pele de Ferro, 8º nível de bárbaro.",
  },
  {
    id: "sangue_dos_inimigos",
    name: "Sangue dos Inimigos",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    description:
      "Enquanto está em fúria, quando faz um acerto crítico ou reduz um inimigo a 0 PV, você recebe um bônus cumulativo de +1 em testes de ataque e rolagens de dano, limitado pelo seu nível, até o fim da cena.",
  },
  {
    id: "supersticao",
    name: "Superstição",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    description:
      "Você odeia e rejeita o sobrenatural. Você recebe resistência a magia +5.",
  },
  {
    id: "totem_espiritual",
    name: "Totem Espiritual",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    prerequisite: "Sab 1, 4º nível de bárbaro",
    description:
      "Você soma sua Sabedoria ao seu total de pontos de mana e possui um animal totêmico. Você pode lançar a magia definida pelo seu totem (atributo-chave Sabedoria) e pode lançá-la em fúria.",
  },
  {
    id: "vigor_primal",
    name: "Vigor Primal",
    type: "classe",
    class: "barbaro",
    activation: "ação",
    description:
      "Você pode gastar uma ação de movimento e uma quantidade de PM limitada por sua Constituição. Para cada PM que gastar, você recupera 1d12 pontos de vida.",
  },
  {
    id: "espirito_inquebravel",
    name: "Espírito Inquebráve",
    type: "classe",
    class: "barbaro",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "Alma de Bronze",
    description:
      "Enquanto está em fúria, você não fica inconsciente por estar com 0 PV ou menos (você ainda morre se chegar em um valor negativo igual à metade de seus PV máximos).",
  },
  {
    id: "esquiva_sobrenatural_barbaro",
    name: "Esquiva Sobrenatural",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    description:
      "Seus instintos são tão apurados que você consegue reagir ao perigo antes que seus sentidos percebam. Você nunca fica surpreendido.",
  },
  {
    id: "forca_indomavel",
    name: "Força Indomável",
    type: "classe",
    class: "barbaro",
    activation: "livre",
    mp_cost: 1,
    description:
      "Você pode gastar 1 PM para somar seu nível em um teste de Força ou Atletismo. Você pode usar esta habilidade depois de rolar o dado, mas deve usá-la antes de o mestre dizer se você passou ou não.",
  },
  {
    id: "frenesi",
    name: "Frenesi",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    mp_cost: 2,
    description:
      "Uma vez por rodada, se estiver em fúria e usar a ação agredir para fazer um ataque corpo a corpo ou de arremesso, você pode gastar 2 PM para fazer um ataque adicional.",
  },
  {
    id: "furia_bestial",
    name: "Fúria Bestial",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    description:
      "Quando entra em fúria, você recebe uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.",
  },
  {
    id: "instinto_selvagem",
    name: "Instinto Selvagem",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    description:
      "Você recebe +1 em rolagens de dano, Percepção e Reflexos. A cada seis níveis, esse bônus aumenta em +1.",
  },
  {
    id: "resistencia_a_dor",
    name: "Resistência à Dor",
    type: "classe",
    class: "barbaro",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "5º nível",
    description:
      "Você ignora parte de seus ferimentos. Você recebe redução de dano 2 (todo dano que sofre é reduzido em 2). A cada três níveis, sua RD aumenta em 2, até um máximo de RD 10 no 17º nível.",
  },

  // ── Poderes de Classe — Bardo ──────────────────────────────────────────────

  {
    id: "inspiracao",
    name: "Inspiração",
    type: "classe",
    class: "bardo",
    activation: "ação",
    mp_cost: 2,
    description:
      "Você pode gastar uma ação padrão e 2 PM para inspirar as pessoas com sua música. Você e todos os seus aliados em alcance curto ganham +1 em testes de perícia até o fim da cena. A cada quatro níveis, pode gastar +2 PM para aumentar o bônus em +1.",
  },
  {
    id: "arte_magica",
    name: "Arte Mágica",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    description:
      "Enquanto você estiver sob efeito de sua habilidade Inspiração, a CD para resistir a suas habilidades de bardo aumenta em +2.",
  },
  {
    id: "artista_versatil",
    name: "Artista Versátil",
    type: "classe",
    class: "bardo",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "Int 2, 6º nível de bardo",
    description:
      "Você recebe um poder de outra classe a sua escolha. Você deve cumprir todos os pré-requisitos do poder escolhido e, para esse efeito, considere que seu nível na classe original do poder é seu nível de bardo −5.",
  },
  {
    id: "aumentar_repertorio",
    name: "Aumentar Repertório",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    description:
      "Você aprende duas magias de qualquer círculo que possa lançar. Você pode escolher este poder quantas vezes quiser.",
  },
  {
    id: "danca_das_laminas",
    name: "Dança das Lâminas",
    type: "classe",
    class: "bardo",
    tier: "campeao",
    activation: "passivo",
    mp_cost: 1,
    prerequisite: "Esgrima Mágica, 10º nível de bardo",
    description:
      "Quando você lança uma magia com execução de uma ação padrão, pode gastar 1 PM para fazer um ataque corpo a corpo como uma ação livre.",
  },
  {
    id: "diletante_mistico",
    name: "Diletante Místico",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    prerequisite: "Treinado em Conhecimento",
    description:
      "Escolha uma tradição arcana. Você aprende uma magia dessa tradição de um círculo que possa lançar, e as magias desta tradição passam a ser consideradas magias de bardo para você.",
  },
  {
    id: "esgrima_magica",
    name: "Esgrima Mágica",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    description:
      "Sua arte mescla esgrima e magia. Se estiver sob efeito de Inspiração, você pode substituir testes de Luta por testes de Atuação, mas apenas para ataques com armas corpo a corpo leves ou de uma mão.",
  },
  {
    id: "estrelato",
    name: "Estrelato",
    type: "classe",
    class: "bardo",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "6º nível de bardo",
    description:
      "Suas apresentações o tornaram famoso. Quando usa Atuação para impressionar uma plateia, o bônus recebido em perícias baseadas em Carisma aumenta para +5.",
  },
  {
    id: "fascinar_em_massa",
    name: "Fascinar em Massa",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "Música: Balada Fascinante",
    description:
      "Quando usa Música: Balada Fascinante, você pode gastar +2 PM para afetar todas as criaturas a sua escolha no alcance da música (você faz um único teste de Atuação, oposto ao teste de Vontade de cada criatura).",
  },
  {
    id: "golpe_elemental_bardo",
    name: "Golpe Elemental",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    mp_cost: 1,
    prerequisite: "Golpe Mágico",
    dice: "+1d6",
    description:
      "Enquanto estiver sob efeito de Inspiração, sempre que você acertar um ataque corpo a corpo, pode gastar 1 PM para causar 1d6 de dano extra de ácido, eletricidade, fogo ou frio, a sua escolha. Para cada quatro níveis, pode gastar +1 PM para aumentar o dano em +1d6.",
  },
  {
    id: "golpe_magico",
    name: "Golpe Mágico",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    prerequisite: "Esgrima Mágica",
    description:
      "Enquanto estiver sob efeito de Inspiração, sempre que você acertar um ataque corpo a corpo em um inimigo, recebe 2 PM temporários cumulativos (máximo = nível por cena). Esses PM temporários desaparecem no final da cena.",
  },
  {
    id: "inspiracao_celere",
    name: "Inspiração Célere",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    description:
      "Quando você usa Inspiração, o deslocamento das criaturas afetadas aumenta em +3m.",
  },
  {
    id: "inspiracao_marcial",
    name: "Inspiração Marcial",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    description:
      "Quando você usa Inspiração, você e seus aliados aplicam o bônus recebido em rolagens de dano (além de testes de perícia).",
  },
  {
    id: "lendas_e_historias",
    name: "Lendas e Histórias",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    mp_cost: 1,
    prerequisite: "Int 1",
    description:
      "Você pode gastar 1 PM para rolar novamente um teste recém realizado de Conhecimento, Misticismo, Nobreza ou Religião para informação, identificar criaturas ou identificar itens mágicos.",
  },
  {
    id: "manipular",
    name: "Manipular",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    mp_cost: 1,
    prerequisite: "Música: Balada Fascinante",
    description:
      "Você pode gastar 1 PM para fazer uma criatura fascinada por você ficar enfeitiçada até o fim da cena (Von CD Car anula). Usar esta habilidade não conta como ameaça à criatura fascinada.",
  },
  {
    id: "manipular_em_massa",
    name: "Manipular em Massa",
    type: "classe",
    class: "bardo",
    tier: "campeao",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "Fascinar em Massa, Manipular, 10º nível de bardo",
    description:
      "Quando usa Manipular, você pode gastar +2 PM para afetar todas as criaturas a sua escolha em alcance curto.",
  },
  {
    id: "musica_balada_fascinante",
    name: "Música: Balada Fascinante",
    type: "classe",
    class: "bardo",
    activation: "ação",
    description:
      "Faça um teste de Atuação oposto ao teste de Vontade de uma criatura no alcance. Se você passar, ela fica fascinada enquanto você se concentrar. Um alvo hostil recebe +5 no teste de resistência.",
  },
  {
    id: "musica_cancao_assustadora",
    name: "Música: Canção Assustadora",
    type: "classe",
    class: "bardo",
    activation: "ação",
    description:
      "Faça um teste de Atuação oposto ao teste de Vontade de cada criatura a sua escolha dentro do alcance (você faz um único teste). Alvos que falhem ficam abalados até o fim da cena.",
  },
  {
    id: "musica_melodia_encorajadora",
    name: "Música: Melodia Encorajadora",
    type: "classe",
    class: "bardo",
    activation: "ação",
    dice: "+1d6",
    description:
      "Criaturas a sua escolha no alcance se tornam imunes a efeitos de medo e recebem 1d6 pontos de vida temporários. Você pode gastar mais PM para aumentar os PV temporários em +1d6 por PM.",
  },
  {
    id: "mestre_dos_sussurros",
    name: "Mestre dos Sussurros",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    prerequisite: "Car 1, treinado em Enganação e Investigação",
    description:
      "Quando faz um teste de Investigação para obter informação ou um teste de Enganação para intriga, você rola dois dados e usa o melhor resultado. Além disso, pode fazer esses testes em ambientes sociais sem custo e em apenas uma hora.",
  },
  {
    id: "parodia",
    name: "Paródia",
    type: "classe",
    class: "bardo",
    activation: "reação",
    mp_cost: 1,
    description:
      "Uma vez por rodada, quando vê outra criatura lançando uma magia em alcance médio, você pode pagar 1 PM e fazer um teste de Atuação (CD 15 + custo em PM da magia). Se passar, até o final de seu próximo turno você pode lançar essa magia.",
  },
  {
    id: "prestidigitacao",
    name: "Prestidigitação",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    description:
      "Quando faz uma ação padrão qualquer, você pode aproveitar seus gestos para lançar uma magia com tempo de execução de uma ação completa ou menor. Faça um teste de Atuação (CD 15 + custo em PM). Se passar, você lança a magia como ação livre.",
  },
  {
    id: "projetar_a_voz",
    name: "Projetar a Voz",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    mp_cost: 2,
    description:
      "Quando usa uma habilidade de bardo, você pode gastar +2 PM para aumentar seu alcance em um passo (de curto para médio, de médio para longo) ou dobrar sua área de efeito.",
  },

  // ── Poderes de Classe — Bucaneiro ──────────────────────────────────────────

  {
    id: "manobra_audaciosa",
    name: "Manobra Audaciosa",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    description:
      "Você pode realizar manobras de combate (agarrar, desarmar, empurrar) sem provocar ataques de oportunidade.",
  },
  {
    id: "abusar_dos_fracos",
    name: "Abusar dos Fracos",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    prerequisite: "Flagelo dos Mares",
    description:
      "Quando ataca uma criatura sob efeito de uma condição de medo, seu dano aumenta em um passo.",
  },
  {
    id: "amigos_no_porto",
    name: "Amigos no Porto",
    type: "classe",
    class: "bucaneiro",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "Car 1, 6º nível de bucaneiro",
    description:
      "Quando chega em uma comunidade portuária, você pode fazer um teste de Carisma (CD 10). Se passar, encontra um amigo que pode ajudá-lo como parceiro veterano por um dia.",
  },
  {
    id: "aparar",
    name: "Aparar",
    type: "classe",
    class: "bucaneiro",
    activation: "reação",
    mp_cost: 1,
    prerequisite: "Esgrimista",
    description:
      "Uma vez por rodada, quando é atingido por um ataque, você pode gastar 1 PM para fazer um teste de ataque com bônus igual ao seu nível. Se o resultado do seu teste for maior que o do oponente, você evita o ataque. Só pode ser usado com arma corpo a corpo leve ou ágil.",
  },
  {
    id: "apostador",
    name: "Apostador",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    prerequisite: "Treinado em Enganação",
    description:
      "Você pode gastar um dia para encontrar e participar de apostas ou jogos de azar. Escolha um valor e faça um teste de Enganação contra a CD correspondente (100 PP CD 15, 200 PP CD 20, etc.). Se passar, você ganha o valor escolhido.",
  },
  {
    id: "ataque_acrobatico",
    name: "Ataque Acrobático",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    description:
      "Quando se aproxima de um inimigo com um salto ou pirueta (usando Atletismo ou Acrobacia para se mover) e o ataca no mesmo turno, você recebe +2 nesse teste de ataque e na rolagem de dano.",
  },
  {
    id: "aventureiro_avido",
    name: "Aventureiro Ávido",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    mp_cost: 5,
    description:
      "Uma vez por rodada, você pode gastar 5 PM para realizar uma ação padrão ou de movimento adicional.",
  },
  {
    id: "bravata_audaz",
    name: "Bravata Audaz",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    description:
      "Você jura fazer uma façanha específica. Se cumprir a bravata, seus PM aumentam em +2 por nível de bucaneiro até o fim da aventura.",
  },
  {
    id: "bravata_imprudente",
    name: "Bravata Imprudente",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    description:
      "Na primeira rodada de um combate, você pode jurar derrotar seus inimigos com uma restrição a sua escolha. Se vencer, recebe +2 nos testes de ataque e na margem de ameaça até o fim da aventura.",
  },
  {
    id: "charme_salvador",
    name: "Charme Salvador",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    description:
      "Quando usa Audácia em um teste de resistência, o custo desta habilidade é reduzido em −1 PM.",
  },
  {
    id: "en_garde",
    name: "En Garde",
    type: "classe",
    class: "bucaneiro",
    activation: "ação",
    mp_cost: 1,
    prerequisite: "Esgrimista",
    description:
      "Você pode gastar uma ação de movimento e 1 PM para assumir postura de luta. Até o fim da cena, se estiver usando uma arma corpo a corpo leve ou ágil, você recebe +2 na Defesa e na margem de ameaça.",
  },
  {
    id: "entrada_triunfal",
    name: "Entrada Triunfal",
    type: "classe",
    class: "bucaneiro",
    uses_per_scene: 1,
    activation: "passivo",
    description:
      "Uma vez por aventura, no início de uma cena com outras pessoas, você pode fazer um teste de perícia (CD 20). Se passar, você recebe 5 PM temporários (+5 PM para cada 10 pontos acima da CD).",
  },
  {
    id: "esgrimista_buc",
    name: "Esgrimista",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    prerequisite: "Int 1",
    description:
      "Quando usa uma arma leve ou ágil, você soma sua Inteligência nas rolagens de dano (limitado pelo seu nível).",
  },
  {
    id: "flagelo_dos_mares",
    name: "Flagelo dos Mares",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    prerequisite: "Treinado em Intimidação",
    description:
      "Você pode lançar Amedrontar (atributo-chave Carisma). Esta não é uma habilidade mágica e provém de sua capacidade de incutir medo em seus inimigos.",
  },
  {
    id: "foliao",
    name: "Folião",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    prerequisite: "Car 1",
    description:
      "Você sabe fazer amizades durante festas. Nesses locais, você recebe +2 em testes de perícias de Carisma e a atitude de todas as pessoas em relação a você melhora em uma categoria.",
  },
  {
    id: "galantio_encorajador",
    name: "Galantio Encorajador",
    type: "classe",
    class: "bucaneiro",
    activation: "ação",
    uses_per_scene: 1,
    dice: "1d6",
    description:
      "Uma vez por cena, você pode fazer um teste de Diplomacia oposto no teste de Vontade de uma criatura inteligente em alcance curto que você considere atraente. Se passar, você recebe 1d6 PM temporários.",
  },
  {
    id: "mao_amiga",
    name: "Mão Amiga",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    mp_cost: 1,
    prerequisite: "Car 3",
    uses_per_scene: 1,
    description:
      "Uma vez por cena, você pode gastar 1 PM para receber o benefício de um parceiro iniciante de um tipo a sua escolha por uma rodada.",
  },
  {
    id: "ousadia_inconsequente",
    name: "Ousadia Inconsequente",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    dice: "1d6",
    description:
      "Uma vez por rodada, quando faz um teste de perícia, você pode rolar 1d6 e adicionar o resultado ao seu teste. Porém, se falhar nesse teste, sofre −1 em testes de perícia até o fim da cena.",
  },
  {
    id: "pernas_do_mar",
    name: "Pernas do Mar",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    description:
      "+2 em Acrobacia e Atletismo. Você não fica desprevenido quando está se equilibrando ou escalando.",
  },
  {
    id: "presenca_paralisante",
    name: "Presença Paralisante",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    prerequisite: "Car 1, 4º nível de bucaneiro",
    description:
      "Você soma seu Carisma à sua Iniciativa e, se for o primeiro na iniciativa, ganha uma ação padrão extra na primeira rodada.",
  },
  {
    id: "ripostar",
    name: "Ripostar",
    type: "classe",
    class: "bucaneiro",
    tier: "campeao",
    activation: "reação",
    mp_cost: 1,
    prerequisite: "Aparar, 12º nível de bucaneiro",
    description:
      "Quando usa a habilidade Aparar e evita o ataque, você pode gastar 1 PM para fazer um ataque corpo a corpo imediato contra o inimigo que o atacou.",
  },
  {
    id: "touche",
    name: "Touché",
    type: "classe",
    class: "bucaneiro",
    tier: "campeao",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "Esgrimista, 10º nível de bucaneiro",
    description:
      "Quando se aproxima de um inimigo e o ataca com uma arma corpo a corpo leve ou ágil no mesmo turno, você pode gastar 2 PM para aumentar seu dano em um passo e receber +5 na margem de ameaça.",
  },

  // ── Poderes de Classe — Caçador ────────────────────────────────────────────

  {
    id: "inimigo_favorito",
    name: "Inimigo Favorito",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    description:
      "Escolha uma categoria de criatura (humanoides, mortos-vivos, bestas, etc.). Você recebe +2 nos " +
      "testes de ataque e nas rolagens de dano contra criaturas dessa categoria.",
  },
  {
    id: "companheiro_animal_cacador",
    name: "Companheiro Animal",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    prerequisite: "Treinado em Adestramento",
    description:
      "Você recebe um companheiro animal permanente que o acompanha e obedece suas ordens.",
  },
  {
    id: "rastreador",
    name: "Rastreador",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    description:
      "+2 em Sobrevivência. Você pode se mover com seu deslocamento normal enquanto rastreia.",
  },
  {
    id: "armadilha_arataca",
    name: "Armadilha: Arataca",
    type: "classe",
    class: "cacador",
    activation: "ação",
    mp_cost: 3,
    dice: "2d6",
    description:
      "A vítima sofre 2d6 pontos de dano de perfuração e fica agarrada. Uma criatura agarrada pode escapar com uma ação padrão e um teste de Força ou Acrobacia (CD Sab).",
  },
  {
    id: "armadilha_espinhos",
    name: "Armadilha: Espinhos",
    type: "classe",
    class: "cacador",
    activation: "ação",
    mp_cost: 3,
    dice: "6d6",
    description:
      "A vítima sofre 6d6 pontos de dano de perfuração. Um teste de Reflexos (CD Sab) reduz o dano à metade.",
  },
  {
    id: "armadilha_laco",
    name: "Armadilha: Laço",
    type: "classe",
    class: "cacador",
    activation: "ação",
    mp_cost: 3,
    description:
      "A vítima deve fazer um teste de Reflexos (CD Sab). Se passar, fica caída. Se falhar, fica agarrada.",
  },
  {
    id: "armadilha_rede",
    name: "Armadilha: Rede",
    type: "classe",
    class: "cacador",
    activation: "ação",
    mp_cost: 3,
    description:
      "Todas as criaturas na área ficam enredadas e não podem sair da área. Uma vítima pode se libertar com uma ação padrão e um teste de Força ou Acrobacia (CD 25).",
  },
  {
    id: "armadilheiro",
    name: "Armadilheiro",
    type: "classe",
    class: "cacador",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "Um poder de armadilha, 5º nível de caçador",
    description:
      "Você soma sua Sabedoria no dano e na CD de suas armadilhas (cumulativo).",
  },
  {
    id: "bote",
    name: "Bote",
    type: "classe",
    class: "cacador",
    tier: "veterano",
    activation: "passivo",
    mp_cost: 1,
    prerequisite: "Ambidestria, 6º nível de caçador",
    description:
      "Se estiver empunhando duas armas e fizer uma investida, você pode pagar 1 PM para fazer um ataque adicional com sua arma secundária.",
  },
  {
    id: "camuflagem",
    name: "Camuflagem",
    type: "classe",
    class: "cacador",
    tier: "veterano",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "6º nível de caçador",
    description:
      "Você pode gastar 2 PM para se esconder mesmo sem camuflagem ou cobertura disponível.",
  },
  {
    id: "chuva_de_laminas",
    name: "Chuva de Lâminas",
    type: "classe",
    class: "cacador",
    tier: "campeao",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "Des 4, Ambidestria, 12º nível de caçador",
    description:
      "Quando usa Ambidestria, você pode pagar 2 PM para fazer um ataque adicional com sua arma primária.",
  },
  {
    id: "elo_com_a_natureza",
    name: "Elo com a Natureza",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    prerequisite: "Sab 1, 3º nível de caçador",
    description:
      "Você soma sua Sabedoria ao seu total de pontos de mana e pode lançar a magia Caminhos da Natureza (atributo-chave Sabedoria).",
  },
  {
    id: "emboscar_cacador",
    name: "Emboscar",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "Treinado em Furtividade",
    description:
      "Você pode gastar 2 PM para realizar uma ação padrão adicional em seu turno. Você só pode usar este poder na primeira rodada de um combate.",
  },
  {
    id: "empatia_selvagem",
    name: "Empatia Selvagem",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    description:
      "Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com animais para mudar atitude e pedir favores.",
  },
  {
    id: "ervas_curativas",
    name: "Ervas Curativas",
    type: "classe",
    class: "cacador",
    activation: "ação",
    dice: "2d6",
    description:
      "Você pode gastar uma ação completa e PM (limitado por Sabedoria) para aplicar ervas curativas. Para cada PM gasto, cura 2d6 PV ou remove uma condição envenenado. Pode ser usado uma vez por dia na mesma criatura.",
  },
  {
    id: "escaramuca",
    name: "Escaramuça",
    type: "classe",
    class: "cacador",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "Des 2, 6º nível de caçador",
    dice: "+1d8",
    description:
      "Quando se move 6m ou mais, você recebe +2 na Defesa e Reflexos e +1d8 nas rolagens de dano de ataques corpo a corpo e à distância em alcance curto até o início de seu próximo turno.",
  },
  {
    id: "escaramuca_superior",
    name: "Escaramuça Superior",
    type: "classe",
    class: "cacador",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "Escaramuça, 12º nível de caçador",
    dice: "+1d12",
    description:
      "Quando usa Escaramuça, seus bônus aumentam para +5 na Defesa e Reflexos e +1d12 em rolagens de dano.",
  },
  {
    id: "espreitar",
    name: "Espreitar",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    description:
      "Quando usa a habilidade Marca da Presa, você recebe um bônus de +1 em testes de perícia contra a criatura marcada. Esse bônus aumenta em +1 para cada PM adicional gasto e dobra com a habilidade Inimigo.",
  },
  {
    id: "inimigo_de",
    name: "Inimigo de (Criatura)",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    description:
      "Escolha um tipo de criatura. Quando você usa a habilidade Marca da Presa contra uma criatura do tipo escolhido, dobra os dados de bônus no dano. Você pode escolher este poder outras vezes para inimigos diferentes.",
  },
  {
    id: "mestre_armadilheiro",
    name: "Mestre Armadilheiro",
    type: "classe",
    class: "cacador",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "Armadilheiro, dois poderes de armadilha",
    description:
      "A CD de suas armadilhas aumenta em +2. Você pode gastar uma ação completa e 5 PM para preparar duas armadilhas ao mesmo tempo.",
  },
  {
    id: "olho_do_falcao",
    name: "Olho do Falcão",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    description:
      "Você pode usar a habilidade Marca da Presa em criaturas em alcance longo.",
  },
  {
    id: "ponto_fraco",
    name: "Ponto Fraco",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    description:
      "Quando usa a habilidade Marca da Presa, seus ataques contra a criatura marcada recebem +2 na margem de ameaça. Esse bônus dobra com a habilidade Inimigo.",
  },
  {
    id: "tiro_em_linha",
    name: "Tiro em Linha",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    mp_cost: 1,
    prerequisite: "Arqueiro",
    description:
      "Quando você faz um ataque à distância e reduz os pontos de vida do alvo a 0, pode gastar 1 PM para fazer um ataque adicional contra outra criatura diretamente atrás do alvo original.",
  },

  // ── Poderes de Classe — Cavaleiro ──────────────────────────────────────────

  {
    id: "desafio",
    name: "Desafio",
    type: "classe",
    class: "cavaleiro",
    activation: "ação rápida",
    mp_cost: 2,
    uses_per_scene: 1,
    description:
      "Você pode gastar 2 PM para escolher um oponente em alcance curto e receber +2 em testes de ataque e rolagens de dano contra ele até o fim da cena. Se atacar outro oponente, o bônus termina.",
  },
  {
    id: "armadura_da_honra",
    name: "Armadura da Honra",
    type: "classe",
    class: "cavaleiro",
    activation: "passivo",
    description:
      "No início de cada cena, você recebe uma quantidade de pontos de vida temporários igual a seu nível + seu Carisma.",
  },
  {
    id: "autoridade_feudal",
    name: "Autoridade Feudal",
    type: "classe",
    class: "cavaleiro",
    tier: "veterano",
    activation: "ação",
    mp_cost: 2,
    prerequisite: "6º nível de cavaleiro",
    description:
      "Você pode gastar uma hora e 2 PM para conclamar o povo a ajudá-lo. Essas pessoas contam como um parceiro iniciante de um tipo a sua escolha que o acompanha até o fim da aventura.",
  },
  {
    id: "desprezar_os_covardes",
    name: "Desprezar os Covardes",
    type: "classe",
    class: "cavaleiro",
    activation: "passivo",
    description:
      "Você recebe RD 5 se estiver caído, desprevenido ou flanqueado.",
  },
  {
    id: "escudeiro",
    name: "Escudeiro",
    type: "classe",
    class: "cavaleiro",
    activation: "passivo",
    mp_cost: 1,
    description:
      "Você recebe os serviços de um escudeiro. Suas armas fornecem +1 em rolagens de dano e sua armadura fornece +1 na Defesa. Além disso, você pode pagar 1 PM para receber uma ação de movimento.",
  },
  {
    id: "estandarte",
    name: "Estandarte",
    type: "classe",
    class: "cavaleiro",
    activation: "passivo",
    description:
      "Sua flâmula inspira seus aliados. Aliados em alcance médio que possam ver seu estandarte recebem um bônus conforme suas habilidades de classe.",
  },
  {
    id: "especializacao_armadura_cavaleiro",
    name: "Especialização em Armadura",
    type: "classe",
    class: "cavaleiro",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "12º nível de cavaleiro",
    description:
      "Se estiver usando armadura pesada, você recebe redução de dano 5.",
  },
  {
    id: "protecao",
    name: "Proteção",
    type: "classe",
    class: "cavaleiro",
    activation: "reação",
    mp_cost: 2,
    uses_per_scene: 2,
    description:
      "Como reação quando um aliado adjacente é atacado, você pode se substituir como alvo do ataque, " +
      "sofrendo o dano no lugar dele.",
  },
  {
    id: "lideranca_marcial",
    name: "Liderança Marcial",
    type: "classe",
    class: "cavaleiro",
    tier: "veterano",
    activation: "passivo",
    description:
      "Aliados ao alcance médio que possam vê-lo recebem +2 em testes de ataque enquanto você estiver " +
      "de pé e em combate.",
  },

  // ── Poderes de Classe — Clérigo ────────────────────────────────────────────

  {
    id: "expulsar_mortos_vivos",
    name: "Expulsar Mortos-Vivos",
    type: "classe",
    class: "clerigo",
    activation: "ação",
    uses_per_scene: 1,
    mp_cost: 1,
    description:
      "Você apresenta seu símbolo sagrado com autoridade divina. Mortos-vivos ao alcance curto que " +
      "falharem em um teste de Vontade (ND = 10 + nível) ficam aterrorizados ou imóveis por 1 cena.",
  },
  {
    id: "cura_divina",
    name: "Cura Divina",
    type: "classe",
    class: "clerigo",
    activation: "ação rápida",
    uses_per_scene: 1,
    dice: "1d6+Sab",
    description:
      "Uma vez por cena, como ação rápida, você canaliza energia divina curando a si mesmo ou um aliado ao " +
      "toque por 1d6 + modificador de Sabedoria pontos de vida.",
  },
  {
    id: "bencao_de_batalha",
    name: "Bênção de Batalha",
    type: "classe",
    class: "clerigo",
    activation: "ação",
    mp_cost: 1,
    description:
      "Você abençoa até 3 aliados que possam ouvi-lo. Os abençoados ganham +2 em testes de ataque e " +
      "Defesa por 1 cena.",
  },
  {
    id: "autoridade_eclesiastica",
    name: "Autoridade Eclesiástica",
    type: "classe",
    class: "clerigo",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "5º nível de clérigo",
    description:
      "Você possui uma posição formal em sua ordem. Você recebe +5 em testes de Diplomacia ou Intimidação ao lidar com devotos de seu santo e paga metade do preço de itens alquímicos, poções e serviços em templos de sua ordem.",
  },
  {
    id: "canalizar_energia",
    name: "Canalizar Energia",
    type: "classe",
    class: "clerigo",
    activation: "ação",
    dice: "1d6",
    description:
      "Você pode gastar uma ação padrão e PM para liberar uma onda de energia sagrada. Para cada PM que gastar, fornece 1d6 PV temporários para criaturas vivas e causa 1d6 pontos de dano de luz em mortos-vivos e demônios (Vontade CD Sab reduz à metade).",
  },
  {
    id: "canalizar_amplo",
    name: "Canalizar Amplo",
    type: "classe",
    class: "clerigo",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "Canalizar Energia",
    description:
      "Quando você usa a habilidade Canalizar Energia, pode gastar +2 PM para aumentar o alcance dela para médio.",
  },
  {
    id: "canalizar_esperanca",
    name: "Canalizar Esperança",
    type: "classe",
    class: "clerigo",
    activation: "passivo",
    mp_cost: 1,
    prerequisite: "Canalizar Energia",
    description:
      "Quando você usa Canalizar Energia, pode gastar +1 PM para anular as condições abalado, apavorado, debilitado, enjoado, exausto, fatigado, fraco ou lento de criaturas a sua escolha.",
  },
  {
    id: "comunhao_vital",
    name: "Comunhão Vital",
    type: "classe",
    class: "clerigo",
    activation: "passivo",
    mp_cost: 2,
    description:
      "Quando lança uma magia que cure uma criatura, você pode pagar +2 PM para que outra criatura em alcance curto recupere uma quantidade de pontos de vida igual à metade dos PV da cura original.",
  },
  {
    id: "conhecimento_magico_clerigo",
    name: "Conhecimento Mágico",
    type: "classe",
    class: "clerigo",
    activation: "passivo",
    description:
      "Você aprende duas magias divinas de seu santo de qualquer círculo que possa lançar. Você pode escolher este poder quantas vezes quiser.",
  },
  {
    id: "expulsar_o_mal",
    name: "Expulsar o Mal",
    type: "classe",
    class: "clerigo",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "Canalizar Energia",
    description:
      "Quando usa Canalizar Energia, você pode pagar +2 PM para expulsar todos os mortos-vivos e demônios em alcance curto. Mortos-vivos que falhem no teste de Vontade ficam apavorados por 1d6 rodadas.",
  },
  {
    id: "fieis",
    name: "Fiéis",
    type: "classe",
    class: "clerigo",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "Car 1, 5º nível de clérigo",
    description:
      "Você atrai um pequeno grupo de seguidores religiosos que funcionam como um parceiro iniciante (podendo ser carregador, adepto, turba ou combatente). No 7º nível mudam para veterano e no 15º para mestre.",
  },
  {
    id: "liturgia_magica",
    name: "Liturgia Mágica",
    type: "classe",
    class: "clerigo",
    activation: "ação",
    description:
      "Você pode gastar uma ação de movimento para executar uma breve liturgia de sua fé. Se fizer isso, a CD para resistir à sua próxima magia divina aumenta em +2 (se lançada até o final de seu próximo turno).",
  },
  {
    id: "missa_bencao_da_vida",
    name: "Missa: Bênção da Vida",
    type: "classe",
    class: "clerigo",
    activation: "ação",
    description:
      "Missa (1h, 25 PP em materiais). Os participantes recebem PV temporários em um valor igual ao seu nível + sua Sabedoria. Dura um dia.",
  },
  {
    id: "missa_chamado_as_armas",
    name: "Missa: Chamado às Armas",
    type: "classe",
    class: "clerigo",
    activation: "ação",
    description:
      "Missa (1h, 25 PP em materiais). Os participantes recebem +1 em testes de ataque e rolagens de dano. Dura um dia.",
  },
  {
    id: "missa_elevacao_do_espirito",
    name: "Missa: Elevação do Espírito",
    type: "classe",
    class: "clerigo",
    activation: "ação",
    description:
      "Missa (1h, 25 PP em materiais). Os participantes recebem PM temporários em um valor igual a sua Sabedoria. Dura um dia.",
  },
  {
    id: "missa_escudo_divino",
    name: "Missa: Escudo Divino",
    type: "classe",
    class: "clerigo",
    activation: "ação",
    description:
      "Missa (1h, 25 PP em materiais). Os participantes recebem +1 na Defesa e testes de resistência. Dura um dia.",
  },
  {
    id: "missa_superar_as_limitacoes",
    name: "Missa: Superar as Limitações",
    type: "classe",
    class: "clerigo",
    activation: "ação",
    dice: "+1d6",
    description:
      "Missa (1h, 25 PP em materiais). Cada participante recebe +1d6 num único teste a sua escolha e pode usá-lo mesmo após rolar o dado. Dura um dia.",
  },

  // ── Poderes de Classe — Druida ─────────────────────────────────────────────

  {
    id: "forma_animal",
    name: "Forma Animal",
    type: "classe",
    class: "druida",
    activation: "ação",
    uses_per_scene: 1,
    mp_cost: 1,
    description:
      "Você se transforma em um animal de Tamanho Médio ou menor pelo resto da cena. Assume as estatísticas " +
      "do animal mas retém sua personalidade e memória. Não pode conjurar magias enquanto transformado.",
  },
  {
    id: "voz_da_natureza",
    name: "Voz da Natureza",
    type: "classe",
    class: "druida",
    activation: "ação",
    uses_per_scene: 1,
    description:
      "Você consulta o ambiente natural ao redor. Plantas, animais e a própria terra respondem com " +
      "informações sobre eventos recentes ou localização de seres e objetos na área.",
  },
  {
    id: "cura_natural",
    name: "Cura Natural",
    type: "classe",
    class: "druida",
    activation: "ação rápida",
    mp_cost: 1,
    dice: "1d8+Sab",
    description:
      "Você canaliza energia natural para restaurar 1d8 + modificador de Sabedoria pontos de vida " +
      "em uma criatura ao toque.",
  },
  {
    id: "aspecto_do_inverno",
    name: "Aspecto do Inverno",
    type: "classe",
    class: "druida",
    activation: "passivo",
    description:
      "Você aprende uma magia de convocação ou evocação de qualquer classe e círculo que possa lançar. Além disso, recebe redução de frio 5 e suas magias que causam dano de frio causam +1 ponto de dano por dado.",
  },
  {
    id: "aspecto_do_outono",
    name: "Aspecto do Outono",
    type: "classe",
    class: "druida",
    activation: "passivo",
    mp_cost: 1,
    description:
      "Você aprende uma magia de necromancia de qualquer classe e círculo que possa lançar. Além disso, pode gastar 1 PM para impor uma penalidade de −2 nos testes de resistência de todos os inimigos em alcance curto até o início do seu próximo turno.",
  },
  {
    id: "aspecto_da_primavera",
    name: "Aspecto da Primavera",
    type: "classe",
    class: "druida",
    activation: "passivo",
    description:
      "Você aprende uma magia de encantamento ou ilusão de qualquer classe e círculo que possa lançar. Além disso, escolha um número de magias igual ao seu Carisma (mínimo 1) — o custo dessas magias é reduzido em −1 PM.",
  },
  {
    id: "aspecto_do_verao",
    name: "Aspecto do Verão",
    type: "classe",
    class: "druida",
    activation: "passivo",
    mp_cost: 1,
    description:
      "Você aprende uma magia de transmutação de qualquer classe e círculo que possa lançar. Pode gastar 1 PM para cobrir uma arma com chamas até o fim da cena (+1d6 fogo). Cada acerto concede 1 PM temporário.",
  },
  {
    id: "companheiro_animal_druida",
    name: "Companheiro Animal",
    type: "classe",
    class: "druida",
    activation: "passivo",
    prerequisite: "Car 1, treinado em Adestramento",
    description:
      "Você recebe um companheiro animal (parceiro assassino, atirador, combatente, fortão, guardião, perseguidor, vigilante ou montaria) do nível iniciante. No 7º nível muda para veterano e no 15º para mestre. Pode ser escolhido múltiplas vezes.",
  },
  {
    id: "companheiro_animal_aprimorado",
    name: "Companheiro Animal Aprimorado",
    type: "classe",
    class: "druida",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "Companheiro Animal, 6º nível de druida",
    description:
      "Escolha um de seus companheiros animais. Ele recebe um segundo tipo, ganhando os bônus de seu nível.",
  },
  {
    id: "coracao_da_selva",
    name: "Coração da Selva",
    type: "classe",
    class: "druida",
    activation: "passivo",
    description:
      "A CD para resistir a seus efeitos de veneno aumenta em +2 e estes efeitos causam +1 de perda de vida por dado.",
  },
  {
    id: "forma_selvagem",
    name: "Forma Selvagem",
    type: "classe",
    class: "druida",
    activation: "ação",
    mp_cost: 3,
    description:
      "Você pode gastar uma ação completa e 3 PM para adquirir a forma de uma criatura selvagem (Ágil, Feroz, Resistente, Sorrateira ou Veloz), assumindo os modificadores correspondentes.",
  },
  {
    id: "forma_selvagem_aprimorada",
    name: "Forma Selvagem Aprimorada",
    type: "classe",
    class: "druida",
    tier: "veterano",
    activation: "passivo",
    mp_cost: 6,
    prerequisite: "Forma Selvagem, 6º nível de druida",
    description:
      "Quando usa Forma Selvagem, você pode gastar 6 PM ao todo para assumir uma forma aprimorada.",
  },
  {
    id: "forma_selvagem_superior",
    name: "Forma Selvagem Superior",
    type: "classe",
    class: "druida",
    tier: "campeao",
    activation: "passivo",
    mp_cost: 10,
    prerequisite: "Forma Selvagem, 12º nível de druida",
    description:
      "Quando usa Forma Selvagem, você pode gastar 10 PM ao todo para assumir uma forma superior.",
  },
  {
    id: "forca_dos_penhascos",
    name: "Força dos Penhascos",
    type: "classe",
    class: "druida",
    activation: "passivo",
    prerequisite: "4º nível de druida",
    description:
      "+2 em Fortitude. Quando sofre dano enquanto em contato com o solo ou pedra, pode gastar PM (limitado por Sabedoria) para reduzir esse dano em 10 por PM.",
  },
  {
    id: "liberdade_da_pradaria",
    name: "Liberdade da Pradaria",
    type: "classe",
    class: "druida",
    activation: "passivo",
    mp_cost: 1,
    description:
      "+2 em Reflexos. Se estiver ao ar livre, sempre que lança uma magia, pode gastar 1 PM para aumentar o alcance dela em um passo.",
  },
  {
    id: "magia_natural",
    name: "Magia Natural",
    type: "classe",
    class: "druida",
    activation: "passivo",
    prerequisite: "Forma Selvagem",
    description:
      "Em forma selvagem, você pode lançar magias e empunhar catalisadores e esotéricos.",
  },
  {
    id: "presas_afiadas",
    name: "Presas Afiadas",
    type: "classe",
    class: "druida",
    activation: "passivo",
    description:
      "A margem de ameaça de suas armas naturais aumenta em +2.",
  },
  {
    id: "segredos_da_natureza",
    name: "Segredos da Natureza",
    type: "classe",
    class: "druida",
    activation: "passivo",
    description:
      "Você aprende duas magias de druida de qualquer círculo que possa lançar. Você pode escolher este poder quantas vezes quiser.",
  },
  {
    id: "tranquilidade_dos_lagos",
    name: "Tranquilidade dos Lagos",
    type: "classe",
    class: "druida",
    activation: "passivo",
    mp_cost: 1,
    description:
      "+2 em Vontade. Se estiver portando um recipiente com água, uma vez por rodada, quando faz um teste de resistência, pode pagar 1 PM para refazer a rolagem.",
  },

  // ── Poderes de Classe — Ladino ─────────────────────────────────────────────

  {
    id: "ataque_furtivo",
    name: "Ataque Furtivo",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    dice: "+2d6",
    description:
      "Quando você ataca uma criatura desprevenida, que não possa ver você, ou que esteja sendo " +
      "flanqueada com um aliado, causa +2d6 de dano furtivo adicional.",
  },
  {
    id: "evasao",
    name: "Evasão",
    type: "classe",
    class: "ladino",
    tier: "veterano",
    activation: "passivo",
    description:
      "Quando você é afetado por uma área de efeito com teste de Reflexos, passar no teste significa " +
      "que você não sofre dano algum (em vez de metade).",
  },
  {
    id: "mestre_ladrao",
    name: "Mestre Ladrão",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    description:
      "+5 em testes de Ladinagem. Você pode abrir fechaduras e fazer batedores sem ferramentas apropriadas.",
  },
  {
    id: "assassinar",
    name: "Assassinar",
    type: "classe",
    class: "ladino",
    tier: "veterano",
    activation: "ação",
    mp_cost: 3,
    prerequisite: "5º nível de ladino",
    description:
      "Você pode gastar uma ação de movimento e 3 PM para analisar uma criatura em alcance curto. Até o fim de seu próximo turno, seu primeiro Ataque Furtivo que causar dano a ela tem seus dados dobrados.",
  },
  {
    id: "camaleao",
    name: "Camaleão",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    prerequisite: "Car 1, treinado em Enganação",
    description:
      "Se possuir um estojo de disfarces, você pode lançar a magia Disfarce Ilusório, gastando seu custo normal em pontos de mana (não é uma habilidade mágica).",
  },
  {
    id: "contatos_no_submundo",
    name: "Contatos no Submundo",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    mp_cost: 2,
    description:
      "Quando chega em uma comunidade equivalente a uma vila ou maior, pode gastar 2 PM para fazer um teste de Carisma (CD 10). Se passar, recebe +5 em Investigação para interrogar, desconto de 20% em itens e acesso a itens proibidos.",
  },
  {
    id: "emboscar_ladino",
    name: "Emboscar",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "Treinado em Furtividade",
    description:
      "Na primeira rodada de cada combate, você pode gastar 2 PM para executar uma ação padrão adicional em seu turno.",
  },
  {
    id: "escapista",
    name: "Escapista",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    description:
      "+5 em testes de Acrobacia para escapar, passar por espaço apertado e passar por inimigo e em testes para resistir a efeitos de movimento.",
  },
  {
    id: "fuga_formidavel",
    name: "Fuga Formidável",
    type: "classe",
    class: "ladino",
    activation: "ação",
    mp_cost: 1,
    prerequisite: "Int 1",
    description:
      "Você pode gastar uma ação completa e 1 PM para analisar o lugar. Até o fim da cena, recebe +3m em deslocamento, +5 em Acrobacia e Atletismo e ignora penalidades por terreno difícil (apenas para ações de fuga).",
  },
  {
    id: "gatuno",
    name: "Gatuno",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    description:
      "+2 em Atletismo. Quando escala, não fica desprevenido e avança seu deslocamento normal.",
  },
  {
    id: "ladrao_arcano",
    name: "Ladrão Arcano",
    type: "classe",
    class: "ladino",
    tier: "lenda",
    activation: "passivo",
    prerequisite: "Roubo de Mana, 13º nível de ladino",
    description:
      "Quando causa dano com um ataque furtivo em uma criatura capaz de lançar magias, você pode 'roubar' uma magia que já a tenha visto lançar (paga 1 PM por círculo, máximo 4º círculo). Até o fim da cena, você pode lançar a magia roubada.",
  },
  {
    id: "mao_na_boca",
    name: "Mão na Boca",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    prerequisite: "Treinado em Luta",
    description:
      "+2 em testes de agarrar. Quando acerta um ataque furtivo contra uma criatura desprevenida, você pode fazer um teste de agarrar como ação livre. Se agarrar a criatura, ela não poderá falar.",
  },
  {
    id: "maos_rapidas",
    name: "Mãos Rápidas",
    type: "classe",
    class: "ladino",
    activation: "livre",
    mp_cost: 1,
    prerequisite: "Des 2, treinado em Ladinagem",
    description:
      "Uma vez por rodada, ao fazer um teste de Ladinagem para abrir fechaduras, ocultar item, punga ou sabotar, você pode pagar 1 PM para fazê-lo como uma ação livre.",
  },
  {
    id: "mente_criminosa",
    name: "Mente Criminosa",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    prerequisite: "Int 1",
    description:
      "Você soma sua Inteligência em Ladinagem e Furtividade.",
  },
  {
    id: "oportunismo",
    name: "Oportunismo",
    type: "classe",
    class: "ladino",
    tier: "veterano",
    activation: "reação",
    mp_cost: 2,
    prerequisite: "6º nível de ladino",
    description:
      "Uma vez por rodada, quando um inimigo adjacente sofre dano de um de seus aliados, você pode gastar 2 PM para fazer um ataque corpo a corpo contra este inimigo.",
  },
  {
    id: "rolamento_defensivo",
    name: "Rolamento Defensivo",
    type: "classe",
    class: "ladino",
    activation: "reação",
    mp_cost: 2,
    prerequisite: "Treinado em Reflexos",
    description:
      "Sempre que sofre dano, você pode gastar 2 PM para reduzir esse dano à metade. Após usar este poder, você fica caído.",
  },
  {
    id: "roubo_de_mana",
    name: "Roubo de Mana",
    type: "classe",
    class: "ladino",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "Truque Mágico, 7º nível de ladino",
    description:
      "Quando você causa dano com um ataque furtivo, para cada 1d6 de dano de seu ataque furtivo, você recebe 1 PM temporário e a criatura perde 1 ponto de mana (se tiver). Uma vez por cena por criatura.",
  },
  {
    id: "saqueador_de_tumbas",
    name: "Saqueador de Tumbas",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    description:
      "+5 em testes de Investigação para encontrar armadilhas e em testes de resistência contra elas. Além disso, gasta uma ação padrão para desabilitar mecanismos, em vez de 1d4 rodadas.",
  },
  {
    id: "sombra",
    name: "Sombra",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    prerequisite: "Treinado em Furtividade",
    description:
      "+2 em Furtividade, não sofre penalidade em testes de Furtividade por se mover no deslocamento normal e reduz a penalidade por atacar e fazer ações chamativas para −10.",
  },
  {
    id: "truque_magico",
    name: "Truque Mágico",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    mp_cost: 1,
    prerequisite: "Int 1",
    description:
      "Você pode lançar uma magia arcana de 1º círculo a sua escolha, pagando seu custo normal em PM (atributo-chave Inteligência). Você pode escolher este poder quantas vezes quiser.",
  },
  {
    id: "velocidade_ladina",
    name: "Velocidade Ladina",
    type: "classe",
    class: "ladino",
    activation: "ação",
    mp_cost: 2,
    prerequisite: "Des 2, treinado em Iniciativa",
    description:
      "Uma vez por rodada, você pode gastar 2 PM para realizar uma ação de movimento adicional em seu turno.",
  },
  {
    id: "veneno_potente",
    name: "Veneno Potente",
    type: "classe",
    class: "ladino",
    activation: "passivo",
    prerequisite: "Treinado em Ofício (alquimista)",
    description:
      "A CD para resistir aos venenos que você usa aumenta em +5.",
  },
  {
    id: "veneno_persistente",
    name: "Veneno Persistente",
    type: "classe",
    class: "ladino",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "Veneno Potente, 8º nível de ladino",
    description:
      "Quando aplica uma dose de veneno a uma arma, este veneno dura por três ataques (em vez de apenas um).",
  },

  // ── Poderes de Classe — Mago ───────────────────────────────────────────────

  {
    id: "familiar",
    name: "Familiar",
    type: "classe",
    class: "mago",
    activation: "passivo",
    description:
      "Você possui um animal mágico como familiar que concede um bônus especial conforme seu tipo " +
      "(borboleta: CD Vontade +1; cobra: CD Fortitude +1; coruja: alcance toque→curto; corvo: rolagem vantagem em Misticismo/Vontade; falcão: nunca surpreendido; fuinha: +2 Iniciativa/Investigação; gato: visão no escuro +2 Furtividade; lagarto: CD Reflexos +1; macaco: ação livre de pegar item; morcego: percepção às cegas; rato: usa Int em Fortitude; sapo: soma Int ao total de PV; tartaruga: +1 Defesa e natação). Você pode se comunicar telepaticamente com ele.",
  },
  {
    id: "conhecimento_magico",
    name: "Conhecimento Mágico",
    type: "classe",
    class: "mago",
    activation: "passivo",
    description:
      "Você aprende duas magias de qualquer círculo que possa lançar. Você pode escolher este poder quantas vezes quiser.",
  },
  {
    id: "conhecimento_proibido",
    name: "Conhecimento Proibido",
    type: "classe",
    class: "mago",
    activation: "passivo",
    prerequisite: "Treinado em Conhecimento",
    description:
      "Você aprende uma magia de qualquer tradição de qualquer círculo que possa lançar.",
  },
  {
    id: "contramgica_aprimorada",
    name: "Contramágica Aprimorada",
    type: "classe",
    class: "mago",
    activation: "reação",
    prerequisite: "Dissipar Magia",
    description:
      "Uma vez por rodada, você pode fazer uma contramágica como uma reação.",
  },
  {
    id: "envolto_em_misterio",
    name: "Envolto em Mistério",
    type: "classe",
    class: "mago",
    activation: "passivo",
    description:
      "Sua aparência assombrosa permite manipular e assustar pessoas ignorantes ou supersticiosas. Você recebe +5 em Enganação e Intimidação contra pessoas não treinadas em Conhecimento ou Misticismo.",
  },
  {
    id: "escudo_magico",
    name: "Escudo Mágico",
    type: "classe",
    class: "mago",
    activation: "passivo",
    description:
      "Quando lança uma magia, você recebe um bônus na Defesa igual ao círculo da magia lançada até o início do seu próximo turno.",
  },
  {
    id: "fluxo_de_mana",
    name: "Fluxo de Mana",
    type: "classe",
    class: "mago",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "10º nível de mago",
    description:
      "Você pode manter dois efeitos sustentados ativos simultaneamente com apenas uma ação livre, pagando o custo de cada efeito separadamente.",
  },
  {
    id: "fortalecimento_arcano",
    name: "Fortalecimento Arcano",
    type: "classe",
    class: "mago",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "5º nível de mago",
    description:
      "A CD para resistir a suas magias aumenta em +1. Se você puder lançar magias de 4º círculo, em vez disso ela aumenta em +2.",
  },
  {
    id: "geometria_mistica",
    name: "Geometria Mística",
    type: "classe",
    class: "mago",
    activation: "passivo",
    prerequisite: "Treinado em Conhecimento",
    description:
      "Quando lança uma magia com efeito em área, você pode excluir uma quantidade de alvos da área afetada igual a sua Inteligência.",
  },
  {
    id: "magia_pungente",
    name: "Magia Pungente",
    type: "classe",
    class: "mago",
    activation: "passivo",
    mp_cost: 1,
    description:
      "Quando lança uma magia, você pode pagar 1 PM para aumentar em +2 a CD para resistir a ela.",
  },
  {
    id: "mago_de_batalha",
    name: "Mago de Batalha",
    type: "classe",
    class: "mago",
    activation: "passivo",
    description:
      "Quando lança uma magia, você soma sua Inteligência na rolagem de dano.",
  },
  {
    id: "poder_magico",
    name: "Poder Mágico",
    type: "classe",
    class: "mago",
    activation: "passivo",
    description:
      "Você recebe +1 ponto de mana por nível de mago. Quando sobe de nível, os PM que recebe por este poder aumentam de acordo.",
  },
  {
    id: "raio_arcano",
    name: "Raio Arcano",
    type: "classe",
    class: "mago",
    activation: "ação",
    dice: "1d8",
    description:
      "Você pode gastar uma ação padrão para causar 1d8 pontos de dano de essência num alvo em alcance curto. Esse dano aumenta em +1d8 para cada círculo de magia acima do 1º que você puder lançar. O alvo pode fazer um teste de Reflexos (CD Int) para reduzir o dano à metade.",
  },
  {
    id: "raio_da_tradicao",
    name: "Raio da Tradição",
    type: "classe",
    class: "mago",
    activation: "passivo",
    prerequisite: "Raio Arcano",
    description:
      "Se o alvo de seu Raio Arcano falhar no teste de resistência, sofre um efeito adicional conforme sua tradição: Abissal (não pode ser curado por uma rodada), Elemental (dado extra de dano), Onírica (ofuscado por uma rodada), Erudita (vulnerável por uma rodada), Rústica (lento por uma rodada).",
  },
  {
    id: "raio_poderoso",
    name: "Raio Poderoso",
    type: "classe",
    class: "mago",
    activation: "passivo",
    prerequisite: "Raio Arcano",
    description:
      "Os dados de dano do seu Raio Arcano aumentam para d12 e o alcance dele aumenta para médio.",
  },
  {
    id: "segredo_aprimorado",
    name: "Segredo Aprimorado",
    type: "classe",
    class: "mago",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "5º nível de mago",
    description:
      "Você recebe o segredo aprimorado de sua tradição arcana (veja a tradição escolhida para detalhes).",
  },
  {
    id: "segredo_superior",
    name: "Segredo Superior",
    type: "classe",
    class: "mago",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "Segredo Aprimorado, 9º nível de mago",
    description:
      "Você recebe o segredo superior de sua tradição arcana (veja a tradição escolhida para detalhes).",
  },
  {
    id: "trespassar",
    name: "Trespassar",
    type: "classe",
    class: "mago",
    tier: "veterano",
    activation: "passivo",
    description:
      "Suas magias de área podem ser configuradas para não afetar aliados que você possa ver dentro da área de efeito. Equivalente ao poder Geometria Mística.",
  },
  {
    id: "magia_potencializada",
    name: "Magia Potencializada",
    type: "classe",
    class: "mago",
    activation: "ação rápida",
    uses_per_scene: 1,
    description:
      "Uma vez por cena, ao conjurar uma magia de dano, você pode adicionar 50% ao dano final " +
      "(arredondado para cima).",
  },

  // ── Poderes de Classe — Nobre ──────────────────────────────────────────────

  {
    id: "autoridade",
    name: "Autoridade",
    type: "classe",
    class: "nobre",
    activation: "passivo",
    description:
      "+5 em testes de Diplomacia e Intimidação contra humanoides civilizados. NPCs não-hostis têm " +
      "dificuldade em recusar suas solicitações razoáveis.",
  },
  {
    id: "rede_de_contatos",
    name: "Rede de Contatos",
    type: "classe",
    class: "nobre",
    activation: "passivo",
    description:
      "Ao chegar em qualquer cidade de médio porte ou maior, você pode gastar 1 hora para localizar " +
      "um contato útil que fornece informações, equipamentos ou serviços a preço de custo.",
  },
  {
    id: "inspiracao_nobre",
    name: "Inspiração Nobre",
    type: "classe",
    class: "nobre",
    activation: "ação",
    uses_per_scene: 1,
    mp_cost: 1,
    description:
      "Com um discurso motivador, você infunde confiança em até 5 aliados ao alcance curto. " +
      "Os aliados afetados recebem +2 em todos os testes por 1 cena.",
  },
  {
    id: "armadura_brilhante",
    name: "Armadura Brilhante",
    type: "classe",
    class: "nobre",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "8º nível de nobre",
    description:
      "Você pode usar seu Carisma na Defesa quando usa armadura pesada. Se fizer isso, não pode somar sua Destreza, mesmo que outras habilidades permitam.",
  },
  {
    id: "autoridade_feudal_nobre",
    name: "Autoridade Feudal",
    type: "classe",
    class: "nobre",
    tier: "veterano",
    activation: "ação",
    mp_cost: 2,
    prerequisite: "6º nível de nobre",
    description:
      "Você pode gastar uma hora e 2 PM para conclamar o povo a ajudá-lo. Essas pessoas contam como um parceiro iniciante de um tipo a sua escolha que o acompanha até o fim da aventura.",
  },
  {
    id: "castelao",
    name: "Castelão",
    type: "classe",
    class: "nobre",
    activation: "passivo",
    description:
      "Você é um administrador competente. Uma vez por turno de domínio, pode calcular o ganho do domínio como se ele fosse um nível maior, receber +5 num teste de domínio ou fazer uma ação construir adicional.",
  },
  {
    id: "educacao_privilegiada",
    name: "Educação Privilegiada",
    type: "classe",
    class: "nobre",
    activation: "passivo",
    description:
      "Você se torna treinado em duas perícias de nobre a sua escolha.",
  },
  {
    id: "estrategista",
    name: "Estrategista",
    type: "classe",
    class: "nobre",
    tier: "veterano",
    activation: "ação",
    mp_cost: 1,
    prerequisite: "Int 1, treinado em Guerra, 6º nível de nobre",
    description:
      "Você pode gastar uma ação padrão e 1 PM por aliado que quiser direcionar (limitado pelo Carisma). No próximo turno do aliado, ele ganha uma ação de movimento.",
  },
  {
    id: "favor",
    name: "Favor",
    type: "classe",
    class: "nobre",
    activation: "ação",
    mp_cost: 5,
    description:
      "Você pode usar sua influência para pedir favores a pessoas poderosas (5 PM, uma hora de conversa). Funciona como o uso persuasão de Diplomacia, mas permite pedir favores ainda mais caros ou perigosos.",
  },
  {
    id: "grito_tiranico",
    name: "Grito Tirânico",
    type: "classe",
    class: "nobre",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "8º nível de nobre",
    description:
      "Você pode usar Palavras Afiadas como uma ação completa, em vez de padrão. Se fizer isso, seus dados de dano aumentam para d8 e você atinge todos os inimigos em alcance curto.",
  },
  {
    id: "inspirar_confianca",
    name: "Inspirar Confiança",
    type: "classe",
    class: "nobre",
    activation: "passivo",
    mp_cost: 2,
    description:
      "Quando um aliado em alcance curto faz um teste, você pode gastar 2 PM para fazer com que ele possa rolar esse teste novamente.",
  },
  {
    id: "inspirar_gloria",
    name: "Inspirar Glória",
    type: "classe",
    class: "nobre",
    tier: "campeao",
    activation: "passivo",
    mp_cost: 5,
    uses_per_scene: 1,
    prerequisite: "Inspirar Confiança, 8º nível de nobre",
    description:
      "Você pode gastar 5 PM para fazer um aliado em alcance curto ganhar uma ação padrão adicional no próximo turno dele. Uma vez por cena por aliado.",
  },
  {
    id: "jogo_da_corte",
    name: "Jogo da Corte",
    type: "classe",
    class: "nobre",
    activation: "passivo",
    mp_cost: 1,
    description:
      "Você pode gastar 1 PM para rolar novamente um teste recém realizado de Diplomacia, Intuição ou Nobreza.",
  },
  {
    id: "liderar_pelo_exemplo",
    name: "Liderar pelo Exemplo",
    type: "classe",
    class: "nobre",
    tier: "veterano",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "6º nível de nobre",
    description:
      "Você pode gastar 2 PM para servir de inspiração. Até o início de seu próximo turno, sempre que você passar em um teste de perícia, aliados em alcance curto que fizerem um teste da mesma perícia podem usar o resultado do seu teste.",
  },
  {
    id: "lingua_de_ouro",
    name: "Língua de Ouro",
    type: "classe",
    class: "nobre",
    tier: "campeao",
    activation: "ação",
    mp_cost: 6,
    prerequisite: "Língua de Prata, 8º nível de nobre",
    description:
      "Você pode gastar uma ação padrão e 6 PM para gerar o efeito da magia Enfeitiçar com os aprimoramentos de sugerir ação e afetar todas as criaturas dentro do alcance (CD Car). Não é uma habilidade mágica.",
  },
  {
    id: "lingua_de_prata",
    name: "Língua de Prata",
    type: "classe",
    class: "nobre",
    activation: "passivo",
    mp_cost: 2,
    description:
      "Quando faz um teste de perícia baseada em Carisma, você pode gastar 2 PM para receber um bônus no teste igual a metade do seu nível.",
  },
  {
    id: "lingua_rapida",
    name: "Língua Rápida",
    type: "classe",
    class: "nobre",
    activation: "passivo",
    description:
      "A penalidade que você sofre para mudar atitude como uma ação completa e para fazer mentiras muito implausíveis diminui de −10 para −5.",
  },
  {
    id: "titulo",
    name: "Título",
    type: "classe",
    class: "nobre",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "Autoridade Feudal, 10º nível de nobre",
    description:
      "Você adquire um título de nobreza. Como regra geral, no início de cada aventura você recebe 20 PO por nível de nobre (rendimentos dos impostos) ou a ajuda de um parceiro veterano.",
  },
  {
    id: "voz_poderosa",
    name: "Voz Poderosa",
    type: "classe",
    class: "nobre",
    activation: "passivo",
    description:
      "+2 em Diplomacia e Intimidação. Suas habilidades de nobre com alcance curto passam para alcance médio.",
  },

  // ── Poderes de Classe — Soldado ────────────────────────────────────────────

  {
    id: "linha_de_batalha",
    name: "Linha de Batalha",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    description:
      "+2 nos testes de ataque e na Defesa quando você está adjacente a pelo menos um aliado durante o combate.",
  },
  {
    id: "treinamento_pesado",
    name: "Treinamento Pesado",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    description:
      "Você não sofre penalidades em testes de perícia por usar armaduras pesadas ou escudos grandes.",
  },
  {
    id: "segundo_vento",
    name: "Segundo Vento",
    type: "classe",
    class: "soldado",
    activation: "reação",
    uses_per_scene: 1,
    dice: "1d6+nível",
    description:
      "Uma vez por cena, como reação ao receber dano que o reduziria a 0 PV, você recupera " +
      "1d6 + nível de pontos de vida antes de aplicar o dano.",
  },
  {
    id: "alabardeiro",
    name: "Alabardeiro",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    mp_cost: 1,
    description:
      "Quando ataca um inimigo com uma arma alongada, você pode gastar 1 PM para fazer um ataque adicional contra um inimigo adjacente ao alvo original, se houver.",
  },
  {
    id: "ataque_reflexo",
    name: "Ataque Reflexo",
    type: "classe",
    class: "soldado",
    activation: "reação",
    mp_cost: 1,
    prerequisite: "Des 1",
    description:
      "Se um alvo em alcance de seus ataques corpo a corpo ficar desprevenido ou se mover voluntariamente para fora do seu alcance, você pode gastar 1 PM para fazer um ataque corpo a corpo contra esse alvo (uma vez por alvo por rodada).",
  },
  {
    id: "bater_e_correr",
    name: "Bater e Correr",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    mp_cost: 2,
    description:
      "Quando faz uma investida, você pode continuar se movendo após o ataque, até o limite de seu deslocamento. Se gastar 2 PM, pode fazer uma investida sobre terreno difícil e sem sofrer a penalidade de Defesa.",
  },
  {
    id: "disciplina_superior",
    name: "Disciplina Superior",
    type: "classe",
    class: "soldado",
    tier: "veterano",
    activation: "passivo",
    prerequisite: "5º nível de soldado",
    description:
      "O dado de dano que você rola por Ataque Disciplinado aumenta para d8.",
  },
  {
    id: "especialista_em_armadura",
    name: "Especialista em Armadura",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    description:
      "Escolha uma armadura. Se estiver usando esta armadura, você recebe +1 na Defesa e redução de dano 1. Você pode escolher este poder outras vezes para armaduras diferentes.",
  },
  {
    id: "especializacao_em_arma",
    name: "Especialização em Arma",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    description:
      "Escolha uma arma. Você recebe +2 em rolagens de dano com a arma escolhida. Você pode escolher este poder outras vezes para armas diferentes.",
  },
  {
    id: "golpe_de_raspao",
    name: "Golpe de Raspão",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    mp_cost: 2,
    description:
      "Uma vez por rodada, quando erra um ataque, você pode gastar 2 PM. Se fizer isso, causa metade do dano que o ataque causaria.",
  },
  {
    id: "golpe_demolidor",
    name: "Golpe Demolidor",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    mp_cost: 2,
    description:
      "Quando usa a manobra quebrar ou ataca um objeto, você pode gastar 2 PM para ignorar a RD dele.",
  },
  {
    id: "golpe_oportunista",
    name: "Golpe Oportunista",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    mp_cost: 1,
    prerequisite: "Treinado em Luta",
    description:
      "Quando usa a ação agredir e acerta um ataque, você pode pagar 1 PM para fazer um ataque desarmado extra contra o mesmo oponente.",
  },
  {
    id: "lutador_de_taverna",
    name: "Lutador de Taverna",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    mp_cost: 2,
    dice: "1d6",
    description:
      "Seus ataques desarmados causam 1d6 pontos de dano. Quando faz um ataque desarmado, pode gastar 2 PM. Se acertar, o inimigo deve fazer um teste de Fortitude (CD For) ou fica atordoado por uma rodada. Uma vez por cena por criatura.",
  },
  {
    id: "mestre_em_arma",
    name: "Mestre em Arma",
    type: "classe",
    class: "soldado",
    tier: "lenda",
    activation: "passivo",
    mp_cost: 2,
    prerequisite: "Especialização em Arma com a arma escolhida, 12º nível de soldado",
    description:
      "Escolha uma arma. Com esta arma, seu dano aumenta em um passo e você pode gastar 2 PM para rolar novamente um teste de ataque recém realizado.",
  },
  {
    id: "planejamento_marcial",
    name: "Planejamento Marcial",
    type: "classe",
    class: "soldado",
    tier: "campeao",
    activation: "passivo",
    prerequisite: "Treinado em Guerra, 10º nível de soldado",
    description:
      "Uma vez por dia, você pode gastar uma hora e 3 PM para escolher um poder de soldado ou de combate cujos pré-requisitos cumpra. Você recebe os benefícios desse poder até o próximo dia.",
  },
  {
    id: "precisao_disciplinada",
    name: "Precisão Disciplinada",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    mp_cost: 1,
    description:
      "Quando usa Ataque Disciplinado, você pode gastar 1 PM para aumentar a margem de ameaça do ataque em +2 ou para ignorar 10 pontos de redução de dano.",
  },
  {
    id: "solidez",
    name: "Solidez",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    description:
      "Se estiver usando um escudo, você aplica o bônus na Defesa recebido pelo escudo em testes de resistência.",
  },
  {
    id: "tornado_de_dor",
    name: "Tornado de Dor",
    type: "classe",
    class: "soldado",
    tier: "veterano",
    activation: "ação",
    mp_cost: 2,
    prerequisite: "6º nível de soldado",
    description:
      "Você pode gastar uma ação padrão e 2 PM para desferir uma série de golpes giratórios. Faça um ataque corpo a corpo e compare-o com a Defesa de cada inimigo adjacente. Faça uma rolagem de dano com +2 cumulativo para cada acerto e aplique-a em cada inimigo atingido.",
  },
  {
    id: "valentao",
    name: "Valentão",
    type: "classe",
    class: "soldado",
    activation: "passivo",
    description:
      "+2 em testes de ataque e rolagens de dano contra oponentes caídos, desprevenidos, flanqueados ou indefesos.",
  },
  {
    id: "pistoleiro",
    name: "Pistoleiro",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    dice: "+1d6",
    description:
      "Você tem maestria com armas de fogo. Ao usar uma arma de fogo, causa +1d6 de dano extra e pode " +
      "recarregar como ação livre uma vez por rodada.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const powerById = Object.fromEntries(
  powers.map((p) => [p.id, p]),
) as Record<string, Power>;

export const powerByName = Object.fromEntries(
  powers.map((p) => [p.name, p]),
) as Record<string, Power>;

export function getPowersForClass(classId: ClassId): Power[] {
  return powers.filter((p) => p.class === classId || p.type === "geral" || p.type === "combate");
}

export function getClassPowers(classId: ClassId): Power[] {
  return powers.filter((p) => p.class === classId);
}

export function getGeneralPowers(): Power[] {
  return powers.filter((p) => p.type === "geral" || p.type === "combate");
}

/** Poder de classe concedido automaticamente ao criar o personagem (nível 1). */
export const CLASS_STARTING_POWER: Partial<Record<import("./types").ClassId, string>> = {
  barbaro:   "furia",
  bardo:     "inspiracao",
  bucaneiro: "manobra_audaciosa",
  cacador:   "inimigo_favorito",
  cavaleiro: "desafio",
  clerigo:   "expulsar_mortos_vivos",
  druida:    "forma_animal",
  ladino:    "ataque_furtivo",
  mago:      "familiar",
  nobre:     "autoridade",
  soldado:   "linha_de_batalha",
};
