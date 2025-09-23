/*
  # Sample Data for Matsyavan Aquaculture Monitoring System

  1. Sample Data
    - Sample farms
    - Sample sensors
    - Sample sensor readings
    - Sample alerts
    - Sample feeding schedules
    - Sample user preferences

  2. Notes
    - This data is for development and testing purposes
    - Real production data should be inserted through the application
*/

-- Insert sample farm data
INSERT INTO farms (id, name, location, description, owner_id, latitude, longitude, area_hectares, fish_species) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Coastal Aqua Farm', 'Kerala, India', 'Modern coastal aquaculture facility specializing in marine fish farming', auth.uid(), 9.9312, 76.2673, 5.5, ARRAY['Tilapia', 'Catfish', 'Prawns']),
  ('550e8400-e29b-41d4-a716-446655440002', 'Freshwater Fish Farm', 'Tamil Nadu, India', 'Inland freshwater fish farming facility', auth.uid(), 11.1271, 78.6569, 3.2, ARRAY['Rohu', 'Catla', 'Mrigal'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample sensors
INSERT INTO sensors (id, farm_id, name, type, model, serial_number, location_description, battery_level, signal_strength, is_active) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Pond 1 Temperature Sensor', 'temperature', 'AquaTemp Pro 2000', 'AT2000-001', 'Main pond, center position', 87, 95, true),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Pond 1 pH Sensor', 'ph', 'pHMaster 3000', 'PH3000-001', 'Main pond, near inlet', 92, 88, true),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Pond 1 Oxygen Sensor', 'dissolved_oxygen', 'OxyPro 1500', 'OP1500-001', 'Main pond, depth 1.5m', 78, 92, true),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Pond 1 Ammonia Sensor', 'ammonia', 'AmmoniAlert 500', 'AA500-001', 'Main pond, near bottom', 85, 90, true)
ON CONFLICT (serial_number) DO NOTHING;

-- Insert sample sensor readings (last 24 hours)
INSERT INTO sensor_readings (sensor_id, value, unit, recorded_at) VALUES
  -- Temperature readings
  ('660e8400-e29b-41d4-a716-446655440001', 24.2, '°C', now() - interval '1 hour'),
  ('660e8400-e29b-41d4-a716-446655440001', 24.5, '°C', now() - interval '2 hours'),
  ('660e8400-e29b-41d4-a716-446655440001', 24.8, '°C', now() - interval '3 hours'),
  ('660e8400-e29b-41d4-a716-446655440001', 25.1, '°C', now() - interval '4 hours'),
  ('660e8400-e29b-41d4-a716-446655440001', 24.9, '°C', now() - interval '5 hours'),
  ('660e8400-e29b-41d4-a716-446655440001', 24.3, '°C', now() - interval '6 hours'),
  
  -- pH readings
  ('660e8400-e29b-41d4-a716-446655440002', 7.2, 'pH', now() - interval '1 hour'),
  ('660e8400-e29b-41d4-a716-446655440002', 7.1, 'pH', now() - interval '2 hours'),
  ('660e8400-e29b-41d4-a716-446655440002', 7.3, 'pH', now() - interval '3 hours'),
  ('660e8400-e29b-41d4-a716-446655440002', 7.2, 'pH', now() - interval '4 hours'),
  ('660e8400-e29b-41d4-a716-446655440002', 7.0, 'pH', now() - interval '5 hours'),
  ('660e8400-e29b-41d4-a716-446655440002', 7.1, 'pH', now() - interval '6 hours'),
  
  -- Oxygen readings
  ('660e8400-e29b-41d4-a716-446655440003', 6.8, 'mg/L', now() - interval '1 hour'),
  ('660e8400-e29b-41d4-a716-446655440003', 6.5, 'mg/L', now() - interval '2 hours'),
  ('660e8400-e29b-41d4-a716-446655440003', 6.9, 'mg/L', now() - interval '3 hours'),
  ('660e8400-e29b-41d4-a716-446655440003', 6.7, 'mg/L', now() - interval '4 hours'),
  ('660e8400-e29b-41d4-a716-446655440003', 6.4, 'mg/L', now() - interval '5 hours'),
  ('660e8400-e29b-41d4-a716-446655440003', 6.6, 'mg/L', now() - interval '6 hours'),
  
  -- Ammonia readings
  ('660e8400-e29b-41d4-a716-446655440004', 0.3, 'ppm', now() - interval '1 hour'),
  ('660e8400-e29b-41d4-a716-446655440004', 0.4, 'ppm', now() - interval '2 hours'),
  ('660e8400-e29b-41d4-a716-446655440004', 0.2, 'ppm', now() - interval '3 hours'),
  ('660e8400-e29b-41d4-a716-446655440004', 0.3, 'ppm', now() - interval '4 hours'),
  ('660e8400-e29b-41d4-a716-446655440004', 0.5, 'ppm', now() - interval '5 hours'),
  ('660e8400-e29b-41d4-a716-446655440004', 0.3, 'ppm', now() - interval '6 hours');

-- Insert sample alerts
INSERT INTO alerts (farm_id, sensor_id, type, parameter, current_value, threshold_value, message, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'warning', 'Dissolved Oxygen', 6.4, 6.5, 'Oxygen levels approaching minimum threshold', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', 'warning', 'Ammonia', 0.5, 0.5, 'Ammonia levels at maximum threshold', 'acknowledged'),
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'info', 'Temperature', 24.2, 24.0, 'Temperature within optimal range', 'resolved');

-- Insert sample feeding schedules
INSERT INTO feeding_schedules (farm_id, name, feed_type, quantity_grams, feeding_times, is_active, last_feeding_at, next_feeding_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Morning Feed', 'High Protein Pellets', 2500, ARRAY['06:00:00', '18:00:00'], true, now() - interval '2 hours', now() + interval '4 hours'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Supplemental Feed', 'Vitamin Enriched', 1000, ARRAY['12:00:00'], true, now() - interval '6 hours', now() + interval '6 hours');

-- Insert sample user preferences (will be created when user first accesses settings)
INSERT INTO user_preferences (user_id, theme, email_alerts, sms_alerts, push_notifications, critical_only, daily_reports, weekly_reports) VALUES
  (auth.uid(), 'light', true, false, true, false, true, true)
ON CONFLICT (user_id) DO NOTHING;