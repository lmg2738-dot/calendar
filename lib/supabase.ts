import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if credentials are placeholders or empty
const isValidConfig = supabaseUrl && 
                    supabaseAnonKey && 
                    !supabaseUrl.includes('your-project-id') &&
                    !supabaseAnonKey.includes('your-anon-key');

export const supabase = isValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.info('Supabase is not configured yet. Using localStorage as fallback.');
}

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
        .select('*')
        .order('start', { ascending: true });
        
      if (error) {
        console.error('Supabase Error (getEvents):', error.message);
        throw error;
      }
      
      console.log('Successfully fetched events from Supabase:', data?.length || 0);
      
      // DB(snake_case) -> App(camelCase) 변환
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        start: item.start,
        end: item.end,
        priority: item.priority,
        description: item.description,
        isAiGenerated: item.is_ai_generated,
        userId: item.user_id
      }));
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to localStorage');
    }
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
  if (supabase) {
    try {
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

      console.log('Attemping to save to Supabase:', dbData);

      const { data, error } = await supabase
        .from('events')
        .upsert(dbData)
        .select()
        .single();
        
      if (error) {
        console.error('Supabase Save Error (saveEvent):', error.message);
        if (error.message.includes('is_ai_generated')) {
          console.error('CRITICAL: is_ai_generated 컬럼이 테이블에 없습니다. SQL Editor에서 수정 쿼리를 실행하세요.');
        }
        throw error;
      }
      
      console.log('Successfully saved/updated event in Supabase:', data.id);
      
      return {
        id: data.id,
        title: data.title,
        start: data.start,
        end: data.end,
        priority: data.priority,
        description: data.description,
        isAiGenerated: data.is_ai_generated,
        userId: data.user_id
      };
    } catch (err) {
      console.warn('Supabase save failed, falling back to localStorage');
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
