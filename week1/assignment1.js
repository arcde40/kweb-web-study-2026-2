const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

const agents = {
    claude: {
        name: 'Claude Code',
        company: 'ANTHROPIC',
        number: '01',
        accent: '#c56b4e',
        shortDescription: '복잡한 맥락을 읽고, 생각을 코드로 옮기는 파트너.',
        description: 'Claude Code는 터미널에서 프로젝트 전체를 이해하고 작업하는 에이전트입니다. 여러 파일을 오가며 코드를 수정하고, 테스트를 실행하고, 변경 내용을 설명하는 흐름을 자연어로 요청할 수 있습니다.',
        bestFor: ['여러 파일에 걸친 기능 구현과 리팩터링', '코드베이스를 살펴보고 원인과 해결책 찾기', '구현 전 계획을 세우고 결과를 검토하는 작업'],
        strengths: ['긴 문맥을 바탕으로 한 코드베이스 이해', '터미널 명령과 개발 도구를 연결하는 작업 흐름', '대화로 계획을 조정하며 진행하는 유연함'],
        label: '맥락을 읽는 빌더',
        symbol: 'C',
    },
    codex: {
        name: 'OpenAI Codex',
        company: 'OPENAI',
        number: '02',
        accent: '#16866e',
        shortDescription: '작업을 맡기고, 변경 사항을 검토하는 코딩 에이전트.',
        description: 'Codex는 소프트웨어 개발 작업을 맡아 코드를 작성하고, 버그를 수정하고, 테스트를 수행하는 코딩 에이전트입니다. 작업을 구체적인 단위로 나누어 맡기고 결과를 확인하는 방식에 잘 어울립니다.',
        bestFor: ['명확한 요구사항을 구현하거나 버그를 수정하기', '테스트와 코드 변경을 함께 진행하기', '서로 독립적인 개발 작업을 나누어 처리하기'],
        strengths: ['요청 단위로 맡기기 좋은 작업 방식', '코드 작성부터 테스트까지 이어지는 실행', '결과와 변경 내용을 확인하며 반복하는 개발'],
        label: '작업을 맡기는 엔지니어',
        symbol: 'O',
    },
    copilot: {
        name: 'GitHub Copilot',
        company: 'GITHUB',
        number: '03',
        accent: '#5366d8',
        shortDescription: '에디터와 GitHub 안에서 이어지는 개발 동료.',
        description: 'GitHub Copilot은 코드 편집기에서의 작성 보조부터 대화형 코드 설명, 저장소 기반 작업까지 개발 흐름 곳곳을 돕습니다. 익숙한 IDE 안에서 바로 도움을 받고 싶은 팀에 자연스럽게 녹아듭니다.',
        bestFor: ['코드를 작성하면서 바로 제안과 설명 받기', '낯선 코드나 라이브러리 빠르게 이해하기', 'GitHub 저장소와 개발 도구를 오가며 작업하기'],
        strengths: ['에디터에서 끊김 없이 이어지는 도움', '코드 제안, 대화, 저장소 작업을 아우르는 경험', '기존 개발 도구와 워크플로에 더하기 쉬움'],
        label: '에디터에 함께하는 동료',
        symbol: '↗',
    },
};

