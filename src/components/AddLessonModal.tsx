import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, BookOpen } from 'lucide-react';
import { ReviewStatus } from '../types';

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLesson: (lesson: {
    title: string;
    studyDate: string;
    status: ReviewStatus;
  }) => void;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({
  isOpen,
  onClose,
  onAddLesson,
}) => {
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [title, setTitle] = useState('');
  const [studyDate, setStudyDate] = useState(getTodayString());
  const [status, setStatus] = useState<ReviewStatus>('moi_hoc');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setStudyDate(getTodayString());
      setStatus('moi_hoc');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên bài học');
      return;
    }
    if (!studyDate) {
      setError('Vui lòng chọn ngày học');
      return;
    }

    onAddLesson({
      title: title.trim(),
      studyDate,
      status,
    });
    onClose();
  };

  return (
    <div
      id="add-lesson-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="add-lesson-modal-content"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-slate-800">
              Thêm bài học mới
            </h2>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div
              id="form-error-message"
              className="p-3 text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="lesson-title-input"
              className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
            >
              Tên bài học <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <input
                id="lesson-title-input"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ví dụ: Toán - Đạo hàm & Khảo sát hàm số"
                autoFocus
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="lesson-date-input"
              className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
            >
              Ngày học <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="lesson-date-input"
                type="date"
                value={studyDate}
                onChange={(e) => {
                  setStudyDate(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="lesson-status-select"
              className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
            >
              Trạng thái ban đầu
            </label>
            <select
              id="lesson-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as ReviewStatus)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="moi_hoc">Mới học</option>
              <option value="can_on_tap">Cần ôn tập</option>
              <option value="da_on_tap">Đã ôn tập</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              id="cancel-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              id="submit-lesson-btn"
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition cursor-pointer"
            >
              Thêm bài học
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
