import { chromium } from "playwright";

const url = process.env.SMOKE_URL ?? "http://127.0.0.1:5173/";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const canvasCount = await page.locator("canvas").count();
const title = await page.title();

// Click through title into hub, then open Dinosaur Hall.
const enter = page.getByText("Enter the Museum");
if (await enter.count()) {
  await enter.click();
  await page.waitForTimeout(500);
  const dino = page.getByText("Dinosaur Hall");
  if (await dino.count()) {
    await dino.first().click();
    await page.waitForTimeout(1000);
  }
}

await browser.close();

if (!title.includes("Spooky Museum")) {
  console.error("Unexpected title:", title);
  process.exit(1);
}
if (canvasCount < 1) {
  console.error("No Phaser canvas found");
  process.exit(1);
}
if (errors.length) {
  console.error("Page errors:\n", errors.join("\n"));
  process.exit(1);
}

console.log("Smoke OK:", { title, canvasCount });
