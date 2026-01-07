
export enum Category {
  TOPS = 'Tops',
  BOTTOMS = 'Bottoms',
  SHOES = 'Shoes',
  ACCESSORIES = 'Accessories',
  OUTERWEAR = 'Outerwear'
}

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  color: string;
  imageUrl: string;
  tags: string[];
  createdAt: number;
}

export interface OutfitSuggestion {
  title: string;
  description: string;
  items: string[]; // IDs of recommended clothing items
  occasion: string;
  stylingTips: string;
}

export type TabType = 'closet' | 'stylist' | 'add' | 'settings';
