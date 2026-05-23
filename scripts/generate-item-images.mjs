/**
 * Generate item images rotating between Together AI, Stability AI and HuggingFace.
 * Usage: node scripts/generate-item-images.mjs
 * Reads keys from .env.local — saves to public/assets/items/{slug}.jpg
 */

import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "assets", "items");
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
const CTX = {
  arma: "medieval weapon",
  armadura: "medieval armor suit",
  escudo: "medieval shield",
  municao: "medieval ammunition",
  equipamento_aventura: "medieval adventuring item",
  ferramenta: "medieval tool",
  vestuario: "medieval garment",
  esoterico: "medieval occult object",
  alquimico_preparado: "small glass vial with liquid",
  alquimico_catalisador: "small alchemical ingredient",
  alquimico_veneno: "small dark poison vial",
  alquimia_mistica: "glowing small glass potion bottle",
  animal: "animal",
  veiculo: "medieval vehicle",
  bens_comuns: "medieval everyday object",
  item_magico: "glowing medieval magical item",
};

function prompt(name, category) {
  const ctx = CTX[category] ?? "medieval item";
  return [
    `a single ${name}`,
    `one ${ctx}`,
    `the object is completely isolated`,
    `pure solid white background`,
    `white background only`,
    `centered in the frame`,
    `full object visible`,
    `clean product photography`,
    `highly detailed`,
    `sharp focus`,
    `professional studio shot`,
    `no background elements whatsoever`,
    `nothing else in the image except the ${ctx}`,
  ].join(", ");
}

function negative() {
  return [
    "person", "people", "hands", "fingers", "body", "face",
    "shadow", "drop shadow", "cast shadow",
    "background", "scenery", "environment", "floor", "table", "surface",
    "gradient background", "gray background", "dark background", "colored background",
    "text", "watermark", "logo", "label",
    "multiple objects", "clutter",
    "blurry", "out of focus", "low quality", "noise",
    "cartoon", "anime", "illustration", "painting", "drawing",
    "border", "frame", "vignette",
  ].join(", ");
}

