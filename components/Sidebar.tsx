'use client';

import React, { useState } from 'react';
import { Send, BrainCircuit, Sparkles, Filter, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { parseNaturalLanguage } from '@/lib/gemini';
import { CalendarEvent } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';

interface SidebarProps {
  onEventsGenerated: (events: CalendarEvent[]) => void;
  upcomingEvents: CalendarEvent[];
}

export default function Sidebar({ onEventsGenerated, upcomingEvents }: SidebarProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const parsed = await parseNaturalLanguage(input);
      const newEvents: CalendarEvent[] = parsed.map((p: any) => ({
        id: uuidv4(),
        title: p.title,
        start: `${p.date}T${p.time}:00`,
        end: `${p.date}T${p.time}:00`, // Assume 1hr or just point for now
        priority: p.priority,
        description: p.description || '',
        isAiGenerated: true
      }));
      onEventsGenerated(newEvents);
      setInput('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-80 h-full flex flex-col gap-8 p-8 border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm">
          <BrainCircuit size={20} />
        </div>
        <h1 className="text-lg font-display font-bold text-slate-900">AI Smart Planner</h1>
      </div>

      {/* AI Input */}
      <div className="space-y-4">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
          <Sparkles size={12} className="text-blue-500" />
          AI Quick Add
        </label>
        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'Team meeting tomorrow 3pm'..."
            className="w-full h-32 p-4 pt-4 pb-12 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-sm shadow-inner"
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="absolute bottom-3 right-3 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>

      {/* Priority Filters */}
      <div className="space-y-4">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
          <Filter size={12} />
          Filter Priority
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border-l-4 border-red-500 bg-red-50 text-red-800 hover:bg-red-100 transition-colors">
            High
          </button>
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border-l-4 border-amber-500 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors">
            Med
          </button>
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border-l-4 border-blue-500 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors">
            Low
          </button>
        </div>
      </div>

      {/* Upcoming Summary */}
      <div className="flex-1 flex flex-col min-h-0">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2 mb-4">
          <CalendarIcon size={12} />
          Today's Summary
        </label>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-4">No upcoming events</p>
          ) : (
            upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-50 hover:border-slate-200 hover:bg-slate-50/50 transition-all group">
                <span className={`shrink-0 w-2 h-2 rounded-full ${
                  event.priority === 'high' ? 'bg-red-500' : 
                  event.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Clock size={10} />
                    {format(parseISO(event.start), 'HH:mm')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-auto p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
        <p className="text-[10px] leading-relaxed text-emerald-800">
          <strong className="block mb-1">💡 Supabase Tip:</strong>
          Store 'events' table with columns: title, start, priority. Use Realtime for instant updates.
        </p>
      </div>
    </div>
  );
}
