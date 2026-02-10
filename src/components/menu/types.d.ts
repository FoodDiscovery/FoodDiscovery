export interface MenuCategory {
  id: number;
  restaurant_id: string;
  name: string;
  display_order: number;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  dietary_tags: string[] | null;
  is_available: boolean;
}

export interface ItemFormData {
  name: string;
  description: string | null;
  price: number;
  dietary_tags: string[] | null;
  is_available: boolean;
}
