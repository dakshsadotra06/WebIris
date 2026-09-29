// EXECUTE — perform the validated action in the browser, then let the page settle.
async function execute(page, items, action) {
  const find = (ref) => {
    const item = items.find((i) => i.ref === ref);
    return item ? item.handle : null;
  };

  switch (action.action) {
    case 'click': {
      const h = find(action.targetRef);
      if (h) await h.click();
      break;
    }
    case 'fill': {
      const h = find(action.targetRef);
      if (h) await h.fill(action.value || '');
      break;
    }
    case 'select': {
      const h = find(action.targetRef);
      if (h) await h.selectOption(action.value || '');
      break;
    }
    case 'press': {
      await page.keyboard.press(action.value || 'Enter');
      break;
    }
    case 'scroll':
      await page.evaluate(() => window.scrollBy(0, 600));
      break;
    case 'navigate':
      await page.goto(action.value, { waitUntil: 'domcontentloaded' });
      break;
    case 'wait':
      await page.waitForTimeout(1200);
      break;
    default:
      break; // complete / fail need no browser action
  }
  await page.waitForTimeout(800); // let the page settle before re-observing
}

module.exports = { execute };
