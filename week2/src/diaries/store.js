const { randomUUID } = require("node:crypto");

const diaries = new Map();

function listDiaries() {
  return [...diaries.values()].sort((first, second) => {
    const dateOrder = second.date.localeCompare(first.date);
    return dateOrder || second.updatedAt.localeCompare(first.updatedAt);
  });
}

function findDiary(id) {
  return diaries.get(id) || null;
}

function findDiaryByDate(date) {
  return listDiaries().find((diary) => diary.date === date) || null;
}

function createDiary({ date, content, weather, mood }) {
  const now = new Date().toISOString();
  const diary = {
    id: randomUUID(),
    date,
    content,
    weather,
    mood,
    createdAt: now,
    updatedAt: now,
  };

  diaries.set(diary.id, diary);
  return diary;
}

function updateDiary(id, { content, weather, mood }) {
  const diary = findDiary(id);
  if (!diary) {
    return null;
  }

  const updatedDiary = {
    ...diary,
    content,
    weather,
    mood,
    updatedAt: new Date().toISOString(),
  };
  diaries.set(id, updatedDiary);
  return updatedDiary;
}

function deleteDiary(id) {
  return diaries.delete(id);
}

module.exports = {
  createDiary,
  deleteDiary,
  findDiary,
  findDiaryByDate,
  listDiaries,
  updateDiary,
};
