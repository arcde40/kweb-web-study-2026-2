# 3주차 샘플: 방명록 API

`spec.md`의 명세를 Express로 구현한 예시입니다.

## 실행

```bash
npm install
npm start        # http://localhost:3000
```

## 확인하기

- **손으로:** `requests.http`를 열고 각 `###` 위의 **Send Request**를 누르세요. (VS Code 확장 REST Client 필요)
- **자동으로:** `npm test`

## 구조

```
src/
├── app.js            Express 앱 (미들웨어, 라우터 연결, 에러 처리)
├── server.js         서버 실행
├── routes/posts.js   /posts 경로 처리
└── store/posts.js    글 저장 (메모리)
test/
└── posts.test.js     spec.md의 각 행을 테스트로
```

서버를 껐다 켜면 글이 전부 사라집니다. 데이터를 메모리에만 들고 있기 때문이에요. 다음 주에 데이터베이스로 해결합니다.
