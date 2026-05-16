const fs = require("fs");
const path = require("path");

const SEED_PATHS = [
  path.join(__dirname, "..", "lib", "supabase", "seed_items_weapons.sql"),
  path.join(__dirname, "..", "lib", "supabase", "seed_items_general.sql"),
  path.join(__dirname, "..", "lib", "supabase", "seed_items_catalog.sql"),
];

// Contagens esperadas por categoria (Prompt 4/4 — total: 255 itens)
const EXPECTED = {
  arma: 53,
  armadura: 10,
  escudo: 3,
  equipamento_aventura: 24,
  ferramenta: 14,
  vestuario: 25,
  esoterico: 15,
  alquimico_preparado: 8,
  alquimico_catalisador: 15,
  alquimico_veneno: 13,
  alquimia_mistica: 11,
  animal: 6,
  veiculo: 3,
  servico: 16,
  bens_comuns: 24,
  item_magico: 15,
};

const EXPECTED_TOTAL = Object.values(EXPECTED).reduce((s, n) => s + n, 0);

// ─── Reutiliza parser do validate-seed ───────────────────────────────────────

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
      if (inString && next === "'") { buffer += next; i += 1; continue; }
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
      if (inString && next === "'") { buffer += "''"; i += 1; continue; }
      inString = !inString;
      buffer += char;
      continue;
    }
    if (!inString) {
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;
      if (char === "," && depth === 0) { values.push(buffer.trim()); buffer = ""; continue; }
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
      return Object.fromEntries(columns.map((col, index) => [col, parseSqlValue(values[index])]));
    });
    blocks.push({ columns, rows });
  }
  return blocks;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const counts = {};
  const seenSlugs = new Set();
  const dupes = [];
  let totalRows = 0;

  for (const filePath of SEED_PATHS) {
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ Arquivo não encontrado: ${filePath}`);
      continue;
    }
    const sql = fs.readFileSync(filePath, "utf8");
    let blocks;
    try {
      blocks = parseInsertBlocks(sql);
    } catch (err) {
      console.error(`Erro ao analisar ${path.basename(filePath)}: ${err.message}`);
      process.exit(1);
    }

    blocks.forEach((block) => {
      block.rows.forEach((row) => {
        totalRows += 1;
        const cat = row.category ?? "?";
        counts[cat] = (counts[cat] ?? 0) + 1;
        if (seenSlugs.has(row.slug)) dupes.push(row.slug);
        seenSlugs.add(row.slug);
      });
    });
  }

  console.log(`\n── Auditoria do Catálogo ──────────────────────────────`);
  console.log(`Total de itens encontrados: ${totalRows} (esperado: ${EXPECTED_TOTAL})\n`);

  let allOk = true;

  const allCategories = new Set([...Object.keys(EXPECTED), ...Object.keys(counts)]);
  for (const cat of [...allCategories].sort()) {
    const found = counts[cat] ?? 0;
    const expected = EXPECTED[cat] ?? "—";
    const ok = typeof expected === "number" ? found === expected : true;
    const icon = ok ? "✓" : found < (expected || 0) ? "↓" : "↑";
    if (!ok) allOk = false;
    console.log(`  ${icon} ${cat.padEnd(24)} ${String(found).padStart(3)} / ${String(expected).padStart(3)}`);
  }

  if (dupes.length > 0) {
    allOk = false;
    console.log(`\n⚠ Slugs duplicados (${dupes.length}):`);
    dupes.forEach((d) => console.log(`    • ${d}`));
  }

  const uncategorized = Object.keys(counts).filter((c) => !(c in EXPECTED));
  if (uncategorized.length > 0) {
    console.log(`\n⚠ Categorias inesperadas: ${uncategorized.join(", ")}`);
  }

  console.log(`\n${allOk ? "✓ Catálogo completo e correto." : "✗ Há divergências no catálogo."}\n`);
  process.exit(allOk ? 0 : 1);
}

main();
