const fs = require("fs");
const path = require("path");

const SEED_PATHS = [
  path.join(__dirname, "..", "lib", "supabase", "seed_items_weapons.sql"),
  path.join(__dirname, "..", "lib", "supabase", "seed_items_general.sql"),
];

const VALID_WEAPON_ABILITIES = new Set([
  "arremessavel", "discreta", "ligeira", "alongada", "versatil", "dupla", "adaptavel",
]);

const VALID_WEAPON_RANGES = new Set(["nenhum", "curto", "medio", "longo"]);
const VALID_CATEGORIES = new Set([
  "arma", "armadura", "escudo", "equipamento_aventura", "ferramenta",
  "vestuario", "esoterico", "alquimico_preparado", "alquimico_veneno",
  "animal", "servico", "bens_comuns",
]);

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
      const content = inner.slice(1, -1);
      return content.split(",").map(item => item.trim()).filter(Boolean);
    }
    return inner;
  }
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    if (trimmed === "{}") return [];
    const content = trimmed.slice(1, -1);
    return content.split(",").map(item => item.trim()).filter(Boolean);
  }
  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === "true";
  }
  if (!Number.isNaN(Number(trimmed))) {
    return Number(trimmed);
  }
  return trimmed;
}

function parseInsertBlocks(sql) {
  const normalized = normalizeSql(sql);
  const blocks = [];
  const regex = /insert into public\.items \(([^)]+)\) values (.+?) on conflict/gi;
  let match;
  while ((match = regex.exec(normalized)) !== null) {
    const columns = match[1].split(",").map(col => col.trim());
    const tuples = splitTuples(match[2]);
    const rows = tuples.map(tuple => {
      const values = splitValues(tuple);
      if (values.length !== columns.length) {
        throw new Error(`Esperado ${columns.length} valores, mas encontrou ${values.length} em ${tuple}`);
      }
      const row = Object.fromEntries(
        columns.map((col, index) => [col, parseSqlValue(values[index])])
      );
      return row;
    });
    blocks.push({ columns, rows });
  }
  return blocks;
}

function validateRow(row, rowIndex, filePath, errors) {
  if (!row.slug) {
    errors.push(`${filePath}: linha ${rowIndex + 1}: slug ausente`);
  }
  if (!row.category) {
    errors.push(`${filePath}: linha ${rowIndex + 1}: category ausente`);
  }
  if (row.slug && !/^[a-z0-9_]+$/.test(row.slug)) {
    errors.push(`${filePath}: '${row.slug}' tem slug inválido`);
  }
  if (row.category && !VALID_CATEGORIES.has(row.category)) {
    errors.push(`${filePath}: '${row.slug}' usa categoria desconhecida '${row.category}'`);
  }

  if (row.category === "arma") {
    const abilities = row.weapon_abilities ?? [];
    if (!Array.isArray(abilities)) {
      errors.push(`${filePath}: '${row.slug}' tem weapon_abilities inválido`);
    } else {
      abilities.forEach((ability) => {
        if (!VALID_WEAPON_ABILITIES.has(ability)) {
          errors.push(`${filePath}: '${row.slug}' tem habilidade desconhecida '${ability}'`);
        }
      });
    }
    if (row.weapon_damage_dice != null && typeof row.weapon_damage_dice !== "string") {
      errors.push(`${filePath}: '${row.slug}' weapon_damage_dice deve ser uma string ou null`);
    }
    if (row.weapon_range && !VALID_WEAPON_RANGES.has(row.weapon_range)) {
      errors.push(`${filePath}: '${row.slug}' tem weapon_range desconhecido '${row.weapon_range}'`);
    }
    if (row.weapon_damage_dice == null && row.is_stackable !== true) {
      errors.push(`${filePath}: '${row.slug}' pode ser munição ou consumível, use is_stackable = true ou defina weapon_damage_dice`);
    }
  }

  if (row.category === "armadura" || row.category === "escudo") {
    if (!row.armor_category) {
      errors.push(`${filePath}: '${row.slug}' precisa de armor_category`);
    }
    if (typeof row.armor_defense_bonus !== "number") {
      errors.push(`${filePath}: '${row.slug}' precisa de armor_defense_bonus numérico`);
    }
    if (typeof row.armor_penalty !== "number") {
      errors.push(`${filePath}: '${row.slug}' precisa de armor_penalty numérico`);
    }
  }
}

function main() {
  const errors = [];
  const seenSlugs = new Set();
  const stats = {
    totalRows: 0,
    categories: {},
  };

  for (const filePath of SEED_PATHS) {
    const sql = fs.readFileSync(filePath, "utf8");
    const blocks = parseInsertBlocks(sql);
    if (blocks.length === 0) {
      errors.push(`${filePath}: nenhum bloco de INSERT encontrado`);
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
        validateRow(row, index, filePath, errors);
      });
    });
  }

  console.log(`Seed validation: ${stats.totalRows} rows across ${Object.keys(stats.categories).length} categories`);
  Object.entries(stats.categories).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count}`);
  });

  if (errors.length > 0) {
    console.error(`\nFound ${errors.length} validation error(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("No seed validation errors found.");
}

main();
