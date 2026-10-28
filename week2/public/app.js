const form = document.querySelector("#diary-form");
const weatherInput = document.querySelector("#weather");
const moodInput = document.querySelector("#mood");
const contentInput = document.querySelector("#content");
const dateLabel = document.querySelector("#entry-date");
const countLabel = document.querySelector("#character-count");
const formMessage = document.querySelector("#form-message");
const saveButton = document.querySelector("#save-button");
const deleteButton = document.querySelector("#delete-button");
const todayButton = document.querySelector("#today-button");
const diaryList = document.querySelector("#diary-list");
const emptyState = document.querySelector("#empty-state");
const entryTotal = document.querySelector("#entry-total");

let diaries = [];
let selectedDiary = null;
let today = getLocalDate();

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function countCharacters(value) {
  return Array.from(value).length;
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || "요청을 처리하지 못했습니다.");
  }

  return response.status === 204 ? null : response.json();
}

function showMessage(message = "") {
  formMessage.textContent = message;
}

function setSelectedDiary(diary) {
  selectedDiary = diary;
  const isEditing = Boolean(diary);
  const date = diary ? diary.date : today;

  dateLabel.textContent = formatDate(date);
  weatherInput.value = diary?.weather || "";
  moodInput.value = diary?.mood || "";
  contentInput.value = diary?.content || "";
  countLabel.textContent = `${countCharacters(contentInput.value)} / 500`;
  saveButton.textContent = isEditing ? "수정 내용 저장" : "오늘의 일기 저장";
  deleteButton.hidden = !isEditing;
  todayButton.hidden = !isEditing || diary.date === today;
  showMessage("");
  renderDiaries();
}

function renderDiaries() {
  diaryList.replaceChildren();
  emptyState.hidden = diaries.length > 0;
  entryTotal.textContent = `${diaries.length}개의 기록`;

  for (const diary of diaries) {
    const button = document.createElement("button");
    button.className = "diary-card";
    button.type = "button";
    button.classList.toggle("is-selected", selectedDiary?.id === diary.id);
    button.setAttribute("aria-label", `${formatDate(diary.date)} 일기 열기`);

    const date = document.createElement("span");
    date.className = "diary-card-date";
    date.textContent = formatDate(diary.date);

    const content = document.createElement("span");
    content.className = "diary-card-content";
    content.textContent = diary.content;

    const meta = document.createElement("span");
    meta.className = "diary-card-meta";
    meta.textContent = `${diary.weather} · ${diary.mood}`;

    button.append(date, content, meta);
    button.addEventListener("click", () => setSelectedDiary(diary));
    diaryList.append(button);
  }
}

async function loadDiaries() {
  diaries = await request("/api/diaries");
  renderDiaries();

  const todayDiary = diaries.find((diary) => diary.date === today);
  setSelectedDiary(todayDiary || null);
}

contentInput.addEventListener("input", () => {
  countLabel.textContent = `${countCharacters(contentInput.value)} / 500`;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");
  today = getLocalDate();
  if (!selectedDiary) {
    dateLabel.textContent = formatDate(today);
  }

  const payload = {
    content: contentInput.value,
    weather: weatherInput.value,
    mood: moodInput.value,
  };

  try {
    const savedDiary = selectedDiary
      ? await request(`/api/diaries/${selectedDiary.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await request("/api/diaries", {
          method: "POST",
          body: JSON.stringify({ ...payload, date: today }),
        });

    diaries = await request("/api/diaries");
    setSelectedDiary(savedDiary);
    showMessage("일기를 저장했어요.");
  } catch (error) {
    showMessage(error.message);
  }
});

todayButton.addEventListener("click", () => {
  const todayDiary = diaries.find((diary) => diary.date === today);
  setSelectedDiary(todayDiary || null);
});

deleteButton.addEventListener("click", async () => {
  if (!selectedDiary || !window.confirm("이 일기를 삭제할까요?")) {
    return;
  }

  try {
    await request(`/api/diaries/${selectedDiary.id}`, { method: "DELETE" });
    diaries = await request("/api/diaries");
    setSelectedDiary(diaries.find((diary) => diary.date === today) || null);
    showMessage("일기를 삭제했어요.");
  } catch (error) {
    showMessage(error.message);
  }
});

dateLabel.textContent = formatDate(today);
loadDiaries().catch((error) => {
  showMessage(error.message);
});
