import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { StoreSettings } from '../types/settings';

const DEFAULT_SETTINGS: StoreSettings = {
  id: 'main',
  address: 'Via Universitária, Simões Filho, BA',
  opening_hours: '08:00 - 19:00',
  start_hour: 8,
  end_hour: 19,
  opening_days: [1, 2, 3, 4, 5, 6], // Segunda a Sábado por padrão
};

export const getStoreSettings = async (): Promise<StoreSettings> => {
  if (!isSupabaseConfigured || !supabase) {
    return DEFAULT_SETTINGS;
  }

  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 'main')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found, return default
      return DEFAULT_SETTINGS;
    }
    throw new Error(error.message);
  }

  return data;
};

export const updateStoreSettings = async (settings: Partial<StoreSettings>): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado');
  }

  const { error } = await supabase
    .from('store_settings')
    .upsert({ id: 'main', ...settings })
    .eq('id', 'main');

  if (error) {
    throw new Error(error.message);
  }
};
