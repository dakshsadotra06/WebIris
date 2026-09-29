// VALIDATE — the AI proposes, the deterministic system disposes.
// An action only executes if its target exists on the CURRENT page state.
const ALLOWED = ['click', 'fill', 'select', 'scroll', 'navigate', 'wait', 'complete', 'fail'];
const NEEDS_TARGET = ['click', 'fill', 'select'];
const NEEDS_VALUE = ['fill', 'select'];

function validate(action, items) {
  if (!action || !ALLOWED.includes(action.action)) {
    return { ok: false, reason: 'unknown action: ' + (action && action.action) };
  }
  const refs = new Set(items.map((i) => i.ref));
  if (NEEDS_TARGET.includes(action.action) && !refs.has(action.targetRef)) {
    return { ok: false, reason: `target ${action.targetRef} not found on current page` };
  }
  if (NEEDS_VALUE.includes(action.action) && !action.value) {
    return { ok: false, reason: `${action.action} requires a value` };
  }
  if (action.action === 'navigate' && !action.value) {
    return { ok: false, reason: 'navigate requires a URL value' };
  }
  return { ok: true, reason: 'ok' };
}

module.exports = { validate };
