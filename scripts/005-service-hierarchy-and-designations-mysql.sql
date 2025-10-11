-- Designations
CREATE TABLE IF NOT EXISTS designations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users: add designation_id
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS designation_id VARCHAR(36) NULL,
  ADD INDEX idx_users_designation (designation_id);

ALTER TABLE users
  ADD CONSTRAINT fk_users_designation
  FOREIGN KEY (designation_id) REFERENCES designations(id)
  ON DELETE SET NULL;

-- Service hierarchy
CREATE TABLE IF NOT EXISTS service_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_subcategories (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subcat_cat FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
  UNIQUE KEY uq_subcat (category_id, name),
  INDEX idx_subcat_category (category_id)
);

-- Services: add subcategory_id if missing
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS subcategory_id VARCHAR(36) NULL,
  ADD INDEX idx_services_subcategory (subcategory_id);

ALTER TABLE services
  ADD CONSTRAINT fk_services_subcategory
  FOREIGN KEY (subcategory_id) REFERENCES service_subcategories(id)
  ON DELETE SET NULL;

-- Staff skills: many-to-many staff/services
CREATE TABLE IF NOT EXISTS staff_services (
  staff_id VARCHAR(36) NOT NULL,
  service_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (staff_id, service_id),
  CONSTRAINT fk_staff_services_staff FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_staff_services_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  INDEX idx_staff_services_staff (staff_id),
  INDEX idx_staff_services_service (service_id)
);

-- Appointment services: per-appointment service items, assignable to multiple staff
CREATE TABLE IF NOT EXISTS appointment_services (
  id VARCHAR(36) PRIMARY KEY,
  appointment_id VARCHAR(36) NOT NULL,
  service_id VARCHAR(36) NOT NULL,
  assigned_staff_id VARCHAR(36) NULL,
  status ENUM('Pending','Ongoing','Completed','Cancelled') DEFAULT 'Pending',
  -- price/duration snapshot for billing accuracy
  price DECIMAL(10,2) NULL,
  duration INT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_apt_services_apt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  CONSTRAINT fk_apt_services_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  CONSTRAINT fk_apt_services_staff FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_apt_services_apt (appointment_id),
  INDEX idx_apt_services_staff (assigned_staff_id),
  INDEX idx_apt_services_status (status)
);

-- Helper indexes
CREATE INDEX IF NOT EXISTS idx_designations_name ON designations(name);
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON service_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_service_subcategories_active ON service_subcategories(is_active);
