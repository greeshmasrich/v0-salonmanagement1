-- Seed 100+ users for testing
-- Note: Passwords are 'password123' for all test accounts

-- Insert auth users first (Supabase Auth)
-- SuperAdmin Account
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'superadmin@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Super Admin"}'),
  ('00000000-0000-0000-0000-000000000002', 'admin1@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Admin One"}'),
  ('00000000-0000-0000-0000-000000000003', 'admin2@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Admin Two"}'),
  ('00000000-0000-0000-0000-000000000004', 'staff1@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Sarah Johnson"}'),
  ('00000000-0000-0000-0000-000000000005', 'staff2@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Michael Chen"}'),
  ('00000000-0000-0000-0000-000000000006', 'staff3@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Emily Rodriguez"}'),
  ('00000000-0000-0000-0000-000000000007', 'staff4@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"David Kim"}'),
  ('00000000-0000-0000-0000-000000000008', 'staff5@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Jessica Martinez"}'),
  ('00000000-0000-0000-0000-000000000009', 'staff6@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"James Wilson"}'),
  ('00000000-0000-0000-0000-000000000010', 'staff7@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Amanda Taylor"}'),
  ('00000000-0000-0000-0000-000000000011', 'staff8@salon.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Robert Anderson"}');

-- Insert users into public.users table
-- SuperAdmin
INSERT INTO public.users (id, email, name, phone, role, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'superadmin@salon.com', 'Super Admin', '+1-555-0001', 'SuperAdmin', NOW());

-- Admins
INSERT INTO public.users (id, email, name, phone, role, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'admin1@salon.com', 'Admin One', '+1-555-0002', 'Admin', NOW()),
  ('00000000-0000-0000-0000-000000000003', 'admin2@salon.com', 'Admin Two', '+1-555-0003', 'Admin', NOW());

