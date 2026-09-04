const test = require("node:test");
const assert = require("node:assert/strict");

const load = () => import("../../src/helpers/translationTrigger.js");

test("detects a bare 请翻译 instruction", async () => {
  const { detectTranslationRequest } = await load();
  assert.deepEqual(detectTranslationRequest("请翻译，我们可以先跟客户确认数量"), {
    requested: true,
    targetLanguage: null,
  });
});

test("detects 请翻译成 with a known target language", async () => {
  const { detectTranslationRequest } = await load();
  assert.deepEqual(detectTranslationRequest("请翻译成德文，我们明天给你确认"), {
    requested: true,
    targetLanguage: "de",
  });
});

test("detects 帮我翻译 with an English target", async () => {
  const { detectTranslationRequest } = await load();
  assert.deepEqual(detectTranslationRequest("帮我翻译成英文，下午三点"), {
    requested: true,
    targetLanguage: "en",
  });
});

test("does not treat dictated content mentioning 翻译 as an instruction", async () => {
  const { detectTranslationRequest } = await load();
  assert.deepEqual(detectTranslationRequest("我明天要翻译这份文件给客户"), {
    requested: false,
    targetLanguage: null,
  });
});

test("returns no request for ordinary dictation", async () => {
  const { detectTranslationRequest } = await load();
  assert.deepEqual(detectTranslationRequest("I think we should discuss the price"), {
    requested: false,
    targetLanguage: null,
  });
});

test("stripTranslationInstruction removes the leading instruction and separator", async () => {
  const { stripTranslationInstruction } = await load();
  assert.equal(
    stripTranslationInstruction("请翻译，我们可以先跟客户确认数量"),
    "我们可以先跟客户确认数量"
  );
});

test("stripTranslationInstruction removes the instruction and its target language", async () => {
  const { stripTranslationInstruction } = await load();
  assert.equal(
    stripTranslationInstruction("请翻译成德文，我们明天给你确认"),
    "我们明天给你确认"
  );
});

test("stripTranslationInstruction is a no-op without an instruction", async () => {
  const { stripTranslationInstruction } = await load();
  assert.equal(
    stripTranslationInstruction("I think we should discuss the price first"),
    "I think we should discuss the price first"
  );
});

test("stripTranslationInstruction handles no trailing punctuation", async () => {
  const { stripTranslationInstruction } = await load();
  assert.equal(stripTranslationInstruction("请翻译成英文我们明天确认"), "我们明天确认");
});
