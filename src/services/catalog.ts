import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Product } from '../types';

export const getCatalogProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(p => {
    const originalPrice = Number(p.price);
    const promotionPrice = p.promotion_price != null ? Number(p.promotion_price) : null;
    const hasPromotion = Boolean(p.promotion_active) && promotionPrice != null && promotionPrice > 0 && promotionPrice < originalPrice;

    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: hasPromotion ? promotionPrice : originalPrice,
      originalPrice,
      promotionPrice: hasPromotion ? promotionPrice : null,
      promotionActive: hasPromotion,
      category: p.category,
      image: p.image_url || '',
      featured: p.featured || false
    };
  });
};

export const getAllAdminProducts = async (): Promise<any[]> => {
  if (!isSupabaseConfigured || !supabase) return [];
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};
