/**
 * Generate spell images rotating between Together AI, Stability AI and HuggingFace.
 * Usage: node scripts/generate-spell-images.mjs
 * Reads keys from .env.local — saves to public/assets/spells/{id}.jpg
 */

import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "assets", "spells");
const DELAY_MS = 2500;

// ── Load .env.local ────────────────────────────────────────────────────────────
function loadEnv() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.+)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}
const env = loadEnv();

// ── HTTP helper ────────────────────────────────────────────────────────────────
function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Prompt builder ─────────────────────────────────────────────────────────────
const EFFECT_CTX = {
  dano:       "destructive magical energy blast",
  cura:       "healing golden divine light",
  buff:       "protective magical aura",
  debuff:     "dark debilitating curse",
  controle:   "binding arcane magic",
  utilidade:  "mystical utility spell",
  "invocação":"summoning magical circle",
};

function prompt(name, effect_type) {
  const ctx = EFFECT_CTX[effect_type] ?? "magical spell effect";
  return [
    `fantasy RPG spell art for "${name}"`,
    `a single ${ctx}`,
    `glowing magical energy`,
    `pure solid black background`,
    `black background only`,
    `centered magical symbol or effect`,
    `highly detailed`,
    `sharp focus`,
    `vibrant magical colors`,
    `professional fantasy illustration`,
    `no background elements`,
    `nothing else in the image except the magical effect`,
    `no people no hands no faces`,
  ].join(", ");
}

function negative() {
  return [
    "person", "people", "hands", "fingers", "body", "face", "character",
    "shadow", "drop shadow",
    "background", "scenery", "environment", "floor", "table",
    "gradient background", "gray background", "colored background",
    "text", "watermark", "logo", "label",
    "multiple objects", "clutter",
    "blurry", "out of focus", "low quality", "noise",
    "anime", "painting", "photo", "realistic photo",
    "border", "frame", "vignette",
  ].join(", ");
}

// ── Provider: Together AI (FLUX.1-schnell) ─────────────────────────────────────
async function generateTogether(name, effect_type, apiKey) {
  const body = Buffer.from(JSON.stringify({
    model: "black-forest-labs/FLUX.1-schnell-Free",
    prompt: prompt(name, effect_type),
    width: 512,
    height: 512,
    steps: 4,
    n: 1,
    response_format: "b64_json",
  }));
  const res = await httpsRequest({
    hostname: "api.together.xyz",
    path: "/v1/images/generations",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    },
  }, body);

  if (res.status === 429) throw Object.assign(new Error("rate_limit"), { rateLimit: true });
  if (res.status === 402) throw Object.assign(new Error("no credits"), { permFail: true });
  if (res.status !== 200) throw new Error(`Together HTTP ${res.status}: ${res.body.toString().slice(0, 150)}`);
  const json = JSON.parse(res.body.toString());
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("Together: no image in response");
  return Buffer.from(b64, "base64");
}

// ── Provider: Stability AI (Stable Image Core) ─────────────────────────────────
async function generateStability(name, effect_type, apiKey) {
  const boundary = "----StabilityBoundary" + Date.now();
  const parts = [
    { name: "prompt",          value: prompt(name, effect_type) },
    { name: "negative_prompt", value: negative() },
    { name: "output_format",   value: "jpeg" },
    { name: "aspect_ratio",    value: "1:1" },
  ];
  const bodyParts = parts.map(({ name: n, value: v }) =>
    `--${boundary}\r\nContent-Disposition: form-data; name="${n}"\r\n\r\n${v}`
  ).join("\r\n");
  const body = Buffer.from(bodyParts + `\r\n--${boundary}--\r\n`);

  const res = await httpsRequest({
    hostname: "api.stability.ai",
    path: "/v2beta/stable-image/generate/core",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json",
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": body.length,
    },
  }, body);

  if (res.status === 429) throw Object.assign(new Error("rate_limit"), { rateLimit: true });
  if (res.status !== 200) throw new Error(`Stability HTTP ${res.status}: ${res.body.toString().slice(0, 150)}`);
  const json = JSON.parse(res.body.toString());
  if (!json.image) throw new Error("Stability: no image in response");
  return Buffer.from(json.image, "base64");
}

