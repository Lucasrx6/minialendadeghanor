import type { ClassId } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SpellEffectType =
  | "dano"
  | "cura"
  | "buff"
  | "debuff"
  | "controle"
  | "utilidade"
  | "invocação";

export type SpellElement =
  | "fogo"
  | "gelo"
  | "relampago"
  | "acido"
  | "sonoro"
  | "necro"
  | "sagrado"
  | "trevas"
  | "luz"
  | "psiquico";

export type SpellCastingTime = "ação" | "ação rápida" | "reação" | "1 minuto";
export type SpellSave = "Fortitude" | "Reflexo" | "Vontade";
export type SpellTradition = "arcana" | "divina" | "natural";

export type SpellAmplify = {
  extra_mp: number; // PM extra além do custo base
  effect: string;   // descrição do efeito ampliado
};

export type Spell = {
  id: string;
  name: string;
  circle: 1 | 2 | 3 | 4 | 5;
  mp_cost: number;
  classes: ClassId[];
  traditions: SpellTradition[];
  tags: string[];
  casting_time: SpellCastingTime;
  range: string;
  target: string;
  duration: string;
  effect_type: SpellEffectType;
  element?: SpellElement;
  description: string;
  dice?: string;
  save?: SpellSave;
  attack?: boolean;
  amplify?: SpellAmplify[];
};

// ─── Catálogo ─────────────────────────────────────────────────────────────────

