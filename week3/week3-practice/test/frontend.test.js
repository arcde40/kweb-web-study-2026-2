const express = require('express');
const request = require('supertest');
const app = require('../src/app');
const { fetchPosts } = require('../public/api');

// 화면이 쓰는 api.js를 진짜 서버에 연결해서 확인합니다

let server;
let baseUrl;

// 테스트 전에 빈 포트(0)로 서버를 켜고, 끝나면 끄기
beforeAll((done) => {
  server = app.listen(0, () => {
    baseUrl = `http://localhost:${server.address().port}`;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

test('서버가 화면(index.html)을 내려준다', async () => {
  const res = await request(app).get('/');

  expect(res.status).toBe(200);
  expect(res.text).toContain('<div id="root"></div>');
  expect(res.text).toContain('src="/api.js"');
});

test('서버가 api.js를 내려준다', async () => {
  const res = await request(app).get('/api.js');

  expect(res.status).toBe(200);
  expect(res.text).toContain('fetchPosts');
});

test('글이 없으면 fetchPosts는 빈 배열', async () => {
  const posts = await fetchPosts(baseUrl);

  expect(posts).toEqual([]);
});

test('쓴 글을 fetchPosts로 받아오고, 화면이 쓰는 필드가 들어 있다', async () => {
  await request(app).post('/posts').send({ author: '영민', content: '안녕!' });

  const posts = await fetchPosts(baseUrl);

  // 화면은 id(key), author, content를 씁니다
  expect(posts).toHaveLength(1);
  expect(posts[0]).toEqual({ id: expect.any(Number), author: '영민', content: '안녕!' });
});

test('서버가 실패하면 fetchPosts는 에러를 던진다', async () => {
  // 항상 500을 주는 가짜 서버
  const broken = express();
  broken.get('/posts', (req, res) => res.status(500).json({ error: '서버 오류' }));
  const brokenServer = broken.listen(0);
  const brokenUrl = `http://localhost:${brokenServer.address().port}`;

  try {
    await expect(fetchPosts(brokenUrl)).rejects.toThrow('서버 응답 500');
  } finally {
    brokenServer.close();
  }
});
