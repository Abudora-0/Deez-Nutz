// One-off screenshot generator for the README. Not a dependency of the app.
// Usage:
//   npm i -D puppeteer && npx puppeteer browsers install chrome
//   npm run build && npm run start &
//   node scripts/shots.mjs [http://localhost:3000]
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer";

const base = process.argv[2] || "http://localhost:3000";
const outDir = "docs";
mkdirSync(outDir, { recursive: true });

const shots = [
  { name: "shot-gallery", path: "/", width: 1440, height: 1050, scrollTo: 1150 },
  { name: "shot-search", path: "/?q=cat", width: 1440, height: 1000, scrollTo: 520 },
  { name: "shot-caption", path: "/meme/template-distracted-boyfriend-112126428", width: 1440, height: 1000 },
  { name: "shot-mobile", path: "/", width: 390, height: 1400, scrollTo: 0 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

for (const s of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 1.5 });
  await page.goto(base + s.path, { waitUntil: "domcontentloaded", timeout: 45000 });
  await sleep(2500);

  // walk the whole page so every lazy image is asked to load, then let them settle
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 250));
    }
  });
  await sleep(4000);

  await page.evaluate((y) => window.scrollTo(0, y ?? 0), s.scrollTo);
  await sleep(1500);

  await page.screenshot({ path: `${outDir}/${s.name}.webp`, type: "webp", quality: 80 });
  console.log(`wrote ${outDir}/${s.name}.webp`);
  await page.close();
}

await browser.close();
