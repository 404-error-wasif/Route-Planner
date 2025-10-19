USE dhaka_routes;

-- Passwords: admin123 / user123
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@example.com', '$2a$10$xhM3oGpF1r7ODs20eW3P3eY1e7P0FVA8W8Qn43tuamBm1q6gWmboi', 'admin'),
('Regular User', 'user@example.com', '$2a$10$WnKyl2nDz0Yf4M2vQ5gZPeo3wJ1eGJj3C2V5f6uY.8Ue2Z9m0M9a2', 'regular');

-- Private pricing bands (BDT per minute)
INSERT INTO private_pricing (mode, min_per_min, max_per_min) VALUES
('rickshaw', 1.5, 3.0),
('cab', 3.0, 6.0),
('bike', 2.0, 4.0),
('car', 3.5, 7.0);

-- Sample public routes (very rough demo; stops are illustrative)
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Mirpur↔Motijheel Bus A', 'bus', 18.0, 10.0, 1.5),
('Airport↔Kamalapur Train B', 'train', 35.0, 20.0, 2.5),
('Uttara↔Motijheel Metro', 'metro', 40.0, 15.0, 2.0);

-- Bus A stops
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(1, 'Mirpur-10', 23.8095, 90.3667, 1),
(1, 'Farmgate', 23.7512, 90.3910, 2),
(1, 'Shahbag', 23.7383, 90.3958, 3),
(1, 'Motijheel', 23.7337, 90.4140, 4);

-- Train B stops
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(2, 'Airport', 23.8431, 90.3978, 1),
(2, 'Tejgaon', 23.7574, 90.3910, 2),
(2, 'Kamalapur', 23.7340, 90.4250, 3);

-- Metro stops
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(3, 'Uttara North', 23.8780, 90.3850, 1),
(3, 'Pallabi', 23.8246, 90.3667, 2),
(3, 'Agargaon', 23.7770, 90.3730, 3),
(3, 'Motijheel', 23.7337, 90.4140, 4);
