/*
# Seed Sample Farms, Listings, and Ads

## Overview
Populates the marketplace with realistic sample data so it is not empty
on first load.

## Data Inserted
1. 4 sample farms with profiles and images.
2. 12 listings across categories with prices, images, and featured flags.
3. 3 promotional ads (hero, sidebar, inline).
4. Marks a couple listings as featured/with ad_tier for the ads system.

## Notes
- Uses Unsplash source URLs for images (reliable, license-free).
- Idempotent: inserts guarded by NOT EXISTS checks.
*/

INSERT INTO farms (name, description, location, owner_name, phone, email, image_url, cover_url) VALUES
  ('Green Valley Farm',
   'Family-owned organic farm nestled in the hills, growing seasonal vegetables and herbs since 1985.',
   'Sonoma County, CA', 'Martha & Joe Greenfield', '(707) 555-0142', 'hello@greenvalley.example',
   'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=400&fit=crop',
   'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=400&fit=crop')
ON CONFLICT DO NOTHING;

INSERT INTO farms (name, description, location, owner_name, phone, email, image_url, cover_url) VALUES
  ('Sunny Meadow Dairy',
   'Pasture-raised dairy and eggs from happy, grass-fed cows and free-range chickens.',
   'Vermont, VT', 'Ellie Summers', '(802) 555-0188', 'ellie@sunnymeadow.example',
   'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=400&h=400&fit=crop',
   'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=1200&h=400&fit=crop')
ON CONFLICT DO NOTHING;

INSERT INTO farms (name, description, location, owner_name, phone, email, image_url, cover_url) VALUES
  ('Golden Grain Fields',
   'Heritage grains and stone-milled flour from the heartland of the prairies.',
   'Kansas, KS', 'Bill Harvester', '(913) 555-0199', 'bill@goldengrain.example',
   'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
   'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&h=400&fit=crop')
ON CONFLICT DO NOTHING;

INSERT INTO farms (name, description, location, owner_name, phone, email, image_url, cover_url) VALUES
  ('Orchard Hills',
   'Orchard-grown fruits and berries picked at peak ripeness every season.',
   'Hood River, OR', 'Lily Chen', '(541) 555-0167', 'lily@orchardhills.example',
   'https://images.unsplash.com/photo-1619535821299-6d3c3c1c1d2e?w=400&h=400&fit=crop',
   'https://images.unsplash.com/photo-1619535821299-6d3c3c1c1d2e?w=1200&h=400&fit=crop')
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  gv uuid := (SELECT id FROM farms WHERE name = 'Green Valley Farm');
  sm uuid := (SELECT id FROM farms WHERE name = 'Sunny Meadow Dairy');
  gg uuid := (SELECT id FROM farms WHERE name = 'Golden Grain Fields');
  oh uuid := (SELECT id FROM farms WHERE name = 'Orchard Hills');
  veg uuid := (SELECT id FROM categories WHERE slug = 'vegetables');
  fruit uuid := (SELECT id FROM categories WHERE slug = 'fruits');
  dairy uuid := (SELECT id FROM categories WHERE slug = 'dairy-eggs');
  grain uuid := (SELECT id FROM categories WHERE slug = 'grains');
  herb uuid := (SELECT id FROM categories WHERE slug = 'herbs');
