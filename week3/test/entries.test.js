const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { createApp } = require('../server');

// spec.md의 규칙 하나 = 테스트 하나
// 테스트마다 빈 임시 파일과 멈춰 있는 시계를 씁니다. (진짜 data/entries.json은 건드리지 않음)

let dataFile;
let currentTime;
let app;

function makeApp() {
  return createApp({ dataFile, now: () => currentTime });
}

function createEntry(body = {}) {
  return request(app)
    .post('/entries')
    .send({ name: '이승우', content: '안녕하세요', password: '0123', ...body });
}

beforeEach(() => {
  dataFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'guestbook-')), 'entries.json');
  currentTime = Date.parse('2026-11-21T12:00:00.000Z');
  app = makeApp();
});

describe('4.1. 글 작성', () => {
  test('글을 쓰면 201과 글 정보, 비밀번호는 응답에 없음', async () => {
    const res = await createEntry({ name: '  이승우  ', content: '  방명록 남기고 갑니다!  ' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      name: '이승우', // 앞뒤 공백 제거
      content: '방명록 남기고 갑니다!',
      createdAt: '2026-11-21T12:00:00.000Z',
      updatedAt: '2026-11-21T12:00:00.000Z',
    });
  });

  test.each([
    ['이름이 없음', { name: undefined }],
    ['이름이 공백뿐', { name: '   ' }],
    ['이름이 21자', { name: '가'.repeat(21) }],
    ['이름이 문자열이 아님', { name: 123 }],
    ['내용이 공백뿐', { content: '  ' }],
    ['내용이 501자', { content: '가'.repeat(501) }],
    ['비밀번호가 세 자리', { password: '123' }],
    ['비밀번호가 다섯 자리', { password: '12345' }],
    ['비밀번호에 문자', { password: '12a4' }],
    ['비밀번호에 공백', { password: ' 1234' }],
    ['비밀번호가 숫자 타입', { password: 1234 }],
  ])('%s → 400', async (_, body) => {
    const res = await createEntry(body);

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
  });

  test('이름 20자, 내용 500자, 0으로 시작하는 비밀번호는 허용', async () => {
    const res = await createEntry({ name: '가'.repeat(20), content: '가'.repeat(500), password: '0000' });

    expect(res.status).toBe(201);
  });

  test('JSON 형식이 깨지면 400', async () => {
    const res = await request(app).post('/entries').set('Content-Type', 'application/json').send('{ "name": ');

    expect(res.status).toBe(400);
  });
});

