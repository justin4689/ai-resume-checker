const { GoogleGenAI } = require('@google/genai');

const MODEL = 'gemini-2.5-flash';

let _client;
function client() {
  if (!_client) _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return _client;
}

function buildPrompt(rawText) {
  return `You are an expert ATS (Applicant Tracking System) analyst. Analyze the resume below and return ONLY a valid JSON object with exactly this structure — no markdown, no explanation:

{
  "atsScore": <integer 0-100>,
  "summary": "<2-3 sentences on overall quality>",
  "scoreBreakdown": [
    { "label": "Keywords",    "value": <0-100> },
    { "label": "Formatting",  "value": <0-100> },
    { "label": "Experience",  "value": <0-100> },
    { "label": "Education",   "value": <0-100> },
    { "label": "Skills",      "value": <0-100> }
  ],
  "issues": [
    { "title": "<issue>", "severity": "high"|"medium"|"low", "fix": "<actionable fix>" }
  ],
  "strengths": [
    { "title": "<strength>", "note": "<why it helps>" }
  ],
  "keywordsPresent": ["<keyword>"],
  "keywordsMissing": ["<keyword>"],
  "bulletRewrites": [
    {
      "section": "<section name>",
      "original": "<exact bullet text from the resume>",
      "rewritten": "<improved bullet with metrics and action verbs>",
      "rationale": "<why this version is stronger>"
    }
  ]
}

Rules:
- atsScore is the weighted average of scoreBreakdown values
- Provide 3-6 issues, 3-5 strengths, 5-10 keywords each, 4-8 bullet rewrites
- original must be an exact substring of the resume text so it can be replaced programmatically

Resume:
---
${rawText}
---`;
}

async function analyzeResume(rawText) {
  const response = await client().models.generateContent({
    model: MODEL,
    contents: buildPrompt(rawText),
    config: { responseMimeType: 'application/json' },
  });

  const raw = response.text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/,'').trim();
  const parsed = JSON.parse(raw);
  return { ...parsed, model: MODEL };
}

module.exports = { analyzeResume };