// ── Provider: HuggingFace (FLUX.1-schnell) ─────────────────────────────────────
async function generateHuggingFace(name, effect_type, token) {
  const body = Buffer.from(JSON.stringify({
    inputs: prompt(name, effect_type),
    parameters: { negative_prompt: negative() },
  }));
  const res = await httpsRequest({
    hostname: "api-inference.huggingface.co",
    path: "/models/black-forest-labs/FLUX.1-schnell",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    },
  }, body);

  if (res.status === 429 || res.status === 503) throw Object.assign(new Error("rate_limit"), { rateLimit: true });
  if (res.status !== 200) throw new Error(`HuggingFace HTTP ${res.status}: ${res.body.toString().slice(0, 150)}`);
  const ct = res.headers["content-type"] ?? "";
  if (!ct.includes("image")) throw new Error(`HuggingFace: unexpected content-type ${ct}`);
  return res.body;
}

// ── Provider rotation ──────────────────────────────────────────────────────────
const PROVIDERS = [];
if (env.TOGETHER_API_KEY)  PROVIDERS.push({ name: "Together",    fn: (n, e) => generateTogether(n, e, env.TOGETHER_API_KEY)  });
if (env.STABILITY_API_KEY) PROVIDERS.push({ name: "Stability",   fn: (n, e) => generateStability(n, e, env.STABILITY_API_KEY) });
if (env.HUGGINGFACE)       PROVIDERS.push({ name: "HuggingFace", fn: (n, e) => generateHuggingFace(n, e, env.HUGGINGFACE)     });

if (PROVIDERS.length === 0) { console.error("No API keys found in .env.local"); process.exit(1); }
console.log(`Providers: ${PROVIDERS.map((p) => p.name).join(", ")}\n`);

const cooldown = {};
function availableProviders() {
  const now = Date.now();
  return PROVIDERS.filter((p) => !cooldown[p.name] || cooldown[p.name] <= now);
}

let roundRobin = 0;
async function generateImage(name, effect_type) {
  const tried = new Set();
  while (true) {
    const available = availableProviders().filter((p) => !tried.has(p.name));
    if (available.length === 0) {
      const tempCooled = PROVIDERS.filter((p) => cooldown[p.name] && cooldown[p.name] !== Infinity && !tried.has(p.name));
      if (tempCooled.length > 0) {
        const wait = Math.min(...tempCooled.map((p) => cooldown[p.name])) - Date.now() + 500;
        process.stdout.write(` (waiting ${Math.ceil(wait / 1000)}s...)`);
        await sleep(wait);
        continue;
      }
      throw new Error("All providers failed");
    }

    const provider = available[roundRobin % available.length];
    roundRobin++;
    tried.add(provider.name);

    try {
      const buf = await provider.fn(name, effect_type);
      process.stdout.write(` [${provider.name}]\n`);
      return buf;
    } catch (err) {
      if (err.permFail) {
        cooldown[provider.name] = Infinity;
        process.stdout.write(` [${provider.name}: ${err.message}]`);
      } else if (err.rateLimit) {
        cooldown[provider.name] = Date.now() + 30000;
        process.stdout.write(` [${provider.name}: rate limit]`);
      } else {
        process.stdout.write(` [${provider.name}: ${err.message.slice(0, 40)}]`);
      }
    }
  }
}

