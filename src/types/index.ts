export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  promotionPrice?: number | null;
  promotionActive?: boolean;
  image: string;
  category: string;
  featured?: boolean;
}

export type Category = 'Sucos' | 'Polpas' | 'Licores' | 'Outros';
