import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
};

export type Farm = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  cover_url: string | null;
  created_at: string;
};

export type Listing = {
  id: string;
  farm_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  price: number;
  unit: string;
  quantity_available: number;
  image_url: string | null;
  is_organic: boolean;
  is_featured: boolean;
  ad_tier: string;
  ad_expires_at: string | null;
  created_at: string;
};

export type Ad = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
};

export type ListingWithFarm = Listing & {
  farm: Pick<Farm, 'id' | 'name' | 'location' | 'image_url'> | null;
  category: Pick<Category, 'id' | 'name' | 'slug'> | null;
};

export type Review = {
  id: string;
  target_type: 'listing' | 'farm';
  target_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  farm_id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  pickup_notes: string | null;
  status: string;
  total: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  listing_id: string | null;
  farm_id: string | null;
  listing_title: string;
  farm_name: string;
  unit_price: number;
  quantity: number;
  unit: string;
  subtotal: number;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};
