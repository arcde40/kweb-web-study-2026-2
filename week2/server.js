const path = require("node:path");
const express = require("express");
const diaryRoutes = require("./src/routes/diaries");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "16kb" }));
app.use("/api/diaries", diaryRoutes);
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", (req, res) => {
  res.status(404).json({ error: "요청한 API를 찾을 수 없습니다." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "요청 본문이 올바른 JSON 형식이 아닙니다." });
  }

  if (error.status === 413) {
    return res.status(413).json({ error: "요청 데이터가 너무 큽니다." });
  }

  return res.status(500).json({ error: "서버 오류가 발생했습니다." });
});

app.listen(port, () => {
  console.log(`Diary app listening on http://localhost:${port}`);
});