// ── Spell list (188 magias) ────────────────────────────────────────────────────
// [id, name, effect_type]
const SPELLS = [
  ["abencoar_alimentos","Abençoar Alimentos","utilidade"],
  ["acalmar_animal","Acalmar Animal","controle"],
  ["alarme","Alarme","utilidade"],
  ["armadura_magica","Armadura Mágica","buff"],
  ["aviso","Aviso","utilidade"],
  ["bencao","Bênção","buff"],
  ["comando","Comando","controle"],
  ["compreensao","Compreensão","utilidade"],
  ["concentracao_de_combate","Concentração de Combate","buff"],
  ["curar_ferimentos","Curar Ferimentos","cura"],
  ["dardo_gelido","Dardo Gélido","dano"],
  ["detectar_ameacas","Detectar Ameaças","utilidade"],
  ["disfarce_ilusorio","Disfarce Ilusório","utilidade"],
  ["enfeiticar","Enfeitiçar","controle"],
  ["escudo_da_fe","Escudo da Fé","buff"],
  ["imagem_espelhada","Imagem Espelhada","buff"],
  ["infligir_ferimentos","Infligir Ferimentos","dano"],
  ["luz","Luz","utilidade"],
  ["mensagem_secreta","Mensagem Secreta","utilidade"],
  ["orientacao","Orientação","buff"],
  ["perdicao","Perdição","debuff"],
  ["primor_atletico","Primor Atlético","buff"],
  ["protecao_mistica","Proteção Mística","buff"],
  ["queda_suave","Queda Suave","utilidade"],
  ["santuario","Santuário","buff"],
  ["sono","Sono","controle"],
  ["suporte_ambiental","Suporte Ambiental","buff"],
  ["tranquilidade","Tranquilidade","controle"],
  ["visao_mistica","Visão Mística","utilidade"],
  ["aliado_animal","Aliado Animal","invocação"],
  ["bola_de_fogo","Bola de Fogo","dano"],
  ["cone_de_frio","Cone de Frio","dano"],
  ["relampago","Relâmpago","dano"],
  ["controlar_fogo","Controlar Fogo","controle"],
  ["controlar_madeira","Controlar Madeira","utilidade"],
  ["tempestade","Tempestade","controle"],
  ["garras_de_rocha","Garras de Rocha","controle"],
  ["flecha_acida","Flecha Ácida","dano"],
  ["fisico_aprimorado","Físico Aprimorado","buff"],
  ["mente_aprimorada","Mente Aprimorada","buff"],
  ["metamorfose","Metamorfose","utilidade"],
  ["aparencia_perfeita","Aparência Perfeita","buff"],
  ["augurio","Augúrio","utilidade"],
  ["campo_de_forca","Campo de Força","buff"],
  ["camuflagem_ilusoria","Camuflagem Ilusória","buff"],
  ["circulo_da_justica","Círculo da Justiça","utilidade"],
  ["condicao","Condição","utilidade"],
  ["desespero_esmagador","Desespero Esmagador","debuff"],
  ["disco_flutuante","Disco Flutuante","utilidade"],
  ["dissipar_magia","Dissipar Magia","utilidade"],
  ["enxame_de_pestes","Enxame de Pestes","dano"],
  ["esculpir_sons","Esculpir Sons","utilidade"],
  ["invisibilidade","Invisibilidade","utilidade"],
  ["ligacao_telepatica","Ligação Telepática","utilidade"],
  ["localizacao","Localização","utilidade"],
  ["mapear","Mapear","utilidade"],
  ["marca_da_obediencia","Marca da Obediência","controle"],
  ["montaria_mistica","Montaria Mística","invocação"],
  ["olhos_nas_sombras","Olhos nas Sombras","utilidade"],
  ["oracao","Oração","buff"],
  ["purificacao","Purificação","cura"],
  ["raio_sagrado","Raio Sagrado","dano"],
  ["refugio","Refúgio","utilidade"],
  ["rogar_maldicao","Rogar Maldição","debuff"],
  ["runa_de_protecao","Runa de Proteção","utilidade"],
  ["salto_dimensional","Salto Dimensional","utilidade"],
  ["silencio","Silêncio","controle"],
  ["sussurros_insanos","Sussurros Insanos","controle"],
  ["toque_vampirico","Toque Vampírico","dano"],
  ["velocidade","Velocidade","buff"],
  ["vestimenta_da_fe","Vestimenta da Fé","buff"],
  ["voz_divina","Voz Divina","utilidade"],
  ["conjurar_mortos_vivos","Conjurar Mortos-Vivos","invocação"],
  ["cranio_voador","Crânio Voador","dano"],
  ["alterar_tamanho","Alterar Tamanho","utilidade"],
  ["amarras_etereas","Amarras Etéreas","controle"],
  ["servos_invisiveis","Servos Invisíveis","utilidade"],
  ["adaga_mental","Adaga Mental","dano"],
  ["amedrontar","Amedrontar","debuff"],
  ["area_escorregadia","Área Escorregadia","controle"],
  ["arma_espiritual","Arma Espiritual","dano"],
  ["arma_magica","Arma Mágica","buff"],
  ["armamento_da_natureza","Armamento da Natureza","buff"],
  ["caminhos_da_natureza","Caminhos da Natureza","utilidade"],
  ["consagrar","Consagrar","utilidade"],
  ["criar_ilusao","Criar Ilusão","utilidade"],
  ["despedacar","Despedaçar","dano"],
  ["escuridao","Escuridão","controle"],
  ["jato_corrosivo","Jato Corrosivo","dano"],
  ["leque_cromatico","Leque Cromático","controle"],
  ["nevoa","Névoa","controle"],
  ["raio_do_enfraquecimento","Raio do Enfraquecimento","debuff"],
  ["resistencia_a_energia","Resistência a Energia","buff"],
  ["seta_infalivel","Seta Infalível","dano"],
  ["toque_chocante","Toque Chocante","dano"],
  ["tranca_arcana","Tranca Arcana","utilidade"],
  ["transmutar_objetos","Transmutar Objetos","utilidade"],
  ["vitalidade_fantasma","Vitalidade Fantasma","buff"],
  ["controlar_plantas","Controlar Plantas","controle"],
  ["criar_elementos","Criar Elementos","utilidade"],
  ["explosao_de_chamas","Explosão de Chamas","dano"],
  ["hipnotismo","Hipnotismo","controle"],
  ["profanar","Profanar","debuff"],
  ["anular_a_luz","Anular a Luz","controle"],
  ["banimento","Banimento","controle"],
  ["banquete_dos_herois","Banquete dos Heróis","cura"],
  ["chuva_acida","Chuva Ácida","dano"],
  ["comunhao_com_a_natureza","Comunhão com a Natureza","utilidade"],
  ["contato_extraplanar","Contato Extraplanar","utilidade"],
  ["convocacao_instantanea","Convocação Instantânea","utilidade"],
  ["despertar_consciencia","Despertar Consciência","invocação"],
  ["dificultar_deteccao","Dificultar Detecção","utilidade"],
  ["dispersar_as_trevas","Dispersar as Trevas","utilidade"],
  ["erupcao_glacial","Erupção Glacial","dano"],
  ["escudo_de_chamas","Escudo de Chamas","buff"],
  ["globo_de_invulnerabilidade","Globo de Invulnerabilidade","buff"],
  ["heroismo","Heroísmo","buff"],
  ["ilusao_lacerante","Ilusão Lacerante","dano"],
  ["imobilizar","Imobilizar","controle"],
  ["impacto_fulminante","Impacto Fulminante","dano"],
  ["lendas_e_historias","Lendas e Histórias","utilidade"],
  ["manto_de_sombras","Manto de Sombras","utilidade"],
  ["miragem","Miragem","utilidade"],
  ["missao_divina","Missão Divina","controle"],
  ["pele_de_pedra","Pele de Pedra","buff"],
  ["potencia_divina","Potência Divina","buff"],
  ["protecao_contra_magia","Proteção contra Magia","buff"],
  ["selo_de_mana","Selo de Mana","debuff"],
  ["servo_divino","Servo Divino","invocação"],
  ["servo_morto_vivo","Servo Morto-Vivo","invocação"],
  ["sopro_da_salvacao","Sopro da Salvação","cura"],
  ["telecinesia","Telecinesia","utilidade"],
  ["teletransporte","Teletransporte","utilidade"],
  ["tentaculos_de_trevas","Tentáculos de Trevas","controle"],
  ["voo","Voo","utilidade"],
  ["viagem_arborea","Viagem Arbórea","utilidade"],
  ["videncia","Vidência","utilidade"],
  ["companheiro_fiel","Companheiro Fiel","invocação"],
  ["conjurar_monstro","Conjurar Monstro","invocação"],
  ["alterar_memoria","Alterar Memória","controle"],
  ["animar_objetos","Animar Objetos","invocação"],
  ["assassino_fantasmagorico","Assassino Fantasmagórico","dano"],
  ["campo_antimagia","Campo Antimagia","utilidade"],
  ["circulo_da_restauracao","Círculo da Restauração","cura"],
  ["conceder_milagre","Conceder Milagre","utilidade"],
  ["conjurar_elemental","Conjurar Elemental","invocação"],
  ["controlar_gravidade","Controlar Gravidade","controle"],
  ["controlar_o_clima","Controlar o Clima","utilidade"],
  ["cupula_de_repulsao","Cúpula de Repulsão","controle"],
  ["desejo","Desejo","utilidade"],
  ["desintegrar","Desintegrar","dano"],
  ["duplicata_ilusoria","Duplicata Ilusória","utilidade"],
  ["explosao_caleidoscopica","Explosão Caleidoscópica","controle"],
  ["forma_eterea","Forma Etérea","utilidade"],
  ["guardiao_divino","Guardião Divino","cura"],
  ["juramento_sagrado","Juramento Sagrado","buff"],
  ["legiao","Legião","controle"],
  ["libertacao","Libertação","buff"],
  ["ligacao_sombria","Ligação Sombria","debuff"],
  ["manto_sagrado","Manto Sagrado","buff"],
  ["mao_poderosa","Mão Poderosa","controle"],
  ["marionete","Marionete","controle"],
  ["muralha_de_ossos","Muralha de Ossos","controle"],
  ["muralha_elemental","Muralha Elemental","controle"],
  ["poco_vitriolico","Poço Vitriólico","controle"],
  ["premonicao","Premonição","utilidade"],
  ["raio_polar","Raio Polar","dano"],
  ["salto_relampago","Salto Relâmpago","dano"],
  ["sonho","Sonho","utilidade"],
  ["sopro_de_dragao","Sopro de Dragão","dano"],
  ["terremoto","Terremoto","controle"],
  ["visao_da_verdade","Visão da Verdade","utilidade"],
  ["alterar_destino","Alterar Destino","utilidade"],
  ["aprisionamento","Aprisionamento","controle"],
  ["aura_divina","Aura Divina","buff"],
  ["barragem_elemental","Barragem Elemental","dano"],
  ["chuva_de_meteoros","Chuva de Meteoros","dano"],
  ["engenho_de_mana","Engenho de Mana","utilidade"],
  ["furia_dos_ceus","Fúria dos Céus","dano"],
  ["intervencao_divina","Intervenção Divina","utilidade"],
  ["invulnerabilidade","Invulnerabilidade","buff"],
  ["palavra_primordial","Palavra Primordial","controle"],
  ["possessao","Possessão","controle"],
  ["projetar_consciencia","Projetar Consciência","utilidade"],
  ["requiem","Réquiem","controle"],
  ["segunda_chance","Segunda Chance","cura"],
  ["sombra_assassina","Sombra Assassina","controle"],
  ["toque_da_morte","Toque da Morte","dano"],
];

