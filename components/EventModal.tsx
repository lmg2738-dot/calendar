'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar as CalendarIcon, Clock, AlignLeft, Flag } from 'lucide-react';
import { CalendarEvent } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Partial<CalendarEvent> | null;
  onSave: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export default function EventModal({ isOpen, onClose, event, onSave, onDelete }: EventModalProps) {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    start: '',
    end: '',
    priority: 'medium',
    description: '',
    isAiGenerated: false
  });

  useEffect(() => {
    const updateForm = () => {
      if (event) {
        setFormData({
          ...event,
          title: event.title || '',
          description: event.description || '',
          start: event.start || format(new Date(), "yyyy-MM-dd'T'09:00"),
          priority: event.priority || 'medium',
          isAiGenerated: event.isAiGenerated || false
        });
      } else {
        setFormData({
          title: '',
          start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          end: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          priority: 'medium',
          description: '',
          isAiGenerated: false
        });
      }
    };
    
    updateForm();
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start) return;
    
    onSave({
      ...formData,
      id: formData.id || crypto.randomUUID(),
    } as CalendarEvent);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 1, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1, y: 40 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 border-b border-slate-100">
            <h3 className="text-xl font-display font-bold text-slate-900">
              {formData.id ? '일정 수정' : '새 일정 추가'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-400">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">일정 제목</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="어떤 일정이 있나요?"
                className="w-full px-5 py-3 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none transition-all text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CalendarIcon size={10} /> 날짜
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start ? formData.start.slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none transition-all text-sm font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Flag size={10} /> 우선순위
                </label>
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none transition-all text-sm font-medium text-slate-800 appearance-none"
                >
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlignLeft size={10} /> 상세 내용
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="추가 메모를 입력하세요."
                className="w-full h-28 px-5 py-3 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none resize-none transition-all text-sm text-slate-800"
              />
            </div>

            <div className="flex items-center justify-between pt-6">
              {formData.id && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(formData.id!);
                    onClose();
                  }}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <Trash2 size={16} />
                  삭제
                </button>
              )}
              <div className="flex items-center gap-4 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 text-sm font-bold"
                >
                  저장하기
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
