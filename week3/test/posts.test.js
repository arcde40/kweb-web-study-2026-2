const request = require('supertest');
const app = require('../src/app');

// spec.md의 각 행 = 입력 + 기대 결과 = 테스트 한 개

test('글 목록을 달라고 하면 200', async () => {
  const res = await request(app).get('/posts');      // 입력

  expect(res.status).toBe(200);                       // 기대 결과
});

test('글을 쓰면 201', async () => {
  const res = await request(app).post('/posts').send({ author: '영민', content: '안녕!' });

  expect(res.status).toBe(201);
});

test('빈 글을 쓰면 400', async () => {
  const res = await request(app).post('/posts').send({ author: '영민', content: '' });

  expect(res.status).toBe(400);
});

test('있는 글을 지우면 204', async () => {
  const created = await request(app).post('/posts').send({ author: '영민', content: '곧 지울 글' });
  const res = await request(app).delete(`/posts/${created.body.id}`);

  expect(res.status).toBe(204);
});

test('없는 글을 지우면 404', async () => {
  const res = await request(app).delete('/posts/999');

  expect(res.status).toBe(404);
});
