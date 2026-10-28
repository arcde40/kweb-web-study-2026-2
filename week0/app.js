const agents = {
    claude: {
        name: "Claude",
        eyebrow: "THOUGHTFUL BY DESIGN",
        category: "대화형 AI",
        accent: "#bd6848",
        logo: "https://cdn.simpleicons.org/anthropic/BD6848",
        intro: "복잡한 생각을 차분히 정리하고, 긴 맥락 속에서 함께 답을 찾아가는 AI.",
        description: "글쓰기와 분석부터 코드 작업까지. 긴 문서와 대화를 바탕으로 깊이 있는 결과를 만드는 데 강합니다.",
        bestFor: ["긴 문서 요약과 분석", "자연스러운 글쓰기와 아이디어 발상", "맥락이 중요한 코딩 작업"],
        sampleLabel: "이렇게 시작해 보세요",
        prompt: "이 기획안을 읽고 핵심 가정 세 가지와 놓친 위험을 찾아줘. 각 항목의 근거도 함께 정리해 줘.",
        responseTitle: "함께 생각을 정리합니다",
        response: "긴 내용을 읽고 논점을 구조화한 뒤, 근거와 함께 차분하게 설명합니다.",
        stat: "깊이 있는 맥락",
    },
    codex: {
        name: "Codex",
        eyebrow: "FROM PROMPT TO PATCH",
        category: "코딩 에이전트",
        accent: "#287a65",
        logo: "https://cdn.simpleicons.org/openai/287A65",
        intro: "개발 작업을 맡기고 결과를 검토하는, 코딩 중심의 AI 에이전트.",
        description: "코드를 읽고 수정안을 만들며 테스트까지 이어갈 수 있습니다. 명확한 작업 단위로 맡기고 변경 내용을 확인해 보세요.",
        bestFor: ["기능 구현과 버그 수정", "코드베이스 탐색과 변경 제안", "테스트 작성과 반복 작업"],
        sampleLabel: "이렇게 작업을 맡겨 보세요",
        prompt: "로그인 폼의 이메일 검증을 개선해 줘. 기존 테스트 방식을 따르고, 변경한 부분의 테스트도 추가해 줘.",
        responseTitle: "작업을 계획하고 실행합니다",
        response: "관련 코드를 찾고 변경을 적용한 뒤, 테스트 결과와 수정 내용을 요약합니다.",
        stat: "코드 작업에 집중",
    },
    copilot: {
        name: "Copilot",
        eyebrow: "IN YOUR FLOW",
        category: "개발 파트너",
        accent: "#52734b",
        logo: "https://cdn.simpleicons.org/githubcopilot/52734B",
        intro: "코드를 쓰는 순간부터 질문과 수정까지, 개발 흐름 곁에 있는 AI 파트너.",
        description: "편집기와 개발 도구 안에서 코드 제안, 설명, 채팅을 이어갑니다. 현재 작업 맥락을 유지하며 작은 단위로 도움을 받을 수 있습니다.",
        bestFor: ["코드 자동 완성과 빠른 수정", "에디터 안에서 코드 설명 받기", "작업 중 바로 질문하고 탐색하기"],
        sampleLabel: "이렇게 물어보세요",
        prompt: "이 함수가 빈 배열을 받을 때 어떤 일이 생기는지 설명하고, 안전하게 처리하도록 고쳐 줘.",
        responseTitle: "작업 흐름을 이어갑니다",
        response: "현재 코드 맥락을 바탕으로 제안하고, 필요한 부분을 바로 검토할 수 있게 합니다.",
        stat: "에디터와 함께",
    },
};

const app = document.querySelector("#app");
const breadcrumb = document.querySelector("#breadcrumb-current");

