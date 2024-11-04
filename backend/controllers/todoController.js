const { Todo } = require('../models/Todo');

/**
 * 할일 목록 조회
 * GET /api/todos
 */
exports.getTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find({ user: req.user.id })
      .sort({
        completed: 1,     // 미완료 항목 먼저
        dueDate: 1,      // 마감일 가까운 순
        createdAt: -1    // 최신 등록순
      });

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 할일 상세 조회
 * GET /api/todos/:id
 */
exports.getTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 할일 생성
 * POST /api/todos
 */
exports.createTodo = async (req, res, next) => {
  try {
    const todo = await Todo.create({
      ...req.body,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 할일 수정
 * PUT /api/todos/:id
 */
exports.updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 할일 삭제
 * DELETE /api/todos/:id
 */
exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '할일이 삭제되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 할일 완료 상태 토글
 * PATCH /api/todos/:id/toggle
 */
exports.toggleTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.'
      });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 체크리스트 아이템 상태 업데이트
 * PATCH /api/todos/:todoId/checklist/:checklistIndex
 */
exports.updateChecklistItem = async (req, res, next) => {
  try {
    const { todoId, checklistIndex } = req.params;
    const { completed } = req.body;

    const todo = await Todo.findOne({
      _id: todoId,
      user: req.user.id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.'
      });
    }

    if (!todo.checkList[checklistIndex]) {
      return res.status(404).json({
        success: false,
        message: '체크리스트 항목을 찾을 수 없습니다.'
      });
    }

    todo.checkList[checklistIndex].completed = completed;
    await todo.save();

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};