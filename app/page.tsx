'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Calendar from '@/components/Calendar';
import EventModal from '@/components/EventModal';
import { CalendarEvent, getEvents, saveEvent, deleteEvent } from '@/lib/supabase';
import { parseISO, isAfter, startOfToday } from 'date-fns';

export default function PlannerPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadEvents = async () => {
    setIsLoading(true);
    const data = await getEvents();
    setEvents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleEventsGenerated = async (newEvents: CalendarEvent[]) => {
    for (const event of newEvents) {
      await saveEvent(event);
    }
    await loadEvents();
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
    setSelectedEvent({
      start: date.toISOString(),
      end: date.toISOString(),
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
          <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
