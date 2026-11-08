CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PELANGGAN (USERS)
CREATE TABLE users (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    nik VARCHAR(20) NOT NULL,
    sim_a VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 2. TABEL ARMADA MOBIL INDONESIA (VEHICLES)
CREATE TABLE vehicles (
    id VARCHAR(40) PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    name VARCHAR(120) NOT NULL,
    year SMALLINT NOT NULL,
    branch_id VARCHAR(20) NOT NULL,
    category VARCHAR(40) NOT NULL,
    transmission VARCHAR(10) NOT NULL CHECK (transmission IN ('AT', 'MT')),
    fuel VARCHAR(30) NOT NULL,
    seats SMALLINT NOT NULL CHECK (seats >= 2),
    luggage SMALLINT NOT NULL DEFAULT 2,
    plate_number VARCHAR(25) UNIQUE NOT NULL,
    rate_6h NUMERIC(12, 2) NOT NULL CHECK (rate_6h > 0),
    rate_12h NUMERIC(12, 2) NOT NULL CHECK (rate_12h > 0),
    rate_24h NUMERIC(12, 2) NOT NULL CHECK (rate_24h > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RENTED', 'MAINTENANCE')),
    image_url TEXT NOT NULL,
    current_km INTEGER CHECK (current_km >= 0),
    next_service_km INTEGER CHECK (next_service_km >= 0),
    next_service_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABEL PESANAN & TRANSAKSI SEWA (BOOKINGS)
CREATE TABLE bookings (
    id VARCHAR(40) PRIMARY KEY,
    booking_code VARCHAR(30) UNIQUE NOT NULL,
    user_id VARCHAR(40) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    customer_name VARCHAR(120) NOT NULL,
    customer_email VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_nik VARCHAR(20) NOT NULL,
    customer_sim VARCHAR(20) NOT NULL,
    vehicle_id VARCHAR(40) NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    vehicle_name VARCHAR(120) NOT NULL,
    plate_number VARCHAR(25) NOT NULL,
    branch_id VARCHAR(20) NOT NULL,
    pickup_hub VARCHAR(120) NOT NULL,
    purpose VARCHAR(200) NOT NULL,
    package_id VARCHAR(20) NOT NULL CHECK (package_id IN ('PKG_6H', 'PKG_12H', 'PKG_24H')),
    multiplier SMALLINT NOT NULL DEFAULT 1 CHECK (multiplier >= 1),
    total_hours SMALLINT NOT NULL,
    service_id VARCHAR(20) NOT NULL CHECK (service_id IN ('SELF_DRIVE', 'WITH_DRIVER')),
    delivery_id VARCHAR(30) NOT NULL CHECK (delivery_id IN ('PICKUP_GARAGE', 'DELIVERY_ADDRESS')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    base_cost NUMERIC(12, 2) NOT NULL,
    driver_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    delivery_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    deposit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION'
        CHECK (status IN ('PENDING_VERIFICATION', 'CONFIRMED', 'ON_TRIP', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_rental_period CHECK (end_time > start_time)
);

CREATE INDEX idx_bookings_overlap
ON bookings (vehicle_id, start_time, end_time)
WHERE status IN ('CONFIRMED', 'ON_TRIP');

-- SEED DATA PELANGGAN AWAL
INSERT INTO users (id, name, email, password, phone, nik, sim_a, address, verified, joined_at) VALUES
('USR-01', 'Rizky Pratama', 'rizky@mahasiswa.ac.id', '123456', '081234567890', '3273011205030001', '120503998877', 'Jl. Telekomunikasi No. 1, Bojongsoang, Bandung', TRUE, '2025-01-12'),
('USR-02', 'Nadia Putri Maharani', 'nadia@gmail.com', '123456', '081398765432', '3174052208010004', '220801445566', 'Jl. Kemang Raya No. 18, Jakarta Selatan', TRUE, '2025-02-03');

-- SEED DATA ARMADA MOBIL INDONESIA
INSERT INTO vehicles (id, brand, name, year, branch_id, category, transmission, fuel, seats, luggage, plate_number, rate_6h, rate_12h, rate_24h, status, image_url) VALUES
('ID-01', 'Toyota', 'Toyota All New Avanza 1.5 G', 2024, 'BDG', 'MPV', 'AT', 'Bensin', 7, 3, 'D 1421 VLD', 200000, 325000, 450000, 'AVAILABLE', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'),
('ID-02', 'Mitsubishi', 'Mitsubishi Xpander Ultimate', 2024, 'JKT', 'MPV', 'AT', 'Bensin', 7, 3, 'B 2819 VLD', 230000, 360000, 500000, 'AVAILABLE', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80'),
('ID-03', 'Honda', 'Honda Brio Satya E CVT', 2024, 'BDG', 'CITY_LCGC', 'AT', 'Bensin', 5, 2, 'D 1088 VLD', 150000, 240000, 350000, 'AVAILABLE', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=900&q=80'),
('ID-04', 'Toyota', 'Toyota Kijang Innova Zenix Hybrid', 2024, 'JKT', 'MPV', 'AT', 'Hybrid', 7, 4, 'B 9012 VLD', 380000, 580000, 800000, 'AVAILABLE', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'),
('ID-05', 'Mitsubishi', 'Mitsubishi Pajero Sport Dakar 4x2', 2023, 'BDG', 'SUV', 'AT', 'Diesel', 7, 4, 'D 8899 VLD', 480000, 750000, 1100000, 'AVAILABLE', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80'),
('ID-06', 'Honda', 'Honda HR-V 1.5L SE', 2024, 'SBY', 'SUV', 'AT', 'Bensin', 5, 3, 'L 1920 VLD', 280000, 440000, 620000, 'AVAILABLE', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=900&q=80'),
('ID-07', 'Toyota', 'Toyota HiAce Premio 14-Seat', 2023, 'YGY', 'MINIBUS', 'MT', 'Diesel', 14, 6, 'AB 7712 VLD', 550000, 880000, 1300000, 'AVAILABLE', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80'),
('ID-08', 'Hyundai', 'Hyundai Ioniq 5 Prime Long Range', 2024, 'JKT', 'EV', 'AT', 'Listrik (EV)', 5, 3, 'B 1025 EV', 490000, 790000, 1150000, 'AVAILABLE', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80');