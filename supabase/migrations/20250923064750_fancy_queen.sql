/*
  # Matsyavan Aquaculture Monitoring System Database Schema

  1. New Tables
    - `users` - User profiles and authentication data
    - `farms` - Aquaculture farm information
    - `sensors` - IoT sensor device information
    - `sensor_readings` - Real-time sensor data readings
    - `alerts` - System alerts and notifications
    - `feeding_schedules` - Automated feeding system schedules
    - `reports` - Generated system reports
    - `user_preferences` - User settings and preferences

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for farm-based access control

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for time-series data
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  company text,
  role text DEFAULT 'observer' CHECK (role IN ('admin', 'manager', 'technician', 'observer')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Farms table
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  description text,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  area_hectares decimal(10, 2),
  fish_species text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sensors table
CREATE TABLE IF NOT EXISTS sensors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('temperature', 'ph', 'dissolved_oxygen', 'ammonia', 'nitrate', 'turbidity', 'salinity')),
  model text,
  serial_number text UNIQUE,
  location_description text,
  battery_level integer DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  signal_strength integer DEFAULT 100 CHECK (signal_strength >= 0 AND signal_strength <= 100),
  is_active boolean DEFAULT true,
  last_reading_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sensor readings table (time-series data)
CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id uuid REFERENCES sensors(id) ON DELETE CASCADE,
  value decimal(10, 4) NOT NULL,
  unit text NOT NULL,
  quality_score integer DEFAULT 100 CHECK (quality_score >= 0 AND quality_score <= 100),
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  sensor_id uuid REFERENCES sensors(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  parameter text NOT NULL,
  current_value decimal(10, 4),
  threshold_value decimal(10, 4),
  message text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by uuid REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feeding schedules table
CREATE TABLE IF NOT EXISTS feeding_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  name text NOT NULL,
  feed_type text NOT NULL,
  quantity_grams integer NOT NULL,
  feeding_times time[] NOT NULL,
  is_active boolean DEFAULT true,
  last_feeding_at timestamptz,
  next_feeding_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  generated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'custom')),
  parameters text[] NOT NULL,
  date_from timestamptz NOT NULL,
  date_to timestamptz NOT NULL,
  file_url text,
  file_size_bytes bigint,
  status text DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  email_alerts boolean DEFAULT true,
  sms_alerts boolean DEFAULT false,
  push_notifications boolean DEFAULT true,
  critical_only boolean DEFAULT false,
  daily_reports boolean DEFAULT true,
  weekly_reports boolean DEFAULT true,
  temperature_min decimal(5, 2) DEFAULT 22.0,
  temperature_max decimal(5, 2) DEFAULT 26.0,
  ph_min decimal(3, 1) DEFAULT 6.5,
  ph_max decimal(3, 1) DEFAULT 7.5,
  oxygen_min decimal(5, 2) DEFAULT 6.0,
  oxygen_max decimal(5, 2) DEFAULT 10.0,
  ammonia_min decimal(5, 2) DEFAULT 0.0,
  ammonia_max decimal(5, 2) DEFAULT 0.5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for farms table
CREATE POLICY "Users can read farms they own or have access to"
  ON farms
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Farm owners can manage their farms"
  ON farms
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for sensors table
CREATE POLICY "Users can read sensors from accessible farms"
  ON sensors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = sensors.farm_id 
      AND (farms.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'manager', 'technician')
      ))
    )
  );

CREATE POLICY "Farm owners and managers can manage sensors"
  ON sensors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = sensors.farm_id 
      AND (farms.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'manager')
      ))
    )
  );

-- RLS Policies for sensor_readings table
CREATE POLICY "Users can read sensor readings from accessible farms"
  ON sensor_readings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sensors 
      JOIN farms ON farms.id = sensors.farm_id
      WHERE sensors.id = sensor_readings.sensor_id 
      AND (farms.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'manager', 'technician')
      ))
    )
  );

CREATE POLICY "System can insert sensor readings"
  ON sensor_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for alerts table
CREATE POLICY "Users can read alerts from accessible farms"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = alerts.farm_id 
      AND (farms.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'manager', 'technician')
      ))
    )
  );

CREATE POLICY "Users can acknowledge alerts"
  ON alerts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = alerts.farm_id 
      AND (farms.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'manager', 'technician')
      ))
    )
  );

-- RLS Policies for feeding_schedules table
CREATE POLICY "Users can read feeding schedules from accessible farms"
  ON feeding_schedules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = feeding_schedules.farm_id 
      AND (farms.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'manager', 'technician')
      ))
    )
  );

CREATE POLICY "Farm owners and managers can manage feeding schedules"
  ON feeding_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = feeding_schedules.farm_id 
      AND (farms.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'manager')
      ))
    )
  );

-- RLS Policies for reports table
CREATE POLICY "Users can read reports from accessible farms"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = reports.farm_id 
      AND (farms.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'manager', 'technician')
      ))
    )
  );

CREATE POLICY "Users can generate reports for accessible farms"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = reports.farm_id 
      AND (farms.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'manager', 'technician')
      ))
    )
  );

-- RLS Policies for user_preferences table
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id_recorded_at ON sensor_readings(sensor_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at ON sensor_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_farm_id_status ON alerts(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensors_farm_id_type ON sensors(farm_id, type);
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON farms(owner_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON sensors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feeding_schedules_updated_at BEFORE UPDATE ON feeding_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();