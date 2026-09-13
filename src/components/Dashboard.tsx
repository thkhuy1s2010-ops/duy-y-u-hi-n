import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { Lesson } from '../types';
import { Activity, Calendar as CalendarIcon, PieChart as PieChartIcon } from 'lucide-react';

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

const getNextDate = (l: Lesson) => l.nextReviewDate || l.studyDate;

export const Dashboard: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => {
  const todayStr = getTodayString();

  const activityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => addDays(todayStr, -6 + i));
    return last7Days.map(date => {
      const count = lessons.reduce((acc, lesson) => {
        return acc + (lesson.completedDates?.includes(date) ? 1 : 0);
      }, 0);
      const [, m, d] = date.split('-');
      return { date: `${d}/${m}`, count, fullDate: date };
    });
  }, [lessons, todayStr]);

  const upcomingData = useMemo(() => {
    const next7Days = Array.from({ length: 7 }, (_, i) => addDays(todayStr, i));
    return next7Days.map((date, i) => {
      const count = lessons.filter(l => getNextDate(l) === date).length;
      const [, m, d] = date.split('-');
      return { date: i === 0 ? 'Nay' : `${d}/${m}`, count };
    });
  }, [lessons, todayStr]);

  const retentionData = useMemo(() => {
    let newLessons = 0;
    let dueLessons = 0;
    let memorizedLessons = 0;

    lessons.forEach(l => {
      const nextDate = getNextDate(l);
      if (l.interval === 0) {
        newLessons++;
      } else if (nextDate <= todayStr) {
        dueLessons++;
      } else {
        memorizedLessons++;
      }
    });

    return [
      { name: 'Mới học', value: newLessons, color: '#38bdf8' }, // sky-400
      { name: 'Đến hạn', value: dueLessons, color: '#fbbf24' }, // amber-400
      { name: 'Đang ghi nhớ', value: memorizedLessons, color: '#34d399' } // emerald-400
    ].filter(d => d.value > 0);
  }, [lessons, todayStr]);

  if (lessons.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">Thống kê tiến độ</h2>
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Weekly Activity */}
        <div className="snap-center shrink-0 w-[85vw] sm:w-auto bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-slate-700">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-sm">Tần suất học (7 ngày qua)</h3>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#334155' }}
                />
                <Line type="monotone" dataKey="count" name="Đã ôn" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Retention Distribution */}
        <div className="snap-center shrink-0 w-[85vw] sm:w-auto bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-slate-700">
            <PieChartIcon className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm">Trạng thái ghi nhớ</h3>
          </div>
          <div className="h-40 w-full flex items-center justify-center relative">
             {retentionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={retentionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {retentionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#334155', fontWeight: '500' }}
                  />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <p className="text-sm text-slate-400">Chưa có dữ liệu</p>
             )}
          </div>
        </div>

        {/* Upcoming Reviews */}
        <div className="snap-center shrink-0 w-[85vw] sm:w-auto bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-slate-700">
            <CalendarIcon className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm">Dự báo ôn tập (7 ngày tới)</h3>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={upcomingData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" name="Cần ôn" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
