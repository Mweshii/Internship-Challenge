-- =============================================================================
-- SAMPLE DATA - for demonstration only.
--
-- These products, prices and stock quantities are placeholders so the shop has
-- something to show. They are NOT a real stock list. Replace them with what the
-- business actually sells: either edit this file and run `npm run db:reset`,
-- or sign in to the admin dashboard and use the Products tab.
--
-- image_url points at files in client/public/images/products/.
-- =============================================================================

INSERT INTO categories (id, slug, name, section, sort_order) VALUES
  (1,  'phone-cases',          'Phone Cases',           'accessories', 1),
  (2,  'screen-protectors',    'Screen Protectors',     'accessories', 2),
  (3,  'chargers-cables',      'Chargers & Cables',     'accessories', 3),
  (4,  'earphones-headphones', 'Earphones & Audio',     'accessories', 4),
  (5,  'power-banks',          'Power Banks',           'accessories', 5),
  (6,  'adapters',             'Adapters',              'accessories', 6),
  (7,  'stands-mounts',        'Stands & Mounts',       'accessories', 7),
  (8,  'other-accessories',    'Other',                 'accessories', 8),
  (9,  'tablets',              'Tablets',               'electronics', 1),
  (10, 'smartwatches',         'Smartwatches',          'electronics', 2),
  (11, 'laptops',              'Laptops',               'electronics', 3),
  (12, 'gaming-accessories',   'Gaming',                'electronics', 4),
  (13, 'computer-accessories', 'Computer Accessories',  'electronics', 5),
  (14, 'other-gadgets',        'Other Gadgets',         'electronics', 6);

INSERT INTO products (id, category_id, name, description, compatibility, price, image_url) VALUES
  -- Accessories ---------------------------------------------------------------
  (1,  1,  'iPhone 15 Case',            'Slim matte protective case with raised camera edge.',      'iPhone 15',                    299.00,  '/images/products/case-black.svg'),
  (2,  1,  'Clear Shockproof Case',     'Transparent case with reinforced corners.',                'Samsung Galaxy S24',           249.00,  '/images/products/case-clear.svg'),
  (3,  1,  'Silicone Case - Blue',      'Soft-touch silicone case with microfibre lining.',         'iPhone 14 / 14 Pro',           279.00,  '/images/products/case-blue.svg'),
  (4,  2,  'Screen Protector',          'Tempered glass, 9H hardness, easy-fit frame included.',    'iPhone 15 / 15 Pro',           199.00,  '/images/products/screen-protector.svg'),
  (5,  2,  'Privacy Screen Protector',  'Tempered glass that hides your screen from side angles.',  'Samsung Galaxy A-series',      259.00,  '/images/products/screen-protector.svg'),
  (6,  3,  '20W Charger',               'Fast-charging USB-C wall plug.',                           'USB-C devices',                399.00,  '/images/products/charger.svg'),
  (7,  3,  'Lightning Cable',           '1 m braided charge and sync cable.',                       'iPhone 5 to iPhone 14',        249.00,  '/images/products/cable-white.svg'),
  (8,  3,  'USB-C to USB-C Cable',      '1.5 m, supports fast charging up to 60W.',                 'Android phones, iPhone 15+',   199.00,  '/images/products/cable-dark.svg'),
  (9,  4,  'Wireless Earbuds',          'Bluetooth earbuds with charging case.',                    'iOS and Android',              699.00,  '/images/products/earbuds.svg'),
  (10, 4,  'Over-Ear Headphones',       'Wireless headphones with built-in microphone.',            'Bluetooth devices',            1199.00, '/images/products/headphones.svg'),
  (11, 5,  'Power Bank (10 000mAh)',    'Pocket-size power bank with two USB outputs.',             'USB devices',                  599.00,  '/images/products/powerbank.svg'),
  (12, 5,  'Power Bank (20 000mAh)',    'High-capacity power bank with USB-C fast charging.',       'USB devices',                  899.00,  '/images/products/powerbank.svg'),
  (13, 6,  'USB-C to 3.5mm Adapter',    'Use wired earphones with a USB-C phone.',                  'USB-C phones',                 149.00,  '/images/products/adapter.svg'),
  (14, 6,  'USB-C Hub (4-in-1)',        'Adds HDMI, two USB ports and a charging port.',            'USB-C laptops and tablets',    749.00,  '/images/products/usb-hub.svg'),
  (15, 7,  'Car Phone Mount',           'Air-vent mount with one-hand release.',                    'Phones up to 6.9 inches',      229.00,  '/images/products/car-mount.svg'),
  (16, 7,  'Desk Phone Stand',          'Adjustable aluminium stand.',                              'Phones and small tablets',     189.00,  '/images/products/phone-stand.svg'),
  (17, 8,  'Cleaning Kit',              'Screen spray, microfibre cloth and port brush.',           'All devices',                  129.00,  '/images/products/cleaning-kit.svg'),
  -- Other electronics ---------------------------------------------------------
  (18, 9,  'iPad (9th Gen)',            '10.2-inch tablet, 64GB, Wi-Fi.',                           NULL,                           5999.00, '/images/products/tablet-colour.svg'),
  (19, 9,  'Samsung Galaxy Tab',        '10.5-inch Android tablet, 64GB.',                          NULL,                           4999.00, '/images/products/tablet-blue.svg'),
  (20, 10, 'Smartwatch',                'Fitness tracking, notifications and heart-rate sensor.',   'iOS and Android',              2499.00, '/images/products/smartwatch.svg'),
  (21, 10, 'Fitness Band',              'Slim activity band with 10-day battery life.',             'iOS and Android',              899.00,  '/images/products/fitness-band.svg'),
  (22, 11, 'Laptop 14-inch',            '8GB RAM, 256GB SSD, Full HD display.',                     NULL,                           8999.00, '/images/products/laptop.svg'),
  (23, 12, 'Wireless Game Controller',  'Bluetooth controller with phone clip.',                    'Android, iOS and PC',          899.00,  '/images/products/controller.svg'),
  (24, 12, 'Gaming Headset',            'Over-ear headset with noise-reducing microphone.',         'PC and consoles',              1099.00, '/images/products/headset.svg'),
  (25, 13, 'Wireless Mouse',            'Silent-click 2.4GHz mouse.',                               'Windows, macOS',               399.00,  '/images/products/mouse.svg'),
  (26, 13, 'Keyboard',                  'Full-size wireless keyboard.',                             'Windows, macOS',               799.00,  '/images/products/keyboard.svg'),
  (27, 14, 'Bluetooth Tracker',         'Find keys and bags from your phone.',                      'iOS and Android',              499.00,  '/images/products/tracker.svg'),
  (28, 14, 'Bluetooth Speaker',         'Portable splash-resistant speaker.',                       'Bluetooth devices',            999.00,  '/images/products/speaker.svg');

-- Sample stock levels. Product 17 is deliberately 0 and product 13 is low so
-- the "Out of stock" and "Only a few left" states can be seen in the shop.
INSERT INTO inventory (product_id, quantity) VALUES
  (1, 12), (2, 8), (3, 10), (4, 25), (5, 6), (6, 15), (7, 20), (8, 18), (9, 7), (10, 4),
  (11, 9), (12, 5), (13, 3), (14, 6), (15, 10), (16, 14), (17, 0),
  (18, 3), (19, 4), (20, 6), (21, 8), (22, 2), (23, 5), (24, 4), (25, 12), (26, 9), (27, 15), (28, 6);
