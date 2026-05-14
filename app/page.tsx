'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Calendar from '@/components/Calendar';
import EventModal from '@/components/EventModal';
import { CalendarEvent, getEvents, saveEvent, deleteEvent } from '@/lib/supabase';
import { parseISO, isAfter, startOfToday, format } from 'date-fns';

export default function PlannerPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await getEvents();
      setEvents([...data]);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleEventsGenerated = async (newEvents: CalendarEvent[]) => {
    setIsLoading(true);
    try {
      await Promise.all(newEvents.map(event => saveEvent(event)));
    } catch (error) {
      console.error("Error saving generated events:", error);
    } finally {
      await loadEvents();
    }
  };

  const handleSaveEvent = async (event: CalendarEvent) => {
    await saveEvent(event);
    await loadEvents();
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    await loadEvents();
  };

  const handleDateClick = (date: Date) => {
    // 로컬 시간 문자열로 변환 (YYYY-MM-DDTHH:mm)
    const localISO = format(date, "yyyy-MM-dd'T'09:00");
    setSelectedEvent({
      start: localISO,
      end: localISO,
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const upcomingEvents = events
    .filter(e => isAfter(parseISO(e.start), startOfToday()))
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
    .slice(0, 5);

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      <Sidebar 
        onEventsGenerated={handleEventsGenerated} 
        upcomingEvents={upcomingEvents}
      />
      
      <main className="flex-1 p-8 h-full min-w-0">
        <Calendar 
          events={events} 
          onSelectDate={handleDateClick}
          onSelectEvent={handleEventClick}
        />
      </main>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-600">일정 정보를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
