const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE_PATH || 'playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ headless: true });
 try {
 const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
 const errors = []; page.on('pageerror', error => errors.push(error.message));
 await page.addInitScript(() => {
   window.qaOscillators = 0;
   const original = OscillatorNode.prototype.start;
   OscillatorNode.prototype.start = function(...args) { window.qaOscillators++; return original.apply(this, args); };
 });
 await page.goto('http://localhost:3000/scripts/fixtures/incense.html');
 const burner = page.getByRole('button', { name: 'Light incense', exact: true });
 await burner.waitFor();
 assert.equal(await burner.getAttribute('aria-pressed'), 'false');
 assert.equal(await page.locator('.incense-smoke').count(), 0);
 await burner.click();
 await page.getByText('1 lit', { exact: true }).waitFor();
 assert.equal(await burner.getAttribute('aria-pressed'), 'true');
 assert.equal(await page.locator('.incense-smoke').count(), 5);
 assert.equal(await page.locator('.incense-smoke').first().evaluate(el => getComputedStyle(el).animationName), 'incense-smoke-rise');
 assert.ok(await page.evaluate(() => window.qaOscillators > 0));
 await burner.focus(); await page.keyboard.press('Enter');
 await page.getByText('2 lit', { exact: true }).waitFor();
 await page.screenshot({ path: 'scripts/artifacts/incense-desktop.png' });
 await page.setViewportSize({ width: 390, height: 844 });
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
 await page.screenshot({ path: 'scripts/artifacts/incense-mobile.png' });
 await page.emulateMedia({ reducedMotion: 'reduce' });
 assert.equal(await page.locator('.incense-smoke').first().evaluate(el => getComputedStyle(el).animationName), 'none');
 assert.deepEqual(errors, []);
 console.log('PASS: click and keyboard activation, offering count, CSS smoke, sound synthesis, mobile layout, reduced motion, no page errors. Persistence callback mocked.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
