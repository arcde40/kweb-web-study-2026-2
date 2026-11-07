# 방명록 서비스 API 명세

## 1. 개요

누구나 회원가입 없이 이름과 메시지를 남길 수 있는 간단한 방명록 서비스입니다.
작성자는 글을 쓸 때 정한 **비밀번호**로 자신의 글을 수정·삭제할 수 있고,
**관리자**는 모든 글을 관리(숨김·삭제)할 수 있습니다.

### 1.1 주요 기능

| 기능 | 설명 | 권한 |
|---|---|---|
| 방명록 목록 조회 | 최신순으로 페이지 단위 조회 | 누구나 |
| 방명록 단건 조회 | 특정 글 조회 | 누구나 |
| 방명록 작성 | 이름, 비밀번호, 내용 입력 | 누구나 |
| 방명록 수정 | 내용 수정 (비밀번호 확인) | 작성자 |
| 방명록 삭제 | 글 삭제 (비밀번호 확인) | 작성자, 관리자 |
| 비밀글 | 작성자·관리자만 내용 열람 가능 | 작성자 |
| 글 숨김 | 부적절한 글을 목록에서 숨김 | 관리자 |

### 1.2 공통 사항

- Base URL: `/api/v1`
- 요청/응답 형식: `application/json; charset=utf-8`
- 시간 형식: ISO 8601, UTC (예: `2026-11-07T09:30:00Z`)
- ID: 서버가 발급하는 양의 정수 (`int64`)
- 문자 수는 유니코드 문자(코드 포인트) 기준으로 계산합니다.

---

## 2. 데이터 모델

### 2.1 Entry (방명록 글)

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | integer | 글 ID |
| `author` | string | 작성자 이름 (1~20자) |
| `content` | string \| null | 내용 (1~500자). 비밀글을 권한 없이 조회하면 `null` |
| `isSecret` | boolean | 비밀글 여부 |
| `isHidden` | boolean | 관리자에 의해 숨김 처리되었는지 여부 (관리자 응답에만 포함) |
| `createdAt` | string | 작성 시각 |
| `updatedAt` | string | 마지막 수정 시각 (수정 이력이 없으면 `createdAt`과 동일) |

> 비밀번호는 저장 시 bcrypt 등 단방향 해시로 저장하며, **어떤 응답에도 포함하지 않습니다.**

### 2.2 입력 검증 규칙

| 필드 | 규칙 |
|---|---|
| `author` | 필수, 앞뒤 공백 제거 후 1~20자 |
| `password` | 필수, 4~20자 |
| `content` | 필수, 앞뒤 공백 제거 후 1~500자 |
| `isSecret` | 선택, 기본값 `false` |

- HTML 태그는 저장 시 그대로 보관하되, 클라이언트는 반드시 이스케이프하여 렌더링합니다(XSS 방지).

---

## 3. API 목록

| Method | Path | 설명 |
|---|---|---|
| GET | `/entries` | 목록 조회 |
| GET | `/entries/{id}` | 단건 조회 |
| POST | `/entries` | 작성 |
| PATCH | `/entries/{id}` | 수정 |
| DELETE | `/entries/{id}` | 삭제 |
| POST | `/entries/{id}/verify` | 비밀번호 확인 (비밀글 열람·수정 화면 진입용) |
| POST | `/admin/login` | 관리자 로그인 |
| PATCH | `/admin/entries/{id}` | 글 숨김/숨김 해제 |
| DELETE | `/admin/entries/{id}` | 글 강제 삭제 |

---

## 4. API 상세

### 4.1 방명록 목록 조회

```
GET /api/v1/entries?page=1&size=20
```

**Query Parameters**

| 이름 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `page` | integer | N | 1 | 페이지 번호 (1부터 시작) |
| `size` | integer | N | 20 | 페이지 크기 (1~50) |

- 정렬: `createdAt` 내림차순(최신순)
- 숨김 처리된 글은 일반 목록에서 제외됩니다.
- 비밀글은 목록에 노출되지만 `content`는 `null`입니다.

**Response `200 OK`**

```json
{
  "items": [
    {
      "id": 42,
      "author": "홍길동",
      "content": "좋은 하루 되세요!",
      "isSecret": false,
      "createdAt": "2026-11-07T09:30:00Z",
      "updatedAt": "2026-11-07T09:30:00Z"
    },
    {
      "id": 41,
      "author": "김철수",
      "content": null,
      "isSecret": true,
      "createdAt": "2026-11-07T08:12:00Z",
      "updatedAt": "2026-11-07T08:12:00Z"
    }
  ],
  "page": 1,
  "size": 20,
  "totalCount": 42,
  "totalPages": 3
}
```

**Errors**

