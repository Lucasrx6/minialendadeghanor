/**
 * Test script — generates only the 3 test items.
 * Usage: node scripts/test-item-images.mjs
 * Saves to public/assets/items/{slug}.jpg (overwrites existing)
 */

import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "assets", "items");

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

async function generateStability(positivePrompt, negativePrompt, apiKey) {
  const boundary = "----Boundary" + Date.now();
  const parts = [
    { name: "prompt",          value: positivePrompt },
    { name: "negative_prompt", value: negativePrompt },
    { name: "output_format",   value: "jpeg" },
    { name: "aspect_ratio",    value: "1:1" },
  ];
  const bodyStr = parts.map(({ name: n, value: v }) =>
    `--${boundary}\r\nContent-Disposition: form-data; name="${n}"\r\n\r\n${v}`
  ).join("\r\n") + `\r\n--${boundary}--\r\n`;
  const body = Buffer.from(bodyStr);

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

  if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${res.body.toString().slice(0, 200)}`);
  const json = JSON.parse(res.body.toString());
  if (!json.image) throw new Error("No image in response");
  return Buffer.from(json.image, "base64");
}

const NEG = [
  "person", "people", "hands", "fingers", "body", "face", "human",
  "shadow", "drop shadow",
  "background", "scenery", "floor", "table", "surface", "environment",
  "gradient", "gray background", "dark background", "colored background",
  "text", "watermark", "logo",
  "multiple objects", "clutter", "other items",
  "blurry", "low quality", "noise",
  "cartoon", "anime",
  "border", "frame", "vignette",
].join(", ");

// ── Test items — edit prompts here ───────────────────────────────────────────
const TEST_ITEMS = [
  {
    slug: "adaga",
    prompt: [
      "a single medieval dagger",
      "this is a SHORT knife, NOT a sword",
      "total length of the entire object is only 25 centimeters",
      "the blade is only 15 centimeters long, very short",
      "double-edged narrow pointed blade",
      "small simple iron crossguard",
      "short handle wrapped in leather",
      "the whole object fits easily in one hand",
      "it is much smaller than a sword",
      "lying flat horizontally",
      "pure white background",
      "isolated single object",
      "product photography",
      "high detail",
    ].join(", "),
  },
  {
    slug: "foice",
    prompt: [
      "a single medieval war sickle weapon",
      "this is NOT a sword",
      "the blade is CURVED like a crescent moon or hook",
      "strongly curved inward single-edged blade",
      "the blade curves sharply like a sickle",
      "short wooden handle",
      "the cutting edge faces inward on the curve",
      "resembles an agricultural sickle but used as a weapon",
      "hook-shaped curved blade",
      "lying flat horizontally",
      "pure white background",
      "isolated single object",
      "product photography",
      "high detail",
    ].join(", "),
  },
  {
    slug: "besta_leve",
    prompt: [
      "a single medieval light crossbow",
      "this is a CROSSBOW not a sword",
      "horizontal wooden bow perpendicular to the stock",
      "long wooden stock like a rifle butt",
      "small iron trigger and nut mechanism",
      "iron stirrup loop at the front tip",
      "the bow arms extend left and right horizontally",
      "lying flat",
      "pure white background",
      "isolated single object",
      "product photography",
      "high detail",
    ].join(", "),
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const key = env.STABILITY_API_KEY;
  if (!key) { console.error("STABILITY_API_KEY not found"); process.exit(1); }

  for (const item of TEST_ITEMS) {
    const dest = path.join(OUT_DIR, `${item.slug}.jpg`);
    console.log(`\nGenerating: ${item.slug}`);
    console.log(`Prompt: ${item.prompt}\n`);
    try {
      const buf = await generateStability(item.prompt, NEG, key);
      fs.writeFileSync(dest, buf);
      console.log(`✓ Saved → ${dest}`);
    } catch (err) {
      console.error(`✗ Error: ${err.message}`);
    }
    if (item !== TEST_ITEMS[TEST_ITEMS.length - 1]) {
      console.log("Waiting 3s...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

main().catch(console.error);
