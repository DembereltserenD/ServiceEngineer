-- Digital Power Service Dashboard - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engineers table
CREATE TABLE IF NOT EXISTS engineers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  employee_code TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System types table
CREATE TABLE IF NOT EXISTS system_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  icon TEXT,
  color TEXT
);

-- Call types table
CREATE TABLE IF NOT EXISTS call_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  priority INTEGER DEFAULT 0
);

-- Task statuses table
CREATE TABLE IF NOT EXISTS task_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  color TEXT,
  sort_order INTEGER
);

-- Main service tasks table
CREATE TABLE IF NOT EXISTS service_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  building_id UUID REFERENCES buildings(id),
  assigned_engineer_id UUID REFERENCES engineers(id),
  status_id UUID REFERENCES task_statuses(id),
  call_type_id UUID REFERENCES call_types(id),
  system_type_id UUID REFERENCES system_types(id),

  -- Core fields
  description TEXT,
  engineering_comment TEXT,
  akt_number INTEGER,

  -- Timestamps
  received_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Original data reference
  original_path TEXT
);

-- Add resolution_days as a generated column
ALTER TABLE service_tasks ADD COLUMN IF NOT EXISTS resolution_days INTEGER
  GENERATED ALWAYS AS (
    CASE WHEN completed_at IS NOT NULL
    THEN EXTRACT(DAY FROM completed_at - received_at)::INTEGER
    ELSE NULL END
  ) STORED;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_received_at ON service_tasks(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON service_tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_tasks_engineer ON service_tasks(assigned_engineer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_organization ON service_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_system_type ON service_tasks(system_type_id);
CREATE INDEX IF NOT EXISTS idx_tasks_call_type ON service_tasks(call_type_id);

-- Insert default statuses
INSERT INTO task_statuses (name, name_en, color, sort_order) VALUES
  ('Completed', 'Completed', '#22c55e', 1),
  ('In progress', 'In progress', '#8b5cf6', 2),
  ('Not started', 'Not started', '#f59e0b', 3)
ON CONFLICT (name) DO NOTHING;

-- Insert default system types
INSERT INTO system_types (name, name_en, icon, color) VALUES
  ('Домофон систем', 'Intercom System', 'Phone', '#3b82f6'),
  ('Orvibo', 'Orvibo', 'Smartphone', '#10b981'),
  ('CCTV', 'CCTV', 'Camera', '#f59e0b'),
  ('FAS', 'Fire Alarm System', 'Flame', '#ef4444'),
  ('ACS', 'Access Control', 'Key', '#8b5cf6'),
  ('Зогсоолын систем', 'Parking System', 'Car', '#06b6d4'),
  ('PAS', 'Public Address', 'Volume2', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Insert default call types
INSERT INTO call_types (name, name_en, priority) VALUES
  ('Хэрэглэгчийн дуудлага', 'User Call', 1),
  ('СӨХ-ийн дуудлага', 'HOA Call', 2),
  ('Бусад', 'Other', 3),
  ('Нэмэлт ажил', 'Additional Work', 4),
  ('Хуваарьт үзлэг', 'Scheduled Inspection', 5)
ON CONFLICT (name) DO NOTHING;

-- View for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE ts.name = 'Completed') as completed_tasks,
  COUNT(*) FILTER (WHERE ts.name = 'In progress') as in_progress_tasks,
  COUNT(*) FILTER (WHERE ts.name = 'Not started') as not_started_tasks,
  ROUND(AVG(st.resolution_days) FILTER (WHERE st.resolution_days IS NOT NULL), 1) as avg_resolution_days,
  COUNT(*) FILTER (WHERE DATE(st.received_at) = CURRENT_DATE) as today_tasks,
  COUNT(*) FILTER (WHERE DATE_TRUNC('month', st.received_at) = DATE_TRUNC('month', CURRENT_DATE)) as this_month_tasks
FROM service_tasks st
LEFT JOIN task_statuses ts ON st.status_id = ts.id;

-- View for monthly statistics
CREATE OR REPLACE VIEW monthly_stats AS
SELECT
  TO_CHAR(DATE_TRUNC('month', received_at), 'YYYY-MM') as month,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE ts.name = 'Completed') as completed,
  COUNT(*) FILTER (WHERE ts.name = 'In progress') as in_progress,
  COUNT(*) FILTER (WHERE ts.name = 'Not started') as not_started,
  ROUND(COUNT(*) FILTER (WHERE ts.name = 'Completed') * 100.0 / NULLIF(COUNT(*), 0), 1) as completion_rate,
  ROUND(AVG(st.resolution_days) FILTER (WHERE st.resolution_days IS NOT NULL), 1) as avg_resolution_days
FROM service_tasks st
LEFT JOIN task_statuses ts ON st.status_id = ts.id
GROUP BY DATE_TRUNC('month', received_at)
ORDER BY month DESC;

-- View for engineer performance
CREATE OR REPLACE VIEW engineer_performance AS
SELECT
  e.id,
  e.full_name,
  e.employee_code,
  COUNT(st.id) as total_tasks,
  COUNT(st.id) FILTER (WHERE ts.name = 'Completed') as completed_tasks,
  ROUND(AVG(st.resolution_days) FILTER (WHERE st.resolution_days IS NOT NULL), 1) as avg_resolution_days,
  COUNT(st.id) FILTER (WHERE st.resolution_days <= 0) as same_day_completions,
  ROUND(COUNT(st.id) FILTER (WHERE ts.name = 'Completed') * 100.0 / NULLIF(COUNT(st.id), 0), 1) as completion_rate
FROM engineers e
LEFT JOIN service_tasks st ON e.id = st.assigned_engineer_id
LEFT JOIN task_statuses ts ON st.status_id = ts.id
GROUP BY e.id, e.full_name, e.employee_code
ORDER BY total_tasks DESC;

-- View for system type statistics
CREATE OR REPLACE VIEW system_type_stats AS
SELECT
  syt.id,
  syt.name as system_type,
  syt.color,
  COUNT(st.id) as total,
  COUNT(st.id) FILTER (WHERE ts.name = 'Completed') as completed,
  ROUND(COUNT(st.id) * 100.0 / NULLIF(SUM(COUNT(st.id)) OVER(), 0), 1) as percentage
FROM system_types syt
LEFT JOIN service_tasks st ON syt.id = st.system_type_id
LEFT JOIN task_statuses ts ON st.status_id = ts.id
GROUP BY syt.id, syt.name, syt.color
ORDER BY total DESC;

-- View for organization statistics
CREATE OR REPLACE VIEW organization_stats AS
SELECT
  o.id,
  o.name,
  COUNT(st.id) as total_tasks,
  COUNT(st.id) FILTER (WHERE ts.name = 'Completed') as completed_tasks,
  ROUND(COUNT(st.id) FILTER (WHERE ts.name = 'Completed') * 100.0 / NULLIF(COUNT(st.id), 0), 1) as completion_rate,
  ROUND(COUNT(st.id) * 100.0 / NULLIF(SUM(COUNT(st.id)) OVER(), 0), 1) as percentage
FROM organizations o
LEFT JOIN service_tasks st ON o.id = st.organization_id
LEFT JOIN task_statuses ts ON st.status_id = ts.id
GROUP BY o.id, o.name
ORDER BY total_tasks DESC;

-- Enable Row Level Security (optional - uncomment if needed)
-- ALTER TABLE service_tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users (if using Supabase Auth)
-- CREATE POLICY "Allow read access" ON service_tasks FOR SELECT USING (true);
-- CREATE POLICY "Allow read access" ON organizations FOR SELECT USING (true);
-- CREATE POLICY "Allow read access" ON engineers FOR SELECT USING (true);
