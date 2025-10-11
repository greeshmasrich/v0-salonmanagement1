DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_service_status') THEN
    CREATE TYPE appointment_service_status AS ENUM ('Pending','Ongoing','Completed','Cancelled');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS designations (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS designation_id UUID NULL REFERENCES designations(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_subcategories (
  id UUID PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (category_id, name)
);

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS subcategory_id UUID NULL REFERENCES service_subcategories(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS staff_services (
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (staff_id, service_id)
);

CREATE TABLE IF NOT EXISTS appointment_services (
  id UUID PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  assigned_staff_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  status appointment_service_status DEFAULT 'Pending',
  price NUMERIC(10,2),
  duration INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_designation ON users(designation_id);
CREATE INDEX IF NOT EXISTS idx_services_subcategory ON services(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_apt_services_apt ON appointment_services(appointment_id);
CREATE INDEX IF NOT EXISTS idx_apt_services_staff ON appointment_services(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_apt_services_status ON appointment_services(status);
