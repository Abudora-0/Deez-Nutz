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
  { name: "shot-gallery", path: "/", width: 1440, height: 1100, wait: 3500, scrollTo: 900 },
  { name: "shot-search", path: "/?q=cat", width: 1440, height: 1000, wait: 4500, scrollTo: 520 },
  { name: "shot-caption", path: "/meme/template-distracted-boyfriend-112126428", width: 1440, height: 1000, wait: 5000 },
  { name: "shot-mobile", path: "/", width: 390, height: 1500, wait: 3500 },
];

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

for (const s of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 2 });
  await page.goto(base + s.path, { waitUntil: "domcontentloaded", timeout: 45000 });
  if (s.scrollTo) await page.evaluate((y) => window.scrollTo(0, y), s.scrollTo);
  await new Promise((r) => setTimeout(r, s.wait));
  await page.screenshot({ path: `${outDir}/${s.name}.png` });
  console.log(`wrote ${outDir}/${s.name}.png`);
  await page.close();
}

await browser.close();
