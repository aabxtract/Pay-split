import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WALLET_FILE = path.join(__dirname, "interaction-wallets.json");
const HIRO_API = "https://api.hiro.so/v2/accounts";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getNonce(address) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${HIRO_API}/${address}?proof=0`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.status === 429) {
        await sleep((attempt + 1) * 3000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.nonce ?? 0;
    } catch (e) {
      if (attempt === 2) return `ERROR: ${e.message}`;
      await sleep(2000);
    }
  }
}

async function main() {
  if (!fs.existsSync(WALLET_FILE)) {
    console.log("❌ No interaction-wallets.json found.");
    process.exit(1);
  }

  const wallets = JSON.parse(fs.readFileSync(WALLET_FILE, "utf8"));
  console.log(`Checking interactions for ${wallets.length} wallets...\n`);

  let interacted = 0;
  let notInteracted = 0;
  let errors = 0;

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i];
    const nonce = await getNonce(w.address);
    const status = typeof nonce === "number"
      ? nonce >= 2 ? "✅ DONE (2 calls)" : nonce === 1 ? "⚠️ PARTIAL (1 call)" : "❌ NOT STARTED"
      : "⚠️ ERROR";

    if (typeof nonce === "number" && nonce >= 2) interacted++;
    else if (typeof nonce === "number" && nonce < 2) notInteracted++;
    else errors++;

    console.log(`${w.index.toString().padStart(3)}. ${w.address}  nonce=${typeof nonce === "number" ? nonce : nonce}  ${status}`);
    if (i < wallets.length - 1) await sleep(500);
  }

  console.log(`\n--- Summary ---`);
  console.log(`Interacted (≥2)  : ${interacted}`);
  console.log(`Not/Partial (<2) : ${notInteracted}`);
  console.log(`Errors           : ${errors}`);
  console.log(`Total            : ${wallets.length}`);
}

main();
