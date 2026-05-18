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
    id: "ataque_poderoso",
    name: "Ataque Poderoso",
    type: "combate",
    activation: "passivo",
    description:
      "Ao fazer um ataque corpo a corpo, você pode aceitar –2 no teste de ataque para ganhar +4 de dano. " +
      "A penalidade e o bônus dobram no patamar Veterano e triplicam no patamar Campeão.",
  },
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
      "Você tem treinamento mental excepcional. Recebe +5 em testes de Vontade e em testes para resistir " +
      "a medo, encantamento e efeitos mentais.",
  },
  {
    id: "iniciativa_aprimorada",
    name: "Iniciativa Aprimorada",
    type: "geral",
    activation: "passivo",
    description:
      "+10 no teste de Iniciativa. Você age antes dos inimigos na maioria das situações.",
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
    description:
      "+5 em testes de Percepção. Você não pode ser surpreendido enquanto estiver consciente.",
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
    description:
      "+2 nos testes de ataque mágico e nas rolagens de dano das suas magias.",
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
    description:
      "Ao empunhar um escudo, você recebe +2 de Defesa adicional ao bônus normal do escudo.",
  },
  {
    id: "foco_em_arma",
    name: "Foco em Arma",
    type: "combate",
    activation: "passivo",
    description:
      "Escolha um tipo de arma. Você recebe +2 nos testes de ataque ao usar essa arma.",
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
    description:
      "Você pode sacar e guardar armas como ação livre em vez de ação rápida.",
  },

  // ── Poderes de Classe — Bárbaro ────────────────────────────────────────────

  {
    id: "furia",
    name: "Fúria",
    type: "classe",
    class: "barbaro",
    activation: "ação rápida",
    uses_per_scene: 1,
    description:
      "Você entra em fúria selvagem por 1 cena: ganha +4 em Força e Constituição, 20 PV temporários e –2 de " +
      "Defesa. Enquanto em fúria, não pode usar magias ou habilidades que exijam concentração.",
  },
  {
    id: "resistencia_a_dor",
    name: "Resistência à Dor",
    type: "classe",
    class: "barbaro",
    tier: "veterano",
    activation: "passivo",
    description:
      "Você reduz todo dano recebido em 5 pontos (mínimo 1). No patamar Campeão, a redução aumenta para 10.",
  },
  {
    id: "instinto_selvagem",
    name: "Instinto Selvagem",
    type: "classe",
    class: "barbaro",
    activation: "passivo",
    description:
      "+10 em Iniciativa. Você não pode ser surpreendido em combate — sente o perigo antes de vê-lo.",
  },

  // ── Poderes de Classe — Bardo ──────────────────────────────────────────────

  {
    id: "inspiracao",
    name: "Inspiração",
    type: "classe",
    class: "bardo",
    activation: "ação",
    uses_per_scene: 2,
    mp_cost: 1,
    description:
      "Você faz uma performance mágica inspirando até 5 aliados que possam ouvi-lo. Os afetados ganham " +
      "+2 em testes de ataque e rolagens de dano por 1 cena.",
  },
  {
    id: "performance_de_combate",
    name: "Performance de Combate",
    type: "classe",
    class: "bardo",
    activation: "passivo",
    description:
      "Você pode manter magias de concentração durante ações de combate, desde que passe em um teste de " +
      "Atuação ND 15.",
  },
  {
    id: "musica_da_cura",
    name: "Música da Cura",
    type: "classe",
    class: "bardo",
    activation: "ação",
    mp_cost: 1,
    dice: "1d6",
    description:
      "Você toca uma melodia curativa que restaura 1d6 PV a todos os aliados ao alcance curto que possam ouvi-lo.",
  },

  // ── Poderes de Classe — Bucaneiro ──────────────────────────────────────────

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
  {
    id: "manobra_audaciosa",
    name: "Manobra Audaciosa",
    type: "classe",
    class: "bucaneiro",
    activation: "passivo",
    description:
      "Você pode realizar manobras de combate (agarrar, desarmar, empurrar) sem provocar ataques de oportunidade.",
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
    description:
      "Você tem um animal parceiro permanente que o acompanha e obedece suas ordens. O animal cresce em " +
      "poder junto com você, ganhando novos truques e resistências.",
  },
  {
    id: "rastreador",
    name: "Rastreador",
    type: "classe",
    class: "cacador",
    activation: "passivo",
    description:
      "Você rastreia criaturas em condições normais sem fazer testes e recebe +5 em testes de Sobrevivência. " +
      "Você nunca se perde no ambiente natural.",
  },

  // ── Poderes de Classe — Cavaleiro ──────────────────────────────────────────

  {
    id: "desafio",
    name: "Desafio",
    type: "classe",
    class: "cavaleiro",
    activation: "ação rápida",
    uses_per_scene: 1,
    description:
      "Você provoca um inimigo visível a lutar com você. Enquanto o desafio persistir, o alvo sofre " +
      "–5 em testes de ataque contra criaturas que não sejam você.",
  },
  {
    id: "protecao",
    name: "Proteção",
    type: "classe",
    class: "cavaleiro",
    activation: "reação",
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
      "Quando você é afetado por uma área de efeito com teste de Reflexo, passar no teste significa " +
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

  // ── Poderes de Classe — Mago ───────────────────────────────────────────────

  {
    id: "familiar",
    name: "Familiar",
    type: "classe",
    class: "mago",
    activation: "passivo",
    description:
      "Você possui um animal mágico como familiar que concede um bônus especial conforme seu tipo " +
      "(corvo: +2 Percepção; sapo: +2 Fortitude; gato: +2 Reflexo). Você pode ver e ouvir através dele.",
  },
  {
    id: "trespassar",
    name: "Trespassar",
    type: "classe",
    class: "mago",
    tier: "veterano",
    activation: "passivo",
    description:
      "Suas magias de área podem ser configuradas para não afetar aliados que você possa ver dentro " +
      "da área de efeito.",
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
