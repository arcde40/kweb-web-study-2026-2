const test = require("node:test");
const assert = require("node:assert/strict");
const {
  characterCount,
  isValidDate,
  normalizeDiaryInput,
  validateDiaryInput,
} = require("../src/diaries/validation");

const validDiary = {
  date: "2026-10-28",
  content: "오늘의 기록",
  weather: "맑음",
  mood: "차분함",
};

test("accepts valid calendar dates and rejects invalid ones", () => {
  assert.equal(isValidDate("2024-02-29"), true);
  assert.equal(isValidDate("2025-02-29"), false);
  assert.equal(isValidDate("2026-13-01"), false);
  assert.equal(isValidDate("2026-1-01"), false);
});

test("counts Unicode code points for the 500-character limit", () => {
  assert.equal(characterCount("가".repeat(500)), 500);
  assert.equal(characterCount("😀".repeat(500)), 500);
  assert.equal(validateDiaryInput({ ...validDiary, content: "가".repeat(500) }, { includeDate: true }), null);
  assert.match(
    validateDiaryInput({ ...validDiary, content: "😀".repeat(501) }, { includeDate: true }),
    /500자/,
  );
});

test("requires content, weather, and mood", () => {
  assert.match(
    validateDiaryInput({ ...validDiary, content: "  " }, { includeDate: true }),
    /내용/,
  );
  assert.match(
    validateDiaryInput({ ...validDiary, weather: " " }, { includeDate: true }),
    /날씨/,
  );
  assert.match(
    validateDiaryInput({ ...validDiary, mood: "" }, { includeDate: true }),
    /기분/,
  );
});

test("trims user-entered diary fields before storing", () => {
  assert.deepEqual(
    normalizeDiaryInput({
      date: validDiary.date,
      content: " 기록 ",
      weather: " 맑음 ",
      mood: " 편안함 ",
    }),
    {
      date: validDiary.date,
      content: "기록",
      weather: "맑음",
      mood: "편안함",
    },
  );
});
