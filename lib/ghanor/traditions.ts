// Tradições Arcanas do Mago — Livro Básico de Ghanor, páginas 59-60

export type TraditionId = "abissal" | "elemental" | "erudita" | "onirica" | "rustica";

export type ArcaniTradition = {
  id: TraditionId;
  name: string;
  flavor: string;
  preco_da_magia: string;
  segredo_basico: string;
};

export const ARCANE_TRADITIONS: ArcaniTradition[] = [
  {
    id: "abissal",
    name: "Tradição Abissal",
    flavor: "Pactos com demônios e entidades sombrias concedem conhecimento e poder arcano.",
    preco_da_magia:
      "Sempre que lançar uma magia usando aprimoramentos, faça um teste de Vontade (CD 15 + custo em PM). " +
      "Se falhar, você perde 1 PM por círculo da magia. Se falhar por 5 ou mais, fica alquebrado até o fim do dia.",
    segredo_basico:
      "Você recebe imunidade a medo e pode gastar 1 PM para gerar uma aura nefasta com 9m de raio. " +
      "Inimigos na aura sofrem −2 em seus testes de resistência. A aura dura até o fim da cena.",
  },
  {
    id: "elemental",
    name: "Tradição Elemental",
    flavor: "Você abraçou uma força primordial (ácido, eletricidade, fogo ou frio) como arma devastadora.",
    preco_da_magia:
      "Escolha um tipo de dano entre ácido, eletricidade, fogo ou frio. " +
      "Você não pode aprender magias que causem dano dos tipos não escolhidos.",
    segredo_basico:
      "Você recebe redução de dano 5 contra o tipo de dano escolhido e a CD para resistir às suas magias " +
      "que causem dano deste tipo aumenta em +1.",
  },
  {
    id: "erudita",
    name: "Tradição Erudita",
    flavor: "Para você, a magia é uma ciência. Você lança magias por memorização de fórmulas arcanas.",
    preco_da_magia:
      "Você só pode lançar magias memorizadas (metade das que conhece, arredondado para baixo). " +
      "Para memorizar magias, você precisa estudar seu grimório por uma hora. Pode memorizar uma vez por dia.",
    segredo_basico:
      "Você começa com uma magia adicional (total de 4) e, sempre que ganha acesso a um novo círculo, " +
      "aprende uma magia adicional daquele círculo.",
  },
  {
    id: "onirica",
    name: "Tradição Onírica",
    flavor: "Você extrai poder do mundo dos sonhos, transformando a vida de seus aliados em sonho e a de seus inimigos em pesadelo.",
    preco_da_magia:
      "A cada noite de descanso, você recupera apenas PV ou PM, a sua escolha (não ambos).",
    segredo_basico:
      "Você pode gastar uma ação de movimento e 1 PM para gerar uma aura onírica com 9m de raio (duração sustentada). " +
      "Dentro da aura, a CD para resistir a suas magias que exigem teste de Vontade aumenta em +2.",
  },
  {
    id: "rustica",
    name: "Tradição Rústica",
    flavor: "Uma magia de crendices e ritos diários. Você depende de um fetiche para lançar suas magias.",
    preco_da_magia:
      "Você depende de um fetiche (amuleto, cristal, saco de ervas...) para lançar suas magias. " +
      "Para lançar uma magia, você precisa empunhar o fetiche com uma mão ou fazer um teste de Misticismo (CD 20 + custo em PM).",
    segredo_basico:
      "Você pode usar até dois catalisadores diferentes quando lança uma magia.",
  },
];

export const traditionById = Object.fromEntries(
  ARCANE_TRADITIONS.map((t) => [t.id, t]),
) as Record<TraditionId, ArcaniTradition>;
