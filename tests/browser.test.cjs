'use strict';
const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const {createServer} = require('node:http');
const {readFile} = require('node:fs/promises');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const files = {'/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'],
  '/css/style.css': ['css/style.css', 'text/css'], '/js/model.js': ['js/model.js', 'text/javascript'],
  '/js/index.js': ['js/index.js', 'text/javascript']};
let browser, server, origin;
before(async () => {
  server = createServer(async (req, res) => {
    const item = files[new URL(req.url, 'http://localhost').pathname];
    if (!item || !['GET', 'HEAD'].includes(req.method)) {res.writeHead(404); res.end(); return;}
    try {
      const content = await readFile(path.join(root, item[0]));
      res.writeHead(200, {'Content-Type': item[1] + '; charset=utf-8', 'Cache-Control': 'no-store'});
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch {res.writeHead(500); res.end();}
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({headless: true, ...(process.env.COLOR_BROWSER ? {channel: process.env.COLOR_BROWSER} : {})});
});
after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});
async function pageTest(action, options = {}) {
  const context = await browser.newContext(options); const page = await context.newPage();
  const errors = [], external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', req => {if (!req.url().startsWith(origin)) external.push(req.url());});
  try {await page.goto(origin); await action(page); assert.deepEqual(errors, []); assert.deepEqual(external, []);}
  finally {await context.close();}
}

test('pointer actions preserve the original pair rule and undo/redo deletion', async () => pageTest(async page => {
  assert.equal(await page.locator('.block.green').count(), 2);
  await page.locator('[data-block-id="1"]').click();
  assert.equal(await page.locator('.block.blue').count(), 1);
  await page.locator('[data-block-id="1"]').click();
  assert.equal(await page.locator('.block.blue').count(), 0);
  await page.locator('[data-block-id="1"]').click(); await page.locator('[data-block-id="2"]').click();
  assert.equal(await page.locator('.block').count(), 0);
  assert.equal(await page.locator('#empty').isVisible(), true);
  assert.match(await page.locator('#status').innerText(), /pareja azul/);
  await page.locator('#undo').click(); assert.equal(await page.locator('.block').count(), 2);
  await page.locator('#redo').click(); assert.equal(await page.locator('.block').count(), 0);
  await page.locator('#btnAdd').click(); assert.equal(await page.locator('.block.green').count(), 1);
}));

test('all-color removal, counters, reset and history branching agree with the visible board', async () => pageTest(async page => {
  await page.locator('#btnAdd').click(); await page.locator('[data-block-id="1"]').click();
  assert.equal(await page.locator('#counts').innerText(), '3 bloques · 2 verdes · 1 azul');
  await page.locator('#btnRemoveG').click();
  assert.equal(await page.locator('.block.green').count(), 0); assert.equal(await page.locator('.block.blue').count(), 1);
  assert.equal(await page.locator('#btnRemoveG').isDisabled(), true);
  await page.locator('#btnRemoveB').click(); assert.equal(await page.locator('.block').count(), 0);
  await page.locator('#reset').click(); assert.equal(await page.locator('.block.green').count(), 2);
  await page.locator('#undo').click(); assert.equal(await page.locator('.block').count(), 0);
  await page.locator('#btnAdd').click(); assert.equal(await page.locator('#redo').isDisabled(), true);
  await page.reload(); assert.equal(await page.locator('.block.green').count(), 2);
}));

test('keyboard Space/Enter works, preserving focus after surviving and removed blocks', async () => pageTest(async page => {
  const first = page.locator('[data-block-id="1"]');
  await first.focus(); await page.keyboard.press('Space');
  assert.equal(await first.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.blockId), '1');
  await page.keyboard.press('Enter'); assert.equal(await first.getAttribute('aria-pressed'), 'false');
  await page.keyboard.press('Space'); await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
  assert.equal(await page.locator('.block').count(), 0);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'btnAdd');
  await page.locator('#undo').focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('.block').count(), 2);
}));

test('cap stays responsive, controls remain usable and no horizontal overflow at mobile widths', async () => pageTest(async page => {
  await page.evaluate(() => {for (let i = 0; i < 210; i++) document.getElementById('btnAdd').click();});
  assert.equal(await page.locator('.block').count(), 200);
  assert.equal(await page.locator('#btnAdd').isDisabled(), true);
  await page.locator('#btnRemoveG').click(); assert.equal(await page.locator('.block').count(), 0);
  await page.locator('#undo').click(); assert.equal(await page.locator('.block').count(), 200);
  await page.locator('#reset').click();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({width, height: 900});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const controls = await page.locator('button:visible').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().height));
    assert(controls.every(height => height >= 44));
    if (process.env.COLOR_SCREENSHOTS) await page.screenshot({path: path.join(process.env.COLOR_SCREENSHOTS, `board-${width}.png`), fullPage: true});
  }
}, {reducedMotion: 'reduce'}));

test('static files also run without HTTP through a local file URL', async () => {
  const {pathToFileURL} = require('node:url');
  const page = await browser.newPage();
  try {
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.locator('#btnAdd').click(); assert.equal(await page.locator('.block').count(), 3);
  } finally {await page.close();}
});
