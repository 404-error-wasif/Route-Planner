CREATE DATABASE IF NOT EXISTS dhaka_routes;
USE dhaka_routes;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(120) UNIQUE,
  password_hash VARCHAR(200),
  role ENUM('admin','regular') DEFAULT 'regular',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  from_name VARCHAR(200),
  to_name VARCHAR(200),
  mode VARCHAR(40),
  cost_min INT,
  cost_max INT,
  duration_min INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS private_pricing (
  mode VARCHAR(40) PRIMARY KEY, -- rickshaw, cab, bike, car
  min_per_min DECIMAL(10,2) NOT NULL,
  max_per_min DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public_routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120),
  mode ENUM('bus','train','metro') NOT NULL,
  avg_kmh DECIMAL(10,2) DEFAULT 22.0,
  base_cost DECIMAL(10,2) DEFAULT 5.0,
  per_km_cost DECIMAL(10,2) DEFAULT 2.0,
  geometry JSON NULL, -- GeoJSON LineString
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public_route_stops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id INT NOT NULL,
  name VARCHAR(120),
  lat DECIMAL(10,7),
  lon DECIMAL(10,7),
  seq INT,
  FOREIGN KEY (route_id) REFERENCES public_routes(id)
);

CREATE TABLE IF NOT EXISTS blocked_segments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200),
  geometry JSON,
  start_time DATETIME NULL,
  end_time DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
