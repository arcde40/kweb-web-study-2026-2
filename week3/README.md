# 3주차 과제: 방명록 서버

2주차에 설계한 [`spec.md`](spec.md)를 Express로 구현했습니다.
수업 시간에 한 실습은 [`week3-practice/`](week3-practice/)에 있습니다.

## 실행

```bash
npm install
npm start        # http://localhost:3000
```

## 확인하기

- **손으로:** `requests.http`를 열고 위에서부터 차례대로 Send Request (VS Code 확장 REST Client 필요)
- **자동으로:** `npm test`

## 구조

```
server.js           서버 및 API 요청 처리 (입력 규칙, 비밀번호 해시, 횟수 제한, 파일 저장)
public/
├── index.html      화면 구성
├── styles.css      화면 디자인
└── app.js          화면 동작 및 서버와의 통신
data/entries.json   글 저장 (서버가 처음 글을 쓸 때 만들고, Git에는 올리지 않음)
requests.http       spec.md의 API를 손으로 확인하는 요청 모음
test/               spec.md의 규칙을 자동으로 확인하는 테스트
```

## 명세에 없어서 정한 것

- 수정·삭제 요청은 **글 번호 → 입력 규칙 → 글 존재 → 횟수 제한 → 비밀번호** 순서로 확인합니다.
  그래서 400, 404 요청은 비밀번호 확인 횟수에 넣지 않습니다.
- 비밀번호 해시는 Node에 들어 있는 `scrypt`를 씁니다. (추가 설치 없음)
- 글자 수는 이모지도 한 글자로 셉니다.
- 지운 글 번호는 서버를 재시작해도 다시 쓰지 않습니다.
