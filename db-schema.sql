-- Database schema for Bridges to Prosperity Impact Map

-- Bridges table containing information about each bridge
CREATE TABLE IF NOT EXISTS bridges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bridge_type VARCHAR(100) NOT NULL,
    year_completed INTEGER,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    span_length DECIMAL(8, 2), -- in meters
    communities_served INTEGER,
    people_served INTEGER,
    country VARCHAR(100),
    region VARCHAR(100),
    district VARCHAR(100),
    construction_cost DECIMAL(12, 2), -- in USD
    last_inspection_date DATE,
    last_inspection_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for testing
INSERT INTO bridges (name, bridge_type, year_completed, latitude, longitude, span_length, communities_served, people_served, country, region, district)
VALUES 
('Rukiri Bridge', 'Suspended', 2018, -1.8512, 29.8352, 45.5, 3, 1240, 'Rwanda', 'Western', 'Rubavu'),
('Nyarubuye Bridge', 'Suspended', 2019, -1.9654, 30.1243, 52.0, 5, 2150, 'Rwanda', 'Eastern', 'Kirehe'),
('Gatare Bridge', 'Trail Bridge', 2020, -2.0123, 29.9876, 38.2, 2, 980, 'Rwanda', 'Southern', 'Nyamagabe'),
('Kinigi Bridge', 'Suspended', 2021, -1.5432, 29.6543, 61.5, 4, 1780, 'Rwanda', 'Northern', 'Musanze'),
('Nyamiyaga Bridge', 'Trail Bridge', 2022, -1.7654, 30.2345, 42.8, 3, 1430, 'Rwanda', 'Eastern', 'Gatsibo'),
('Mugusa Bridge', 'Suspended', 2022, -2.1234, 29.8765, 56.7, 6, 2560, 'Rwanda', 'Southern', 'Gisagara'),
('Kibungo Bridge', 'Trail Bridge', 2019, -2.2345, 30.3456, 35.4, 2, 870, 'Rwanda', 'Eastern', 'Ngoma'),
('Kivumu Bridge', 'Suspended', 2020, -1.6789, 29.7890, 48.9, 5, 2340, 'Rwanda', 'Western', 'Rutsiro'),
('Gihinga Bridge', 'Trail Bridge', 2021, -1.8901, 29.9012, 39.6, 3, 1560, 'Rwanda', 'Northern', 'Gakenke'),
('Ndego Bridge', 'Suspended', 2023, -1.9876, 30.4567, 65.2, 7, 3120, 'Rwanda', 'Eastern', 'Kayonza');

-- Create index for improved query performance
CREATE INDEX idx_bridges_location ON bridges (latitude, longitude);
CREATE INDEX idx_bridges_year ON bridges (year_completed);
CREATE INDEX idx_bridges_type ON bridges (bridge_type);