const styles = `
    :root { color-scheme: light; font-family: Inter, Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; color: #20211f; background: #f7f6f2; font-synthesis: none; }
    * { box-sizing: border-box; }
    body { margin: 0; min-width: 320px; }
    a { color: inherit; text-decoration: none; }
    .shell { width: min(1080px, calc(100% - 48px)); margin: 0 auto; }
    .topbar { height: 82px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e6e4dd; }
    .wordmark { display: flex; align-items: center; gap: 11px; font-size: 14px; font-weight: 700; letter-spacing: -.04em; }
    .mark { width: 29px; height: 29px; display: grid; place-items: center; border-radius: 9px; background: #22231f; color: white; font-size: 14px; }
    .nav { display: flex; gap: 25px; color: #6c6c65; font-size: 12px; }
    .nav a:hover, .back:hover { color: #20211f; }
    .eyebrow { display: flex; align-items: center; gap: 9px; color: #77766f; font: 500 10px SFMono-Regular, Consolas, monospace; letter-spacing: .12em; text-transform: uppercase; }
    .eyebrow::before { content: ''; width: 18px; height: 1px; background: #b7b5ac; }
    .hero { padding: 83px 0 51px; }
    h1 { max-width: 720px; margin: 18px 0 17px; font-size: clamp(39px, 6vw, 70px); line-height: 1.12; letter-spacing: -.075em; font-weight: 600; }
    .hero-copy { max-width: 560px; color: #77766f; font-size: 15px; line-height: 1.8; word-break: keep-all; }
    .section-head { display: flex; align-items: center; justify-content: space-between; margin: 23px 0 14px; }
    .section-title { font-size: 12px; font-weight: 600; }
    .section-note { color: #8b8a82; font: 10px 'DM Mono', monospace; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding-bottom: 78px; }
    .card { min-height: 296px; display: flex; flex-direction: column; padding: 22px; background: #fff; border: 1px solid #ecebe5; border-radius: 12px; transition: transform .2s ease, box-shadow .2s ease; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px #25251c0c; }
    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .agent-icon { width: 37px; height: 37px; display: grid; place-items: center; border-radius: 11px; color: white; font-size: 17px; font-weight: 600; }
    .card-number { color: #a5a49c; font: 10px SFMono-Regular, Consolas, monospace; }
    .company { margin-top: 27px; color: #898880; font: 10px SFMono-Regular, Consolas, monospace; letter-spacing: .13em; }
    .card h2 { margin: 7px 0 9px; font-size: 20px; letter-spacing: -.045em; }
    .card p { margin: 0; color: #77766f; font-size: 12px; line-height: 1.75; word-break: keep-all; }
    .card-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 24px; }
    .tag { color: #62615a; font-size: 10px; }
    .arrow { color: #8d8b83; font-size: 17px; }
    .footer { display: flex; justify-content: space-between; gap: 20px; padding: 19px 0 28px; border-top: 1px solid #e6e4dd; color: #929189; font-size: 10px; }
    .detail { padding: 60px 0 76px; }
    .back { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 46px; color: #77766f; font-size: 12px; }
    .detail-heading { display: grid; grid-template-columns: 1fr auto; gap: 30px; align-items: end; padding-bottom: 36px; border-bottom: 1px solid #e6e4dd; }
    .detail-title { margin: 14px 0 12px; font-size: clamp(42px, 7vw, 76px); letter-spacing: -.08em; line-height: 1.05; }
    .detail-copy { max-width: 640px; color: #77766f; font-size: 14px; line-height: 1.9; word-break: keep-all; }
    .detail-symbol { width: 82px; height: 82px; display: grid; place-items: center; border-radius: 23px; color: white; font-size: 34px; font-weight: 600; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding-top: 22px; }
    .detail-panel { padding: 24px; background: #fff; border: 1px solid #ecebe5; border-radius: 12px; }
    .detail-panel h2 { margin: 0 0 18px; font-size: 12px; font-weight: 600; }
    .detail-panel ul { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
    .detail-panel li { display: flex; gap: 10px; color: #6f6e67; font-size: 12px; line-height: 1.65; word-break: keep-all; }
    .detail-panel li::before { content: '↗'; color: var(--accent); }
    .detail-foot { margin-top: 26px; color: #929189; font-size: 11px; line-height: 1.8; }
    .not-found { padding: 100px 0; text-align: center; }
    @media (max-width: 700px) {
        .shell { width: min(100% - 32px, 520px); }
        .topbar { height: 68px; }
        .nav { gap: 12px; font-size: 10px; }
        .hero { padding: 62px 0 38px; }
        .cards { grid-template-columns: 1fr; gap: 10px; padding-bottom: 55px; }
        .card { min-height: 255px; }
        .detail { padding-top: 38px; }
        .back { margin-bottom: 34px; }
        .detail-heading { grid-template-columns: 1fr; }
        .detail-symbol { grid-row: 1; width: 58px; height: 58px; border-radius: 17px; font-size: 25px; }
        .detail-title { margin-top: 10px; }
        .detail-grid { grid-template-columns: 1fr; }
        .footer { flex-direction: column; gap: 7px; }
    }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; } }
`;

