// 방명록 글을 메모리(배열)에 저장합니다.
// 서버를 껐다 켜면 전부 사라집니다. 데이터베이스는 4주차에.
const posts = [];
let nextId = 1;

function findAll() {
  return posts;
}

function create({ author, content }) {
  const post = { id: nextId++, author, content };
  posts.push(post);
  return post;
}

function remove(id) {
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return false;
  posts.splice(index, 1);
  return true;
}

module.exports = { findAll, create, remove };
