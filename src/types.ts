export type ReviewStatus = 'moi_hoc' | 'can_on_tap' | 'da_on_tap';
export type ReviewRating = 'forgot' | 'good' | 'easy';

export interface Lesson {
  id: string;
  title: string;
  studyDate: string; // ISO date string YYYY-MM-DD
  status: ReviewStatus;
  
  // SM-2 Algorithm variables
  nextReviewDate: string; // ISO date string YYYY-MM-DD
  interval: number; // in days
  easeFactor: number;
  repetitions: number;
  
  // Backwards compatibility for old MVP format (optional to keep for safety if users have data)
  reviewDates?: string[];
  completedDates?: string[];
}

export const STATUS_CONFIG: Record<
  ReviewStatus,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  can_on_tap: {
    label: 'Cần ôn tập',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    dotClass: 'bg-amber-500',
  },
  moi_hoc: {
    label: 'Mới học',
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-200',
    dotClass: 'bg-sky-500',
  },
  da_on_tap: {
    label: 'Đã ôn tập',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
};