| 상태 | 코드 | 상황 |
|---|---|---|
| 400 | `INVALID_PARAMETER` | `page`, `size`가 범위를 벗어남 |

---

### 4.2 방명록 단건 조회

```
GET /api/v1/entries/{id}
```

- 비밀글이면 `content`는 `null`로 응답합니다. 내용을 보려면 4.6 비밀번호 확인 API를 사용합니다.
- 숨김 처리된 글은 `404`로 응답합니다.

**Response `200 OK`**

```json
{
  "id": 42,
  "author": "홍길동",
  "content": "좋은 하루 되세요!",
  "isSecret": false,
  "createdAt": "2026-11-07T09:30:00Z",
  "updatedAt": "2026-11-07T09:30:00Z"
}
```

**Errors**

| 상태 | 코드 | 상황 |
|---|---|---|
| 404 | `ENTRY_NOT_FOUND` | 글이 없거나 숨김 처리됨 |

---

### 4.3 방명록 작성

```
POST /api/v1/entries
```

**Request Body**

```json
{
  "author": "홍길동",
  "password": "1234",
  "content": "좋은 하루 되세요!",
  "isSecret": false
}
```

**Response `201 Created`**

- `Location: /api/v1/entries/42` 헤더 포함

```json
{
  "id": 42,
  "author": "홍길동",
  "content": "좋은 하루 되세요!",
  "isSecret": false,
  "createdAt": "2026-11-07T09:30:00Z",
  "updatedAt": "2026-11-07T09:30:00Z"
}
```

**Errors**

| 상태 | 코드 | 상황 |
|---|---|---|
| 400 | `VALIDATION_FAILED` | 필수 값 누락, 길이 제한 위반 |
| 429 | `TOO_MANY_REQUESTS` | 작성 빈도 제한 초과 (7장 참고) |

---

### 4.4 방명록 수정

```
PATCH /api/v1/entries/{id}
```

변경할 필드만 보냅니다. `author`는 수정할 수 없습니다.

**Request Body**

```json
{
  "password": "1234",
  "content": "내용을 고쳤습니다.",
  "isSecret": true
}
```

| 필드 | 필수 | 설명 |
|---|---|---|
| `password` | Y | 작성 시 입력한 비밀번호 |
| `content` | N | 새 내용 |
| `isSecret` | N | 비밀글 여부 변경 |

- `content`, `isSecret` 중 최소 하나는 있어야 합니다.

**Response `200 OK`**

수정된 Entry 전체 (비밀글이어도 수정한 본인에게는 `content` 포함)

```json
{
  "id": 42,
  "author": "홍길동",
  "content": "내용을 고쳤습니다.",
  "isSecret": true,
  "createdAt": "2026-11-07T09:30:00Z",
  "updatedAt": "2026-11-07T10:05:00Z"
}
```

**Errors**

| 상태 | 코드 | 상황 |
|---|---|---|
| 400 | `VALIDATION_FAILED` | 변경할 필드 없음, 길이 제한 위반 |
| 403 | `PASSWORD_MISMATCH` | 비밀번호 불일치 |
| 404 | `ENTRY_NOT_FOUND` | 글이 없거나 숨김 처리됨 |
| 429 | `TOO_MANY_REQUESTS` | 비밀번호 시도 횟수 초과 |

---

### 4.5 방명록 삭제

```
DELETE /api/v1/entries/{id}
```

> DELETE 요청 본문을 지원하지 않는 클라이언트·프록시가 있으므로 비밀번호는 헤더로 전달합니다.

**Request Headers**

| 이름 | 필수 | 설명 |
|---|---|---|
| `X-Entry-Password` | Y | 작성 시 입력한 비밀번호 |

**Response `204 No Content`**

**Errors**

| 상태 | 코드 | 상황 |
|---|---|---|
| 400 | `VALIDATION_FAILED` | 비밀번호 헤더 누락 |
| 403 | `PASSWORD_MISMATCH` | 비밀번호 불일치 |
| 404 | `ENTRY_NOT_FOUND` | 글이 없음 |
| 429 | `TOO_MANY_REQUESTS` | 비밀번호 시도 횟수 초과 |

- 삭제는 소프트 삭제(`deletedAt` 기록)로 처리하며, 삭제된 글은 모든 API에서 `404`로 응답합니다.

---

### 4.6 비밀번호 확인

```
POST /api/v1/entries/{id}/verify
```

비밀글 내용을 열람하거나, 수정 화면에 진입하기 전에 비밀번호를 확인합니다.
성공 시 `content`를 포함한 Entry 전체를 반환합니다.

**Request Body**

```json
{ "password": "1234" }
```

**Response `200 OK`**

