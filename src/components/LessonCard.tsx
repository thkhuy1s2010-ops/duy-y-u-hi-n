import React from 'react';
import { Calendar, Trash2, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { Lesson, ReviewStatus, ReviewRating, STATUS_CONFIG } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  onStatusChange: (id: string, newStatus: ReviewStatus) => void;
  onDelete: (id: string) => void;
  onReview?: (id: string, rating: ReviewRating) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onStatusChange,
  onDelete,
  onReview,
}) => {
  const currentStatusConfig = STATUS_CONFIG[lesson.status];

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Chưa chọn ngày';
    try {
      const [year, month, day] = dateString.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'can_on_tap':
        return <Clock className="w-3.5 h-3.5 text-amber-600 mr-1.5" />;
      case 'moi_hoc':
        return <BookOpen className="w-3.5 h-3.5 text-sky-600 mr-1.5" />;
      case 'da_on_tap':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />;
    }
  };

  return (
    <div
      id={`lesson-card-${lesson.id}`}
      className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            id={`lesson-title-${lesson.id}`}
            className="text-base sm:text-lg font-semibold text-slate-800 break-words"
          >
            {lesson.title}
          </h3>

          <div className="mt-2.5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-slate-400 shrink-0" />
              <span>Gốc: <strong>{formatDisplayDate(lesson.studyDate)}</strong></span>
            </div>
            {(lesson.nextReviewDate || lesson.interval > 0) && (
              <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                <span>
                  Lặp: <strong>{lesson.interval || 0} ngày</strong> 
                  <span className="text-slate-400 font-normal mx-1">•</span> 
                  Tiếp theo: <strong>{formatDisplayDate(lesson.nextReviewDate || lesson.studyDate)}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          id={`delete-lesson-btn-${lesson.id}`}
          onClick={() => onDelete(lesson.id)}
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"
          title="Xóa bài học"
          aria-label="Xóa bài học"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center">
          <span
            id={`lesson-status-badge-${lesson.id}`}
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${currentStatusConfig.bgClass} ${currentStatusConfig.textClass} ${currentStatusConfig.borderClass}`}
          >
            {getStatusIcon(lesson.status)}
            {currentStatusConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end sm:justify-start w-full sm:w-auto">
          {onReview && (
            <div className="flex items-center gap-1.5 mr-0 sm:mr-2 flex-wrap">
              <button
                onClick={() => onReview(lesson.id, 'forgot')}
                className="px-2.5 sm:px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-medium text-xs sm:text-sm rounded-lg transition"
                title="Quên (Học lại)"
              >
                🔴 Quên
              </button>
              <button
                onClick={() => onReview(lesson.id, 'good')}
                className="px-2.5 sm:px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-medium text-xs sm:text-sm rounded-lg transition"
                title="Nhớ (Tăng khoảng cách)"
              >
                🟡 Nhớ
              </button>
              <button
                onClick={() => onReview(lesson.id, 'easy')}
                className="px-2.5 sm:px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-medium text-xs sm:text-sm rounded-lg transition"
                title="Dễ (Nhảy cóc)"
              >
                🟢 Dễ
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
            <label htmlFor={`status-select-${lesson.id}`} className="text-xs text-slate-400 hidden sm:inline-block">
              Trạng thái:
            </label>
            <select
              id={`status-select-${lesson.id}`}
              value={lesson.status}
              onChange={(e) => onStatusChange(lesson.id, e.target.value as ReviewStatus)}
              className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="moi_hoc">Mới học</option>
              <option value="can_on_tap">Cần ôn tập</option>
              <option value="da_on_tap">Đã ôn tập</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
