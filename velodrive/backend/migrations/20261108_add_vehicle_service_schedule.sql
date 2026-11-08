ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS current_km INTEGER CHECK (current_km >= 0),
    ADD COLUMN IF NOT EXISTS next_service_km INTEGER CHECK (next_service_km >= 0),
    ADD COLUMN IF NOT EXISTS next_service_date DATE;
