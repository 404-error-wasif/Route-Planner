USE dhaka_routes;

-- Passwords: admin123 / user123
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@example.com', '$2a$10$9DlKw4Sw8pXMcIrHCijfMeIXoi.lqO2zbOS08LCFaE4f8Qj.8XFO.', 'admin'),
('Regular User', 'user@example.com', '$2a$10$JGp9lluK2XfXGZAtQTthae.1ruuDMCE.2xk0J1mHo0b7a0l3cVcG6', 'regular')
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role);

-- Private pricing bands (BDT per minute)
INSERT INTO private_pricing (mode, min_per_min, max_per_min) VALUES
('rickshaw', 1.5, 3.0),
('cab', 3.0, 6.0),
('bike', 2.0, 4.0),
('car', 3.5, 7.0)
ON DUPLICATE KEY UPDATE min_per_min = VALUES(min_per_min), max_per_min = VALUES(max_per_min);

START TRANSACTION;

-- Refresh public transport data so the seed is repeatable
DELETE FROM public_route_stops;
DELETE FROM public_routes;
ALTER TABLE public_routes AUTO_INCREMENT = 1;
ALTER TABLE public_route_stops AUTO_INCREMENT = 1;

-- BRTC City Service: Mirpur-10 → Motijheel
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('BRTC City Service', 'bus', 18.5, 12.0, 1.80);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Mirpur-10', 23.8151000, 90.3668000, 1),
(@route_id, 'Kazipara', 23.8043000, 90.3659000, 2),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 3),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 4),
(@route_id, 'Paltan', 23.7329000, 90.4126000, 5),
(@route_id, 'Motijheel', 23.7337000, 90.4140000, 6);

-- Tungipara Express: Gulistan → Savar
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Tungipara Express', 'bus', 19.0, 14.0, 1.90);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Gulistan', 23.7278000, 90.4108000, 1),
(@route_id, 'Technical', 23.7789000, 90.3653000, 2),
(@route_id, 'Gabtoli', 23.7785000, 90.3490000, 3),
(@route_id, 'Hemayetpur', 23.7705000, 90.3000000, 4),
(@route_id, 'Savar', 23.8420000, 90.2560000, 5);

-- Suprabhat Paribahan: Mirpur-12 → Sadarghat
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Suprabhat Paribahan', 'bus', 18.0, 12.0, 1.80);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Mirpur-12', 23.8239000, 90.3657000, 1),
(@route_id, 'Kazipara', 23.8043000, 90.3659000, 2),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 3),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 4),
(@route_id, 'Gulistan', 23.7278000, 90.4108000, 5),
(@route_id, 'Sadarghat', 23.7085000, 90.4101000, 6);

-- Shadhin Paribahan: Azimpur → Uttara
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Shadhin Paribahan', 'bus', 18.5, 13.0, 1.70);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Azimpur', 23.7292000, 90.3900000, 1),
(@route_id, 'Science Lab', 23.7416000, 90.3814000, 2),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 3),
(@route_id, 'Banani', 23.7935000, 90.4044000, 4),
(@route_id, 'Airport', 23.8525000, 90.4042000, 5),
(@route_id, 'Uttara', 23.8765000, 90.3790000, 6);

-- Trans Silva: Mohammadpur → Banasree
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Trans Silva', 'bus', 17.5, 11.0, 1.60);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Mohammadpur', 23.7565000, 90.3579000, 1),
(@route_id, 'Asad Gate', 23.7579000, 90.3694000, 2),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 3),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 4),
(@route_id, 'Malibagh', 23.7489000, 90.4145000, 5),
(@route_id, 'Banasree', 23.7637000, 90.4298000, 6);

-- VIP 27: Mirpur-1 → Motijheel
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('VIP 27', 'bus', 18.0, 11.0, 1.60);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Mirpur-1', 23.8060000, 90.3685000, 1),
(@route_id, 'Kazipara', 23.8043000, 90.3659000, 2),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 3),
(@route_id, 'Paltan', 23.7329000, 90.4126000, 4),
(@route_id, 'Motijheel', 23.7337000, 90.4140000, 5);

