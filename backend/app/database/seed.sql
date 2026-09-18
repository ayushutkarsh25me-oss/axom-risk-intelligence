-- Demo seed for AXOM (8 instrumented NE India sites).
-- Run in Supabase SQL editor AFTER schema.sql.
-- Uses upserts so it is safe to re-run.

INSERT INTO locations (id, name, state, district, latitude, longitude, slope, vegetation, base_seismic, recommendation)
VALUES
    ('east-khasi-hills', 'East Khasi Hills', 'Meghalaya', 'East Khasi Hills', 25.45, 91.75, 34, 41, 'Moderate',
     'Immediate evacuation advisory. Avoid slope-side roads and notify district authorities.'),
    ('aizawl', 'Aizawl', 'Mizoram', 'Aizawl', 23.72, 92.72, 38, 55, 'Low',
     'Enhanced monitoring recommended. Pre-position response teams and restrict heavy vehicles on hill roads.'),
    ('gangtok', 'Gangtok', 'Sikkim', 'East Sikkim', 27.33, 88.61, 41, 49, 'High',
     'Enhanced monitoring recommended. Inspect known landslide-prone stretches along NH-10.'),
    ('itanagar', 'Itanagar', 'Arunachal Pradesh', 'Papum Pare', 27.08, 93.60, 29, 62, 'Moderate',
     'Enhanced monitoring recommended. Issue advisory to communities near cut slopes.'),
    ('kohima', 'Kohima', 'Nagaland', 'Kohima', 25.67, 94.11, 27, 66, 'Low',
     'Continue monitoring. No action required beyond routine surveillance.'),
    ('shillong', 'Shillong', 'Meghalaya', 'East Khasi Hills', 25.57, 91.88, 22, 60, 'Moderate',
     'Continue monitoring. Watch rainfall accumulation over the next 12 hours.'),
    ('guwahati', 'Guwahati', 'Assam', 'Kamrup Metropolitan', 26.14, 91.73, 14, 47, 'Moderate',
     'Continue monitoring. Localized risk concentrated on Nilachal and hillside colonies.'),
    ('imphal', 'Imphal', 'Manipur', 'Imphal West', 24.81, 93.94, 11, 58, 'Low',
     'No action required. Conditions stable within normal range.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    state = EXCLUDED.state,
    district = EXCLUDED.district,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    slope = EXCLUDED.slope,
    vegetation = EXCLUDED.vegetation,
    base_seismic = EXCLUDED.base_seismic,
    recommendation = EXCLUDED.recommendation,
    updated_at = NOW();

-- One current reading per site (risk scores match the demo dataset)
INSERT INTO risk_readings (location_id, rainfall, soil_saturation, slope, seismic_activity, vegetation_cover, risk_score, risk_level, confidence)
VALUES
    ('east-khasi-hills', 142, 87, 34, 50, 41, 0.82, 'CRITICAL', 0.91),
    ('aizawl', 108, 74, 38, 20, 55, 0.68, 'HIGH', 0.86),
    ('gangtok', 96, 71, 41, 80, 49, 0.64, 'HIGH', 0.83),
    ('itanagar', 88, 69, 29, 50, 62, 0.61, 'HIGH', 0.80),
    ('kohima', 61, 58, 27, 20, 66, 0.46, 'MODERATE', 0.78),
    ('shillong', 58, 55, 22, 50, 60, 0.44, 'MODERATE', 0.79),
    ('guwahati', 52, 53, 14, 50, 47, 0.41, 'MODERATE', 0.82),
    ('imphal', 34, 42, 11, 20, 58, 0.28, 'LOW', 0.84);

INSERT INTO alerts (id, location_id, severity, risk_score, message, status)
VALUES
    ('alert-01', 'east-khasi-hills', 'critical', 0.82, 'Immediate evacuation advisory', 'active'),
    ('alert-02', 'aizawl', 'high', 0.68, 'Enhanced monitoring recommended', 'active'),
    ('alert-03', 'gangtok', 'high', 0.64, 'Inspect NH-10 landslide-prone stretches', 'active'),
    ('alert-04', 'kohima', 'moderate', 0.46, 'Continue monitoring', 'active'),
    ('alert-05', 'itanagar', 'high', 0.61, 'Advisory to communities near cut slopes', 'active'),
    ('alert-06', 'shillong', 'moderate', 0.44, 'Watch rainfall accumulation', 'acknowledged'),
    ('alert-07', 'guwahati', 'moderate', 0.41, 'Localized hillside-colony risk', 'acknowledged'),
    ('alert-08', 'east-khasi-hills', 'critical', 0.79, 'Soil saturation threshold exceeded', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, payload)
VALUES ('default', '{"high_threshold": 0.6, "critical_threshold": 0.8, "refresh_minutes": 15, "channels": {"sms": true, "email": true, "push": false}, "demo_mode": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;
