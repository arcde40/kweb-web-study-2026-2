const express = require('express');
const postsRouter = require('./routes/posts');

const app = express();

app.use(express.json());
app.use('/posts', postsRouter);

// 명세에 없는 경로
app.use((req, res) => {
  res.status(404).json({ error: '없는 경로입니다' });
});

// 에러 처리 미들웨어: 맨 마지막에, 서버 내부 정보는 사용자에게 보내지 않기
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: '요청 형식이 잘못되었습니다' });
  }
  console.error(err);
  res.status(500).json({ error: '서버 오류' });
});

// 테스트에서 쓸 수 있게 app만 내보내고, 실제 실행은 server.js에서
module.exports = app;