-- Poribohon Service Ltd.: Gabtoli → Jatrabari
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Poribohon Service Ltd.', 'bus', 17.5, 12.0, 1.70);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Gabtoli', 23.7785000, 90.3490000, 1),
(@route_id, 'Technical', 23.7789000, 90.3653000, 2),
(@route_id, 'Kallyanpur', 23.7764000, 90.3653000, 3),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 4),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 5),
(@route_id, 'Jatrabari', 23.7105000, 90.4396000, 6);

-- Ashulia City Bus: Ashulia → Gulistan
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Ashulia City Bus', 'bus', 19.5, 14.0, 1.90);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Ashulia', 23.9008000, 90.3034000, 1),
(@route_id, 'Savar', 23.8420000, 90.2560000, 2),
(@route_id, 'Mirpur-10', 23.8151000, 90.3668000, 3),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 4),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 5),
(@route_id, 'Gulistan', 23.7278000, 90.4108000, 6);

-- Shikha Paribahan: Gabtoli → Notun Bazar
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Shikha Paribahan', 'bus', 18.0, 13.0, 1.70);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Gabtoli', 23.7785000, 90.3490000, 1),
(@route_id, 'Dhanmondi', 23.7455000, 90.3760000, 2),
(@route_id, 'Mohakhali', 23.7805000, 90.4017000, 3),
(@route_id, 'Banani', 23.7935000, 90.4044000, 4),
(@route_id, 'Notun Bazar', 23.7917000, 90.4250000, 5);

-- Raida Paribahan: Uttara → Motijheel
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Raida Paribahan', 'bus', 18.5, 12.0, 1.80);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Uttara', 23.8765000, 90.3790000, 1),
(@route_id, 'Airport', 23.8525000, 90.4042000, 2),
(@route_id, 'Mohakhali', 23.7805000, 90.4017000, 3),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 4),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 5),
(@route_id, 'Motijheel', 23.7337000, 90.4140000, 6);

-- Winner Paribahan: Abdullahpur → Basabo
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Winner Paribahan', 'bus', 17.5, 12.0, 1.70);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Abdullahpur', 23.8892000, 90.4020000, 1),
(@route_id, 'Airport', 23.8525000, 90.4042000, 2),
(@route_id, 'Banani', 23.7935000, 90.4044000, 3),
(@route_id, 'Malibagh', 23.7489000, 90.4145000, 4),
(@route_id, 'Basabo', 23.7297000, 90.4299000, 5);

-- Projapoti Paribahan: Mirpur-12 → Gulistan
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Projapoti Paribahan', 'bus', 18.0, 11.0, 1.60);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Mirpur-12', 23.8239000, 90.3657000, 1),
(@route_id, 'Kazipara', 23.8043000, 90.3659000, 2),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 3),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 4),
(@route_id, 'Gulistan', 23.7278000, 90.4108000, 5);

-- Alif Paribahan: Gabtoli → Azimpur
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Alif Paribahan', 'bus', 17.0, 10.0, 1.50);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Gabtoli', 23.7785000, 90.3490000, 1),
(@route_id, 'Technical', 23.7789000, 90.3653000, 2),
(@route_id, 'Shyamoli', 23.7738000, 90.3650000, 3),
(@route_id, 'Asad Gate', 23.7579000, 90.3694000, 4),
(@route_id, 'Azimpur', 23.7292000, 90.3900000, 5);

-- Shikor Paribahan: Mohammadpur → Rampura
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Shikor Paribahan', 'bus', 17.5, 11.0, 1.60);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Mohammadpur', 23.7565000, 90.3579000, 1),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 2),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 3),
(@route_id, 'Malibagh', 23.7489000, 90.4145000, 4),
(@route_id, 'Rampura', 23.7627000, 90.4237000, 5);

