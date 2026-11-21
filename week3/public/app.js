// 화면 동작과 서버 통신

const writeForm = document.getElementById('write-form');
const sortSelect = document.getElementById('sort');
const entryList = document.getElementById('entries');
const message = document.getElementById('message');

// 서버에 요청을 보내고, 실패하면 서버가 보낸 오류 메시지로 에러를 던집니다.
async function request(method, url, body) {
  const options = { method };
  if (body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  if (res.status === 204) return null; // 삭제 성공은 본문이 없음

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `요청에 실패했습니다. (${res.status})`);
  return data;
}

function showMessage(text) {
  message.textContent = text;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ko-KR');
}

// ---------- 목록 ----------

async function loadEntries() {
  try {
    const entries = await request('GET', `/entries?sort=${sortSelect.value}`);
    renderEntries(entries);
  } catch (err) {
    showMessage(err.message);
  }
}

function renderEntries(entries) {
  entryList.replaceChildren();

  if (entries.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = '아직 글이 없습니다. 첫 글을 남겨 보세요!';
    entryList.append(empty);
    return;
  }

  for (const entry of entries) {
    entryList.append(createEntryItem(entry));
  }
}

// 글 하나를 그립니다. 사용자가 쓴 글은 textContent로 넣어서 HTML로 해석되지 않게 합니다.
function createEntryItem(entry) {
  const item = document.createElement('li');
  item.className = 'card';

  const header = document.createElement('div');
  const name = document.createElement('span');
  name.className = 'entry-name';
  name.textContent = entry.name;
  const date = document.createElement('span');
  date.className = 'entry-date';
  date.textContent = formatDate(entry.createdAt) + (entry.updatedAt !== entry.createdAt ? ' (수정됨)' : '');
  header.append(name, date);

  const content = document.createElement('p');
  content.className = 'entry-content';
  content.textContent = entry.content;

  const actions = document.createElement('div');
  actions.className = 'entry-actions';
  const editButton = document.createElement('button');
  editButton.textContent = '수정';
  editButton.addEventListener('click', () => toggleEditForm(item, entry));
  const deleteButton = document.createElement('button');
  deleteButton.textContent = '삭제';
  deleteButton.addEventListener('click', () => deleteEntry(entry));
  actions.append(editButton, deleteButton);

  item.append(header, content, actions);
  return item;
}

// ---------- 작성 ----------

writeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(writeForm);

  try {
    await request('POST', '/entries', {
      name: form.get('name'),
      content: form.get('content'),
      password: form.get('password'),
    });
    writeForm.reset();
    showMessage('');
    await loadEntries();
  } catch (err) {
    showMessage(err.message);
  }
});

// ---------- 수정 ----------

// 수정 버튼을 누르면 글 아래에 수정 폼을 열고, 다시 누르면 닫습니다.
function toggleEditForm(item, entry) {
  const opened = item.querySelector('.edit-form');
  if (opened) {
    opened.remove();
    return;
  }

  const form = document.createElement('form');
  form.className = 'edit-form';

  const nameInput = document.createElement('input');
  nameInput.value = entry.name;
  nameInput.maxLength = 20;
  const contentInput = document.createElement('textarea');
  contentInput.value = entry.content;
  contentInput.maxLength = 500;
  contentInput.rows = 3;
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = '작성할 때 정한 비밀번호';
  passwordInput.inputMode = 'numeric';
  passwordInput.maxLength = 4;
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.textContent = '저장';

  form.append(nameInput, contentInput, passwordInput, saveButton);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('PATCH', `/entries/${entry.id}`, {
        name: nameInput.value,
        content: contentInput.value,
        password: passwordInput.value,
      });
      showMessage('');
      await loadEntries();
    } catch (err) {
      showMessage(err.message);
    }
  });

  item.append(form);
  nameInput.focus();
}

// ---------- 삭제 ----------

async function deleteEntry(entry) {
  const password = prompt(`'${entry.name}'님의 글을 삭제하려면 비밀번호를 입력하세요.`);
  if (password === null) return; // 취소

  try {
    await request('DELETE', `/entries/${entry.id}`, { password });
    showMessage('');
    await loadEntries();
  } catch (err) {
    showMessage(err.message);
  }
}

// ---------- 시작 ----------

sortSelect.addEventListener('change', loadEntries);
loadEntries();
