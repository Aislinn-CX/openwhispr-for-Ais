// Natural-language translation trigger for dictation. Detects and strips a
// leading "请翻译[成X]" instruction so the rest of the transcript is translated
// instead of the instruction itself. Pure and node-testable — no imports.

const TARGET_LANGUAGE_MAP = {
  中文: "zh",
  汉语: "zh",
  英文: "en",
  英语: "en",
  德文: "de",
  德语: "de",
  法文: "fr",
  法语: "fr",
  日文: "ja",
  日语: "ja",
  韩文: "ko",
  韩语: "ko",
  俄文: "ru",
  俄语: "ru",
  西班牙文: "es",
  西班牙语: "es",
};

// Anchored on "请/帮我/麻烦你翻译" so a dictated "我明天要翻译这份文件" is NOT
// treated as an instruction — only an explicit request to translate qualifies.
const TRANSLATION_REQUEST_RE = /(?:请|帮我|麻烦(?:你|您)?)\s*翻译/;

// Matches "成/为/到 <已知语言词>" immediately after the "翻译" instruction.
// Longest keys first so "西班牙文" wins over any shorter prefix.
const TARGET_LANGUAGE_RE = new RegExp(
  `(?:成|为|到)\\s*(${Object.keys(TARGET_LANGUAGE_MAP)
    .sort((a, b) => b.length - a.length)
    .join("|")})`
);

/**
 * Detect a natural-language translation instruction.
 * @returns {{ requested: boolean, targetLanguage: string | null }}
 */
export function detectTranslationRequest(text) {
  const input = String(text ?? "");
  const requestMatch = TRANSLATION_REQUEST_RE.exec(input);
  if (!requestMatch) return { requested: false, targetLanguage: null };

  const after = input.slice(requestMatch.index + requestMatch[0].length);
  const targetMatch = TARGET_LANGUAGE_RE.exec(after);
  return {
    requested: true,
    targetLanguage: targetMatch ? TARGET_LANGUAGE_MAP[targetMatch[1]] : null,
  };
}

/**
 * Remove a leading "请翻译[成X]" instruction plus any immediately-following
 * punctuation/whitespace. Idempotent; returns the input unchanged when there is
 * no instruction.
 */
export function stripTranslationInstruction(text) {
  const input = String(text ?? "");
  const requestMatch = TRANSLATION_REQUEST_RE.exec(input);
  if (!requestMatch) return input;

  let end = requestMatch.index + requestMatch[0].length;
  const after = input.slice(end);
  const targetMatch = TARGET_LANGUAGE_RE.exec(after);
  if (targetMatch) end += targetMatch.index + targetMatch[0].length;

  return input.slice(end).replace(/^[\s，。,：:、]+/, "").trim();
}
