import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "public", "captured");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await page.emulateMedia({ colorScheme: "light" });
await page.goto("https://cursor.com", {
  waitUntil: "domcontentloaded",
  timeout: 120000,
});
await page.waitForTimeout(5000);
for (let y = 0; y < 9000; y += 600) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(350);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);

const handles = await page.$$("section .media-border-container");
let idx = 0;
for (const h of handles) {
  const box = await h.boundingBox();
  if (!box || box.width < 320 || box.height < 320) continue;
  const fp = path.join(outDir, `media-${idx}.png`);
  await h.screenshot({ path: fp, animations: "disabled" });
  console.log("wrote", fp, box);
  idx += 1;
  if (idx >= 20) break;
}

await browser.close();