// ── Provider: Together AI (FLUX.1-schnell) ─────────────────────────────────────
async function generateTogether(name, category, apiKey) {
  const body = Buffer.from(JSON.stringify({
    model: "black-forest-labs/FLUX.1-schnell-Free",
    prompt: prompt(name, category),
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
async function generateStability(name, category, apiKey) {
  const boundary = "----StabilityBoundary" + Date.now();
  const parts = [
    { name: "prompt",        value: prompt(name, category) },
    { name: "negative_prompt", value: negative() },
    { name: "output_format", value: "jpeg" },
    { name: "aspect_ratio",  value: "1:1" },
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
async function generateHuggingFace(name, category, token) {
  const body = Buffer.from(JSON.stringify({
    inputs: prompt(name, category),
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
if (env.TOGETHER_API_KEY)  PROVIDERS.push({ name: "Together",   fn: (n, c) => generateTogether(n, c, env.TOGETHER_API_KEY)  });
if (env.STABILITY_API_KEY) PROVIDERS.push({ name: "Stability",  fn: (n, c) => generateStability(n, c, env.STABILITY_API_KEY) });
if (env.HUGGINGFACE)       PROVIDERS.push({ name: "HuggingFace",fn: (n, c) => generateHuggingFace(n, c, env.HUGGINGFACE)     });

if (PROVIDERS.length === 0) { console.error("No API keys found in .env.local"); process.exit(1); }
console.log(`Providers: ${PROVIDERS.map((p) => p.name).join(", ")}\n`);

// Cooldown timestamps per provider (ms); Infinity = permanently disabled
const cooldown = {};
function availableProviders() {
  const now = Date.now();
  return PROVIDERS.filter((p) => !cooldown[p.name] || cooldown[p.name] <= now);
}

let roundRobin = 0;
async function generateImage(name, category) {
  const tried = new Set();
  while (true) {
    const available = availableProviders().filter((p) => !tried.has(p.name));
    if (available.length === 0) {
      // Check if any are just in temporary cooldown (not permanent)
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
      const buf = await provider.fn(name, category);
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
        // Network error or other — skip this provider for this item only
        process.stdout.write(` [${provider.name}: ${err.message.slice(0, 40)}]`);
      }
    }
  }
}

// ── Item list (239 items — servicos excluded) ──────────────────────────────────
const ITEMS = [
  ["adaga","Adaga","arma"],
  ["espada_curta","Espada curta","arma"],
  ["foice","Foice","arma"],
  ["punhal","Punhal","arma"],
  ["clava","Clava","arma"],
  ["lanca","Lança","arma"],
  ["maca","Maça","arma"],
  ["bordao","Bordão","arma"],
  ["pique","Pique","arma"],
  ["tacape","Tacape","arma"],
  ["azagaia","Azagaia","arma"],
  ["besta_leve","Besta leve","arma"],
  ["funda","Funda (sling)","arma"],
  ["arco_curto","Arco curto","arma"],
  ["gancho","Gancho de combate","arma"],
  ["khanjar","Khanjar","arma"],
  ["machadinha","Machadinha","arma"],
  ["cimitarra","Cimitarra","arma"],
  ["espada_larga","Espada larga","arma"],
  ["espada_longa","Espada longa","arma"],
  ["florete","Florete","arma"],
  ["maca_estrela","Maça estrela","arma"],
  ["machado_batalha","Machado de batalha","arma"],
  ["mangual","Mangual","arma"],
  ["martelo_batalha","Martelo de batalha","arma"],
  ["picareta","Picareta de guerra","arma"],
  ["tridente","Tridente","arma"],
  ["alabarda","Alabarda","arma"],
  ["alfange","Alfange","arma"],
  ["bico_de_corvo","Bico de corvo (pollaxe)","arma"],
  ["gadanho","Gadanho","arma"],
  ["lanca_montada","Lança montada","arma"],
  ["machado_guerra","Machado de guerra","arma"],
  ["malho","Malho","arma"],
  ["marreta_guerra","Marreta de guerra","arma"],
  ["martelo_longo","Martelo longo","arma"],
  ["montante","Montante (greatsword)","arma"],
  ["arco_longo","Arco longo","arma"],
  ["besta_pesada","Besta pesada","arma"],
  ["chicote","Chicote","arma"],
  ["espada_bastarda","Espada bastarda","arma"],
  ["maca_guerra","Maça de guerra","arma"],
  ["machado_anao","Machado anão","arma"],
  ["rapieira","Rapieira","arma"],
  ["sabre_elfico","Sabre curvo élfico","arma"],
  ["corrente_espinhos","Corrente de espinhos","arma"],
  ["marrao","Marrão","arma"],
  ["arco_guerra","Arco de guerra","arma"],
  ["arpao","Arpão","arma"],
  ["rede","Rede de combate","arma"],
  ["virotes_20","Virotes de besta","municao"],
  ["pedras_20","Pedras de funda","municao"],
  ["flechas_20","Flechas de arco","municao"],
  ["armadura_acolchoada","Armadura acolchoada","armadura"],
  ["armadura_couro","Armadura de couro","armadura"],
  ["couro_batido","Couro batido","armadura"],
  ["gibao_peles","Gibão de peles","armadura"],
  ["cota_aneis","Cota de anéis","armadura"],
  ["brunea","Brunea (lamellar armor)","armadura"],
  ["cota_malha","Cota de malha","armadura"],
  ["cota_talas","Cota de talas","armadura"],
  ["meia_armadura","Meia armadura de placas","armadura"],
  ["armadura_completa","Armadura completa de placas","armadura"],
  ["escudo_leve","Escudo leve redondo","escudo"],
  ["escudo_pesado","Escudo pesado kite","escudo"],
  ["escudo_torre","Escudo torre","escudo"],
  ["agua_benta","Frasco de água benta","equipamento_aventura"],
  ["agua_sacra","Frasco de água sacra","equipamento_aventura"],
  ["algemas","Algemas de ferro","equipamento_aventura"],
  ["arpeu","Arpéu e corda","equipamento_aventura"],
  ["bandoleira_pocoes","Bandoleira de poções","equipamento_aventura"],
  ["barraca","Barraca de acampamento","equipamento_aventura"],
  ["bolsa_lona","Bolsa de lona","equipamento_aventura"],
  ["corda","Corda de cânhamo 15m","equipamento_aventura"],
  ["espelho","Espelho de bolso de aço","equipamento_aventura"],
  ["estrepes","Estrepes de ferro","equipamento_aventura"],
  ["lampiao","Lampião de metal","equipamento_aventura"],
  ["mapa","Mapa de pergaminho enrolado","equipamento_aventura"],
  ["mochila","Mochila de couro","equipamento_aventura"],
  ["oleo","Frasco de óleo de lampião","equipamento_aventura"],
  ["pe_de_cabra","Pé de cabra de ferro","equipamento_aventura"],
  ["pederneira","Pederneira e isqueiro","equipamento_aventura"],
  ["racao_viagem","Ração de viagem embrulhada","equipamento_aventura"],
  ["saco_dormir","Saco de dormir de lã","equipamento_aventura"],
  ["simbolo_sagrado","Símbolo sagrado de madeira","equipamento_aventura"],
  ["tocha","Tocha de madeira","equipamento_aventura"],
  ["vara_madeira","Vara de madeira 3 metros","equipamento_aventura"],
  ["anzol_linha","Anzol e linha de pesca","equipamento_aventura"],
  ["ampulheta","Ampulheta de areia","equipamento_aventura"],
  ["gaiola","Gaiola de arame para ave","equipamento_aventura"],
  ["ferramentas_ladrao","Ferramentas de ladrão lockpicks","ferramenta"],
  ["instrumentos_oficio","Instrumentos de ofício artesão","ferramenta"],
  ["instrumento_musical","Instrumento musical de madeira","ferramenta"],
  ["luneta","Luneta de latão","ferramenta"],
  ["maleta_medicamentos","Maleta de medicamentos","ferramenta"],
  ["estojo_disfarces","Estojo de disfarces e maquiagem","ferramenta"],
  ["kit_escalada","Kit de escalada com pitões","ferramenta"],
  ["kit_cirurgiao","Kit de cirurgião com bisturi","ferramenta"],
  ["kit_cartografia","Kit de cartografia e régua","ferramenta"],
  ["kit_alquimia","Kit de alquimia com frascos","ferramenta"],
  ["kit_joalheria","Kit de joalheria com pinças","ferramenta"],
  ["kit_culinaria","Kit de culinária com utensílios","ferramenta"],
  ["kit_ferraria","Kit de ferraria com martelo","ferramenta"],
  ["bussola","Bússola de latão","ferramenta"],
  ["traje_viajante","Traje de viajante de couro","vestuario"],
  ["elmo_leve","Elmo leve de couro","vestuario"],
  ["elmo_pesado","Elmo pesado de aço","vestuario"],
  ["capa_pesada","Capa pesada de lã","vestuario"],
  ["botas_reforcadas","Botas reforçadas de couro","vestuario"],
  ["luva_pelica","Luva de pelica","vestuario"],
  ["traje_corte","Traje de corte nobre","vestuario"],
  ["manto_eclesiastico","Manto eclesiástico","vestuario"],
  ["robe_mago","Robe de mago com capuz","vestuario"],
  ["chapeu_aventureiro","Chapéu de aventureiro de feltro","vestuario"],
  ["manto_comum","Manto comum de lã","vestuario"],
  ["manto_nobre","Manto nobre bordado","vestuario"],
  ["manto_inverno","Manto de inverno com pele","vestuario"],
  ["tunica","Túnica simples de linho","vestuario"],
  ["calcas_couro","Calças de couro","vestuario"],
  ["camisa_seda","Camisa de seda","vestuario"],
  ["sandalia","Sandálias de couro","vestuario"],
  ["botas_altas","Botas de cano alto","vestuario"],
  ["capuz_la","Capuz de lã","vestuario"],
  ["luvas_couro","Luvas de couro","vestuario"],
  ["cinto_simples","Cinto simples de couro","vestuario"],
  ["cinta_abdominal","Cinta abdominal de couro","vestuario"],
  ["traje_trabalho","Traje de trabalho simples","vestuario"],
  ["uniforme_guarda","Uniforme de guarda","vestuario"],
  ["roupa_disfarce","Roupa de disfarce","vestuario"],
  ["cajado_arcano","Cajado arcano de madeira","esoterico"],
  ["varinha_arcana","Varinha arcana de madeira","esoterico"],
  ["orbe_cristalina","Orbe de cristal mágico","esoterico"],
  ["tomo_hermetico","Tomo hermético encadernado","esoterico"],
  ["simbolo_sagrado_ouro","Símbolo sagrado de ouro","esoterico"],
  ["bolsa_po","Bolsa de pó mágico","esoterico"],
  ["incenso_concentracao","Incenso ritual de concentração","esoterico"],
  ["vela_ritual","Vela ritual","esoterico"],
  ["cristal_foco","Cristal de foco mágico","esoterico"],
  ["pedra_runa","Pedra rúnica gravada","esoterico"],
  ["grimorio","Grimório encadernado em couro","esoterico"],
  ["pergaminho_magia","Pergaminho de magia enrolado","esoterico"],
  ["talisman_sorte","Talismã da sorte","esoterico"],
  ["ampola_arcana","Ampola arcana de vidro","esoterico"],
  ["diapasao_magico","Diapasão mágico de metal","esoterico"],
  ["acido","Frasco de ácido","alquimico_preparado"],
  ["antidoto","Frasco de antídoto","alquimico_preparado"],
  ["balsamo_restaurador","Frasco de bálsamo restaurador","alquimico_preparado"],
  ["essencia_mana","Frasco de essência de mana","alquimico_preparado"],
  ["fogo_alquimico","Frasco de fogo alquímico","alquimico_preparado"],
  ["fumaca_grossa","Bomba de fumaça grossa","alquimico_preparado"],
  ["oleo_escorregadio","Frasco de óleo escorregadio","alquimico_preparado"],
  ["balsamo_curativo","Frasco de bálsamo curativo","alquimico_preparado"],
  ["po_enxofre","Pó de enxofre amarelo","alquimico_catalisador"],
  ["mercurio","Frasco de mercúrio líquido","alquimico_catalisador"],
  ["sal_magico","Cristais de sal mágico","alquimico_catalisador"],
  ["areia_vitrea","Areia vítrea cintilante","alquimico_catalisador"],
  ["sangue_dragao","Resina de sangue de dragão","alquimico_catalisador"],
  ["po_osso","Pó de osso branco","alquimico_catalisador"],
  ["carvao_ativado","Carvão ativado preto","alquimico_catalisador"],
  ["oleo_essencial","Frasco de óleo essencial","alquimico_catalisador"],
  ["cristal_sal","Cristal de sal transparente","alquimico_catalisador"],
  ["pena_corvo","Pena de corvo preta","alquimico_catalisador"],
  ["olho_sapo","Olho de sapo seco preservado","alquimico_catalisador"],
  ["teia_concentrada","Teia de aranha concentrada","alquimico_catalisador"],
  ["mel_selvagem","Frasco de mel selvagem","alquimico_catalisador"],
  ["musgo_luminoso","Musgo luminoso em frasco","alquimico_catalisador"],
  ["pedra_enxofre","Pedra de enxofre mineral","alquimico_catalisador"],
  ["peconha_comum","Frasco de peçonha","alquimico_veneno"],
  ["cicuta","Extrato de cicuta em frasco","alquimico_veneno"],
  ["bruma_sonolenta","Frasco de bruma sonolenta","alquimico_veneno"],
  ["beladona","Extrato de beladona","alquimico_veneno"],
  ["peconha_vibora","Peçonha de víbora em frasco","alquimico_veneno"],
  ["peconha_escorpiao","Peçonha de escorpião em frasco","alquimico_veneno"],
  ["peconha_aranha","Peçonha de aranha em frasco","alquimico_veneno"],
  ["veneno_paralisante","Veneno paralisante em frasco","alquimico_veneno"],
  ["toxina_mental","Toxina mental em frasco","alquimico_veneno"],
  ["po_contaminado","Pó contaminado embrulhado","alquimico_veneno"],
  ["oleo_cogumelo","Óleo de cogumelo venenoso","alquimico_veneno"],
  ["peconha_sapo","Peçonha de sapo-dardo","alquimico_veneno"],
  ["amargura_haste","Extrato de amargura da haste","alquimico_veneno"],
  ["pocao_cura_menor","Poção vermelha de cura menor","alquimia_mistica"],
  ["pocao_cura","Poção vermelha de cura","alquimia_mistica"],
  ["pocao_cura_maior","Poção vermelha de cura maior","alquimia_mistica"],
  ["elixir_forca","Elixir laranja de força","alquimia_mistica"],
  ["elixir_destreza","Elixir verde de destreza","alquimia_mistica"],
  ["elixir_resistencia","Elixir azul de resistência","alquimia_mistica"],
  ["oleo_magico","Frasco de óleo mágico dourado","alquimia_mistica"],
  ["po_sono","Pó do sono roxo","alquimia_mistica"],
  ["po_visao","Pó da visão prateado","alquimia_mistica"],
  ["frasco_fumaca","Frasco de fumaça colorida","alquimia_mistica"],
  ["tintura_invisivel","Frasco de tintura invisível","alquimia_mistica"],
  ["cavalo","Cavalo castanho","animal"],
  ["cavalo_guerra","Cavalo de guerra negro","animal"],
  ["mula","Mula de carga","animal"],
  ["cao_caca","Cão de caça","animal"],
  ["sela","Sela de couro para cavalo","animal"],
  ["falcao","Falcão de caça","animal"],
  ["carrocinha","Carrocinha de madeira","veiculo"],
  ["charrete","Charrete de madeira","veiculo"],
  ["carruagem","Carruagem fechada","veiculo"],
  ["vela","Vela de cera","bens_comuns"],
  ["giz","Giz branco","bens_comuns"],
  ["tinta","Frasco de tinta preta","bens_comuns"],
  ["pena_escrita","Pena de escrita","bens_comuns"],
  ["papel","Folhas de papel","bens_comuns"],
  ["livro_branco","Livro em branco encadernado","bens_comuns"],
  ["cera_lacre","Cera de lacre vermelha","bens_comuns"],
  ["cadeado","Cadeado de ferro","bens_comuns"],
  ["corrente","Corrente de ferro","bens_comuns"],
  ["argola_ferro","Argola de ferro","bens_comuns"],
  ["prego","Pregos de ferro","bens_comuns"],
  ["martelo_carpinteiro","Martelo de carpinteiro","bens_comuns"],
  ["cinzel","Cinzel de metal","bens_comuns"],
  ["pa","Pá de ferro","bens_comuns"],
  ["picareta_trabalho","Picareta de mineração","bens_comuns"],
  ["agulha_linha","Agulha e linha de costura","bens_comuns"],
  ["pano","Rolo de pano de linho","bens_comuns"],
  ["cesto","Cesto de vime trançado","bens_comuns"],
  ["barril_pequeno","Barrilinho de madeira","bens_comuns"],
  ["caixote","Caixote de madeira","bens_comuns"],
  ["saco_estopa","Saco de estopa","bens_comuns"],
  ["cobertor","Cobertor de lã","bens_comuns"],
  ["sabao","Barra de sabão","bens_comuns"],
  ["arame","Rolo de arame de metal","bens_comuns"],
  ["anel_protecao","Anel de proteção mágico","item_magico"],
  ["amuleto_saude","Amuleto da saúde mágico","item_magico"],
  ["botas_velozes","Botas velozes encantadas","item_magico"],
  ["capa_sombra","Capa das sombras encantada","item_magico"],
  ["luvas_forca","Luvas de força mágicas","item_magico"],
  ["elmo_percepcao","Elmo da percepção mágico","item_magico"],
  ["anel_resistencia","Anel de resistência mágico","item_magico"],
  ["cinto_forca","Cinto de força mágico","item_magico"],
  ["talisman_coragem","Talismã da coragem","item_magico"],
  ["bolsa_guardadora","Bolsa guardadora mágica","item_magico"],
  ["pedra_chamado","Pedra de chamado mágica","item_magico"],
  ["vela_revelacao","Vela da revelação mágica","item_magico"],
  ["manto_invisibilidade","Manto de invisibilidade","item_magico"],
  ["cristal_memoria","Cristal de memória mágico","item_magico"],
  ["espelho_visoes","Espelho de visões mágico","item_magico"],
];

// ── Main ───────────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const total = ITEMS.length;
  console.log(`Generating ${total} images → ${OUT_DIR}\n`);

  let ok = 0, skipped = 0, errors = 0;
  const failed = [];

  for (let i = 0; i < ITEMS.length; i++) {
    const [slug, name, category] = ITEMS[i];
    const dest = path.join(OUT_DIR, `${slug}.jpg`);

    if (fs.existsSync(dest)) {
      console.log(`[${String(i + 1).padStart(3, "0")}/${total}] skip  ${slug}`);
      skipped++;
      continue;
    }

    process.stdout.write(`[${String(i + 1).padStart(3, "0")}/${total}] ${name.padEnd(40)}`);

    try {
      const buf = await generateImage(name, category);
      fs.writeFileSync(dest, buf);
      ok++;
    } catch (err) {
      process.stdout.write(` ERROR: ${err.message.slice(0, 80)}\n`);
      errors++;
      failed.push(slug);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n${"─".repeat(55)}`);
  console.log(`Done.  Generated: ${ok}  Skipped: ${skipped}  Errors: ${errors}`);
  if (failed.length > 0) console.log(`Failed slugs: ${failed.join(", ")}`);
  console.log(`Files in output: ${fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".jpg")).length}`);
}

main().catch(console.error);
