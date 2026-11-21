// 방명록 서버: spec.md의 API를 처리합니다.
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'entries.json');

// 6. 비밀번호 확인 요청 횟수 제한: 글마다 첫 요청부터 1분 동안 5회
const LIMIT_COUNT = 5;
const LIMIT_WINDOW_MS = 60 * 1000;

// ---------- 저장 (data/entries.json) ----------
// 파일 형태: { "nextId": 3, "entries": [ ... ] }
// nextId를 따로 저장해서, 서버를 재시작해도 지운 글의 번호를 다시 쓰지 않습니다.

function loadData(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return { nextId: 1, entries: [] }; // 파일이 없으면 빈 방명록
    throw err;
  }
}

function saveData(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // 임시 파일에 다 쓴 뒤 바꿔치기: 쓰는 도중 서버가 꺼져도 원래 파일이 깨지지 않습니다.
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  fs.renameSync(tempFile, file);
}

// ---------- 비밀번호 해시 ----------
// Node에 들어 있는 scrypt(비밀번호 저장용 해시 함수)를 씁니다. 저장 형태: "salt:hash"

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, hash] = passwordHash.split(':');
  const actual = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}

// ---------- 5. 입력 규칙 ----------
// 문제가 있으면 오류 메시지를, 없으면 null을 돌려줍니다.

// 이모지처럼 두 칸을 차지하는 글자도 한 글자로 세기
function countChars(text) {
  return [...text].length;
}

function checkText(value, label, maxLength) {
  if (typeof value !== 'string') return `${label}은 문자열이어야 합니다.`;
  const length = countChars(value.trim());
  if (length < 1 || length > maxLength) return `${label}은 공백을 제외하고 1~${maxLength}자로 입력해 주세요.`;
  return null;
}

function checkPassword(value) {
  if (typeof value !== 'string' || !/^[0-9]{4}$/.test(value)) {
    return '비밀번호는 숫자 네 자리 문자열이어야 합니다.';
  }
  return null;
}

// "1", "25"처럼 1 이상의 정수만 허용 ("0", "01", "1.5", "abc"는 거절)
function parseId(text) {
  if (!/^[1-9][0-9]*$/.test(text)) return null;
  const id = Number(text);
  return Number.isSafeInteger(id) ? id : null;
}

// 응답에는 비밀번호 해시를 빼고 보냅니다.
function toResponse(entry) {
  const { id, name, content, createdAt, updatedAt } = entry;
  return { id, name, content, createdAt, updatedAt };
}

// ---------- 앱 ----------
// 테스트에서 저장 파일과 현재 시각을 바꿔 끼울 수 있게 함수로 만듭니다.