-- Bihango Paribahan: Uttara → Motijheel
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Bihango Paribahan', 'bus', 18.5, 12.0, 1.80);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Uttara', 23.8765000, 90.3790000, 1),
(@route_id, 'Airport', 23.8525000, 90.4042000, 2),
(@route_id, 'Mohakhali', 23.7805000, 90.4017000, 3),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 4),
(@route_id, 'Motijheel', 23.7337000, 90.4140000, 5);

-- Khajababa Paribahan: Mirpur-12 → Jatrabari
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Khajababa Paribahan', 'bus', 18.0, 11.0, 1.60);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Mirpur-12', 23.8239000, 90.3657000, 1),
(@route_id, 'Kazipara', 23.8043000, 90.3659000, 2),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 3),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 4),
(@route_id, 'Jatrabari', 23.7105000, 90.4396000, 5);

-- Turag Paribahan: Mirpur-1 → Gulistan
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Turag Paribahan', 'bus', 17.0, 10.0, 1.50);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Mirpur-1', 23.8060000, 90.3685000, 1),
(@route_id, 'Khamarbari', 23.7554000, 90.3890000, 2),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 3),
(@route_id, 'Gulistan', 23.7278000, 90.4108000, 4);

-- Grameen Travels: Savar → Gulistan
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Grameen Travels', 'bus', 18.5, 13.0, 1.80);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Savar', 23.8420000, 90.2560000, 1),
(@route_id, 'Hemayetpur', 23.7705000, 90.3000000, 2),
(@route_id, 'Technical', 23.7789000, 90.3653000, 3),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 4),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 5),
(@route_id, 'Gulistan', 23.7278000, 90.4108000, 6);

-- Victor Classic: Uttara → Notun Bazar → Badda
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Victor Classic', 'bus', 18.0, 12.0, 1.70);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Uttara', 23.8765000, 90.3790000, 1),
(@route_id, 'Airport', 23.8525000, 90.4042000, 2),
(@route_id, 'Banani', 23.7935000, 90.4044000, 3),
(@route_id, 'Gulshan-1', 23.7806000, 90.4159000, 4),
(@route_id, 'Notun Bazar', 23.7917000, 90.4250000, 5),
(@route_id, 'Badda', 23.7782000, 90.4247000, 6);

-- Balaka Paribahan: Mohammadpur → Uttara
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Balaka Paribahan', 'bus', 18.5, 11.0, 1.60);
SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Mohammadpur', 23.7565000, 90.3579000, 1),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 2),
(@route_id, 'Mohakhali', 23.7805000, 90.4017000, 3),
(@route_id, 'Airport', 23.8525000, 90.4042000, 4),
(@route_id, 'Uttara', 23.8765000, 90.3790000, 5);

-- Preserve original demo routes for variety across modes
INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost) VALUES
('Mirpur↔Motijheel Bus A', 'bus', 18.0, 10.0, 1.50),
('Airport↔Kamalapur Train B', 'train', 35.0, 20.0, 2.50),
('Uttara↔Motijheel Metro', 'metro', 40.0, 15.0, 2.00);

SET @route_id = LAST_INSERT_ID();
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Mirpur-10', 23.8151000, 90.3668000, 1),
(@route_id, 'Farmgate', 23.7513000, 90.3907000, 2),
(@route_id, 'Shahbagh', 23.7387000, 90.3955000, 3),
(@route_id, 'Motijheel', 23.7337000, 90.4140000, 4);

SET @route_id = @route_id + 1;
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Airport', 23.8525000, 90.4042000, 1),
(@route_id, 'Tejgaon', 23.7574000, 90.3910000, 2),
(@route_id, 'Kamalapur', 23.7340000, 90.4250000, 3);

SET @route_id = @route_id + 1;
INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES
(@route_id, 'Uttara North', 23.8780000, 90.3850000, 1),
(@route_id, 'Pallabi', 23.8246000, 90.3667000, 2),
(@route_id, 'Agargaon', 23.7770000, 90.3730000, 3),
(@route_id, 'Motijheel', 23.7337000, 90.4140000, 4);

COMMIT;
