const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const routes = new Set(["/", "/claude", "/codex", "/copilot"]);
const assets = {
    "/": { file: "index.html", type: "text/html; charset=utf-8" },
    "/styles.css": { file: "styles.css", type: "text/css; charset=utf-8" },
    "/app.js": { file: "app.js", type: "text/javascript; charset=utf-8" },
};

const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const asset = assets[pathname];

    if (!asset && !routes.has(pathname)) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("페이지를 찾을 수 없습니다.");
        return;
    }

    const requested = asset || assets["/"];
    fs.readFile(path.join(root, requested.file), (error, content) => {
        if (error) {
            response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            response.end("페이지를 불러오지 못했습니다.");
            return;
        }

        response.writeHead(200, { "Content-Type": requested.type });
        response.end(content);
    });
});

const port = Number(process.env.PORT) || 4173;
server.listen(port, "0.0.0.0", () => {
    console.log(`에이전트 가이드: http://localhost:${port}`);
});