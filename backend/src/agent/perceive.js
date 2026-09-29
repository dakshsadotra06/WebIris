// PERCEIVE — collect visible interactive elements + a screenshot of the page.
const SELECTOR = 'button, a, input, select, textarea, [role="button"]';

function describe(d) {
  const label = d.text || d.placeholder || d.name || d.type || d.tag;
  return `${d.tag}${label ? ' "' + label + '"' : ''}`;
}

async function perceive(page) {
  // Serializable element info (for the AI prompt)
  const raw = await page.$$eval(SELECTOR, (els) =>
    els
      .filter((el) => el.offsetParent !== null)
      .slice(0, 60)
      .map((el, i) => ({
        ref: 'e' + i,
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        text: (el.innerText || el.value || '').trim().slice(0, 60),
        placeholder: el.getAttribute('placeholder') || '',
        name: el.getAttribute('name') || '',
      }))
  );

  // Live handles (for execution), filtered with the same visibility rule
  // so refs line up with `raw` in document order.
  const handles = await page.$$(SELECTOR);
  const items = [];
  let idx = 0;
  for (const handle of handles) {
    if (idx >= 60) break;
    const visible = await handle
      .evaluate((el) => el.offsetParent !== null)
      .catch(() => false);
    if (!visible) continue;
    items.push({ ref: 'e' + idx, handle, desc: describe(raw[idx] || { tag: 'el' }) });
    idx++;
  }

  const shot = await page.screenshot();
  return { items, shotBase64: shot.toString('base64') };
}

module.exports = { perceive };