export const spells: Spell[] = [
  // ── Círculo 1 ──────────────────────────────────────────────────────────────

  {
    id: "abencoar_alimentos",
    name: "Abençoar Alimentos",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "druida"],
    traditions: ["divina", "natural"],
    tags: ["Clérigo", "Druida", "utilidade"],
    casting_time: "1 minuto",
    range: "toque",
    target: "Alimentos e bebidas em área de até 30 cm de raio",
    duration: "permanente",
    effect_type: "utilidade",
    description:
      "Purifica alimentos e bebidas, removendo venenos naturais, doenças e contaminações. " +
      "Torna comida estragada segura para consumo e água impura em potável.",
  },
  {
    id: "acalmar_animal",
    name: "Acalmar Animal",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "druida", "mago"],
    traditions: ["divina", "natural", "arcana"],
    tags: ["Clérigo", "Druida", "Mago", "controle"],
    casting_time: "ação",
    range: "curto",
    target: "1 animal",
    duration: "cena",
    effect_type: "controle",
    description:
      "Acalma um animal hostil ou com medo, tornando-o dócil e não ameaçador pelo resto da cena. " +
      "O animal não ataca e ignora provocações menores enquanto o efeito durar.",
    save: "Vontade",
  },
  {
    id: "alarme",
    name: "Alarme",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "mago"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "Mago", "utilidade"],
    casting_time: "1 minuto",
    range: "toque",
    target: "Uma entrada ou área de até 3m × 3m",
    duration: "8 horas",
    effect_type: "utilidade",
    description:
      "Cria um alarme mágico invisível em uma entrada ou área escolhida. Se um ser de Tamanho Pequeno ou " +
      "maior atravessar a área monitorada, o conjurador é alertado mentalmente, mesmo que esteja dormindo.",
  },
  {
    id: "armadura_magica",
    name: "Armadura Mágica",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "mago"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "Mago", "buff"],
    casting_time: "ação",
    range: "toque",
    target: "1 criatura",
    duration: "cena",
    effect_type: "buff",
    description:
      "Cria uma proteção mágica invisível ao redor do alvo, concedendo +2 de Defesa pelo resto da cena. " +
      "Este bônus não se acumula com armaduras físicas médias ou pesadas.",
    amplify: [
      { extra_mp: 1, effect: "+1 adicional de Defesa (total +3)." },
      { extra_mp: 2, effect: "+2 adicional de Defesa (total +4) e o bônus passa a valer mesmo com armadura física." },
    ],
  },
  {
    id: "aviso",
    name: "Aviso",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "mago"],
    traditions: ["divina", "arcana"],
    tags: ["Clérigo", "Mago", "utilidade"],
    casting_time: "ação",
    range: "pessoal",
    target: "Você",
    duration: "1 hora",
    effect_type: "utilidade",
    description:
      "Aguça seu senso de perigo iminente por 1 hora. Você não pode ser surpreendido e ganha +5 em " +
      "Iniciativa enquanto o efeito estiver ativo.",
  },
  {
    id: "bencao",
    name: "Bênção",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "mago"],
    traditions: ["divina", "arcana"],
    tags: ["Clérigo", "Mago", "buff"],
    casting_time: "ação",
    range: "curto",
    target: "Até 3 aliados",
    duration: "cena",
    effect_type: "buff",
    description:
      "Invoca a proteção divina sobre até 3 aliados próximos. Os alvos ganham +1 em todos os testes " +
      "de ataque e rolagens de dano enquanto a bênção durar.",
    amplify: [
      { extra_mp: 2, effect: "Afeta até 6 aliados adicionais." },
    ],
  },
  {
    id: "comando",
    name: "Comando",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "mago"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "Mago", "controle"],
    casting_time: "ação",
    range: "curto",
    target: "1 criatura inteligente",
    duration: "1 turno",
    effect_type: "controle",
    description:
      "Emite um único comando de uma palavra (como 'Fuja!', 'Caia!' ou 'Pare!') que o alvo deve " +
      "obedecer por 1 turno se falhar no teste. O comando não pode ser suicida nem impossível.",
    save: "Vontade",
    amplify: [
      { extra_mp: 2, effect: "O efeito dura 1 cena inteira em vez de 1 turno." },
    ],
  },
  {
    id: "compreensao",
    name: "Compreensão",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "mago"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "Mago", "utilidade"],
    casting_time: "ação",
    range: "pessoal",
    target: "Você",
    duration: "cena",
    effect_type: "utilidade",
    description:
      "Você consegue ler e compreender qualquer idioma escrito ou falado pelo resto da cena. " +
      "Não concede a habilidade de falar o idioma, apenas de entendê-lo.",
  },
  {
    id: "concentracao_de_combate",
    name: "Concentração de Combate",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "buff"],
    casting_time: "ação rápida",
    range: "pessoal",
    target: "Você",
    duration: "cena",
    effect_type: "buff",
    description:
      "Aguda sua concentração arcana, permitindo lançar magias mesmo sob pressão extrema. " +
      "Pelo resto da cena, você não precisa fazer testes para manter concentração quando está ferido ou ameaçado.",
  },
  {
    id: "curar_ferimentos",
    name: "Curar Ferimentos",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "druida"],
    traditions: ["divina", "natural"],
    tags: ["Clérigo", "Druida", "cura"],
    casting_time: "ação",
    range: "toque",
    target: "1 criatura",
    duration: "instantâneo",
    effect_type: "cura",
    description:
      "Canaliza energia vital para curar as feridas de uma criatura ao toque, restaurando " +
      "1d8 PV mais o modificador de Sabedoria do conjurador.",
    dice: "1d8+Sab",
    amplify: [
      { extra_mp: 1, effect: "+1d8 adicional de cura." },
      { extra_mp: 2, effect: "+2d8 de cura e o alcance passa para curto (sem toque necessário)." },
      { extra_mp: 4, effect: "Cura todos os aliados ao alcance curto por 1d8+Sab cada." },
    ],
  },
  {
    id: "dardo_gelido",
    name: "Dardo Gélido",
    circle: 1, mp_cost: 1,
    classes: ["druida", "mago"],
    traditions: ["natural", "arcana"],
    tags: ["Druida", "Mago", "dano"],
    casting_time: "ação",
    range: "curto",
    target: "1 criatura",
    duration: "instantâneo",
    effect_type: "dano",
    element: "gelo",
    description:
      "Lança um projétil de gelo que congela levemente o alvo ao acertar. Causa 1d6 de dano " +
      "frio e reduz o deslocamento do alvo em 3m até o início do próximo turno.",
    dice: "1d6",
    attack: true,
    amplify: [
      { extra_mp: 1, effect: "+1d6 de dano frio e o alvo fica entorpecido por 1 turno." },
      { extra_mp: 2, effect: "Atinge até 2 alvos adicionais." },
    ],
  },
  {
    id: "detectar_ameacas",
    name: "Detectar Ameaças",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "mago"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "Mago", "utilidade"],
    casting_time: "ação",
    range: "pessoal",
    target: "Você",
    duration: "cena",
    effect_type: "utilidade",
    description:
      "Aguça seus sentidos para captar perigos sobrenaturais na área ao redor. Você detecta " +
      "seres hostis, armadilhas mágicas e encantamentos ocultos em um raio de 18m.",
  },
  {
    id: "disfarce_ilusorio",
    name: "Disfarce Ilusório",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "mago"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "Mago", "utilidade"],
    casting_time: "ação",
    range: "pessoal",
    target: "Você",
    duration: "cena",
    effect_type: "utilidade",
    description:
      "Altera sua aparência visual para parecer outro humanoide de constituição similar. " +
      "A ilusão cobre roupas e equipamentos aparentes, mas não resiste ao toque físico.",
  },
  {
    id: "enfeiticar",
    name: "Enfeitiçar",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "mago"],
    traditions: ["arcana"],
    tags: ["Bardo", "Mago", "controle"],
    casting_time: "ação",
    range: "curto",
    target: "1 humanoide",
    duration: "cena",
    effect_type: "controle",
    description:
      "Lança um encanto de amizade sobre um humanoide. Se falhar no teste, o alvo trata o " +
      "conjurador como um amigo confiável e não o atacará pelo resto da cena.",
    save: "Vontade",
  },
  {
    id: "escudo_da_fe",
    name: "Escudo da Fé",
    circle: 1, mp_cost: 1,
    classes: ["clerigo"],
    traditions: ["divina"],
    tags: ["Clérigo", "buff"],
    casting_time: "ação rápida",
    range: "toque",
    target: "1 criatura",
    duration: "cena",
    effect_type: "buff",
    description:
      "Invoca um escudo de energia sagrada ao redor do alvo, concedendo +2 de Defesa pelo " +
      "resto da cena. Pode ser conjurada como ação rápida e transferida ao toque.",
  },
  {
    id: "imagem_espelhada",
    name: "Imagem Espelhada",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "mago"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "Mago", "buff"],
    casting_time: "ação rápida",
    range: "pessoal",
    target: "Você",
    duration: "cena",
    effect_type: "buff",
    description:
      "Gera 1d4+1 duplicatas ilusórias suas que se movem e imitam suas ações. Ataques contra " +
      "você têm chance de atingir uma duplicata; cada cópia desaparece ao ser atingida.",
    dice: "1d4+1 duplicatas",
    amplify: [
      { extra_mp: 1, effect: "+1d4 duplicatas adicionais." },
    ],
  },
  {
    id: "infligir_ferimentos",
    name: "Infligir Ferimentos",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "mago"],
    traditions: ["divina", "arcana"],
    tags: ["Clérigo", "Mago", "dano"],
    casting_time: "ação",
    range: "toque",
    target: "1 criatura",
    duration: "instantâneo",
    effect_type: "dano",
    element: "necro",
    description:
      "Canaliza energia negativa que queima ao toque, ferindo criaturas vivas (ou curando " +
      "mortos-vivos pelo mesmo valor). Causa 1d8 de dano necrótico mais o modificador de Sabedoria.",
    dice: "1d8+Sab",
    attack: true,
    amplify: [
      { extra_mp: 1, effect: "+1d8 adicional de dano necrótico." },
      { extra_mp: 2, effect: "+2d8 e o alcance passa para curto (sem toque necessário)." },
    ],
  },
  {
    id: "luz",
    name: "Luz",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "druida", "mago"],
    traditions: ["arcana", "divina", "natural"],
    tags: ["Bardo", "Clérigo", "Druida", "Mago", "utilidade"],
    casting_time: "ação rápida",
    range: "toque",
    target: "1 objeto",
    duration: "cena",
    effect_type: "utilidade",
    element: "luz",
    description:
      "Faz um objeto brilhar com luz mágica equivalente a uma tocha, iluminando um raio de 9m " +
      "por 1 cena. Pode ser conjurada em um objeto que o conjurador segura ou ao alcance de toque.",
  },
  {
    id: "mensagem_secreta",
    name: "Mensagem Secreta",
    circle: 1, mp_cost: 1,
    classes: ["bardo"],
    traditions: ["arcana"],
    tags: ["Bardo", "utilidade"],
    casting_time: "ação",
    range: "especial",
    target: "1 criatura conhecida no mesmo plano",
    duration: "instantâneo",
    effect_type: "utilidade",
    description:
      "Transmite uma mensagem mental de até 25 palavras para alguém que você conhece e que " +
      "esteja no mesmo plano. O destinatário pode responder instantaneamente com uma mensagem igualmente curta.",
  },
  {
    id: "orientacao",
    name: "Orientação",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "mago"],
    traditions: ["divina", "arcana"],
    tags: ["Clérigo", "Mago", "buff"],
    casting_time: "ação rápida",
    range: "toque",
    target: "1 criatura",
    duration: "1 turno",
    effect_type: "buff",
    description:
      "Canaliza um toque de sabedoria divina para auxiliar uma ação específica. O alvo pode " +
      "adicionar 1d4 ao próximo teste de habilidade que fizer antes do fim do seu próximo turno.",
    dice: "1d4",
  },
  {
    id: "perdicao",
    name: "Perdição",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "mago"],
    traditions: ["divina", "arcana"],
    tags: ["Clérigo", "Mago", "debuff"],
    casting_time: "ação",
    range: "curto",
    target: "Até 3 criaturas",
    duration: "cena",
    effect_type: "debuff",
    description:
      "Maldiz até 3 criaturas com energia negativa debilitante. As criaturas afetadas sofrem " +
      "–1 em todos os testes de ataque e rolagens de dano enquanto o efeito durar.",
    save: "Vontade",
  },
  {
    id: "primor_atletico",
    name: "Primor Atlético",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "druida", "mago"],
    traditions: ["arcana", "divina", "natural"],
    tags: ["Bardo", "Clérigo", "Druida", "Mago", "buff"],
    casting_time: "ação rápida",
    range: "toque",
    target: "1 criatura",
    duration: "cena",
    effect_type: "buff",
    description:
      "Aprimora temporariamente as capacidades físicas do alvo com magia. O alvo ganha +2 em " +
      "testes de Atletismo, Acrobacia e Furtividade, além de +3m de deslocamento.",
  },
  {
    id: "protecao_mistica",
    name: "Proteção Mística",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "druida", "mago"],
    traditions: ["arcana", "divina", "natural"],
    tags: ["Bardo", "Clérigo", "Druida", "Mago", "buff"],
    casting_time: "ação",
    range: "toque",
    target: "1 criatura",
    duration: "cena",
    effect_type: "buff",
    description:
      "Envolve o alvo em uma barreira de força mágica que resiste a danos elementais. O alvo " +
      "ganha resistência 5 contra um tipo de dano energético escolhido (fogo, frio, elétrico, ácido ou trovão).",
    amplify: [
      { extra_mp: 2, effect: "A resistência aumenta para 10 e pode cobrir 2 tipos de dano." },
    ],
  },
  {
    id: "queda_suave",
    name: "Queda Suave",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "druida", "mago"],
    traditions: ["divina", "natural", "arcana"],
    tags: ["Clérigo", "Druida", "Mago", "utilidade"],
    casting_time: "reação",
    range: "curto",
    target: "Até 2 criaturas caindo",
    duration: "1 turno",
    effect_type: "utilidade",
    description:
      "Como reação ao início de uma queda, desacelera magicamente o conjurador ou um aliado " +
      "próximo. A velocidade de queda reduz para 18m/turno; a criatura não sofre dano de queda.",
  },
  {
    id: "santuario",
    name: "Santuário",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "mago"],
    traditions: ["divina", "arcana"],
    tags: ["Clérigo", "Mago", "buff"],
    casting_time: "ação rápida",
    range: "toque",
    target: "1 criatura",
    duration: "cena",
    effect_type: "buff",
    description:
      "Envolve o alvo com uma aura que proíbe ataques diretos. Criaturas que quiserem atacar " +
      "o protegido devem antes fazer um teste de Vontade; se falharem, não podem atacá-lo naquele turno.",
    save: "Vontade",
  },
  {
    id: "sono",
    name: "Sono",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "mago"],
    traditions: ["arcana"],
    tags: ["Bardo", "Mago", "controle"],
    casting_time: "ação",
    range: "curto",
    target: "Até 3 criaturas",
    duration: "cena",
    effect_type: "controle",
    description:
      "Envolve criaturas em uma névoa sonífera mágica. Criaturas com 5 PV ou menos são afetadas " +
      "automaticamente; demais fazem teste de Vontade ou adormecem pelo resto da cena.",
    save: "Vontade",
    amplify: [
      { extra_mp: 2, effect: "Afeta mais 3 criaturas adicionais e o limite de PV sobe para 15." },
    ],
  },
  {
    id: "suporte_ambiental",
    name: "Suporte Ambiental",
    circle: 1, mp_cost: 1,
    classes: ["clerigo", "druida", "mago"],
    traditions: ["divina", "natural", "arcana"],
    tags: ["Clérigo", "Druida", "Mago", "buff"],
    casting_time: "ação",
    range: "toque",
    target: "1 criatura",
    duration: "cena",
    effect_type: "buff",
    description:
      "Protege o alvo dos extremos climáticos naturais pelo resto da cena. O alvo ignora " +
      "penalidades por calor extremo, frio intenso, chuva forte ou ventos, e não precisa beber água.",
  },
  {
    id: "tranquilidade",
    name: "Tranquilidade",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "mago"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "Mago", "controle"],
    casting_time: "ação",
    range: "curto",
    target: "Até 3 criaturas",
    duration: "cena",
    effect_type: "controle",
    description:
      "Dissipa emoções intensas em até 3 criaturas ao alcance. Seres com raiva, medo ou " +
      "comportamento hostil ficam calmos e não iniciam conflito por 1 cena, a menos que sejam atacados.",
    save: "Vontade",
  },
  {
    id: "visao_mistica",
    name: "Visão Mística",
    circle: 1, mp_cost: 1,
    classes: ["bardo", "clerigo", "druida", "mago"],
    traditions: ["arcana", "divina", "natural"],
    tags: ["Bardo", "Clérigo", "Druida", "Mago", "utilidade"],
    casting_time: "ação",
    range: "pessoal",
    target: "Você",
    duration: "cena",
    effect_type: "utilidade",
    description:
      "Expande sua percepção para além do normal. Você detecta seres invisíveis, vê através de " +
      "ilusões (com teste de Int ou Sab) e lê auras mágicas em um raio de 9m.",
  },

  // ── Círculo 2 ──────────────────────────────────────────────────────────────

  {
    id: "adaga_mental",
    name: "Adaga Mental",
    circle: 2, mp_cost: 2,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "dano"],
    casting_time: "ação",
    range: "curto",
    target: "1 criatura",
    duration: "instantâneo",
    effect_type: "dano",
    element: "psiquico",
    description:
      "Conjura uma adaga de energia psíquica que contorna armaduras físicas e atinge diretamente " +
      "a mente do alvo. Causa 2d6 de dano mental; o alvo fica confuso por 1 turno se falhar no teste.",
    dice: "2d6",
    save: "Vontade",
    amplify: [
      { extra_mp: 1, effect: "+1d6 de dano e o alvo fica atordoado por 1 turno (em vez de confuso)." },
    ],
  },
  {
    id: "amedrontar",
    name: "Amedrontar",
    circle: 2, mp_cost: 2,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "debuff"],
    casting_time: "ação",
    range: "curto",
    target: "1 criatura",
    duration: "cena",
    effect_type: "debuff",
    description:
      "Infunde pavor sobrenatural no coração do alvo que falha no teste. O alvo fica amedrontado " +
      "e deve fugir da fonte de medo ou agir com penalidade de –2 em todos os testes por 1 cena.",
    save: "Vontade",
    amplify: [
      { extra_mp: 2, effect: "Afeta até 3 alvos na mesma área." },
    ],
  },
  {
    id: "area_escorregadia",
    name: "Área Escorregadia",
    circle: 2, mp_cost: 2,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "controle"],
    casting_time: "ação",
    range: "médio",
    target: "Área de 6m de raio no chão",
    duration: "cena",
    effect_type: "controle",
    description:
      "Cobre o chão de uma área de 6m de raio com um filme mágico escorregadio. Criaturas que " +
      "entram ou se movem pela área fazem um teste de Reflexo ou caem, ficando prostradas.",
    save: "Reflexo",
  },
  {
    id: "arma_espiritual",
    name: "Arma Espiritual",
    circle: 2, mp_cost: 2,
    classes: ["clerigo"],
    traditions: ["divina"],
    tags: ["Clérigo", "dano"],
    casting_time: "ação",
    range: "médio",
    target: "1 criatura",
    duration: "cena",
    effect_type: "dano",
    element: "sagrado",
    description:
      "Invoca uma arma de energia divina que flutua no ar e ataca por conta própria. A cada " +
      "turno, como ação livre, a arma ataca um alvo a alcance médio causando 2d6 de dano sagrado.",
    dice: "2d6",
    attack: true,
    amplify: [
      { extra_mp: 2, effect: "A arma causa +1d6 de dano e pode atacar 2 alvos diferentes no mesmo turno." },
    ],
  },
  {
    id: "arma_magica",
    name: "Arma Mágica",
    circle: 2, mp_cost: 2,
    classes: ["clerigo", "mago"],
    traditions: ["divina", "arcana"],
    tags: ["Clérigo", "Mago", "buff"],
    casting_time: "ação",
    range: "toque",
    target: "1 arma",
    duration: "cena",
    effect_type: "buff",
    description:
      "Encanta uma arma natural ou manufaturada com energia mágica. A arma recebe +2 de bônus " +
      "mágico nos testes de ataque e nas rolagens de dano pelo resto da cena.",
    amplify: [
      { extra_mp: 2, effect: "Bônus aumenta para +4 e a arma causa 1d6 de dano adicional de energia mágica." },
    ],
  },
  {
    id: "armamento_da_natureza",
    name: "Armamento da Natureza",
    circle: 2, mp_cost: 2,
    classes: ["druida", "mago"],
    traditions: ["natural", "arcana"],
    tags: ["Druida", "Mago", "buff"],
    casting_time: "ação",
    range: "pessoal",
    target: "Você",
    duration: "cena",
    effect_type: "buff",
    description:
      "Chama as forças da natureza para armar e proteger o conjurador com elementos naturais. " +
      "Você ganha uma arma natural de dano 1d8 e +2 de Defesa pelo resto da cena.",
    dice: "1d8",
  },
  {
    id: "caminhos_da_natureza",
    name: "Caminhos da Natureza",
    circle: 2, mp_cost: 2,
    classes: ["clerigo", "druida", "mago"],
    traditions: ["divina", "natural", "arcana"],
    tags: ["Clérigo", "Druida", "Mago", "utilidade"],
    casting_time: "ação",
    range: "pessoal",
    target: "Você",
    duration: "cena",
    effect_type: "utilidade",
    description:
      "Você se harmoniza com o ambiente natural. Ganha +5 em testes de Sobrevivência e Percepção " +
      "ao ar livre, não deixa rastros rastreáveis e atravessa terreno natural difícil sem penalidade.",
  },
  {
    id: "consagrar",
    name: "Consagrar",
    circle: 2, mp_cost: 2,
    classes: ["clerigo", "druida"],
    traditions: ["divina", "natural"],
    tags: ["Clérigo", "Druida", "utilidade"],
    casting_time: "1 minuto",
    range: "pessoal",
    target: "Área de 6m de raio ao redor do conjurador",
    duration: "1 dia",
    effect_type: "utilidade",
    description:
      "Santifica uma área com energia sagrada por 24 horas. Mortos-vivos na área sofrem –2 em " +
      "todos os testes, e aliados ganham +2 contra efeitos de medo e encantamento enquanto estiverem nela.",
  },
  {
    id: "criar_ilusao",
    name: "Criar Ilusão",
    circle: 2, mp_cost: 2,
    classes: ["bardo", "mago"],
    traditions: ["arcana"],
    tags: ["Bardo", "Mago", "utilidade"],
    casting_time: "ação",
    range: "médio",
    target: "Área de até 3m de comprimento",
    duration: "concentração",
    effect_type: "utilidade",
    description:
      "Cria uma ilusão visual e auditiva convincente de até 3m de comprimento dentro do alcance. " +
      "A ilusão persiste enquanto o conjurador mantiver concentração e não resiste à inspeção tátil.",
    save: "Vontade",
    amplify: [
      { extra_mp: 2, effect: "A ilusão passa a incluir sensações táteis leves e odores; requer novo teste de Vontade." },
    ],
  },
  {
    id: "despedacar",
    name: "Despedaçar",
    circle: 2, mp_cost: 2,
    classes: ["bardo", "clerigo", "mago"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "Mago", "dano"],
    casting_time: "ação",
    range: "curto",
    target: "1 objeto ou criatura",
    duration: "instantâneo",
    effect_type: "dano",
    element: "sonoro",
    description:
      "Cria uma vibração mágica explosiva que pode partir objetos ou desestruturar criaturas. " +
      "Um objeto não mágico de até 5kg é destruído; uma criatura sofre 2d6 de dano sonoro se falhar no teste.",
    dice: "2d6",
    save: "Fortitude",
  },
  {
    id: "escuridao",
    name: "Escuridão",
    circle: 2, mp_cost: 2,
    classes: ["clerigo", "druida", "mago"],
    traditions: ["divina", "natural", "arcana"],
    tags: ["Clérigo", "Druida", "Mago", "controle"],
    casting_time: "ação",
    range: "curto",
    target: "Área de 6m de raio",
    duration: "cena",
    effect_type: "controle",
    element: "trevas",
    description:
      "Preenche uma área de 6m de raio com trevas mágicas impenetráveis pelo resto da cena. " +
      "Bloqueia visão normal e de baixa luminosidade; criaturas com visão no escuro mágica ainda podem ver.",
  },
  {
    id: "jato_corrosivo",
    name: "Jato Corrosivo",
    circle: 2, mp_cost: 2,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "dano"],
    casting_time: "ação",
    range: "curto",
    target: "1 criatura",
    duration: "instantâneo",
    effect_type: "dano",
    element: "acido",
    description:
      "Expele um jato de ácido mágico que corrói armaduras e queima carne. Causa 2d6 de dano " +
      "ácido; se acertar, o alvo sofre –1 na Defesa até o fim da cena (não cumulativo).",
    dice: "2d6",
    attack: true,
    amplify: [
      { extra_mp: 1, effect: "+1d6 de dano ácido e o alvo sofre –1 adicional de Defesa." },
    ],
  },
  {
    id: "leque_cromatico",
    name: "Leque Cromático",
    circle: 2, mp_cost: 2,
    classes: ["bardo", "mago"],
    traditions: ["arcana"],
    tags: ["Bardo", "Mago", "controle"],
    casting_time: "ação",
    range: "pessoal",
    target: "Cone de 6m à frente do conjurador",
    duration: "instantâneo",
    effect_type: "controle",
    description:
      "Libera um cone de luz multicolorida que afeta criaturas na área. Cada criatura que falhar " +
      "no teste fica cega por 1 turno, confusa por 2 turnos, ou paralisada por 1 turno (1d3 determina o efeito).",
    save: "Fortitude",
  },
  {
    id: "nevoa",
    name: "Névoa",
    circle: 2, mp_cost: 2,
    classes: ["clerigo", "druida", "mago"],
    traditions: ["divina", "natural", "arcana"],
    tags: ["Clérigo", "Druida", "Mago", "controle"],
    casting_time: "ação",
    range: "médio",
    target: "Área de 12m de raio",
    duration: "cena",
    effect_type: "controle",
    description:
      "Cria uma névoa densa em uma área de 12m de raio centrada em um ponto ao alcance médio. " +
      "Bloqueia visão além de 1,5m dentro dela e persiste por 1 cena ou até vento forte a dissipar.",
  },
  {
    id: "raio_do_enfraquecimento",
    name: "Raio do Enfraquecimento",
    circle: 2, mp_cost: 2,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "debuff"],
    casting_time: "ação",
    range: "curto",
    target: "1 criatura",
    duration: "cena",
    effect_type: "debuff",
    description:
      "Dispara um raio de energia debilitante que drena a força física do alvo. Se acertar, " +
      "o alvo tem o modificador de Força reduzido em 2 por 1 cena, com penalidade equivalente em dano e testes.",
    attack: true,
    amplify: [
      { extra_mp: 2, effect: "A penalidade de Força aumenta para –4 e o alvo fica lento." },
    ],
  },
  {
    id: "resistencia_a_energia",
    name: "Resistência a Energia",
    circle: 2, mp_cost: 2,
    classes: ["clerigo", "druida", "mago"],
    traditions: ["divina", "natural", "arcana"],
    tags: ["Clérigo", "Druida", "Mago", "buff"],
    casting_time: "ação",
    range: "toque",
    target: "1 criatura",
    duration: "cena",
    effect_type: "buff",
    description:
      "Confere ao alvo resistência a um tipo de dano energético escolhido (fogo, frio, elétrico, " +
      "ácido ou trovão). O alvo reduz em 10 qualquer dano recebido daquele tipo.",
    amplify: [
      { extra_mp: 2, effect: "Resistência aumenta para 20 e pode afetar um segundo tipo de energia." },
    ],
  },
  {
    id: "seta_infalivel",
    name: "Seta Infalível",
    circle: 2, mp_cost: 2,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "dano"],
    casting_time: "ação",
    range: "médio",
    target: "1 criatura",
    duration: "instantâneo",
    effect_type: "dano",
    description:
      "Cria uma seta de força mágica que acerta automaticamente, sem necessidade de teste de " +
      "ataque. Causa 1d4+1 de dano mágico e não pode ser desviada por defesas ou cobertura parcial.",
    dice: "1d4+1",
    amplify: [
      { extra_mp: 2, effect: "Dispara 3 setas simultaneamente, cada uma em alvos diferentes ou no mesmo." },
    ],
  },
  {
    id: "toque_chocante",
    name: "Toque Chocante",
    circle: 2, mp_cost: 2,
    classes: ["druida", "mago"],
    traditions: ["natural", "arcana"],
    tags: ["Druida", "Mago", "dano"],
    casting_time: "ação",
    range: "toque",
    target: "1 criatura",
    duration: "instantâneo",
    effect_type: "dano",
    element: "relampago",
    description:
      "Canaliza uma descarga elétrica pela mão do conjurador. Causa 2d6 de dano elétrico; " +
      "se o alvo usar armadura metálica, o dano aumenta em 1d6 extra.",
    dice: "2d6",
    attack: true,
    amplify: [
      { extra_mp: 1, effect: "+1d6 de dano elétrico e o alvo fica atordoado por 1 turno." },
    ],
  },
  {
    id: "tranca_arcana",
    name: "Tranca Arcana",
    circle: 2, mp_cost: 2,
    classes: ["bardo", "clerigo", "mago"],
    traditions: ["arcana", "divina"],
    tags: ["Bardo", "Clérigo", "Mago", "utilidade"],
    casting_time: "ação",
    range: "toque",
    target: "1 porta, janela ou fechadura",
    duration: "permanente",
    effect_type: "utilidade",
    description:
      "Sela magicamente uma porta, janela, baú ou outra superfície fechável de forma permanente. " +
      "A tranca requer um teste de Atletismo ND 25 ou uma magia de dissipar para ser aberta.",
  },
  {
    id: "transmutar_objetos",
    name: "Transmutar Objetos",
    circle: 2, mp_cost: 2,
    classes: ["clerigo", "mago"],
    traditions: ["divina", "arcana"],
    tags: ["Clérigo", "Mago", "utilidade"],
    casting_time: "ação",
    range: "toque",
    target: "1 objeto não mágico de até 5kg",
    duration: "cena",
    effect_type: "utilidade",
    description:
      "Altera as propriedades básicas de um objeto não mágico por 1 cena: madeira em pedra, " +
      "metal em argila, tecido em couro, etc. Não afeta criaturas nem objetos mágicos.",
    amplify: [
      { extra_mp: 2, effect: "O limite sobe para 25kg e a duração passa a ser 1 dia." },
    ],
  },
  {
    id: "vitalidade_fantasma",
    name: "Vitalidade Fantasma",
    circle: 2, mp_cost: 2,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "buff"],
    casting_time: "ação",
    range: "pessoal",
    target: "Você",
    duration: "cena",
    effect_type: "buff",
    description:
      "Infunde a si mesmo com energia vital ilusória que atua como pontos de vida temporários. " +
      "Você ganha 1d6+4 PV temporários que duram até o fim da cena ou até serem esgotados.",
    dice: "1d6+4 PV temporários",
    amplify: [
      { extra_mp: 2, effect: "Ganha 2d6+6 PV temporários em vez do valor base." },
    ],
  },

  // ── Círculo 3 ──────────────────────────────────────────────────────────────

  {
    id: "controlar_plantas",
    name: "Controlar Plantas",
    circle: 3, mp_cost: 3,
    classes: ["druida", "mago"],
    traditions: ["natural", "arcana"],
    tags: ["Druida", "Mago", "controle"],
    casting_time: "ação",
    range: "médio",
    target: "Plantas em área de 9m de raio",
    duration: "cena",
    effect_type: "controle",
    description:
      "Você comanda plantas ao alcance, podendo fazê-las imobilizar criaturas, abrir passagens " +
      "ou criar barreiras densas. Criaturas imobilizadas pelas plantas fazem teste de Força ND 18 para escapar.",
    save: "Reflexo",
    amplify: [
      { extra_mp: 2, effect: "A área dobra para 18m de raio e as plantas podem atacar causando 2d6 de dano." },
    ],
  },
  {
    id: "criar_elementos",
    name: "Criar Elementos",
    circle: 3, mp_cost: 3,
    classes: ["druida", "mago"],
    traditions: ["natural", "arcana"],
    tags: ["Druida", "Mago", "utilidade"],
    casting_time: "ação",
    range: "curto",
    target: "Área de 3m de raio",
    duration: "cena",
    effect_type: "utilidade",
    description:
      "Cria uma quantidade significativa de um elemento puro (água, fogo, terra ou ar) que " +
      "persiste por 1 cena: até 100 litros de água, uma parede de fogo, um muro de terra ou um vendaval.",
    amplify: [
      { extra_mp: 2, effect: "O elemento criado pode causar 3d6 de dano a criaturas que o atravessem." },
    ],
  },
  {
    id: "explosao_de_chamas",
    name: "Explosão de Chamas",
    circle: 3, mp_cost: 3,
    classes: ["druida", "mago"],
    traditions: ["natural", "arcana"],
    tags: ["Druida", "Mago", "dano"],
    casting_time: "ação",
    range: "médio",
    target: "Área de 9m de raio",
    duration: "instantâneo",
    effect_type: "dano",
    element: "fogo",
    description:
      "Detona uma explosão de fogo mágico em uma área de 9m de raio. Todas as criaturas na " +
      "área sofrem 3d6 de dano de fogo; aquelas que passarem no teste de Reflexo sofrem apenas metade.",
    dice: "3d6",
    save: "Reflexo",
    amplify: [
      { extra_mp: 1, effect: "+1d6 de dano de fogo." },
      { extra_mp: 2, effect: "+2d6 de dano e a área aumenta para 12m de raio." },
      { extra_mp: 3, effect: "+3d6 de dano e objetos inflamáveis na área pegam fogo." },
    ],
  },
  {
    id: "hipnotismo",
    name: "Hipnotismo",
    circle: 3, mp_cost: 3,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "controle"],
    casting_time: "ação",
    range: "curto",
    target: "1 humanoide",
    duration: "cena",
    effect_type: "controle",
    description:
      "Mergulha um humanoide em estado de transe hipnótico profundo. Se falhar no teste, o " +
      "alvo fica paralisado por 1 turno e depois imóvel pelo resto da cena, podendo receber sugestões simples.",
    save: "Vontade",
    amplify: [
      { extra_mp: 2, effect: "Afeta até 3 humanoides simultaneamente na área." },
    ],
  },
  {
    id: "profanar",
    name: "Profanar",
    circle: 3, mp_cost: 3,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "debuff"],
    casting_time: "1 minuto",
    range: "pessoal",
    target: "Área de 6m de raio",
    duration: "1 dia",
    effect_type: "debuff",
    element: "necro",
    description:
      "Corrompe uma área com energia profana e negativa por 24 horas. Criaturas vivas (exceto " +
      "mortos-vivos) sofrem –2 em todos os testes; mortos-vivos na área ganham +2 em testes e Defesa.",
  },
  {
    id: "voz_divina",
    name: "Voz Divina",
    circle: 3, mp_cost: 3,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "controle"],
    casting_time: "ação",
    range: "curto",
    target: "Até 5 criaturas",
    duration: "1 turno",
    effect_type: "controle",
    description:
      "O conjurador fala com autoridade sobrenatural, tornando impossível para os alvos " +
      "ignorarem sua presença. Até 5 criaturas ficam paralisadas ou em pânico por 1 turno se falharem no teste.",
    save: "Vontade",
    amplify: [
      { extra_mp: 2, effect: "O efeito dura 1 cena inteira e afeta até 10 criaturas." },
    ],
  },

  // ── Círculo 4 ──────────────────────────────────────────────────────────────

  {
    id: "conjurar_monstro",
    name: "Conjurar Monstro",
    circle: 4, mp_cost: 4,
    classes: ["mago"],
    traditions: ["arcana"],
    tags: ["Mago", "invocação"],
    casting_time: "ação",
    range: "curto",
    target: "1 criatura conjurada",
    duration: "cena",
    effect_type: "invocação",
    description:
      "Invoca uma criatura de patamar Iniciante ou Veterano de outro plano ou da natureza para " +
      "servi-lo. A criatura executa suas ordens por 1 cena e então retorna à sua origem.",
    amplify: [
      { extra_mp: 2, effect: "Pode invocar uma criatura de patamar Campeão, ou 2 criaturas de patamar Veterano." },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const spellById = Object.fromEntries(
  spells.map((s) => [s.id, s]),
) as Record<string, Spell>;

/** Lookup por nome (compatibilidade com personagens salvos antes da migração para slugs) */
export const spellByName = Object.fromEntries(
  spells.map((s) => [s.name, s]),
) as Record<string, Spell>;

export function getSpellsForClass(classId: ClassId): Spell[] {
  return spells.filter((s) => s.classes.includes(classId));
}

export function getSpellsForClassAndCircle(classId: ClassId, maxCircle: number): Spell[] {
  return spells.filter((s) => s.classes.includes(classId) && s.circle <= maxCircle);
}

export function getSpellsByCircle(circle: 1 | 2 | 3 | 4 | 5): Spell[] {
  return spells.filter((s) => s.circle === circle);
}

export function isCasterClass(classId: ClassId): boolean {
  return ["bardo", "clerigo", "druida", "mago"].includes(classId);
}
