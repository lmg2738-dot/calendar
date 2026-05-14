'use client';

import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, BrainCircuit } from 'lucide-react';
import { CalendarEvent } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarProps {
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export default function Calendar({ events, onSelectDate, onSelectEvent }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(parseISO(event.start), day));
  };

  const priorityColors = {
    high: 'bg-red-50 text-red-900 border-l-4 border-l-red-500 border-y border-r border-red-100',
    medium: 'bg-amber-50 text-amber-900 border-l-4 border-l-amber-500 border-y border-r border-amber-100',
    low: 'bg-blue-50 text-blue-900 border-l-4 border-l-blue-500 border-y border-r border-blue-100',
  };

  return (
    <div className="flex flex-col h-full bg-slate-200 rounded-3xl shadow-2xl border-4 border-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 bg-white">
        <h2 className="text-2xl font-display font-bold text-slate-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center border border-slate-200 hover:bg-slate-50 rounded-xl transition-all text-slate-600">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center border border-slate-200 hover:bg-slate-50 rounded-xl transition-all text-slate-600">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekdays */}
      <div className="calendar-grid bg-slate-50 border-y border-slate-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="calendar-grid flex-1 overflow-y-auto min-h-0 bg-slate-200">
        {calendarDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`min-h-[110px] p-2 bg-white group cursor-pointer transition-all hover:bg-slate-50
                ${!isCurrentMonth ? 'opacity-40' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-colors
                  ${isToday ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : isCurrentMonth ? 'text-slate-800' : 'text-slate-300'}`}>
                  {format(day, 'd')}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-all">
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-1">
                {dayEvents.map(event => (
                  <motion.div
                    layoutId={event.id}
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(event);
                    }}
                    className={`px-2 py-1.5 rounded-md text-[10px] font-bold truncate flex items-center gap-1.5 shadow-sm
                      ${priorityColors[event.priority]}`}
                  >
                    {event.isAiGenerated && <BrainCircuit size={10} className="shrink-0 opacity-60" />}
                    {event.title}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
