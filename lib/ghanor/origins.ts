export type Origin = {
  id: string;
  name: string;
  benefit: string;
  items: string[];
  trainedSkills?: string[];
  skillBonuses?: Record<string, number>;
  hpBonus?: number;
  hpPerLevelBonus?: number;
  mpBonus?: number;
  mpPerLevelBonus?: number;
  defenseBonus?: number;
  movementBonusM?: number;
  attributeChoiceBonus?: number;
};

const id = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const rawOrigins: Array<Omit<Origin, "id">> = [
  { name: "Acólito", benefit: "Religião, +1 PM por nível e abrigo em templos.", items: ["Essência de mana", "Símbolo sagrado"], trainedSkills: ["religiao"], mpPerLevelBonus: 1 },
  { name: "Ajudante de curandeiro", benefit: "Cura e +1 PV por dado curado.", items: ["Bálsamo restaurador x2", "Maleta de medicamentos"], trainedSkills: ["cura"] },
  { name: "Ajudante de mercador", benefit: "Diplomacia e +1 limite de itens vestidos.", items: ["Burro de carga", "Mercadorias (10 espaços, 100 PP)"], trainedSkills: ["diplomacia"] },
  { name: "Amigo dos animais", benefit: "Adestramento.", items: ["Animal de estimação parceiro"], trainedSkills: ["adestramento"] },
  { name: "Amnésico", benefit: "Duas perícias escolhidas pelo mestre e lembranças em flashes.", items: ["Item do mestre até 100 PP"] },
  { name: "Aprendiz de alquimista", benefit: "Ofício (alquimista) e dado extra em itens alquímicos.", items: ["Ácido x2", "Fogo alquímico x2", "Instrumentos de alquimista"], trainedSkills: ["oficio"] },
  { name: "Aprendiz de artesão", benefit: "Ofício à escolha e fabricação mais barata.", items: ["Item até 50 PP", "Instrumentos de ofício"], trainedSkills: ["oficio"] },
  { name: "Aristocrata", benefit: "Nobreza e renda ao subir de nível.", items: ["Item até 1.000 PP", "Joias 100 PP", "Veste da corte"], trainedSkills: ["nobreza"] },
  { name: "Artista", benefit: "Atuação e Enganação.", items: ["Estojo de disfarces", "Instrumento musical"], trainedSkills: ["atuacao", "enganacao"] },
  { name: "Auxiliar de cozinha", benefit: "Ofício (cozinheiro) e pratos especiais melhores.", items: ["Instrumentos de cozinheiro", "50 PP em ingredientes"], trainedSkills: ["oficio"] },
  { name: "Camponês", benefit: "+3 PM e 1 PM para +1d4 em um teste.", items: ["Ferramenta agrícola", "Rações x10"], mpBonus: 3 },
  { name: "Criança da guerra", benefit: "Iniciativa e um poder de combate.", items: ["Arma marcial com insígnia do exército"], trainedSkills: ["iniciativa"] },
  { name: "Discípulo arcano", benefit: "Misticismo e +1 na CD das magias.", items: ["Essência de mana x2"], trainedSkills: ["misticismo"] },
  { name: "Escravo", benefit: "Fortitude, +3 PV e +1 PV por nível.", items: ["Algemas", "Ferramenta pesada"], trainedSkills: ["fortitude"], hpBonus: 3, hpPerLevelBonus: 1 },
  { name: "Escudeiro", benefit: "Percepção e +2 na Defesa.", items: ["Cota de malha ou escudo e elmo pesados"], trainedSkills: ["percepcao"], defenseBonus: 2 },
  { name: "Estudioso", benefit: "Conhecimento e 2 PM para trocar um teste por Conhecimento.", items: ["Bálsamo restaurador", "Essência de mana"], trainedSkills: ["conhecimento"] },
  { name: "Grumete", benefit: "+2 em Acrobacia e Atletismo; equilíbrio e escalada sem penalidade.", items: ["Corda", "2d6 PP"], skillBonuses: { acrobacia: 2, atletismo: 2 } },
  { name: "Herdeiro", benefit: "+3 PV e um poder geral.", items: ["Item até 1.000 PP"], hpBonus: 3 },
  { name: "Isolado", benefit: "+3 PM e um poder geral.", items: ["Equipamento de viagem", "Rações x5"], mpBonus: 3 },
  { name: "Mascote da guarda", benefit: "Atletismo e +2 em ataques.", items: ["Arma marcial com insígnia da guarda"], trainedSkills: ["atletismo"] },
  { name: "Membro de gangue", benefit: "Intimidação e +1 em dano corpo a corpo.", items: ["Arma simples corpo a corpo"], trainedSkills: ["intimidacao"] },
  { name: "Nômade", benefit: "+2 em Atletismo e Sobrevivência; terreno difícil sem penalidade.", items: ["Bordão", "Equipamento de viagem"], skillBonuses: { atletismo: 2, sobrevivencia: 2 } },
  { name: "Órfão", benefit: "Atletismo e deslocamento +3m.", items: ["Adaga"], trainedSkills: ["atletismo"], movementBonusM: 3 },
  { name: "Predestinado", benefit: "+1 em um atributo à escolha.", items: ["Item até 100 PP"], attributeChoiceBonus: 1 },
  { name: "Rato", benefit: "Furtividade e Ladinagem.", items: ["Ferramentas de ladrão"], trainedSkills: ["furtividade", "ladinagem"] },
  { name: "Receptáculo", benefit: "Pode lançar uma magia de 1º círculo.", items: ["Essência de mana", "Marca de nascença"] },
  { name: "Refugiado", benefit: "Vontade e descanso uma categoria melhor.", items: ["Item da terra natal até 100 PP"], trainedSkills: ["vontade"] },
  { name: "Selvagem", benefit: "Sobrevivência e +2 em dano.", items: ["Arma simples"], trainedSkills: ["sobrevivencia"] },
  { name: "Serviçal", benefit: "Diplomacia e Intuição.", items: ["Carta de recomendação", "4d6 PO"], trainedSkills: ["diplomacia", "intuicao"] },
  { name: "Trapaceiro", benefit: "Enganação e pode substituir Diplomacia por Enganação.", items: ["Estojo de disfarces"], trainedSkills: ["enganacao"] },
];

export const origins: Origin[] = rawOrigins.map((origin) => ({ id: id(origin.name), ...origin }));

export const originById = Object.fromEntries(origins.map((origin) => [origin.id, origin])) as Record<
  string,
  Origin
>;
