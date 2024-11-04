const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { protect } = require('../middleware/authMiddleware');

// 모든 라우트에 인증 미들웨어 적용
router.use(protect);

// Todo CRUD 라우트
router.route('/')
  .get(todoController.getTodos)
  .post(todoController.createTodo);

router.route('/:id')
  .get(todoController.getTodo)
  .put(todoController.updateTodo)
  .delete(todoController.deleteTodo);

// 특별한 동작을 위한 라우트
router.patch('/:id/toggle', todoController.toggleTodo);


router.patch('/:todoId/checklist/:checklistIndex', protect, todoController.updateChecklistItem);

module.exports = router;