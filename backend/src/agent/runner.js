// RUNNER — the agent loop: perceive → reason → validate → execute → verify → repeat.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { perceive } = require('./perceive');
const { decideAction } = require('./reason');
const { validate } = require('./validate');
const { execute } = require('./execute');

const MAX_STEPS = 10;

async function saveStep(supabase, runId, n, reasoning, action, valid, screenshotPath) {
  await supabase.from('steps').insert({
    run_id: runId,
    n,
    reasoning,
    action,
    valid,
    screenshot_path: screenshotPath,
  });
}

async function runAgent(runId, goal, url, supabase) {
  const cdpUrl = process.env.CDP_URL;
  let browser;
  let page;
  const ownBrowser = !cdpUrl;

  if (cdpUrl) {
    // CDP mode: user's own Chrome (logins intact) — sirf naya tab kholenge.
    try {
      browser = await chromium.connectOverCDP(cdpUrl);
    } catch (e) {
      throw new Error('CDP connect fail: kya Chrome --remote-debugging-port=9222 ke saath chal raha hai? (' + e.message + ')');
    }
    const context = browser.contexts()[0];
    if (!context) throw new Error('CDP: Chrome me koi khuli window nahi mili.');
    page = await context.newPage();
    // CDP mode: window ka natural size use karo — viewport force karne se
    // page squeeze hokar dikhta hai (white strip issue)
  } else {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  }

  const shotDir = path.join(__dirname, '..', '..', 'public', 'shots', runId);
  fs.mkdirSync(shotDir, { recursive: true });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    for (let n = 1; n <= MAX_STEPS; n++) {
      // 1. PERCEIVE
      const { items, shotBase64 } = await perceive(page);
      const elements = items.map((i) => ({ ref: i.ref, desc: i.desc }));

      // 2. REASON
      const action = await decideAction({ goal, url: page.url(), elements, shotBase64 });

      // 3. VALIDATE — AI proposes, deterministic system validates
      const v = validate(action, items);
      if (!v.ok) {
        await saveStep(supabase, runId, n, 'Validator blocked: ' + v.reason, action, false, null);
        continue;
      }

      // 4. EXECUTE
      await execute(page, items, action);

      // 5. VERIFY — capture the new state as proof
      const shotPath = `/shots/${runId}/step${n}.png`;
      fs.writeFileSync(path.join(shotDir, `step${n}.png`), await page.screenshot());
      await saveStep(supabase, runId, n, action.reasoning, action, true, shotPath);

      if (action.action === 'complete' || action.action === 'fail') break;
    }

    await supabase.from('runs').update({ status: 'done' }).eq('id', runId);
  } catch (e) {
    console.error('runAgent error:', e.message);
    await supabase.from('runs').update({ status: 'failed' }).eq('id', runId);
  } finally {
    if (ownBrowser && process.env.KEEP_BROWSER_OPEN !== 'true') {
      await browser.close();
    }
    // CDP mode: tab khula rehta hai, auto-close band
  }
}

module.exports = { runAgent };