describe('4.2. 글 목록 조회', () => {
  test('글이 없으면 200과 빈 배열', async () => {
    const res = await request(app).get('/entries');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('sort 생략과 newest는 최신순, oldest는 오래된순', async () => {
    await createEntry({ content: '첫 번째' });
    currentTime += 1000;
    await createEntry({ content: '두 번째' });

    const contents = (res) => res.body.map((entry) => entry.content);
    expect(contents(await request(app).get('/entries'))).toEqual(['두 번째', '첫 번째']);
    expect(contents(await request(app).get('/entries?sort=newest'))).toEqual(['두 번째', '첫 번째']);
    expect(contents(await request(app).get('/entries?sort=oldest'))).toEqual(['첫 번째', '두 번째']);
  });

  test('목록에도 비밀번호 해시는 없음', async () => {
    await createEntry();

    const res = await request(app).get('/entries');

    expect(Object.keys(res.body[0]).sort()).toEqual(['content', 'createdAt', 'id', 'name', 'updatedAt']);
  });

  test('잘못된 sort → 400', async () => {
    const res = await request(app).get('/entries?sort=popular');

    expect(res.status).toBe(400);
  });
});

describe('4.3. 글 수정', () => {
  test('이름만 보내면 이름만 바뀌고 updatedAt 갱신', async () => {
    await createEntry();
    currentTime += 5000;

    const res = await request(app).patch('/entries/1').send({ name: '승우', password: '0123' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: '승우',
      content: '안녕하세요',
      createdAt: '2026-11-21T12:00:00.000Z',
      updatedAt: '2026-11-21T12:00:05.000Z',
    });
  });

  test('이름과 내용 둘 다 없으면 400', async () => {
    await createEntry();

    const res = await request(app).patch('/entries/1').send({ password: '0123' });

    expect(res.status).toBe(400);
  });

  test('수정하는 내용도 입력 규칙 적용 → 400', async () => {
    await createEntry();

    const res = await request(app).patch('/entries/1').send({ content: '   ', password: '0123' });

    expect(res.status).toBe(400);
  });

  test.each(['abc', '0', '-1', '1.5', '01'])('글 번호가 %s → 400', async (id) => {
    await createEntry();

    const res = await request(app).patch(`/entries/${id}`).send({ content: '수정', password: '0123' });

    expect(res.status).toBe(400);
  });

  test('비밀번호가 틀리면 403, 글은 그대로', async () => {
    await createEntry();

    const res = await request(app).patch('/entries/1').send({ content: '수정', password: '9999' });
    const list = await request(app).get('/entries');

    expect(res.status).toBe(403);
    expect(list.body[0].content).toBe('안녕하세요');
  });

  test('없는 글 → 404', async () => {
    const res = await request(app).patch('/entries/999').send({ content: '수정', password: '0123' });

    expect(res.status).toBe(404);
  });
});

describe('4.4. 글 삭제', () => {
  test('삭제하면 204, 목록에서 빠지고 이후 수정·삭제는 404', async () => {
    await createEntry();

    const res = await request(app).delete('/entries/1').send({ password: '0123' });

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    expect((await request(app).get('/entries')).body).toEqual([]);
    expect((await request(app).delete('/entries/1').send({ password: '0123' })).status).toBe(404);
    expect((await request(app).patch('/entries/1').send({ content: '수정', password: '0123' })).status).toBe(404);
  });

  test('비밀번호가 없으면 400', async () => {
    await createEntry();

    const res = await request(app).delete('/entries/1').send({});

    expect(res.status).toBe(400);
  });

  test('비밀번호가 틀리면 403', async () => {
    await createEntry();

    const res = await request(app).delete('/entries/1').send({ password: '9999' });

    expect(res.status).toBe(403);
  });
});

describe('6. 비밀번호 확인 요청 횟수 제한', () => {
  test('1분 안에 6번째 요청은 429와 Retry-After, 맞는 비밀번호여도 수행하지 않음', async () => {
    await createEntry();

    // 수정과 삭제가 횟수를 함께 씀 (틀린 비밀번호 3번 + 맞는 비밀번호 수정 2번)
    for (let i = 0; i < 3; i += 1) {
      expect((await request(app).delete('/entries/1').send({ password: '9999' })).status).toBe(403);
    }
    expect((await request(app).patch('/entries/1').send({ content: '수정1', password: '0123' })).status).toBe(200);
    expect((await request(app).patch('/entries/1').send({ content: '수정2', password: '0123' })).status).toBe(200);

    currentTime += 20 * 1000; // 첫 요청부터 20초 뒤
    const res = await request(app).delete('/entries/1').send({ password: '0123' });

    expect(res.status).toBe(429);
    expect(res.headers['retry-after']).toBe('40');
    expect((await request(app).get('/entries')).body).toHaveLength(1); // 삭제되지 않음
  });

  test('차단 중에 더 보내도 대기 시간이 늘지 않고, 1분이 지나면 초기화', async () => {
    await createEntry();
    for (let i = 0; i < 5; i += 1) {
      await request(app).delete('/entries/1').send({ password: '9999' });
    }

    currentTime += 30 * 1000;
    await request(app).delete('/entries/1').send({ password: '9999' });
    currentTime += 20 * 1000;
    const blocked = await request(app).delete('/entries/1').send({ password: '9999' });
    expect(blocked.status).toBe(429);
    expect(blocked.headers['retry-after']).toBe('10');

    currentTime += 10 * 1000; // 첫 요청부터 정확히 1분
    const res = await request(app).delete('/entries/1').send({ password: '0123' });
    expect(res.status).toBe(204);
  });

  test('제한은 글마다 따로 셈', async () => {
    await createEntry();
    await createEntry();
    for (let i = 0; i < 5; i += 1) {
      await request(app).delete('/entries/1').send({ password: '9999' });
    }

    expect((await request(app).delete('/entries/1').send({ password: '9999' })).status).toBe(429);
    expect((await request(app).delete('/entries/2').send({ password: '9999' })).status).toBe(403);
  });

  test('입력 규칙 위반(400)과 없는 글(404)은 횟수에 넣지 않음', async () => {
    await createEntry();
    for (let i = 0; i < 10; i += 1) {
      await request(app).delete('/entries/1').send({ password: '12' });
    }

    expect((await request(app).delete('/entries/1').send({ password: '9999' })).status).toBe(403);
  });
});

describe('7. 저장 (JSON 파일)', () => {
  test('서버를 다시 만들어도 글이 남아 있고, 지운 글 번호는 다시 쓰지 않음', async () => {
    await createEntry({ content: '첫 번째' });
    await createEntry({ content: '두 번째' });
    await request(app).delete('/entries/2').send({ password: '0123' });

    app = makeApp(); // 서버 재시작
    const list = await request(app).get('/entries');
    const created = await createEntry({ content: '세 번째' });

    expect(list.body.map((entry) => entry.content)).toEqual(['첫 번째']);
    expect(created.body.id).toBe(3);
  });

  test('파일에는 비밀번호 평문이 아니라 해시가 저장됨', async () => {
    await createEntry({ password: '0123' });

    const saved = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    expect(saved.entries[0].passwordHash).toEqual(expect.any(String));
    expect(saved.entries[0].passwordHash).not.toContain('0123');
    expect(JSON.stringify(saved)).not.toContain('"password"');
  });
});

describe('화면과 기타 경로', () => {
  test.each(['/', '/styles.css', '/app.js'])('%s 화면 파일을 내려줌', async (url) => {
    const res = await request(app).get(url);

    expect(res.status).toBe(200);
  });

  test('명세에 없는 경로 → 404', async () => {
    const res = await request(app).get('/posts');

    expect(res.status).toBe(404);
  });
});
