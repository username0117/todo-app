import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import todoService from '../../services/todoService';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';

import './styles/TodoList.css';

/* TodoList 컴포넌트:
 * - 할일 목록을 표시하고 관리하는 메인 컴포넌트
 * - React Query를 사용하여 서버 상태 관리
 */
const TodoList = () => {
  // 상태 관리
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // QueryClient 인스턴스 가져오기
  const queryClient = useQueryClient();

  /* useQuery를 사용하여 할일 목록 데이터 가져오기:
   * - 자동 캐싱, 재시도, 백그라운드 업데이트 등의 기능 제공
   */
  const { data: todos = [], isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: todoService.getTodos
  });

  /* useMutation을 사용하여 할일 삭제 기능 구현:
   * - 삭제 후 목록 자동 갱신
   */
  const deleteMutation = useMutation({
    mutationFn: todoService.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
      toast.success('할일이 삭제되었습니다.');
    },
    onError: () => {
      toast.error('할일 삭제에 실패했습니다.');
    }
  });

  /* 할일 삭제 핸들러:
   * - 삭제 확인 후 mutation 실행
   */
  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  /* 할일 수정 핸들러:
   * - 수정할 할일 데이터를 상태에 저장하고 폼 열기
   */
  const handleUpdate = (todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  /* 폼 닫기 핸들러:
   * - 폼을 닫고 수정 상태 초기화
   */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTodo(null);
  };

  // 로딩 상태 표시
  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  // 에러 상태 표시
  if (error) {
    return <div className="error">에러가 발생했습니다.</div>;
  }

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h2>할 일 목록</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '닫기' : '새 할일 추가'}
        </button>
      </div>

      {/* TodoForm: 새 할일 추가 또는 기존 할일 수정 */}
      {showForm && (
        <TodoForm
          onClose={handleCloseForm}
          initialData={editingTodo}  // 수정 시 초기 데이터 전달
        />
      )}

      {/* 할일 목록 */}
      <div className="todo-list">
        {todos.length === 0 ? (
          <p className="empty-message">할일이 없습니다.</p>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onDelete={() => handleDelete(todo._id)}
              onUpdate={() => handleUpdate(todo)}  // 수정 핸들러 전달
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;