function createApp({ dataFile = DATA_FILE, now = () => Date.now() } = {}) {
  const data = loadData(dataFile);
  const attempts = new Map(); // 글 id → { firstAt, count } (서버 메모리에만 보관)

  const app = express();
  app.use(express.json());
  // 화면 파일(index.html, styles.css, app.js)은 public/에서 내보냅니다.
  app.use(express.static(path.join(__dirname, 'public')));

  function findEntry(id) {
    return data.entries.find((entry) => entry.id === id);
  }

  // 제한에 걸리면 다시 시도할 때까지 남은 초를, 아니면 0을 돌려줍니다.
  function useAttempt(id) {
    const currentTime = now();
    let record = attempts.get(id);
    if (!record || currentTime - record.firstAt >= LIMIT_WINDOW_MS) {
      record = { firstAt: currentTime, count: 0 };
      attempts.set(id, record);
    }
    if (record.count >= LIMIT_COUNT) {
      // 차단 중인 요청은 횟수를 늘리지 않으므로 대기 시간도 늘어나지 않습니다.
      return Math.ceil((record.firstAt + LIMIT_WINDOW_MS - currentTime) / 1000);
    }
    record.count += 1;
    return 0;
  }

  // 수정·삭제 공통: 글 번호 → 글 존재 → 횟수 제한 → 비밀번호 순서로 확인합니다.
  // 통과하면 글을, 실패하면 응답을 보내고 null을 돌려줍니다.
  function authorize(req, res, id, password) {
    const entry = findEntry(id);
    if (!entry) {
      res.status(404).json({ error: '해당 글이 없습니다.' });
      return null;
    }
    const retryAfter = useAttempt(id);
    if (retryAfter > 0) {
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({ error: `비밀번호 확인 요청이 너무 많습니다. ${retryAfter}초 후에 다시 시도해 주세요.` });
      return null;
    }
    if (!verifyPassword(password, entry.passwordHash)) {
      res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });
      return null;
    }
    return entry;
  }

  // 4.1. POST /entries → 201 / 입력 규칙 위반 400
  app.post('/entries', (req, res) => {
    const { name, content, password } = req.body ?? {};
    const error = checkText(name, '이름', 20) || checkText(content, '내용', 500) || checkPassword(password);
    if (error) return res.status(400).json({ error });

    const timestamp = new Date(now()).toISOString();
    const entry = {
      id: data.nextId,
      name: name.trim(),
      content: content.trim(),
      passwordHash: hashPassword(password),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    data.nextId += 1;
    data.entries.push(entry);
    saveData(dataFile, data);

    res.status(201).json(toResponse(entry));
  });

  // 4.2. GET /entries?sort=newest|oldest → 200 / 잘못된 sort 400
  app.get('/entries', (req, res) => {
    const sort = req.query.sort ?? 'newest';
    if (sort !== 'newest' && sort !== 'oldest') {
      return res.status(400).json({ error: 'sort는 newest 또는 oldest만 쓸 수 있습니다.' });
    }

    // 작성 시각이 같으면 먼저 쓴 글(id가 작은 글)을 오래된 글로 봅니다.
    const oldestFirst = [...data.entries].sort(
      (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id,
    );
    const sorted = sort === 'oldest' ? oldestFirst : oldestFirst.reverse();

    res.json(sorted.map(toResponse));
  });

  // 4.3. PATCH /entries/:id → 200 / 400, 403, 404, 429
  app.patch('/entries/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: '글 번호는 1 이상의 정수여야 합니다.' });

    const { name, content, password } = req.body ?? {};
    if (name === undefined && content === undefined) {
      return res.status(400).json({ error: '이름과 내용 중 하나 이상을 보내야 합니다.' });
    }
    const error =
      (name !== undefined && checkText(name, '이름', 20)) ||
      (content !== undefined && checkText(content, '내용', 500)) ||
      checkPassword(password);
    if (error) return res.status(400).json({ error });

    const entry = authorize(req, res, id, password);
    if (!entry) return;

    // 보내지 않은 항목은 기존 값을 유지합니다.
    if (name !== undefined) entry.name = name.trim();
    if (content !== undefined) entry.content = content.trim();
    entry.updatedAt = new Date(now()).toISOString();
    saveData(dataFile, data);

    res.json(toResponse(entry));
  });

  // 4.4. DELETE /entries/:id → 204 / 400, 403, 404, 429
  app.delete('/entries/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: '글 번호는 1 이상의 정수여야 합니다.' });

    const { password } = req.body ?? {};
    const error = checkPassword(password);
    if (error) return res.status(400).json({ error });

    const entry = authorize(req, res, id, password);
    if (!entry) return;

    data.entries = data.entries.filter((item) => item !== entry);
    attempts.delete(id);
    saveData(dataFile, data);

    res.status(204).end();
  });

  // 명세에 없는 경로
  app.use((req, res) => {
    res.status(404).json({ error: '없는 경로입니다.' });
  });

  // 에러 처리: 서버 내부 정보는 사용자에게 보내지 않습니다.
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: '요청 형식이 잘못되었습니다.' });
    }
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  });

  return app;
}

// `node server.js`로 실행했을 때만 서버를 켭니다. (테스트에서는 createApp만 가져다 씀)
if (require.main === module) {
  createApp().listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = { createApp };
