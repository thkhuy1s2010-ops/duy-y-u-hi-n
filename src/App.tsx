/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, BookOpenCheck, AlertCircle } from 'lucide-react';
import { LessonCard } from './components/LessonCard';
import { AddLessonModal } from './components/AddLessonModal';
import { Lesson, ReviewStatus } from './types';

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function App() {
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('spaced_rep_lessons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('spaced_rep_lessons', JSON.stringify(lessons));
  }, [lessons]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleStatusChange = (id: string, newStatus: ReviewStatus) => {
    setLessons((prevLessons) =>
      prevLessons.map((lesson) =>
        lesson.id === id ? { ...lesson, status: newStatus } : lesson
      )
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      setLessons((prevLessons) => prevLessons.filter((lesson) => lesson.id !== id));
    }
  };

  const handleAddLesson = (newLessonData: {
    title: string;
    studyDate: string;
    status: ReviewStatus;
  }) => {
    const r1 = addDays(newLessonData.studyDate, 1);
    const r2 = addDays(newLessonData.studyDate, 3);
    const r3 = addDays(newLessonData.studyDate, 7);

    const newLesson: Lesson = {
      id: Date.now().toString(),
      ...newLessonData,
      reviewDates: [r1, r2, r3],
    };
    // Add to the top of the list
    setLessons((prevLessons) => [newLesson, ...prevLessons]);
  };

  const handleCompleteReview = (id: string) => {
    setLessons((prevLessons) =>
      prevLessons.map((lesson) => {
        if (lesson.id === id) {
          const completed = lesson.completedDates ? [...lesson.completedDates] : [];
          if (!completed.includes(todayStr)) {
            completed.push(todayStr);
          }
          return { ...lesson, completedDates: completed, status: 'da_on_tap' };
        }
        return lesson;
      })
    );
  };

  const todayStr = getTodayString();
  const todayLessons = lessons.filter(
    (l) => l.reviewDates?.includes(todayStr) && !l.completedDates?.includes(todayStr)
  );
  const otherLessons = lessons.filter(
    (l) => !l.reviewDates?.includes(todayStr) || l.completedDates?.includes(todayStr)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-blue-600">
            <BookOpenCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">
              Spaced Rep
            </h1>
          </div>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm bài học</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {lessons.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">Chưa có bài học nào</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Bắt đầu thêm các bài học mới để lên kế hoạch ôn tập theo phương pháp Spaced Repetition.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm bài học đầu tiên
            </button>
          </div>
        ) : (
          <>
            {todayLessons.length > 0 && (
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">HÔM NAY CẦN ÔN</h2>
                </div>
                <div className="space-y-4">
                  {todayLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onComplete={handleCompleteReview}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Tất cả bài học</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Quản lý các bài học cần ôn tập của bạn.
                </p>
              </div>
              <div className="space-y-4">
                {otherLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <AddLessonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLesson={handleAddLesson}
      />
    </div>
  );
}
