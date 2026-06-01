// Listas de magias do Mago por Tradição Arcana — Livro Básico de Ghanor, págs. 138–140
// Cada tradição define a lista de magias disponível para o mago que a escolheu.
// Nota: "Voz Divina" da Tradição Abissal ainda não consta no catálogo de spells.ts.

export type MagoTraditionId = "abissal" | "elemental" | "erudita" | "onirica" | "rustica";

export const MAGO_TRADITION_SPELLS: Record<MagoTraditionId, Partial<Record<number, string[]>>> = {
  abissal: {
    // 15 magias (Voz Divina ausente do catálogo atual)
    1: ["amedrontar", "perdicao", "armadura_magica", "profanar", "aviso", "protecao_mistica",
        "comando", "raio_do_enfraquecimento", "conjurar_monstro", "resistencia_a_energia",
        "disfarce_ilusorio", "visao_mistica", "escuridao", "vitalidade_fantasma", "infligir_ferimentos"],
    2: ["amarras_etereas", "dissipar_magia", "augurio", "marca_da_obediencia", "campo_de_forca",
        "montaria_mistica", "conjurar_mortos_vivos", "rogar_maldicao", "cranio_voador",
        "sussurros_insanos", "desespero_esmagador", "toque_vampirico"],
    3: ["anular_a_luz", "servo_morto_vivo", "contato_extraplanar", "teletransporte",
        "manto_de_sombras", "tentaculos_de_trevas", "protecao_contra_magia", "voo"],
    4: ["assassino_fantasmagorico", "ligacao_sombria", "desintegrar", "muralha_de_ossos",
        "forma_eterea", "sopro_de_dragao"],
    5: ["desejo", "sombra_assassina", "possessao", "toque_da_morte"],
  },
  elemental: {
    1: ["area_escorregadia", "nevoa", "arma_magica", "protecao_mistica", "armadura_magica",
        "queda_suave", "aviso", "resistencia_a_energia", "criar_elementos", "suporte_ambiental",
        "dardo_gelido", "toque_chocante", "explosao_de_chamas", "visao_mistica", "luz", "jato_corrosivo"],
    2: ["bola_de_fogo", "garras_de_rocha", "campo_de_forca", "montaria_mistica", "cone_de_frio",
        "relampago", "controlar_fogo", "salto_dimensional", "dissipar_magia", "tempestade",
        "flecha_acida", "velocidade"],
    3: ["chuva_acida", "escudo_de_chamas", "impacto_fulminante", "muralha_elemental",
        "erupcao_glacial", "voo"],
    4: ["conjurar_elemental", "raio_polar", "controlar_o_clima", "salto_relampago",
        "poco_vitriolico", "sopro_de_dragao"],
    5: ["barragem_elemental", "furia_dos_ceus", "chuva_de_meteoros", "invulnerabilidade"],
  },
  erudita: {
    1: ["alarme", "luz", "arma_magica", "orientacao", "armadura_magica", "protecao_mistica",
        "aviso", "resistencia_a_energia", "comando", "seta_infalivel", "compreensao",
        "tranca_arcana", "conjurar_monstro", "transmutar_objetos", "detectar_ameacas", "visao_mistica"],
    2: ["alterar_tamanho", "metamorfose", "amarras_etereas", "refugio", "campo_de_forca",
        "runa_de_protecao", "dissipar_magia", "salto_dimensional", "localizacao",
        "servos_invisiveis", "mapear", "velocidade"],
    3: ["protecao_contra_magia", "convocacao_instantanea", "selo_de_mana",
        "globo_de_invulnerabilidade", "telecinesia", "pele_de_pedra", "teletransporte"],
    4: ["campo_antimagia", "forma_eterea", "mao_poderosa", "desintegrar", "visao_da_verdade"],
    5: ["desejo", "invulnerabilidade", "engenho_de_mana", "palavra_primordial"],
  },
  onirica: {
    1: ["adaga_mental", "leque_cromatico", "armadura_magica", "luz", "aviso", "protecao_mistica",
        "criar_ilusao", "resistencia_a_energia", "disfarce_ilusorio", "santuario", "enfeiticar",
        "sono", "hipnotismo", "tranquilidade", "imagem_espelhada", "visao_mistica"],
    2: ["aparencia_perfeita", "esculpir_sons", "augurio", "invisibilidade", "campo_de_forca",
        "ligacao_telepatica", "camuflagem_ilusoria", "mente_aprimorada", "circulo_da_justica",
        "salto_dimensional", "dissipar_magia", "sussurros_insanos"],
    3: ["banimento", "miragem", "contato_extraplanar", "protecao_contra_magia",
        "despertar_consciencia", "teletransporte", "ilusao_lacerante", "videncia"],
    4: ["alterar_memoria", "libertacao", "duplicata_ilusoria", "premonicao",
        "explosao_caleidoscopica", "sonho"],
    5: ["desejo", "projetar_consciencia", "legiao", "requiem"],
  },
  rustica: {
    1: ["acalmar_animal", "luz", "area_escorregadia", "nevoa", "armadura_magica", "orientacao",
        "armamento_da_natureza", "primor_atletico", "bencao", "protecao_mistica",
        "caminhos_da_natureza", "resistencia_a_energia", "controlar_plantas", "suporte_ambiental",
        "despedacar", "visao_mistica"],
    2: ["aliado_animal", "enxame_de_pestes", "augurio", "fisico_aprimorado", "campo_de_forca",
        "localizacao", "condicao", "mente_aprimorada", "disco_flutuante", "servos_invisiveis",
        "dissipar_magia", "toque_vampirico"],
    3: ["banimento", "dispersar_as_trevas", "comunhao_com_a_natureza", "imobilizar",
        "contato_extraplanar", "lendas_e_historias", "dificultar_deteccao", "protecao_contra_magia"],
    4: ["animar_objetos", "libertacao", "companheiro_fiel", "premonicao",
        "cupula_de_repulsao", "visao_da_verdade"],
    5: ["aprisionamento", "invulnerabilidade", "desejo", "toque_da_morte"],
  },
};

/**
 * Retorna os IDs das magias disponíveis para o Mago em uma tradição até o círculo informado.
 * Se `tradition` for inválido ou não informado, retorna lista vazia.
 */
export function getMagoTraditionSpells(tradition: string | undefined, maxCircle: number): string[] {
  if (!tradition) return [];
  const map = MAGO_TRADITION_SPELLS[tradition as MagoTraditionId];
  if (!map) return [];
  const ids: string[] = [];
  for (let c = 1; c <= maxCircle; c++) {
    ids.push(...(map[c] ?? []));
  }
  return ids;
}