function renderHome() {
    breadcrumb.textContent = "전체 보기";
    app.innerHTML = `
        <section class="home-view">
            <div class="home-copy">
                <div class="eyebrow"><span class="eyebrow-line"></span> THREE WAYS TO WORK WITH AI</div>
                <h1>도움이 필요한 순간,<br><em>어떤 에이전트와</em><br>함께할까요?</h1>
                <p class="home-intro">대화와 분석, 코드 실행, 개발 흐름 속 협업까지.<br>각 에이전트의 강점을 살펴보고 지금 할 일에 맞춰 골라 보세요.</p>
                <a class="text-link" href="/claude">에이전트 살펴보기 <span>↗</span></a>
            </div>
            <div class="home-visual" aria-label="세 에이전트 소개">
                <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
                <div class="orbit-center"><span>AI</span><small>YOUR TOOLKIT</small></div>
                <a class="orbit-agent orbit-claude" href="/claude"><img src="${agents.claude.logo}" alt=""><span>Claude</span><small>THINK</small></a>
                <a class="orbit-agent orbit-codex" href="/codex"><img src="${agents.codex.logo}" alt=""><span>Codex</span><small>BUILD</small></a>
                <a class="orbit-agent orbit-copilot" href="/copilot"><img src="${agents.copilot.logo}" alt=""><span>Copilot</span><small>PAIR</small></a>
                <span class="visual-caption">각기 다른 방식으로, 더 나은 결과를.</span>
            </div>
            <div class="home-index">
                <div class="index-heading"><span>01 — 03</span><span>고르는 기준은 간단해요</span></div>
                <div class="index-items">
                    <a href="/claude"><span class="index-number">01</span><span><b>생각을 정리하고 싶다면</b><small>Claude · 대화와 분석</small></span><span class="index-arrow">↗</span></a>
                    <a href="/codex"><span class="index-number">02</span><span><b>코드 작업을 맡기고 싶다면</b><small>Codex · 구현과 실행</small></span><span class="index-arrow">↗</span></a>
                    <a href="/copilot"><span class="index-number">03</span><span><b>개발 흐름을 이어가고 싶다면</b><small>Copilot · 에디터 속 협업</small></span><span class="index-arrow">↗</span></a>
                </div>
            </div>
        </section>`;
}

function renderAgent(agent) {
    breadcrumb.textContent = agent.name;
    app.innerHTML = `
        <article class="agent-page" style="--accent:${agent.accent}">
            <section class="agent-hero">
                <div class="agent-copy">
                    <div class="eyebrow"><span class="eyebrow-line"></span> ${agent.eyebrow}</div>
                    <div class="agent-name-row"><h1>${agent.name}</h1><span class="category-tag">${agent.category}</span></div>
                    <p class="agent-lead">${agent.intro}</p>
                    <p class="agent-description">${agent.description}</p>
                    <a class="text-link" href="#details">나에게 맞는지 알아보기 <span>↓</span></a>
                </div>
                <div class="agent-art" aria-label="${agent.name} 로고와 대화 예시">
                    <div class="art-topline"><span>FIELDNOTE No. 0${Object.keys(agents).indexOf(agent.name.toLowerCase()) + 1}</span><span>${agent.stat}</span></div>
                    <div class="art-grid"></div>
                    <div class="art-orbit"></div>
                    <div class="art-logo"><img src="${agent.logo}" alt="${agent.name} 로고"></div>
                    <div class="art-word">${agent.name}</div>
                    <div class="art-caption">${agent.eyebrow}</div>
                    <span class="art-coordinate">AI / ${agent.name.toUpperCase()}</span>
                </div>
            </section>
            <section class="detail-grid" id="details">
                <div class="strengths">
                    <div class="section-label"><span>01</span> 잘하는 일</div>
                    <h2>이럴 때 특히<br><em>유용해요.</em></h2>
                    <ul>${agent.bestFor.map((item, index) => `<li><span>0${index + 1}</span>${item}<b>↗</b></li>`).join("")}</ul>
                </div>
                <div class="sample-card">
                    <div class="section-label"><span>02</span> ${agent.sampleLabel}</div>
                    <blockquote>“${agent.prompt}”</blockquote>
                    <div class="sample-response"><span class="response-icon"><img src="${agent.logo}" alt=""></span><span><b>${agent.responseTitle}</b><small>${agent.response}</small></span></div>
                </div>
            </section>
            <nav class="next-agent" aria-label="다른 에이전트 보기">
                <span>다른 에이전트도 보기</span>
                ${Object.entries(agents).filter(([key]) => key !== agent.name.toLowerCase()).map(([key, other]) => `<a href="/${key}">${other.name}<span>↗</span></a>`).join("")}
            </nav>
        </article>`;
}

function render() {
    const route = window.location.pathname.replace(/\/$/, "") || "/";
    const agent = agents[route.slice(1)];

    document.querySelectorAll(".agent-nav a").forEach((link) => {
        const active = link.dataset.route === route.slice(1);
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });

    if (agent) renderAgent(agent);
    else renderHome();
}

document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || link.origin !== window.location.origin || !/^\/(claude|codex|copilot)?\/?$/.test(link.pathname)) return;

    event.preventDefault();
    window.history.pushState({}, "", link.pathname);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("popstate", render);
render();