-- Staff Members
INSERT INTO public.users (id, email, name, phone, role, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000004', 'staff1@salon.com', 'Sarah Johnson', '+1-555-0004', 'Staff', NOW()),
  ('00000000-0000-0000-0000-000000000005', 'staff2@salon.com', 'Michael Chen', '+1-555-0005', 'Staff', NOW()),
  ('00000000-0000-0000-0000-000000000006', 'staff3@salon.com', 'Emily Rodriguez', '+1-555-0006', 'Staff', NOW()),
  ('00000000-0000-0000-0000-000000000007', 'staff4@salon.com', 'David Kim', '+1-555-0007', 'Staff', NOW()),
  ('00000000-0000-0000-0000-000000000008', 'staff5@salon.com', 'Jessica Martinez', '+1-555-0008', 'Staff', NOW()),
  ('00000000-0000-0000-0000-000000000009', 'staff6@salon.com', 'James Wilson', '+1-555-0009', 'Staff', NOW()),
  ('00000000-0000-0000-0000-000000000010', 'staff7@salon.com', 'Amanda Taylor', '+1-555-0010', 'Staff', NOW()),
  ('00000000-0000-0000-0000-000000000011', 'staff8@salon.com', 'Robert Anderson', '+1-555-0011', 'Staff', NOW());

-- Regular Users (Customers) - 92 users to make 100+ total
INSERT INTO public.users (id, email, name, phone, role, created_at)
VALUES 
  (gen_random_uuid(), 'emma.davis@email.com', 'Emma Davis', '+1-555-1001', 'User', NOW() - INTERVAL '25 days'),
  (gen_random_uuid(), 'oliver.brown@email.com', 'Oliver Brown', '+1-555-1002', 'User', NOW() - INTERVAL '24 days'),
  (gen_random_uuid(), 'sophia.miller@email.com', 'Sophia Miller', '+1-555-1003', 'User', NOW() - INTERVAL '23 days'),
  (gen_random_uuid(), 'liam.garcia@email.com', 'Liam Garcia', '+1-555-1004', 'User', NOW() - INTERVAL '22 days'),
  (gen_random_uuid(), 'ava.martinez@email.com', 'Ava Martinez', '+1-555-1005', 'User', NOW() - INTERVAL '21 days'),
  (gen_random_uuid(), 'noah.lopez@email.com', 'Noah Lopez', '+1-555-1006', 'User', NOW() - INTERVAL '20 days'),
  (gen_random_uuid(), 'isabella.gonzalez@email.com', 'Isabella Gonzalez', '+1-555-1007', 'User', NOW() - INTERVAL '19 days'),
  (gen_random_uuid(), 'ethan.wilson@email.com', 'Ethan Wilson', '+1-555-1008', 'User', NOW() - INTERVAL '18 days'),
  (gen_random_uuid(), 'mia.anderson@email.com', 'Mia Anderson', '+1-555-1009', 'User', NOW() - INTERVAL '17 days'),
  (gen_random_uuid(), 'mason.thomas@email.com', 'Mason Thomas', '+1-555-1010', 'User', NOW() - INTERVAL '16 days'),
  (gen_random_uuid(), 'charlotte.taylor@email.com', 'Charlotte Taylor', '+1-555-1011', 'User', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), 'lucas.moore@email.com', 'Lucas Moore', '+1-555-1012', 'User', NOW() - INTERVAL '14 days'),
  (gen_random_uuid(), 'amelia.jackson@email.com', 'Amelia Jackson', '+1-555-1013', 'User', NOW() - INTERVAL '13 days'),
  (gen_random_uuid(), 'logan.martin@email.com', 'Logan Martin', '+1-555-1014', 'User', NOW() - INTERVAL '12 days'),
  (gen_random_uuid(), 'harper.lee@email.com', 'Harper Lee', '+1-555-1015', 'User', NOW() - INTERVAL '11 days'),
  (gen_random_uuid(), 'elijah.perez@email.com', 'Elijah Perez', '+1-555-1016', 'User', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), 'evelyn.white@email.com', 'Evelyn White', '+1-555-1017', 'User', NOW() - INTERVAL '9 days'),
  (gen_random_uuid(), 'james.harris@email.com', 'James Harris', '+1-555-1018', 'User', NOW() - INTERVAL '8 days'),
  (gen_random_uuid(), 'abigail.clark@email.com', 'Abigail Clark', '+1-555-1019', 'User', NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), 'benjamin.lewis@email.com', 'Benjamin Lewis', '+1-555-1020', 'User', NOW() - INTERVAL '6 days'),
  (gen_random_uuid(), 'emily.robinson@email.com', 'Emily Robinson', '+1-555-1021', 'User', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'william.walker@email.com', 'William Walker', '+1-555-1022', 'User', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'ella.young@email.com', 'Ella Young', '+1-555-1023', 'User', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'alexander.allen@email.com', 'Alexander Allen', '+1-555-1024', 'User', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'scarlett.king@email.com', 'Scarlett King', '+1-555-1025', 'User', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'henry.wright@email.com', 'Henry Wright', '+1-555-1026', 'User', NOW()),
  (gen_random_uuid(), 'grace.scott@email.com', 'Grace Scott', '+1-555-1027', 'User', NOW() - INTERVAL '26 days'),
  (gen_random_uuid(), 'sebastian.green@email.com', 'Sebastian Green', '+1-555-1028', 'User', NOW() - INTERVAL '25 days'),
  (gen_random_uuid(), 'chloe.baker@email.com', 'Chloe Baker', '+1-555-1029', 'User', NOW() - INTERVAL '24 days'),
  (gen_random_uuid(), 'jack.adams@email.com', 'Jack Adams', '+1-555-1030', 'User', NOW() - INTERVAL '23 days'),
  (gen_random_uuid(), 'victoria.nelson@email.com', 'Victoria Nelson', '+1-555-1031', 'User', NOW() - INTERVAL '22 days'),
  (gen_random_uuid(), 'daniel.carter@email.com', 'Daniel Carter', '+1-555-1032', 'User', NOW() - INTERVAL '21 days'),
  (gen_random_uuid(), 'zoey.mitchell@email.com', 'Zoey Mitchell', '+1-555-1033', 'User', NOW() - INTERVAL '20 days'),
  (gen_random_uuid(), 'matthew.roberts@email.com', 'Matthew Roberts', '+1-555-1034', 'User', NOW() - INTERVAL '19 days'),
  (gen_random_uuid(), 'lily.turner@email.com', 'Lily Turner', '+1-555-1035', 'User', NOW() - INTERVAL '18 days'),
  (gen_random_uuid(), 'jackson.phillips@email.com', 'Jackson Phillips', '+1-555-1036', 'User', NOW() - INTERVAL '17 days'),
  (gen_random_uuid(), 'hannah.campbell@email.com', 'Hannah Campbell', '+1-555-1037', 'User', NOW() - INTERVAL '16 days'),
  (gen_random_uuid(), 'samuel.parker@email.com', 'Samuel Parker', '+1-555-1038', 'User', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), 'addison.evans@email.com', 'Addison Evans', '+1-555-1039', 'User', NOW() - INTERVAL '14 days'),
  (gen_random_uuid(), 'david.edwards@email.com', 'David Edwards', '+1-555-1040', 'User', NOW() - INTERVAL '13 days'),
  (gen_random_uuid(), 'natalie.collins@email.com', 'Natalie Collins', '+1-555-1041', 'User', NOW() - INTERVAL '12 days'),
  (gen_random_uuid(), 'joseph.stewart@email.com', 'Joseph Stewart', '+1-555-1042', 'User', NOW() - INTERVAL '11 days'),
  (gen_random_uuid(), 'lillian.sanchez@email.com', 'Lillian Sanchez', '+1-555-1043', 'User', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), 'carter.morris@email.com', 'Carter Morris', '+1-555-1044', 'User', NOW() - INTERVAL '9 days'),
  (gen_random_uuid(), 'aubrey.rogers@email.com', 'Aubrey Rogers', '+1-555-1045', 'User', NOW() - INTERVAL '8 days'),
  (gen_random_uuid(), 'owen.reed@email.com', 'Owen Reed', '+1-555-1046', 'User', NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), 'penelope.cook@email.com', 'Penelope Cook', '+1-555-1047', 'User', NOW() - INTERVAL '6 days'),
  (gen_random_uuid(), 'wyatt.morgan@email.com', 'Wyatt Morgan', '+1-555-1048', 'User', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'layla.bell@email.com', 'Layla Bell', '+1-555-1049', 'User', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'john.murphy@email.com', 'John Murphy', '+1-555-1050', 'User', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'nora.bailey@email.com', 'Nora Bailey', '+1-555-1051', 'User', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'luke.rivera@email.com', 'Luke Rivera', '+1-555-1052', 'User', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'zoe.cooper@email.com', 'Zoe Cooper', '+1-555-1053', 'User', NOW()),
  (gen_random_uuid(), 'gabriel.richardson@email.com', 'Gabriel Richardson', '+1-555-1054', 'User', NOW() - INTERVAL '27 days'),
  (gen_random_uuid(), 'stella.cox@email.com', 'Stella Cox', '+1-555-1055', 'User', NOW() - INTERVAL '26 days'),
  (gen_random_uuid(), 'anthony.howard@email.com', 'Anthony Howard', '+1-555-1056', 'User', NOW() - INTERVAL '25 days'),
  (gen_random_uuid(), 'claire.ward@email.com', 'Claire Ward', '+1-555-1057', 'User', NOW() - INTERVAL '24 days'),
  (gen_random_uuid(), 'isaac.torres@email.com', 'Isaac Torres', '+1-555-1058', 'User', NOW() - INTERVAL '23 days'),
  (gen_random_uuid(), 'skylar.peterson@email.com', 'Skylar Peterson', '+1-555-1059', 'User', NOW() - INTERVAL '22 days'),
  (gen_random_uuid(), 'dylan.gray@email.com', 'Dylan Gray', '+1-555-1060', 'User', NOW() - INTERVAL '21 days'),
  (gen_random_uuid(), 'bella.ramirez@email.com', 'Bella Ramirez', '+1-555-1061', 'User', NOW() - INTERVAL '20 days'),
  (gen_random_uuid(), 'leo.james@email.com', 'Leo James', '+1-555-1062', 'User', NOW() - INTERVAL '19 days'),
  (gen_random_uuid(), 'paisley.watson@email.com', 'Paisley Watson', '+1-555-1063', 'User', NOW() - INTERVAL '18 days'),
  (gen_random_uuid(), 'julian.brooks@email.com', 'Julian Brooks', '+1-555-1064', 'User', NOW() - INTERVAL '17 days'),
  (gen_random_uuid(), 'savannah.kelly@email.com', 'Savannah Kelly', '+1-555-1065', 'User', NOW() - INTERVAL '16 days'),
  (gen_random_uuid(), 'christopher.sanders@email.com', 'Christopher Sanders', '+1-555-1066', 'User', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), 'aurora.price@email.com', 'Aurora Price', '+1-555-1067', 'User', NOW() - INTERVAL '14 days'),
  (gen_random_uuid(), 'jaxon.bennett@email.com', 'Jaxon Bennett', '+1-555-1068', 'User', NOW() - INTERVAL '13 days'),
  (gen_random_uuid(), 'violet.wood@email.com', 'Violet Wood', '+1-555-1069', 'User', NOW() - INTERVAL '12 days'),
  (gen_random_uuid(), 'lincoln.barnes@email.com', 'Lincoln Barnes', '+1-555-1070', 'User', NOW() - INTERVAL '11 days'),
  (gen_random_uuid(), 'lucy.ross@email.com', 'Lucy Ross', '+1-555-1071', 'User', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), 'levi.henderson@email.com', 'Levi Henderson', '+1-555-1072', 'User', NOW() - INTERVAL '9 days'),
  (gen_random_uuid(), 'anna.coleman@email.com', 'Anna Coleman', '+1-555-1073', 'User', NOW() - INTERVAL '8 days'),
  (gen_random_uuid(), 'nathan.jenkins@email.com', 'Nathan Jenkins', '+1-555-1074', 'User', NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), 'caroline.perry@email.com', 'Caroline Perry', '+1-555-1075', 'User', NOW() - INTERVAL '6 days'),
  (gen_random_uuid(), 'aaron.powell@email.com', 'Aaron Powell', '+1-555-1076', 'User', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'genesis.long@email.com', 'Genesis Long', '+1-555-1077', 'User', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'thomas.patterson@email.com', 'Thomas Patterson', '+1-555-1078', 'User', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'kennedy.hughes@email.com', 'Kennedy Hughes', '+1-555-1079', 'User', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'charles.flores@email.com', 'Charles Flores', '+1-555-1080', 'User', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'sadie.washington@email.com', 'Sadie Washington', '+1-555-1081', 'User', NOW()),
  (gen_random_uuid(), 'caleb.butler@email.com', 'Caleb Butler', '+1-555-1082', 'User', NOW() - INTERVAL '28 days'),
  (gen_random_uuid(), 'madelyn.simmons@email.com', 'Madelyn Simmons', '+1-555-1083', 'User', NOW() - INTERVAL '27 days'),
  (gen_random_uuid(), 'ryan.foster@email.com', 'Ryan Foster', '+1-555-1084', 'User', NOW() - INTERVAL '26 days'),
  (gen_random_uuid(), 'allison.gonzales@email.com', 'Allison Gonzales', '+1-555-1085', 'User', NOW() - INTERVAL '25 days'),
  (gen_random_uuid(), 'asher.bryant@email.com', 'Asher Bryant', '+1-555-1086', 'User', NOW() - INTERVAL '24 days'),
  (gen_random_uuid(), 'brooklyn.alexander@email.com', 'Brooklyn Alexander', '+1-555-1087', 'User', NOW() - INTERVAL '23 days'),
  (gen_random_uuid(), 'christian.russell@email.com', 'Christian Russell', '+1-555-1088', 'User', NOW() - INTERVAL '22 days'),
  (gen_random_uuid(), 'alice.griffin@email.com', 'Alice Griffin', '+1-555-1089', 'User', NOW() - INTERVAL '21 days'),
  (gen_random_uuid(), 'josiah.diaz@email.com', 'Josiah Diaz', '+1-555-1090', 'User', NOW() - INTERVAL '20 days'),
  (gen_random_uuid(), 'valentina.hayes@email.com', 'Valentina Hayes', '+1-555-1091', 'User', NOW() - INTERVAL '19 days'),
  (gen_random_uuid(), 'andrew.myers@email.com', 'Andrew Myers', '+1-555-1092', 'User', NOW() - INTERVAL '18 days');

-- Add staff availability for all staff members (recurring weekly schedule)
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time, is_available)
SELECT 
  id,
  day,
  '09:00:00'::time,
  '18:00:00'::time,
  true
FROM public.users
CROSS JOIN (SELECT generate_series(1, 6) as day) days
WHERE role = 'Staff';

-- Add some unavailable periods for variety
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time, is_available)
SELECT 
  id,
  0, -- Sunday
  '00:00:00'::time,
  '23:59:59'::time,
  false
FROM public.users
WHERE role = 'Staff';
