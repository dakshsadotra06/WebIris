// REASON — ask Gemini for the single next action as strict JSON.
const { z } = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ActionSchema = z.object({
  action: z.enum(['click', 'fill', 'select', 'scroll', 'navigate', 'wait', 'press', 'complete', 'fail']),
  targetRef: z.string().nullable().default(null),
  value: z.string().nullable().default(null),
  reasoning: z.string(),
});

const PARSE_FAIL = {
  action: 'fail',
  targetRef: null,
  value: null,
  reasoning: 'AI output parse failed',
};

// Model fallback chain: overloaded (503) ya retired (404) model aaye
// toh automatically agla try karo. Manual swapping ki zaroorat nahi.
const MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
];

async function generateWithFallback(parts) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  let lastError = null;
  for (const modelName of MODELS) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    });
    for (let i = 0; i < 3; i++) {
      try {
        return await model.generateContent(parts);
      } catch (e) {
        lastError = e;
        const msg = e.message || String(e);
        if (msg.includes('404')) break; // model retired -> agla model turant
        const retryable = msg.includes('503') || msg.includes('429') || /overloaded|high demand/i.test(msg);
        if (!retryable) throw e;
        if (i < 2) await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, i)));
      }
    }
    // ye model busy raha -> agla try karo
  }
  throw lastError;
}

async function decideAction({ goal, url, elements, shotBase64 }) {
  try {
    const prompt = `You are WebIris, an AI browser agent. Decide the SINGLE next browser action to make progress toward the user's goal.

User goal: ${goal}
Current page URL: ${url}

Interactive elements currently visible (target them via "ref"):
${JSON.stringify(elements, null, 1)}

Rules:
- Reply with ONLY a JSON object: {"action": "click"|"fill"|"select"|"scroll"|"navigate"|"wait"|"complete"|"fail", "targetRef": string|null, "value": string|null, "reasoning": string}
- "click": click the element with targetRef.
- "fill": type value into the input/textarea with targetRef.
- "select": choose the option with value in the select element with targetRef.
- "scroll": scroll the page down (targetRef must be null).
- "navigate": go to the URL in value (targetRef must be null).
- "wait": wait briefly for the page to settle (targetRef must be null).
- "press": press a keyboard key (value like "Enter"); use this right after "fill" on a search box to submit the search (targetRef must be null).
- If the goal is fully achieved, reply with action "complete".
- If the goal is impossible from this page, reply with action "fail" and explain why in reasoning.
- Prefer the smallest useful next step. Do not repeat an action that already succeeded.`;

    const result = await generateWithFallback([
      { text: prompt },
      { inlineData: { mimeType: 'image/png', data: shotBase64 } },
    ]);

    const parsed = ActionSchema.safeParse(JSON.parse(result.response.text()));
    if (!parsed.success) return PARSE_FAIL;
    return parsed.data;
  } catch (e) {
    return { ...PARSE_FAIL, reasoning: 'AI call failed: ' + (e.message || String(e)) };
  }
}

module.exports = { decideAction, ActionSchema };
