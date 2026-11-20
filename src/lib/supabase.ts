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
