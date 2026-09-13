import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Lesson, ReviewRating } from '../types';

interface CalendarViewProps {
  lessons: Lesson[];
  currentDate: string; // YYYY-MM-DD
  onReview?: (id: string, rating: ReviewRating) => void;
}

const getStartOfWeek = (dateString: string) => {
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0 is Sunday
  date.setDate(date.getDate() - day);
  return date;
};

export const CalendarView: React.FC<CalendarViewProps> = ({ lessons, currentDate, onReview }) => {
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(currentDate));

  const nextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const startMonth = weekStart.getMonth();
  const startYear = weekStart.getFullYear();
  
  const endOfWeek = weekDays[6];
  const endMonth = endOfWeek.getMonth();
  const endYear = endOfWeek.getFullYear();

  let title = `[ ${months[startMonth]} ${startYear} ]`;
  if (startMonth !== endMonth) {
    if (startYear !== endYear) {
      title = `[ ${months[startMonth]} ${startYear} - ${months[endMonth]} ${endYear} ]`;
    } else {
      title = `[ ${months[startMonth]} - ${months[endMonth]} ${startYear} ]`;
    }
  }

  const getNextDate = (l: Lesson) => l.nextReviewDate || l.studyDate;

  return (
    <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Controls and Title */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={prevWeek} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h2 className="text-xl sm:text-2xl font-bold font-sans text-center text-black tracking-wide uppercase">
            {title}
          </h2>
          
          <button onClick={nextWeek} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* The Calendar Grid exactly like the worksheet */}
        <table className="w-full border-collapse border-2 border-[#333333] table-fixed">
          <thead>
            <tr>
              {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => (
                <th key={day} className="border-2 border-[#333333] bg-[#666666] text-white text-[10px] sm:text-xs font-bold py-2 sm:py-3 text-center uppercase tracking-wider w-[14.28%]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {weekDays.map((dateObj, dayIdx) => {
                const y = dateObj.getFullYear();
                const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                const d = String(dateObj.getDate()).padStart(2, '0');
                const dateStr = `${y}-${m}-${d}`;
                
                const isToday = dateStr === currentDate;
                const dayLessons = lessons.filter(l => getNextDate(l) === dateStr);

                return (
                  <td 
                    key={dayIdx} 
                    className={`border-2 border-[#333333] h-64 sm:h-96 align-top p-1 sm:p-2 relative transition-colors ${isToday ? 'bg-amber-50/50' : 'bg-white'}`}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm sm:text-base font-bold mb-2 ${isToday ? 'text-amber-600' : 'text-black'}`}>
                        {dateObj.getDate()}
                      </span>
                      
                      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto no-scrollbar pb-1">
                        {dayLessons.map(lesson => {
                          let colorClass = 'bg-slate-100 text-slate-800 border-slate-200';
                          if (lesson.interval === 0) colorClass = 'bg-sky-100 text-sky-800 border-sky-200';
                          else if (lesson.status === 'da_on_tap') colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                          else colorClass = 'bg-amber-100 text-amber-800 border-amber-200';

                          return (
                            <div 
                              key={lesson.id} 
                              className={`text-[10px] sm:text-xs px-2 py-1.5 rounded-md border ${colorClass} leading-snug break-words cursor-pointer hover:opacity-80 transition`}
                              title={lesson.title}
                            >
                              {lesson.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>

        <div className="mt-4 text-center text-[10px] sm:text-xs text-slate-500">
          © 2026 by Spaced Rep. Education grants users permission to reproduce this work sheet for educational purposes only.
        </div>
      </div>
    </div>
  );
};
