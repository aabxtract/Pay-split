import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WALLET_FILE = path.join(__dirname, "interaction-wallets.json");
const HIRO_API = "https://api.hiro.so/extended/v1/address";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getBalance(address) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${HIRO_API}/${address}/stx`);
      if (res.status === 429) {
        const wait = (attempt + 1) * 2000;
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.balance ? Number(data.balance) / 1_000_000 : 0;
    } catch (e) {
      if (attempt === 2) return `ERROR: ${e.message}`;
      await sleep(1000);
    }
  }
}

async function main() {
  if (!fs.existsSync(WALLET_FILE)) {
    console.log("❌ No interaction-wallets.json found.");
    process.exit(1);
  }

  const wallets = JSON.parse(fs.readFileSync(WALLET_FILE, "utf8"));
  console.log(`Checking balances for ${wallets.length} wallets...\n`);

  let funded = 0;
  let empty = 0;
  let errors = 0;

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i];
    const bal = await getBalance(w.address);
    const status = typeof bal === "number"
      ? bal > 0 ? "✅ FUNDED" : "❌ EMPTY"
      : "⚠️ ERROR";

    if (typeof bal === "number" && bal > 0) funded++;
    else if (typeof bal === "number" && bal === 0) empty++;
    else errors++;

    console.log(`${w.index.toString().padStart(3)}. ${w.address}  ${status}  ${typeof bal === "number" ? bal.toFixed(6) + " STX" : bal}`);
    if (i < wallets.length - 1) await sleep(500);
  }

  console.log(`\n--- Summary ---`);
  console.log(`Funded : ${funded}`);
  console.log(`Empty  : ${empty}`);
  console.log(`Errors : ${errors}`);
  console.log(`Total  : ${wallets.length}`);
}

main();