function pageShell(content, title = 'Agent Index — AI 코딩 에이전트 가이드') {
    return `<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f7f6f2">
    <title>${title}</title>
    <style>${styles}</style>
</head>
<body>
    <div class="shell">
        <header class="topbar">
            <a class="wordmark" href="/" aria-label="Agent Index 홈"><span class="mark">A</span><span>agent index</span></a>
            <nav class="nav" aria-label="에이전트 페이지">
                <a href="/claude">Claude</a><a href="/codex">Codex</a><a href="/copilot">Copilot</a>
            </nav>
        </header>
        ${content}
        <footer class="footer"><span>AGENT INDEX · AI CODING FIELD GUIDE</span><span>도구보다 중요한 건, 지금 풀고 싶은 문제.</span></footer>
    </div>
</body>
</html>`;
}

function renderCard(agent, slug) {
    return `<a class="card" href="/${slug}" style="--accent:${agent.accent}">
        <div class="card-top"><span class="agent-icon" style="background:${agent.accent}">${agent.symbol}</span><span class="card-number">${agent.number} / 03</span></div>
        <div class="company">${agent.company}</div>
        <h2>${agent.name}</h2>
        <p>${agent.shortDescription}</p>
        <div class="card-bottom"><span class="tag">${agent.label}</span><span class="arrow" aria-hidden="true">↗</span></div>
    </a>`;
}

function renderHome() {
    const cards = Object.entries(agents).map(([slug, agent]) => renderCard(agent, slug)).join('');
    return pageShell(`<main>
        <section class="hero">
            <div class="eyebrow">A small guide to AI agents</div>
            <h1>함께 만들고,<br>더 멀리 가는 방법.</h1>
            <p class="hero-copy">AI 코딩 에이전트는 각자 다른 방식으로 개발을 돕습니다. 세 가지 도구의 특징을 살펴보고, 지금의 작업에 맞는 파트너를 찾아보세요.</p>
        </section>
        <section aria-labelledby="agents-heading">
            <div class="section-head"><span class="section-title" id="agents-heading">세 가지 에이전트</span><span class="section-note">EXPLORE THE INDEX &nbsp;→</span></div>
            <div class="cards">${cards}</div>
        </section>
    </main>`);
}

function renderAgent(agent) {
    const bestFor = agent.bestFor.map((item) => `<li>${item}</li>`).join('');
    const strengths = agent.strengths.map((item) => `<li>${item}</li>`).join('');
    return pageShell(`<main class="detail" style="--accent:${agent.accent}">
        <a class="back" href="/"><span aria-hidden="true">←</span> 모든 에이전트</a>
        <section class="detail-heading">
            <div>
                <div class="eyebrow">${agent.company} &nbsp;·&nbsp; AI AGENT ${agent.number}</div>
                <h1 class="detail-title">${agent.name}</h1>
                <p class="detail-copy">${agent.description}</p>
            </div>
            <div class="detail-symbol" style="background:${agent.accent}" aria-hidden="true">${agent.symbol}</div>
        </section>
        <section class="detail-grid" aria-label="${agent.name} 특징">
            <div class="detail-panel"><h2>이럴 때 잘 맞아요</h2><ul>${bestFor}</ul></div>
            <div class="detail-panel"><h2>눈여겨볼 점</h2><ul>${strengths}</ul></div>
        </section>
        <p class="detail-foot">에이전트의 기능과 제공 방식은 사용하는 제품 및 설정에 따라 달라질 수 있습니다. 실제 작업에 적용하기 전에는 변경 사항과 실행 결과를 꼭 확인하세요.</p>
    </main>`, `${agent.name} — Agent Index`);
}

app.get('/', (req, res) => {
    res.type('html').send(renderHome());
});

app.get('/:agent', (req, res, next) => {
    const agent = agents[req.params.agent];
    if (!agent) return next();
    res.type('html').send(renderAgent(agent));
});

app.use((req, res) => {
    res.status(404).type('html').send(pageShell(`<main class="not-found"><div class="eyebrow">404 · PAGE NOT FOUND</div><h1>아직 이 페이지는 없어요.</h1><a class="back" href="/">← 에이전트 목록으로</a></main>`, '페이지를 찾을 수 없습니다 — Agent Index'));
});

app.listen(port, () => {
    console.log(`Agent Index is running at http://localhost:${port}`);
});