/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, BookOpenCheck, AlertCircle, Database, Calendar as CalendarIcon, List as ListIcon } from 'lucide-react';
import { LessonCard } from './components/LessonCard';
import { AddLessonModal } from './components/AddLessonModal';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { Lesson, ReviewStatus, ReviewRating } from './types';

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
  const [currentDate, setCurrentDate] = useState(getTodayString());
  
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

  // Keep currentDate accurate if app is left open (e.g. overnight)
  useEffect(() => {
    const timer = setInterval(() => {
      const today = getTodayString();
      if (today !== currentDate) {
        setCurrentDate(today);
      }
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [currentDate]);

  // Sync state if another tab changes localStorage (realtime cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spaced_rep_lessons' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLessons(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('spaced_rep_lessons', JSON.stringify(lessons));
  }, [lessons]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'agenda' | 'calendar'>('calendar');

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
    const newLesson: Lesson = {
      id: Date.now().toString(),
      ...newLessonData,
      nextReviewDate: newLessonData.studyDate, // Start reviewing immediately or on the given date
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
    };
    // Add to the top of the list
    setLessons((prevLessons) => [newLesson, ...prevLessons]);
  };

  const handleReview = (id: string, rating: ReviewRating) => {
    setLessons((prevLessons) =>
      prevLessons.map((lesson) => {
        if (lesson.id !== id) return lesson;
        
        let { interval = 0, easeFactor = 2.5, repetitions = 0 } = lesson;
        
        if (rating === 'forgot') {
          repetitions = 0;
          interval = 1;
          easeFactor = Math.max(1.3, easeFactor - 0.2);
        } else if (rating === 'good') {
          repetitions += 1;
          interval = (repetitions === 1) ? 1 : (repetitions === 2) ? 6 : Math.round(interval * easeFactor);
        } else if (rating === 'easy') {
          repetitions += 1;
          easeFactor += 0.15;
          interval = (repetitions === 1) ? 4 : Math.round(interval * easeFactor * 1.3);
        }
        
        const nextReviewDate = addDays(currentDate, interval);
        
        return {
          ...lesson,
          interval,
          easeFactor,
          repetitions,
          nextReviewDate,
          status: 'da_on_tap'
        };
      })
    );
  };

  const handleSeedData = () => {
    const today = currentDate;
    const now = Date.now();
    
    const subjects = [
      'Tiếng Anh', 'Toán Học', 'Vật Lý', 'Hóa Học', 'Sinh Học', 
      'Lịch Sử', 'Địa Lý', 'Lập Trình', 'Tiếng Nhật', 'Ngữ Văn'
    ];
    
    const topics = [
      'Từ vựng Unit', 'Ngữ pháp:', 'Định lý', 'Công thức', 'Cấu trúc', 
      'Chương', 'Phân tích', 'Các dạng bài', 'Tổng hợp', 'Khái niệm'
    ];

    const generateRandomLesson = (idIndex: number, offsetDays: number, isOverdue: boolean) => {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const title = `${subject}: ${topic} ${Math.floor(Math.random() * 20) + 1}`;
      
      const studyDateOffset = -Math.floor(Math.random() * 30) - 1; // Studied 1 to 30 days ago
      const studyDate = addDays(today, studyDateOffset);
      
      const nextReviewDate = addDays(today, offsetDays);
      
      // Calculate realistic SM2 stats based on the gap
      const repetitions = Math.floor(Math.random() * 5) + (isOverdue ? 0 : 1);
      const easeFactor = 2.5 + (Math.random() * 0.5 - 0.2); // 2.3 to 3.0
      const interval = Math.abs(studyDateOffset) + offsetDays;
      
      return {
        id: `mock-${now}-${idIndex}`,
        title,
        studyDate,
        status: (offsetDays <= 0 && interval > 0) ? 'can_on_tap' : (interval === 0 ? 'moi_hoc' : 'da_on_tap') as ReviewStatus,
        nextReviewDate,
        interval,
        easeFactor,
        repetitions,
      };
    };

    const mockLessons: Lesson[] = [];
    let count = 0;

    // Generate ~8 Overdue lessons (-7 to -1 days)
    for (let i = 0; i < 8; i++) {
      mockLessons.push(generateRandomLesson(count++, -Math.floor(Math.random() * 7) - 1, true));
    }

    // Generate ~15 Today lessons (0 days)
    for (let i = 0; i < 15; i++) {
      mockLessons.push(generateRandomLesson(count++, 0, false));
    }

    // Generate ~7 Tomorrow lessons (+1 days)
    for (let i = 0; i < 7; i++) {
      mockLessons.push(generateRandomLesson(count++, 1, false));
    }

    // Generate ~20 Future lessons (+2 to +30 days)
    for (let i = 0; i < 20; i++) {
      mockLessons.push(generateRandomLesson(count++, Math.floor(Math.random() * 29) + 2, false));
    }

    setLessons((prev) => [...mockLessons, ...prev]);
  };

  // Safe parsing for nextReviewDate (with fallback for old data)
  const getNextDate = (l: Lesson) => l.nextReviewDate || l.studyDate;
  
  // Group lessons by date
  const groupedLessons = lessons.reduce((acc, lesson) => {
    const date = getNextDate(lesson);
    if (!acc[date]) acc[date] = [];
    acc[date].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const sortedDates = Object.keys(groupedLessons).sort();

  const getAgendaTitle = (dateStr: string, todayStr: string) => {
    if (dateStr < todayStr) return { title: 'Quá hạn', color: 'text-rose-600', dot: 'bg-rose-500', icon: <AlertCircle className="w-5 h-5" /> };
    if (dateStr === todayStr) return { title: 'Hôm nay', color: 'text-amber-600', dot: 'bg-amber-500', icon: <AlertCircle className="w-5 h-5" /> };
    
    const tomorrowStr = addDays(todayStr, 1);
    if (dateStr === tomorrowStr) return { title: 'Ngày mai', color: 'text-blue-600', dot: 'bg-blue-500' };
    
    // Safe date parsing for YYYY-MM-DD
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[date.getDay()];
    
    return { 
      title: `${dayName}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`, 
      color: 'text-slate-600', 
      dot: 'bg-slate-400' 
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-blue-600">
            <BookOpenCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">
              Spaced Rep
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedData}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
              title="Thêm dữ liệu mẫu để kiểm tra"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Data Mẫu</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm bài học</span>
              <span className="sm:hidden">Thêm</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {lessons.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">Chưa có bài học nào</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Bắt đầu thêm các bài học mới để lên kế hoạch ôn tập theo phương pháp Spaced Repetition.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Thêm bài học đầu tiên
              </button>
              <button
                onClick={handleSeedData}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer w-full sm:w-auto"
              >
                <Database className="w-4 h-4 text-slate-400" />
                Tạo 50 bài học mẫu
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end mb-6">
              <div className="bg-white border border-slate-200 p-1 rounded-xl inline-flex shadow-sm">
                <button
                  onClick={() => setViewMode('agenda')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'agenda' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Danh sách</span>
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'calendar' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Lịch tuần</span>
                </button>
              </div>
            </div>

            {viewMode === 'calendar' ? (
              <div className="mb-8">
                <CalendarView lessons={lessons} currentDate={currentDate} onReview={handleReview} />
              </div>
            ) : (
              <Dashboard lessons={lessons} />
            )}
            
            {viewMode === 'agenda' && (
              <div className="space-y-8">
              {sortedDates.map((dateStr) => {
                const dateLessons = groupedLessons[dateStr];
                const isActionable = dateStr <= currentDate;
                const { title, color, dot, icon } = getAgendaTitle(dateStr, currentDate);
                
                return (
                  <div key={dateStr} className="relative">
                    <div className="sticky top-16 z-20 bg-slate-50/95 backdrop-blur-sm py-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`}></div>
                        <h2 className={`text-base sm:text-lg font-bold tracking-wide flex items-center gap-1.5 ${color}`}>
                          {icon}
                          {title}
                        </h2>
                        <div className="h-px flex-1 bg-slate-200 ml-2"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 border-l-2 border-slate-200 ml-1 pl-4 sm:ml-1.5 sm:pl-5">
                      {dateLessons.map((lesson) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          onStatusChange={handleStatusChange}
                          onDelete={handleDelete}
                          onReview={isActionable ? handleReview : undefined}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
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
