-- =============================================================================
-- TechFix database schema (MySQL 8)
--
-- Run this inside the database you created for the project. The easiest way is
-- `npm run db:setup`, which creates the database, runs this file, loads the
-- sample products and creates your admin login.
--
-- Naming rules used throughout:
--   * tables are plural snake_case            (repair_requests)
--   * every table has an auto-increment `id`  primary key
--   * foreign keys are named <thing>_id       (category_id -> categories.id)
-- =============================================================================

-- People who can sign in to the admin dashboard. Customers do NOT get accounts:
-- they identify a booking with its reference number plus their phone or email.
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,           -- bcrypt hash, never the password
  role          ENUM('admin', 'staff') NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A category belongs to one shop section: the Accessories page or the
-- Other Electronics page.
CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(60)  NOT NULL,              -- used in URLs, e.g. phone-cases
  name       VARCHAR(80)  NOT NULL,
  section    ENUM('accessories', 'electronics') NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id   INT UNSIGNED NOT NULL,
  name          VARCHAR(120) NOT NULL,
  description   VARCHAR(500) NULL,
  compatibility VARCHAR(160) NULL,               -- e.g. "iPhone 15 / 15 Pro"
  price         DECIMAL(10, 2) NOT NULL,         -- Namibian dollars
  image_url     VARCHAR(255) NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,   -- 0 = hidden from the shop
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT chk_products_price CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock lives in its own table (one row per product). Catalogue details change
-- rarely, stock changes on every order, and checkout locks these rows while it
-- checks and reduces the quantity.
CREATE TABLE IF NOT EXISTS inventory (
  product_id INT UNSIGNED PRIMARY KEY,
  quantity   INT UNSIGNED NOT NULL DEFAULT 0,    -- UNSIGNED: stock can never go below 0
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS repair_requests (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference           VARCHAR(16) NOT NULL,      -- e.g. REP-7KQ2M9XA
  device_brand        VARCHAR(40) NOT NULL,
  device_type         ENUM('smartphone', 'tablet', 'other') NOT NULL,
  device_model        VARCHAR(80) NOT NULL,
  operating_system    ENUM('ios', 'android', 'other') NOT NULL,
  hardware_issues     JSON NOT NULL,             -- array of issue labels
  software_issues     JSON NOT NULL,
  description         TEXT NULL,
  image_path          VARCHAR(80) NULL,          -- file name inside server/uploads
  service_method      ENUM('dropoff', 'pickup') NOT NULL,
  pickup_address      VARCHAR(200) NULL,         -- pickup_* are only filled for pickups
  pickup_area         VARCHAR(100) NULL,
  pickup_street       VARCHAR(200) NULL,
  pickup_instructions VARCHAR(500) NULL,
  pickup_date         DATE NULL,
  pickup_time         VARCHAR(40) NULL,
  customer_name       VARCHAR(120) NOT NULL,
  customer_phone      VARCHAR(25)  NOT NULL,
  customer_email      VARCHAR(190) NOT NULL,
  contact_method      ENUM('phone', 'whatsapp', 'email') NOT NULL,
  status              VARCHAR(40) NOT NULL DEFAULT 'request_received',
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_repair_reference (reference),
  KEY idx_repair_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sell_enquiries (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference            VARCHAR(16) NOT NULL,     -- e.g. SEL-4HT8WQ2B
  device_type          ENUM('phone', 'tablet', 'laptop', 'other') NOT NULL,
  brand                VARCHAR(60) NOT NULL,
  model                VARCHAR(80) NOT NULL,
  storage_capacity     VARCHAR(40) NULL,
  device_age           VARCHAR(40) NULL,
  device_condition     ENUM('like_new', 'good', 'fair', 'poor', 'faulty') NOT NULL,
  powers_on            ENUM('yes', 'no', 'sometimes') NOT NULL,
  battery_condition    VARCHAR(40) NULL,
  hardware_problems    VARCHAR(1000) NULL,
  software_problems    VARCHAR(1000) NULL,
  screen_damaged       TINYINT(1) NOT NULL,
  repaired_before      ENUM('yes', 'no', 'unsure') NOT NULL,
  accessories_included JSON NOT NULL,            -- array of labels
  description          TEXT NULL,
  asking_price         DECIMAL(10, 2) NOT NULL,  -- what the CUSTOMER hopes to get
  proposed_offer       DECIMAL(10, 2) NULL,      -- what the BUSINESS offers (set by an admin)
  admin_notes          VARCHAR(1000) NULL,
  customer_name        VARCHAR(120) NOT NULL,
  customer_phone       VARCHAR(25)  NOT NULL,
  customer_email       VARCHAR(190) NOT NULL,
  contact_method       ENUM('phone', 'whatsapp', 'email') NOT NULL,
  status               VARCHAR(40) NOT NULL DEFAULT 'enquiry_received',
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sell_reference (reference),
  KEY idx_sell_status (status),
  CONSTRAINT chk_sell_asking_price CHECK (asking_price > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sell_enquiry_photos (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  enquiry_id INT UNSIGNED NOT NULL,
  file_path  VARCHAR(80) NOT NULL,
  CONSTRAINT fk_sell_photos_enquiry FOREIGN KEY (enquiry_id) REFERENCES sell_enquiries (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference             VARCHAR(16) NOT NULL,    -- e.g. ORD-9PL3XK7C
  customer_name         VARCHAR(120) NOT NULL,
  customer_phone        VARCHAR(25)  NOT NULL,
  customer_email        VARCHAR(190) NOT NULL,
  fulfilment_method     ENUM('delivery', 'collection') NOT NULL,
  delivery_address      VARCHAR(200) NULL,       -- delivery_* are only filled for deliveries
  delivery_area         VARCHAR(100) NULL,
  delivery_street       VARCHAR(200) NULL,
  delivery_instructions VARCHAR(500) NULL,
  subtotal              DECIMAL(10, 2) NOT NULL,
  delivery_fee          DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total                 DECIMAL(10, 2) NOT NULL,
  -- No online payment exists yet. This only becomes 'paid' when a real payment
  -- provider (or an admin, later) confirms it.
  payment_status        ENUM('not_paid', 'paid') NOT NULL DEFAULT 'not_paid',
  status                VARCHAR(40) NOT NULL DEFAULT 'order_received',
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_order_reference (reference),
  KEY idx_order_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- product_name and unit_price are copied at the time of ordering, so an old
-- order still shows what the customer agreed to after a product is renamed or
-- repriced.
CREATE TABLE IF NOT EXISTS order_items (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id     INT UNSIGNED NOT NULL,
  product_id   INT UNSIGNED NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  unit_price   DECIMAL(10, 2) NOT NULL,
  quantity     INT UNSIGNED NOT NULL,
  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One shared history table for repairs, orders and sell enquiries.
-- record_type says which table record_id points at, so record_id cannot be a
-- real foreign key; the application always writes both together.
CREATE TABLE IF NOT EXISTS status_history (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_type ENUM('repair', 'order', 'sell') NOT NULL,
  record_id   INT UNSIGNED NOT NULL,
  status      VARCHAR(40) NOT NULL,
  note        VARCHAR(500) NULL,
  changed_by  INT UNSIGNED NULL,                 -- NULL = created by the customer/system
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_history_record (record_type, record_id),
  CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name  VARCHAR(120) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  phone      VARCHAR(25)  NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