```json
{
  "id": 41,
  "author": "김철수",
  "content": "비밀 메시지입니다.",
  "isSecret": true,
  "createdAt": "2026-11-07T08:12:00Z",
  "updatedAt": "2026-11-07T08:12:00Z"
}
```

**Errors**

| 상태 | 코드 | 상황 |
|---|---|---|
| 403 | `PASSWORD_MISMATCH` | 비밀번호 불일치 |
| 404 | `ENTRY_NOT_FOUND` | 글이 없거나 숨김 처리됨 |
| 429 | `TOO_MANY_REQUESTS` | 비밀번호 시도 횟수 초과 |

---

## 5. 관리자 API

관리자 API는 `Authorization: Bearer {accessToken}` 헤더가 필요합니다.

### 5.1 관리자 로그인

```
POST /api/v1/admin/login
```

**Request Body**

```json
{ "username": "admin", "password": "********" }
```

**Response `200 OK`**

```json
{
  "accessToken": "eyJhbGciOi...",
  "expiresIn": 3600
}
```

**Errors**

| 상태 | 코드 | 상황 |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | 아이디 또는 비밀번호 불일치 |

### 5.2 관리자용 목록 조회

```
GET /api/v1/entries?page=1&size=20&includeHidden=true
```

- 유효한 관리자 토큰과 함께 요청하면 `includeHidden=true`로 숨김 글까지 조회할 수 있습니다.
- 관리자 요청에서는 비밀글의 `content`도 노출되며, 각 항목에 `isHidden` 필드가 포함됩니다.
- 토큰 없이 `includeHidden=true`를 보내면 `401 UNAUTHORIZED`.

### 5.3 글 숨김 / 숨김 해제

```
PATCH /api/v1/admin/entries/{id}
```

**Request Body**

```json
{ "isHidden": true }
```

**Response `200 OK`**: `isHidden`이 포함된 Entry 전체

### 5.4 글 강제 삭제

```
DELETE /api/v1/admin/entries/{id}
```

**Response `204 No Content`**

**관리자 API 공통 Errors**

| 상태 | 코드 | 상황 |
|---|---|---|
| 401 | `UNAUTHORIZED` | 토큰 없음 / 만료 / 위조 |
| 404 | `ENTRY_NOT_FOUND` | 글이 없음 |

---

## 6. 에러 응답 형식

모든 에러는 아래 형식으로 응답합니다.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      { "field": "content", "reason": "1자 이상 500자 이하로 입력해주세요." }
    ]
  }
}
```

| 필드 | 설명 |
|---|---|
| `code` | 기계가 판별하기 위한 에러 코드 (아래 표) |
| `message` | 사용자에게 보여줄 수 있는 메시지 |
| `details` | 선택. 필드별 검증 오류 목록 |

### 에러 코드 목록

| HTTP | 코드 | 설명 |
|---|---|---|
| 400 | `INVALID_PARAMETER` | 쿼리 파라미터 오류 |
| 400 | `VALIDATION_FAILED` | 요청 본문/헤더 검증 실패 |
| 401 | `UNAUTHORIZED` | 관리자 인증 필요 또는 실패 |
| 401 | `INVALID_CREDENTIALS` | 관리자 로그인 실패 |
| 403 | `PASSWORD_MISMATCH` | 글 비밀번호 불일치 |
| 404 | `ENTRY_NOT_FOUND` | 글을 찾을 수 없음 |
| 429 | `TOO_MANY_REQUESTS` | 요청 빈도 제한 초과 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

---

## 7. 제한 정책 (Rate Limit)

스팸과 비밀번호 무차별 대입을 막기 위해 IP 기준으로 제한합니다.

| 대상 | 제한 |
|---|---|
| 글 작성 (`POST /entries`) | 1분에 3회 |
| 비밀번호 확인이 필요한 요청 (수정·삭제·verify) | 글 1개당 10분에 5회 실패 시 10분간 차단 |
| 관리자 로그인 | 10분에 5회 실패 시 10분간 차단 |

- 제한 초과 시 `429`와 함께 `Retry-After` 헤더(초 단위)를 응답합니다.

---

## 8. 기타 고려 사항

- **보안**
  - 글 비밀번호, 관리자 비밀번호 모두 bcrypt 등으로 해시하여 저장합니다.
  - 모든 통신은 HTTPS를 전제로 합니다.
  - 응답의 `content`는 원문 그대로이며, 클라이언트에서 HTML 이스케이프 후 출력합니다.
- **CORS**: 방명록 프론트엔드 도메인만 허용합니다.
- **확장 아이디어** (이번 범위 외)
  - 금칙어 필터링
  - 관리자 답글
  - 커서 기반 페이지네이션 (`?cursor=`) — 글이 많아질 때 offset 방식 대체
  - 이모지 반응(좋아요)
