import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only initialize if we have the credentials to avoid crashing during build/prerender
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO DateTime
  end: string;   // ISO DateTime
  priority: 'high' | 'medium' | 'low';
  description?: string;
  isAiGenerated: boolean;
  userId?: string;
}

// Fallback logic using localStorage if Supabase is not configured
const STORAGE_KEY = 'ai_smart_planner_events';

export const getEvents = async (): Promise<CalendarEvent[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*');
      if (error) throw error;
      
      // DB(snake_case) -> App(camelCase) 변환
      return (data || []).map(item => ({
        ...item,
        isAiGenerated: item.is_ai_generated,
        userId: item.user_id
      }));
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to localStorage', err);
    }
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
  if (supabase) {
    try {
      // App(camelCase) -> DB(snake_case) 변환
      const dbData = {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        priority: event.priority,
        description: event.description,
        is_ai_generated: event.isAiGenerated,
        user_id: event.userId
      };

      const { data, error } = await supabase
        .from('events')
        .upsert(dbData)
        .select()
        .single();
      if (error) throw error;
      
      return {
        ...data,
        isAiGenerated: data.is_ai_generated,
        userId: data.user_id
      };
    } catch (err) {
      console.warn('Supabase save failed, falling back to localStorage', err);
    }
  }

  const events = await getEvents();
  const existingIndex = events.findIndex(e => e.id === event.id);
  
  let newEvents;
  if (existingIndex >= 0) {
    newEvents = [...events];
    newEvents[existingIndex] = event;
  } else {
    newEvents = [...events, event];
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents));
  return event;
};

export const deleteEvent = async (id: string): Promise<void> => {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('Supabase delete failed, falling back to localStorage', err);
    }
  }

  const events = await getEvents();
  const newEvents = events.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents));
};
