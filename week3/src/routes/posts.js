const express = require('express');
const store = require('../store/posts');

const router = express.Router();

// GET /posts → 200, 글 목록
router.get('/', (req, res) => {
  res.json(store.findAll());
});

// POST /posts → 201, 만든 글 / 빈 content면 400
router.post('/', (req, res) => {
  const { author, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'content가 비었습니다' });
  }
  const post = store.create({ author, content });
  res.status(201).json(post);
});

// DELETE /posts/:id → 204 / 없는 id면 404
router.delete('/:id', (req, res) => {
  const removed = store.remove(Number(req.params.id));
  if (!removed) {
    return res.status(404).json({ error: '없는 글입니다' });
  }
  res.status(204).end();
});

module.exports = router;
