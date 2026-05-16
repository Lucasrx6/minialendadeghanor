const fs = require("fs");
const path = require("path");

const SEED_PATHS = [
  path.join(__dirname, "..", "lib", "supabase", "seed_items_weapons.sql"),
  path.join(__dirname, "..", "lib", "supabase", "seed_items_general.sql"),
  path.join(__dirname, "..", "lib", "supabase", "seed_items_catalog.sql"),
];

/** 50 armas de combate da Tabela 3-4 (sem munição) */
const EXPECTED_WEAPON_SLUGS = [
  "adaga", "espada_curta", "foice", "punhal",
  "clava", "lanca", "maca",
  "bordao", "pique", "tacape",
  "azagaia", "besta_leve", "funda", "arco_curto",
  "gancho", "khanjar", "machadinha",
  "cimitarra", "espada_larga", "espada_longa", "florete", "maca_estrela",
  "machado_batalha", "mangual", "martelo_batalha", "picareta", "tridente",
  "alabarda", "alfange", "bico_de_corvo", "gadanho", "lanca_montada",
  "machado_guerra", "malho", "marreta_guerra", "martelo_longo", "montante",
  "arco_longo", "besta_pesada",
  "chicote", "espada_bastarda", "maca_guerra", "machado_anao", "rapieira", "sabre_elfico",
  "corrente_espinhos", "marrao",
  "arco_guerra", "arpao", "rede",
];

const VALID_WEAPON_ABILITIES = new Set([
  "adaptavel", "agil", "alongada", "arremessavel", "desbalanceada",
  "discreta", "dupla", "ligeira", "versatil",
]);

const VALID_WEAPON_RANGES = new Set(["nenhum", "curto", "medio", "longo"]);
const VALID_WEAPON_PROF = new Set(["simples", "marcial", "exotica"]);
const VALID_WEAPON_GRIP = new Set(["leve", "uma_mao", "duas_maos"]);
const VALID_WEAPON_PURPOSE = new Set(["corpo_a_corpo", "arremesso", "disparo"]);
const VALID_DAMAGE_TYPES = new Set([
  "corte", "impacto", "perfuracao",
  "corte_perfuracao", "impacto_perfuracao", "corte_impacto",
]);

const VALID_CATEGORIES = new Set([
  "arma", "armadura", "escudo", "municao",
  "equipamento_aventura", "ferramenta", "vestuario",
  "esoterico", "alquimico_preparado", "alquimico_catalisador", "alquimico_veneno",
  "alquimia_mistica", "animal", "veiculo", "servico", "bens_comuns", "item_magico",
]);

const WEAPON_REQUIRED_FIELDS = [
  "weapon_proficiency", "weapon_grip", "weapon_purpose",
  "weapon_damage_dice", "weapon_critical", "weapon_range", "weapon_damage_type",
];

function normalizeSql(text) {
  return text.replace(/--.*$/gm, "").replace(/\s+/g, " ").trim();
}

function splitTuples(valuesText) {
  const tuples = [];
  let depth = 0;
  let inString = false;
  let buffer = "";
  for (let i = 0; i < valuesText.length; i += 1) {
    const char = valuesText[i];
    const prev = valuesText[i - 1];
    buffer += char;
    if (char === "'" && prev !== "\\") {
      const next = valuesText[i + 1];
      if (inString && next === "'") {
        buffer += next;
        i += 1;
        continue;
      }
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (depth === 0 && char === ")") {
      tuples.push(buffer.trim().replace(/^,\s*/, ""));
      buffer = "";
    }
  }
  return tuples.filter(Boolean);
}

function splitValues(tupleText) {
  const values = [];
  let depth = 0;
  let inString = false;
  let buffer = "";
  const trimmed = tupleText.trim().replace(/^\(|\)$/g, "");
  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i];
    const prev = trimmed[i - 1];
    if (char === "'" && prev !== "\\") {
      const next = trimmed[i + 1];
      if (inString && next === "'") {
        buffer += "''";
        i += 1;
        continue;
      }
      inString = !inString;
      buffer += char;
      continue;
    }
    if (!inString) {
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;
      if (char === "," && depth === 0) {
        values.push(buffer.trim());
        buffer = "";
        continue;
      }
    }
    buffer += char;
  }
  if (buffer.trim().length > 0) values.push(buffer.trim());
  return values;
}

function parseSqlValue(value) {
  const trimmed = value.trim();
  if (/^null$/i.test(trimmed)) return null;
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    const inner = trimmed.slice(1, -1).replace(/''/g, "'");
    if (inner.startsWith("{") && inner.endsWith("}")) {
      if (inner === "{}") return [];
      return inner.slice(1, -1).split(",").map((item) => item.trim()).filter(Boolean);
    }
    return inner;
  }
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    if (trimmed === "{}") return [];
    return trimmed.slice(1, -1).split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === "true";
  if (!Number.isNaN(Number(trimmed))) return Number(trimmed);
  return trimmed;
}

function parseInsertBlocks(sql) {
  const normalized = normalizeSql(sql);
  const blocks = [];
  const regex = /insert into public\.items \(([^)]+)\) values (.+?) on conflict/gi;
  let match;
  while ((match = regex.exec(normalized)) !== null) {
    const columns = match[1].split(",").map((col) => col.trim());
    const tuples = splitTuples(match[2]);
    const rows = tuples.map((tuple) => {
      const values = splitValues(tuple);
      if (values.length !== columns.length) {
        throw new Error(`Esperado ${columns.length} valores, encontrou ${values.length} em ${tuple.slice(0, 80)}…`);
      }
      return Object.fromEntries(columns.map((col, index) => [col, parseSqlValue(values[index])]));
    });
    blocks.push({ columns, rows });
  }
  return blocks;
}

