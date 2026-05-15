export type Power = {
  id: string;
  name: string;
  type: "geral" | "combate" | "classe";
  summary: string;
};

export const powers: Power[] = [
  { id: "ataque_poderoso", name: "Ataque Poderoso", type: "combate", summary: "Troca precisão por dano em ataques corpo a corpo." },
  { id: "estilo_de_arma_e_escudo", name: "Estilo de Arma e Escudo", type: "combate", summary: "Melhora a defesa lutando com escudo." },
  { id: "foco_em_arma", name: "Foco em Arma", type: "combate", summary: "Especialização em uma arma escolhida." },
  { id: "iniciativa_aprimorada", name: "Iniciativa Aprimorada", type: "geral", summary: "Age mais cedo em cenas perigosas." },
  { id: "vontade_de_ferro", name: "Vontade de Ferro", type: "geral", summary: "Resiste melhor a medo, encanto e pressão mental." },
  { id: "sortudo", name: "Sortudo", type: "geral", summary: "Força a sorte quando um teste importante falha." },
];

export const powerById = Object.fromEntries(powers.map((power) => [power.id, power])) as Record<
  string,
  Power
>;
