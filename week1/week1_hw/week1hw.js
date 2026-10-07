const express = require('express');
const path = require('path');

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

const page = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Coding Agents 소개</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #20242b;
            background-color: #f4f6f8;
            font-family: Arial, "Malgun Gothic", sans-serif;
            line-height: 1.6;
        }

        header {
            padding: 40px 20px;
            color: white;
            background-color: #263449;
            text-align: center;
        }

        header h1 {
            margin: 0 0 8px;
            font-size: 2rem;
        }

        header p {
            margin: 0;
            color: #d8e0ea;
        }

        main {
            width: min(1100px, 92%);
            margin: 32px auto;
        }

        h2 {
            margin: 0 0 16px;
            font-size: 1.5rem;
        }

        .agent-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 16px;
        }

        .agent-card {
            padding: 20px;
            background-color: white;
            border: 1px solid #dce2e8;
            border-top: 4px solid var(--agent-accent);
            border-radius: 8px;
        }

        .codex {
            --agent-accent: #343a40;
            --agent-soft: #eef0f2;
            --agent-text: #252a30;
        }

        .claude {
            --agent-accent: #d97745;
            --agent-soft: #fff1e9;
            --agent-text: #a94f2a;
        }

        .copilot {
            --agent-accent: #6654c0;
            --agent-soft: #f0edff;
            --agent-text: #5141a3;
        }

        .gemini {
            --agent-accent: #4285f4;
            --agent-soft: #eaf2ff;
            --agent-text: #2865bd;
        }

        .agent-heading {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }

        .agent-logo {
            display: flex;
            width: 48px;
            height: 48px;
            flex: 0 0 48px;
            align-items: center;
            justify-content: center;
            background-color: var(--agent-soft);
            border-radius: 8px;
        }

        .agent-logo img {
            display: block;
            width: 28px;
            height: 28px;
        }

        .agent-heading h3 {
            color: var(--agent-text);
        }

        .agent-card h3 {
            margin: 0;
            font-size: 1.25rem;
        }

        .developer {
            margin: 2px 0 0;
            color: #53657a;
            font-size: 0.95rem;
        }

        .agent-card p:not(.developer) {
            margin: 0 0 12px;
        }

        .agent-card h4 {
            margin: 0 0 6px;
            font-size: 1rem;
        }

        .agent-card ul {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .agent-card li {
            padding: 3px 9px;
            color: var(--agent-text);
            background-color: var(--agent-soft);
            border-radius: 12px;
            font-size: 0.85rem;
        }

        .comparison {
            margin-top: 36px;
        }

        .table-container {
            overflow-x: auto;
            background-color: white;
            border: 1px solid #dce2e8;
            border-radius: 8px;
        }

        table {
            width: 100%;
            min-width: 650px;
            border-collapse: collapse;
            text-align: left;
        }

        caption {
            padding: 12px;
            color: #53657a;
            text-align: left;
        }

        th,
        td {
            padding: 12px 14px;
            border-top: 1px solid #e5e9ee;
            vertical-align: top;
        }

        thead th {
            color: white;
            background-color: #40536b;
            border-top: 0;
        }

        tbody th {
            white-space: nowrap;
        }

        footer {
            padding: 20px;
            color: #53657a;
            text-align: center;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <header>
        <h1>AI Coding Agents</h1>
        <p>개발자의 코딩 작업을 돕는 대표적인 AI agent 네 가지</p>
    </header>

    <main>
        <section aria-labelledby="agents-heading">
            <h2 id="agents-heading">AI coding agent 소개</h2>
            <div class="agent-list">
                <article class="agent-card codex">
                    <div class="agent-heading">
                        <span class="agent-logo">
                            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/openai.svg" alt="">
                        </span>
                        <div>
                            <h3>OpenAI Codex</h3>
                            <p class="developer">개발사: OpenAI</p>
                        </div>
                    </div>
                    <p>코드베이스를 이해하고 파일 수정, 명령어 실행, 테스트와 코드 리뷰 같은 개발 작업을 수행합니다. IDE, CLI, cloud에서 사용할 수 있고 여러 agent를 병렬로 활용할 수 있습니다.</p>
                    <h4>핵심 특징</h4>
                    <ul>
                        <li>Coding Agent</li>
                        <li>Multi-Agent</li>
                        <li>CLI</li>
                        <li>IDE</li>
                        <li>Cloud</li>
                    </ul>
                </article>

                <article class="agent-card claude">
                    <div class="agent-heading">
                        <span class="agent-logo">
                            <img src="/assets/claude.svg" alt="">
                        </span>
                        <div>
                            <h3>Claude Code</h3>
                            <p class="developer">개발사: Anthropic</p>
                        </div>
                    </div>
                    <p>터미널과 실제 codebase를 중심으로 동작하는 agentic coding 도구입니다. 프로젝트 코드를 탐색하고 요청에 따라 수정하는 개발 작업에 강점이 있습니다.</p>
                    <h4>핵심 특징</h4>
                    <ul>
                        <li>Terminal</li>
                        <li>Codebase</li>
                        <li>Agentic Coding</li>
                        <li>Automation</li>
                    </ul>
                </article>

                <article class="agent-card copilot">
                    <div class="agent-heading">
                        <span class="agent-logo">
                            <img src="https://raw.githubusercontent.com/primer/octicons/main/icons/copilot-16.svg" alt="">
                        </span>
                        <div>
                            <h3>GitHub Copilot</h3>
                            <p class="developer">개발사: GitHub</p>
                        </div>
                    </div>
                    <p>GitHub 및 VS Code와 통합된 AI 개발 도구입니다. Agent mode에서 프로젝트를 분석하고 여러 파일을 수정하며, GitHub에서는 코드 변경부터 Pull Request 생성까지 맡길 수 있습니다.</p>
                    <h4>핵심 특징</h4>
                    <ul>
                        <li>GitHub</li>
                        <li>VS Code</li>
                        <li>Agent Mode</li>
                        <li>Pull Request</li>
                        <li>Code Review</li>
                    </ul>
                </article>

                <article class="agent-card gemini">
                    <div class="agent-heading">
                        <span class="agent-logo">
                            <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_4g_512_lt_f94943af3be039176192d.png" alt="">
                        </span>
                        <div>
                            <h3>Gemini CLI</h3>
                            <p class="developer">개발사: Google</p>
                        </div>
                    </div>
                    <p>터미널에서 사용하는 오픈소스 AI agent입니다. ReAct 방식으로 판단과 도구 사용을 반복하며 버그 수정, 기능 구현, 테스트 개선을 돕고 MCP 확장을 지원합니다.</p>
                    <h4>핵심 특징</h4>
                    <ul>
                        <li>Open Source</li>
                        <li>Terminal</li>
                        <li>ReAct</li>
                        <li>MCP</li>
                        <li>Gemini</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="comparison" aria-labelledby="comparison-heading">
            <h2 id="comparison-heading">AI coding Agent 요약 정리</h2>
            <div class="table-container">
                <table>
                    <caption>각 agent의 주요 사용 환경과 강점 비교</caption>
                    <thead>
                        <tr>
                            <th scope="col">Agent</th>
                            <th scope="col">개발사</th>
                            <th scope="col">주요 환경</th>
                            <th scope="col">주요 강점</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">OpenAI Codex</th>
                            <td>OpenAI</td>
                            <td>IDE, CLI, Cloud</td>
                            <td>여러 agent의 병렬 작업, 코드 수정과 테스트</td>
                        </tr>
                        <tr>
                            <th scope="row">Claude Code</th>
                            <td>Anthropic</td>
                            <td>터미널, codebase</td>
                            <td>프로젝트 코드 탐색과 개발 작업 자동화</td>
                        </tr>
                        <tr>
                            <th scope="row">GitHub Copilot</th>
                            <td>GitHub</td>
                            <td>VS Code, GitHub</td>
                            <td>Agent mode, 코드 리뷰와 Pull Request 작업</td>
                        </tr>
                        <tr>
                            <th scope="row">Gemini CLI</th>
                            <td>Google</td>
                            <td>터미널</td>
                            <td>오픈소스, ReAct와 MCP 확장</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <footer>
        <p>AI coding agents는 개발 작업을 돕는 도구이며, 결과는 개발자가 확인해야 합니다.</p>
        <p class="assignment-info">Week 1 Assignment · 2022170317 이승우</p>
    </footer>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.type('html').send(page);
});

const port = 8081;

app.listen(port, () => {
    console.log(`AI Coding Agents page listening on port ${port}`);
});