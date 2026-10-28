const express = require("express");

const app = express();
const port = 3030;

app.get("/hello", (request, response) => {
    response.send("Hello, World!");
});

app.get("/bye", (request, response) => {
    response.send("Goodbye, World!");
});

app.get("/claude", (request, response) => {
    response.send(`<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Claude 소개</title>
</head>
<body>
    <main>
        <h1>Claude</h1>
        <p>Claude는 Anthropic이 개발한 AI 어시스턴트입니다. 질문에 답하고, 글을 작성하며, 코드를 생성하거나 설명하는 등 다양한 작업을 도와줍니다.</p>
        <nav aria-label="다른 AI 에이전트">
            <a href="/codex">Codex</a>
            <a href="/copilot">GitHub Copilot</a>
        </nav>
    </main>
</body>
</html>`);
});

app.get("/codex", (request, response) => {
    response.send(`<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Codex 소개</title>
</head>
<body>
    <main>
        <h1>Codex</h1>
        <p>Codex는 OpenAI의 코딩 에이전트입니다. 코드 작성과 수정, 저장소 작업, 테스트 실행 같은 소프트웨어 개발 업무를 지원합니다.</p>
        <nav aria-label="다른 AI 에이전트">
            <a href="/claude">Claude</a>
            <a href="/copilot">GitHub Copilot</a>
        </nav>
    </main>
</body>
</html>`);
});

app.get("/copilot", (request, response) => {
    response.send(`<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>GitHub Copilot 소개</title>
</head>
<body>
    <main>
        <h1>GitHub Copilot</h1>
        <p>GitHub Copilot은 GitHub의 AI 코딩 도구입니다. 편집기에서 코드 자동 완성과 채팅을 제공하고, 개발자가 코드를 이해하고 작성하는 일을 돕습니다.</p>
        <nav aria-label="다른 AI 에이전트">
            <a href="/claude">Claude</a>
            <a href="/codex">Codex</a>
        </nav>
    </main>
</body>
</html>`);
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
