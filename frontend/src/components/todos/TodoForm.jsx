import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import todoService from '../../services/todoService';

import './styles/TodoForm.css';

const REPEAT_TYPES = {
  NONE: 'none',
  MINUTE: 'minute',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

const WEEKDAYS = [
  { value: 0, label: '일' },
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' }
];

/* TodoForm 컴포넌트:
 * - 새로운 할일 추가 및 기존 할일 수정
 * - 제목, 내용, 마감일, 반복 설정, 체크리스트 등 입력 가능
 */
const TodoForm = ({ onClose, initialData }) => {
  const queryClient = useQueryClient();
  const [newCheckListItem, setNewCheckListItem] = useState('');

  // ISO 날짜 문자열을 datetime-local input 형식으로 변환하는 함수
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);  // "yyyy-MM-ddThh:mm" 형식으로 변환
  };

  /* 폼 데이터 상태 관리 */
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    dueDate: formatDateForInput(initialData?.dueDate) || '',  // 날짜 형식 변환
    referenceUrl: initialData?.referenceUrl || '',
    repeat: {
      type: initialData?.repeat?.type || 'none',
      interval: initialData?.repeat?.interval || 1,
      weekdays: initialData?.repeat?.weekdays || [],
      endDate: formatDateForInput(initialData?.repeat?.endDate) || ''  // 날짜 형식 변환
    },
    checkList: initialData?.checkList || []
  });

  /* 할일 생성/수정 mutation */
  const updateMutation = useMutation({
    mutationFn: (data) =>
      initialData
        ? todoService.updateTodo(initialData._id, data)
        : todoService.createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
      toast.success(
        initialData
          ? '할일이 수정되었습니다.'
          : '새로운 할일이 추가되었습니다.'
      );
      onClose();
    },
    onError: (error) => {
      // error.message에 서버에서 전달한 메시지가 포함됨
      toast.error(error.message);
    }
  });
  /* 입력 필드 변경 핸들러 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('repeat.')) {
      const repeatField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        repeat: {
          ...prev.repeat,
          [repeatField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /* 요일 선택 토글 핸들러 */
  const handleWeekdayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      repeat: {
        ...prev.repeat,
        weekdays: prev.repeat.weekdays.includes(day)
          ? prev.repeat.weekdays.filter(d => d !== day)
          : [...prev.repeat.weekdays, day]
      }
    }));
  };

  /* 체크리스트 항목 추가 핸들러 */
  const handleAddCheckListItem = () => {
    if (newCheckListItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checkList: [
          ...prev.checkList,
          { item: newCheckListItem.trim(), completed: false }
        ]
      }));
      setNewCheckListItem('');
    }
  };

  /* 체크리스트 항목 제거 핸들러 */
  const handleRemoveCheckListItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checkList: prev.checkList.filter((_, i) => i !== index)
    }));
  };

  /* 폼 제출 핸들러 */
  const handleSubmit = (e) => {
    e.preventDefault();

    // 제목 검증
    if (!formData.title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    // 마감일이 과거인지 검증
    if (formData.dueDate) {
      const now = new Date();
      const dueDate = new Date(formData.dueDate);

      if (dueDate < now) {
        if (!window.confirm('마감일이 과거 날짜입니다. 계속 진행하시겠습니까?')) {
          return;
        }
      }
    }

    updateMutation.mutate(formData);
  };

  return (
    <div className="todo-form-container">
      <form onSubmit={handleSubmit} className="todo-form">
        <h2>{initialData ? '할일 수정' : '새 할일'}</h2>

        {/* 기본 정보 */}
        <div className="form-group">
          <label htmlFor="title">제목 *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            className="input"
            placeholder="할일 제목을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="input textarea"
            placeholder="상세 내용을 입력하세요"
            rows="3"
          />
        </div>

        {/* 일정 설정 */}
        <div className="form-group">
          <label htmlFor="dueDate">마감일</label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}  // 현재 시간 이후로 제한
            className="input"
          />
          {formData.dueDate && new Date(formData.dueDate) < new Date() && (
            <small className="text-danger">
              * 과거 날짜가 선택되었습니다.
            </small>
          )}
        </div>

        {/* 반복 설정 */}
        <div className="form-group">
          <label htmlFor="repeat.type">반복 설정</label>
          <select
            id="repeat.type"
            name="repeat.type"
            value={formData.repeat.type}
            onChange={handleChange}
            className="input"
          >
            <option value={REPEAT_TYPES.NONE}>반복 없음</option>
            <option value={REPEAT_TYPES.DAILY}>매일</option>
            <option value={REPEAT_TYPES.WEEKLY}>매주</option>
            <option value={REPEAT_TYPES.MONTHLY}>매월</option>
            <option value={REPEAT_TYPES.YEARLY}>매년</option>
          </select>
        </div>

        {formData.repeat.type !== REPEAT_TYPES.NONE && (
          <>
            <div className="form-group">
              <label htmlFor="repeat.interval">반복 간격</label>
              <input
                type="number"
                id="repeat.interval"
                name="repeat.interval"
                value={formData.repeat.interval}
                onChange={handleChange}
                className="input"
                min="1"
              />
            </div>

            {formData.repeat.type === REPEAT_TYPES.WEEKLY && (
              <div className="form-group">
                <label>반복할 요일</label>
                <div className="weekdays-container">
                  {WEEKDAYS.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      className={`weekday-button ${formData.repeat.weekdays.includes(day.value) ? 'active' : ''
                        }`}
                      onClick={() => handleWeekdayToggle(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="repeat.endDate">반복 종료일</label>
              <input
                type="date"
                id="repeat.endDate"
                name="repeat.endDate"
                value={formData.repeat.endDate}
                onChange={handleChange}
                className="input"
              />
            </div>
          </>
        )}

        {/* 참조 URL */}
        <div className="form-group">
          <label htmlFor="referenceUrl">참조 URL</label>
          <input
            type="url"
            id="referenceUrl"
            name="referenceUrl"
            value={formData.referenceUrl}
            onChange={handleChange}
            className="input"
            placeholder="https://example.com"
          />
        </div>

        {/* 체크리스트 */}
        <div className="form-group">
          <label>체크리스트</label>
          <div className="checklist-input">
            <input
              type="text"
              value={newCheckListItem}
              onChange={(e) => setNewCheckListItem(e.target.value)}
              className="input"
              placeholder="체크리스트 항목 추가"
            />
            <button
              type="button"
              onClick={handleAddCheckListItem}
              className="btn btn-secondary"
            >
              추가
            </button>
          </div>
          <ul className="checklist">
            {formData.checkList.map((item, index) => (
              <li key={index} className="checklist-item">
                <span>{item.item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCheckListItem(index)}
                  className="btn btn-danger btn-sm"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 제출 버튼 */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {initialData ? '수정' : '추가'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodoForm;