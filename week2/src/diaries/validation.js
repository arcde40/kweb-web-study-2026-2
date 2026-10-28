const MAX_CONTENT_LENGTH = 500;

function isValidDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

function characterCount(value) {
  return Array.from(value).length;
}

function validateDiaryInput(input, { includeDate = false } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return "일기 정보가 올바르지 않습니다.";
  }

  if (includeDate && !isValidDate(input.date)) {
    return "일기 날짜가 올바르지 않습니다.";
  }

  if (typeof input.content !== "string" || !input.content.trim()) {
    return "일기 내용을 입력해 주세요.";
  }

  if (characterCount(input.content) > MAX_CONTENT_LENGTH) {
    return "일기 내용은 500자 이내로 작성해 주세요.";
  }

  if (typeof input.weather !== "string" || !input.weather.trim()) {
    return "오늘의 날씨를 입력해 주세요.";
  }

  if (typeof input.mood !== "string" || !input.mood.trim()) {
    return "오늘의 기분을 입력해 주세요.";
  }

  return null;
}

function normalizeDiaryInput(input) {
  return {
    date: input.date,
    content: input.content.trim(),
    weather: input.weather.trim(),
    mood: input.mood.trim(),
  };
}

module.exports = {
  MAX_CONTENT_LENGTH,
  characterCount,
  isValidDate,
  normalizeDiaryInput,
  validateDiaryInput,
};