function isCombatWeapon(row) {
  if (row.category !== "arma") return false;
  if (row.is_stackable) return false;
  if (row.slug === "rede") return true;
  return row.weapon_damage_dice != null;
}

function validateRow(row, rowIndex, filePath, errors) {
  const label = `${filePath} → '${row.slug || `linha ${rowIndex + 1}`}'`;

  if (!row.slug) errors.push(`${label}: slug ausente`);
  if (!row.category) errors.push(`${label}: category ausente`);
  if (row.slug && !/^[a-z0-9_]+$/.test(row.slug)) {
    errors.push(`${label}: slug inválido`);
  }
  if (row.category && !VALID_CATEGORIES.has(row.category)) {
    errors.push(`${label}: categoria desconhecida '${row.category}'`);
  }
  if (row.min_stage != null && (row.min_stage < 1 || row.min_stage > 5)) {
    errors.push(`${label}: min_stage deve ser 1–5`);
  }

  if (row.category === "arma") {
    const abilities = row.weapon_abilities ?? [];
    if (!Array.isArray(abilities)) {
      errors.push(`${label}: weapon_abilities inválido`);
    } else {
      abilities.forEach((ability) => {
        if (!VALID_WEAPON_ABILITIES.has(ability)) {
          errors.push(`${label}: habilidade desconhecida '${ability}'`);
        }
      });
    }

    const isAmmo = row.is_stackable === true;
    const isSpecial = row.slug === "rede";

    if (!isAmmo && !isSpecial) {
      for (const field of WEAPON_REQUIRED_FIELDS) {
        if (row[field] == null || row[field] === "") {
          errors.push(`${label}: campo obrigatório '${field}' ausente`);
        }
      }
      if (row.weapon_proficiency && !VALID_WEAPON_PROF.has(row.weapon_proficiency)) {
        errors.push(`${label}: weapon_proficiency inválida`);
      }
      if (row.weapon_grip && !VALID_WEAPON_GRIP.has(row.weapon_grip)) {
        errors.push(`${label}: weapon_grip inválido`);
      }
      if (row.weapon_purpose && !VALID_WEAPON_PURPOSE.has(row.weapon_purpose)) {
        errors.push(`${label}: weapon_purpose inválido`);
      }
      if (row.weapon_range && !VALID_WEAPON_RANGES.has(row.weapon_range)) {
        errors.push(`${label}: weapon_range inválido '${row.weapon_range}'`);
      }
      if (row.weapon_damage_type && !VALID_DAMAGE_TYPES.has(row.weapon_damage_type)) {
        errors.push(`${label}: weapon_damage_type inválido`);
      }
    }
  }

  if (row.category === "armadura" || row.category === "escudo") {
    if (!row.armor_category) errors.push(`${label}: armor_category ausente`);
    if (typeof row.armor_defense_bonus !== "number") {
      errors.push(`${label}: armor_defense_bonus numérico obrigatório`);
    }
    if (typeof row.armor_penalty !== "number") {
      errors.push(`${label}: armor_penalty numérico obrigatório`);
    }
  }
}

function main() {
  const errors = [];
  const seenSlugs = new Set();
  const weaponSlugs = new Set();
  const stats = { totalRows: 0, categories: {} };

  for (const filePath of SEED_PATHS) {
    const sql = fs.readFileSync(filePath, "utf8");
    let blocks;
    try {
      blocks = parseInsertBlocks(sql);
    } catch (err) {
      errors.push(`${filePath}: falha ao analisar SQL — ${err.message}`);
      continue;
    }
    if (blocks.length === 0) {
      errors.push(`${filePath}: nenhum bloco INSERT encontrado`);
      continue;
    }

    blocks.forEach((block) => {
      block.rows.forEach((row, index) => {
        stats.totalRows += 1;
        stats.categories[row.category] = (stats.categories[row.category] ?? 0) + 1;
        if (seenSlugs.has(row.slug)) {
          errors.push(`${filePath}: slug duplicado '${row.slug}'`);
        }
        seenSlugs.add(row.slug);
        if (isCombatWeapon(row)) weaponSlugs.add(row.slug);
        validateRow(row, index, filePath, errors);
      });
    });
  }

  for (const slug of EXPECTED_WEAPON_SLUGS) {
    if (!weaponSlugs.has(slug)) {
      errors.push(`Arma obrigatória ausente no seed: '${slug}'`);
    }
  }

  const EXPECTED_CATEGORY_COUNTS = {
    arma: 53, armadura: 10, escudo: 3,
    equipamento_aventura: 24, ferramenta: 14, vestuario: 25, esoterico: 15,
    alquimico_preparado: 8, alquimico_catalisador: 15, alquimico_veneno: 13,
    alquimia_mistica: 11, animal: 6, veiculo: 3, servico: 16,
    bens_comuns: 24, item_magico: 15,
  };

  console.log(`Validação do seed: ${stats.totalRows} itens`);
  Object.entries(stats.categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const expected = EXPECTED_CATEGORY_COUNTS[cat];
      const note = expected !== undefined && count !== expected ? ` ← esperado ${expected}` : "";
      console.log(`  • ${cat}: ${count}${note}`);
      if (expected !== undefined && count !== expected) {
        errors.push(`Categoria '${cat}': encontrada ${count}, esperada ${expected}`);
      }
    });
  console.log(`  • armas de combate: ${weaponSlugs.size} (esperadas: ${EXPECTED_WEAPON_SLUGS.length})`);

  if (errors.length > 0) {
    console.error(`\n${errors.length} erro(s) encontrado(s):`);
    errors.forEach((e) => console.error(`  ✗ ${e}`));
    process.exit(1);
  }

  console.log("\nSeed validado com sucesso.");
}

main();
