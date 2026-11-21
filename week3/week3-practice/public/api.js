// 화면에서 서버 API를 부르는 함수들
// 브라우저에서는 <script>로 불러서 window.api로 쓰고, 테스트(Node)에서는 require로 씁니다.

// GET /posts → 글 목록 배열 / 실패하면 에러
// baseUrl: 브라우저에서는 '' (같은 서버), 테스트에서는 'http://localhost:포트'
async function fetchPosts(baseUrl = '') {
  const res = await fetch(`${baseUrl}/posts`);
  if (!res.ok) throw new Error(`서버 응답 ${res.status}`);
  return res.json();
}

if (typeof module !== 'undefined') {
  module.exports = { fetchPosts };
} else {
  window.api = { fetchPosts };
}
