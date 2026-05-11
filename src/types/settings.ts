export interface StoreSettings {
  id: string;
  address: string;
  opening_hours: string;
  start_hour: number;
  end_hour: number;
  opening_days: number[]; // 0 for Sunday, 1 for Monday, etc.
}