BEGIN
  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_organic, is_featured, ad_tier, ad_expires_at)
  SELECT gv, veg, 'Heirloom Tomatoes', 'Vine-ripened heirloom tomatoes in rainbow colors. Sweet and juicy.', 4.50, 'lb', 80,
    'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500&h=500&fit=crop', true, true, 'premium', now() + interval '30 days'
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Heirloom Tomatoes');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_organic, is_featured)
  SELECT gv, veg, 'Rainbow Carrots', 'Sweet, crunchy carrots in purple, orange, yellow, and white.', 3.00, 'bunch', 50,
    'https://images.unsplash.com/photo-1598340722220-2a5c5a4c6c5d?w=500&h=500&fit=crop', true, true
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Rainbow Carrots');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_organic)
  SELECT gv, herb, 'Fresh Basil Bunch', 'Aromatic Genovese basil, perfect for pesto.', 2.50, 'bunch', 40,
    'https://images.unsplash.com/photo-1616285260818-7b2f5c3c5c5d?w=500&h=500&fit=crop', true
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Fresh Basil Bunch');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_organic, is_featured, ad_tier, ad_expires_at)
  SELECT sm, dairy, 'Fresh Raw Milk', 'Creamy, unpasteurized milk from grass-fed Jersey cows.', 6.00, 'gallon', 20,
    'https://images.unsplash.com/photo-1563636616010-9f6b3b2c5c5d?w=500&h=500&fit=crop', true, true, 'basic', now() + interval '20 days'
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Fresh Raw Milk');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_organic)
  SELECT sm, dairy, 'Free-Range Eggs', 'Dozen large brown eggs from free-range hens.', 5.00, 'dozen', 60,
    'https://images.unsplash.com/photo-1582728652486-c2d3c5c5c5d?w=500&h=500&fit=crop', true
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Free-Range Eggs');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_organic)
  SELECT sm, dairy, 'Aged Cheddar Wheel', 'Sharp, 12-month aged raw-milk cheddar.', 14.00, 'lb', 15,
    'https://images.unsplash.com/photo-1486297678162-eb6852477d3c?w=500&h=500&fit=crop', true
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Aged Cheddar Wheel');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_featured, ad_tier, ad_expires_at)
  SELECT gg, grain, 'Stone-Milled Whole Wheat Flour', 'Freshly milled heritage wheat flour, 5lb bag.', 8.00, 'bag', 100,
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&h=500&fit=crop', true, 'premium', now() + interval '45 days'
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Stone-Milled Whole Wheat Flour');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url)
  SELECT gg, grain, 'Heirloom Cornmeal', 'Stone-ground cornmeal for polenta and cornbread.', 6.50, 'lb', 70,
    'https://images.unsplash.com/photo-1589256837237-6c3c5c5c5d?w=500&h=500&fit=crop'
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Heirloom Cornmeal');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_organic, is_featured)
  SELECT oh, fruit, 'Honeycrisp Apples', 'Crunchy, sweet Honeycrisp apples picked this week.', 3.50, 'lb', 120,
    'https://images.unsplash.com/photo-1568702846914-6a36d3c5c5d?w=500&h=500&fit=crop', true, true
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Honeycrisp Apples');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_organic)
  SELECT oh, fruit, 'Blueberry Pints', 'Plump, sweet organic blueberries.', 5.50, 'pint', 45,
    'https://images.unsplash.com/photo-1589256837237-6c3c5c5c5d?w=500&h=500&fit=crop', true
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Blueberry Pints');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_organic)
  SELECT oh, fruit, 'Canning Peaches', 'Freestone peaches perfect for canning and jam.', 4.00, 'lb', 90,
    'https://images.unsplash.com/photo-1589256837237-6c3c5c5c5d?w=500&h=500&fit=crop', true
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Canning Peaches');

  INSERT INTO listings (farm_id, category_id, title, description, price, unit, quantity_available, image_url, is_organic)
  SELECT gv, veg, 'Kale Bunch', 'Sturdy lacinato kale, great for salads and chips.', 2.00, 'bunch', 60,
    'https://images.unsplash.com/photo-1589256837237-6c3c5c5c5d?w=500&h=500&fit=crop', true
  WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Kale Bunch');
END $$;

INSERT INTO ads (title, description, image_url, link_url, placement, is_active, end_date)
VALUES
  ('Farm-Fresh Delivered Weekly', 'Subscribe to a weekly produce box from local farms. First box 20% off.',
   'https://images.unsplash.com/photo-1542838132-92c5eb009b8c?w=1200&h=400&fit=crop', '#', 'hero', true, now() + interval '60 days'),
  ('Become a Seller', 'List your farm products and reach thousands of local buyers.',
   'https://images.unsplash.com/photo-1444492417376-2270a6c6c5c5?w=600&h=400&fit=crop', '#', 'sidebar', true, now() + interval '90 days'),
  ('Fall Harvest Festival', 'Join us Oct 12 for live music, food, and farm tours.',
   'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=300&fit=crop', '#', 'inline', true, now() + interval '45 days')
ON CONFLICT DO NOTHING;
