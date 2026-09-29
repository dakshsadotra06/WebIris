// REASON — ask Gemini for the single next action as strict JSON.
const { z } = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ActionSchema = z.object({
  action: z.enum(['click', 'fill', 'select', 'scroll', 'navigate', 'wait', 'complete', 'fail']),
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

async function decideAction({ goal, url, elements, shotBase64 }) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    });

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
- If the goal is fully achieved, reply with action "complete".
- If the goal is impossible from this page, reply with action "fail" and explain why in reasoning.
- Prefer the smallest useful next step. Do not repeat an action that already succeeded.`;

    const result = await model.generateContent([
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
