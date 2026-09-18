-- ==========================================================
-- AXOM: AI Landslide Risk Intelligence Schema
-- Target Database: Supabase (PostgreSQL 15+)
-- Additive / idempotent. Safe to re-run.
-- Risk scores and environmental readings live on risk_readings.
-- Static site metadata lives on locations.
-- ==========================================================

CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    state VARCHAR(64) NOT NULL,
    district VARCHAR(64) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    slope DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    vegetation DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    base_seismic VARCHAR(32) NOT NULL DEFAULT 'Low',
    recommendation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_state ON locations(state);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations(latitude, longitude);

-- Environmental sensor / satellite risk readings (source of truth for scores)
CREATE TABLE IF NOT EXISTS risk_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    rainfall DOUBLE PRECISION NOT NULL,
    soil_saturation DOUBLE PRECISION NOT NULL,
    slope DOUBLE PRECISION NOT NULL,
    seismic_activity DOUBLE PRECISION NOT NULL,
    vegetation_cover DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    risk_score DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(16) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.80,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readings_location_time ON risk_readings(location_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_risk_level ON risk_readings(risk_level);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    severity VARCHAR(16) NOT NULL,
    risk_score DOUBLE PRECISION NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- Dispatch audit (SMS / email / push / PDF). Demo rows are expected.
CREATE TABLE IF NOT EXISTS alert_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(64) REFERENCES alerts(id) ON DELETE SET NULL,
    channel VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    detail TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dispatches_alert ON alert_dispatches(alert_id, created_at DESC);

CREATE TABLE IF NOT EXISTS app_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'default',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Current risk per site = latest reading joined to static location metadata
CREATE OR REPLACE VIEW location_current_risk AS
SELECT
    l.id,
    l.name,
    l.state,
    l.district,
    l.latitude,
    l.longitude,
    l.base_seismic,
    l.recommendation,
    COALESCE(r.slope, l.slope) AS slope,
    COALESCE(r.vegetation_cover, l.vegetation) AS vegetation,
    r.rainfall,
    r.soil_saturation,
    r.seismic_activity,
    r.risk_score,
    r.risk_level,
    r.confidence,
    r.recorded_at
FROM locations l
LEFT JOIN LATERAL (
    SELECT *
    FROM risk_readings rr
    WHERE rr.location_id = l.id
    ORDER BY rr.recorded_at DESC
    LIMIT 1
) r ON TRUE;
