import React from 'react';
import { Calendar, Trash2, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { Lesson, ReviewStatus, STATUS_CONFIG } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  onStatusChange: (id: string, newStatus: ReviewStatus) => void;
  onDelete: (id: string) => void;
  onComplete?: (id: string) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onStatusChange,
  onDelete,
  onComplete,
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
              <span>Ngày học: <strong className="font-medium text-slate-700">{formatDisplayDate(lesson.studyDate)}</strong></span>
            </div>
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

        <div className="flex items-center gap-1">
          {onComplete && (
            <button
              onClick={() => onComplete(lesson.id)}
              className="mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium text-xs sm:text-sm rounded-lg transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Hoàn thành
            </button>
          )}
          <label htmlFor={`status-select-${lesson.id}`} className="text-xs text-slate-400 mr-1">
            Đổi trạng thái:
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
  );
};
