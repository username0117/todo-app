import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import todoService from '../../services/todoService';

import './styles/TodoItem.css';

/* 반복 타입 레이블 매핑 */
const REPEAT_TYPE_LABELS = {
  none: '반복 없음',
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년'
};

/* 요일 레이블 매핑 */
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const TodoItem = ({ todo, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  /* Todo 상태 변경 mutation */
  const toggleMutation = useMutation({
    mutationFn: (data) => todoService.updateTodo(data.id, { completed: data.completed }),  // 수정된 부분
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '작업 수행 중 오류가 발생했습니다.');
    }
  });

  /* 체크리스트 아이템 상태 변경 mutation */
  const toggleChecklistMutation = useMutation({
    mutationFn: ({ todoId, checklistIndex, completed }) =>
      todoService.updateChecklistItem(todoId, checklistIndex, !completed),  // completed 상태 토글
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '체크리스트 항목 업데이트 중 오류가 발생했습니다.');
    }
  });

  /* Todo 삭제 mutation */
  const deleteMutation = useMutation({
    mutationFn: todoService.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
      toast.success('할일이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  });

  /* 완료 상태 토글 핸들러 */
  const handleToggleComplete = () => {
    toggleMutation.mutate({
      id: todo._id,
      completed: !todo.completed
    });
  };

  /* 체크리스트 아이템 토글 핸들러 */
  const handleToggleChecklistItem = (index, completed) => {
    toggleChecklistMutation.mutate({
      todoId: todo._id,
      checklistIndex: index,
      completed
    });
  };

  /* 삭제 핸들러 */
  const handleDelete = () => {
    if (window.confirm('정말 이 할일을 삭제하시겠습니까?')) {
      deleteMutation.mutate(todo._id);
    }
  };

  /* D-day 계산 및 표시 */
  const getDdayText = () => {
    if (!todo.dueDate) return null;
    const today = new Date();
    const dueDate = new Date(todo.dueDate);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '(오늘 마감)';
    if (diffDays < 0) return `(${Math.abs(diffDays)}일 지남)`;
    return `(D-${diffDays})`;
  };

  /* 반복 설정 텍스트 생성 */
  const getRepeatText = () => {
    if (todo.repeat.type === 'none') return null;

    let text = `${REPEAT_TYPE_LABELS[todo.repeat.type]}`;
    if (todo.repeat.interval > 1) {
      text += ` ${todo.repeat.interval}회`;
    }

    if (todo.repeat.type === 'weekly' && todo.repeat.weekdays?.length > 0) {
      text += ` (${todo.repeat.weekdays.map(day => WEEKDAY_LABELS[day]).join(', ')})`;
    }

    return text;
  };

  // 마감일 경과 여부 확인
  const isOverdue = () => {
    if (!todo.dueDate) return false;
    return new Date(todo.dueDate) < new Date() && !todo.completed;
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          className="todo-checkbox"
        />
        <div className="todo-details">
          <h3 className="todo-title">{todo.title}</h3>

          {/* 상세 내용 토글 - 조건 수정 */}
          {(todo.content || todo.checkList?.length > 0 || todo.referenceUrl) && (
            <button
              className="btn btn-link"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '접기' : '자세히'}
            </button>
          )}

          {/* 확장된 상세 내용 */}
          {isExpanded && (
            <div className="todo-expanded">
              <p className="todo-description">{todo.content}</p>

              {/* 체크리스트 */}
              {todo.checkList?.length > 0 && (
                <div className="todo-checklist">
                  <h4>체크리스트</h4>
                  <ul>
                    {todo.checkList.map((item, index) => (
                      <li key={index} className="checklist-item">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklistItem(index, item.completed)}
                        />
                        <span>{item.item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 참조 URL */}
              {todo.referenceUrl && (
                <div className="todo-reference">
                  <a
                    href={todo.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reference-link"
                  >
                    참조 링크
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 하단 정보 */}
          <div className="todo-footer">
            {todo.dueDate && (
              <span className="todo-due-date">
                마감: {new Date(todo.dueDate).toLocaleDateString()} {getDdayText()}
              </span>
            )}
            {getRepeatText() && (
              <span className="todo-repeat">
                반복: {getRepeatText()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 작업 버튼 */}
      <div className="todo-actions">
        <button
          onClick={() => onUpdate(todo)}
          className="btn btn-secondary btn-sm"
          title="수정"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-danger btn-sm"
          title="삭제"
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default TodoItem;