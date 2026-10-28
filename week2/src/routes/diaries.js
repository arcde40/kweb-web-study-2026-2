const express = require("express");
const store = require("../diaries/store");
const { normalizeDiaryInput, validateDiaryInput } = require("../diaries/validation");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(store.listDiaries());
});

router.get("/:id", (req, res) => {
  const diary = store.findDiary(req.params.id);
  if (!diary) {
    return res.status(404).json({ error: "일기를 찾을 수 없습니다." });
  }

  return res.json(diary);
});

router.post("/", (req, res) => {
  const validationError = validateDiaryInput(req.body, { includeDate: true });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const input = normalizeDiaryInput(req.body);
  if (store.findDiaryByDate(input.date)) {
    return res.status(409).json({ error: "선택한 날짜에는 이미 작성한 일기가 있습니다." });
  }

  return res.status(201).json(store.createDiary(input));
});

router.put("/:id", (req, res) => {
  const validationError = validateDiaryInput(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const updatedDiary = store.updateDiary(
    req.params.id,
    normalizeDiaryInput(req.body),
  );
  if (!updatedDiary) {
    return res.status(404).json({ error: "일기를 찾을 수 없습니다." });
  }

  return res.json(updatedDiary);
});

router.delete("/:id", (req, res) => {
  if (!store.deleteDiary(req.params.id)) {
    return res.status(404).json({ error: "일기를 찾을 수 없습니다." });
  }

  return res.status(204).end();
});

module.exports = router;
