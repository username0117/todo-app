import axios from 'axios';

/* axios 인스턴스 생성:
 * - authService와 동일한 설정 사용
 * - 모든 요청에 자동으로 인증 토큰 포함
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* Todo CRUD 작업을 위한 API 호출 함수들 */
const todoService = {
  // 할일 목록 조회
  async getTodos() {
    const response = await api.get('/todos');
    return response.data.data;
  },

  // 할일 상세 조회
  async getTodoById(id) {
    const response = await api.get(`/todos/${id}`);
    return response.data.data;
  },

  // 할일 생성
  async createTodo(todoData) {
    try {
      const response = await api.post('/todos', todoData);
      return response.data.data;
    } catch (error) {
      // 서버에서 전달한 에러 메시지 사용
      throw new Error(error.response?.data?.message || '할일 생성 중 오류가 발생했습니다.');
    }
  },

  // 할일 수정
  async updateTodo(id, todoData) {
    try {
      const updatedData = {
        ...todoData,
        repeat: {
          type: todoData.repeat?.type || 'none',
          interval: todoData.repeat?.interval || 1,
          weekdays: todoData.repeat?.weekdays || [],
          endDate: todoData.repeat?.endDate || null
        }
      };

      const response = await api.put(`/todos/${id}`, updatedData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '할일 수정 중 오류가 발생했습니다.');
    }
  },

  // 할일 삭제
  async deleteTodo(id) {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },

  // 할일 완료 상태 토글
  async toggleTodo(id) {
    const response = await api.patch(`/todos/${id}/toggle`);
    return response.data.data;
  },

  // 체크리스트 아이템 상태 업데이트 - 여기에 추가
  async updateChecklistItem(todoId, checklistIndex, completed) {
    const response = await api.patch(`/todos/${todoId}/checklist/${checklistIndex}`, {
      completed
    });
    return response.data.data;
  }
};

export default todoService;