// ── Main ───────────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const total = SPELLS.length;
  console.log(`Generating ${total} spell images → ${OUT_DIR}\n`);

  let ok = 0, skipped = 0, errors = 0;
  const failed = [];

  for (let i = 0; i < SPELLS.length; i++) {
    const [id, name, effect_type] = SPELLS[i];
    const dest = path.join(OUT_DIR, `${id}.jpg`);

    if (fs.existsSync(dest)) {
      console.log(`[${String(i + 1).padStart(3, "0")}/${total}] skip  ${id}`);
      skipped++;
      continue;
    }

    process.stdout.write(`[${String(i + 1).padStart(3, "0")}/${total}] ${name.padEnd(40)}`);

    try {
      const buf = await generateImage(name, effect_type);
      fs.writeFileSync(dest, buf);
      ok++;
    } catch (err) {
      process.stdout.write(` ERROR: ${err.message.slice(0, 80)}\n`);
      errors++;
      failed.push(id);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n${"─".repeat(55)}`);
  console.log(`Done.  Generated: ${ok}  Skipped: ${skipped}  Errors: ${errors}`);
  if (failed.length > 0) console.log(`Failed slugs: ${failed.join(", ")}`);
  console.log(`Files in output: ${fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".jpg")).length}`);
}

main().catch(console.error);
