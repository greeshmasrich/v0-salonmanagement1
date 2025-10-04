-- Seed Appointments and Billing Data
-- This script creates realistic appointment and billing data for the current month

-- First, let's create appointments for this month
-- We'll create appointments with various statuses and spread them across the month

-- Get staff user IDs (we'll use the first 8 staff members)
DO $$
DECLARE
  staff_ids UUID[];
  customer_ids UUID[];
  service_ids UUID[];
  chair_ids UUID[];
  current_date_var DATE := DATE_TRUNC('month', CURRENT_DATE);
  end_date DATE := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
  appointment_date DATE;
  appointment_time TIME;
  staff_id UUID;
  customer_id UUID;
  service_id UUID;
  chair_id UUID;
  appointment_id UUID;
  status TEXT;
  total_amount DECIMAL(10,2);
  discount_amount DECIMAL(10,2);
  final_amount DECIMAL(10,2);
  payment_method TEXT;
  payment_status TEXT;
  i INTEGER;
BEGIN
  -- Get staff IDs
  SELECT ARRAY_AGG(id) INTO staff_ids FROM users WHERE role = 'Staff' LIMIT 8;
  
  -- Get customer IDs
  SELECT ARRAY_AGG(id) INTO customer_ids FROM users WHERE role = 'User';
  
  -- Get service IDs
  SELECT ARRAY_AGG(id) INTO service_ids FROM services WHERE is_active = true;
  
  -- Get chair IDs
  SELECT ARRAY_AGG(id) INTO chair_ids FROM chairs WHERE is_active = true;

  -- Create 150 appointments spread across the month
  FOR i IN 1..150 LOOP
    -- Random date in current month
    appointment_date := current_date_var + (RANDOM() * (end_date - current_date_var))::INTEGER;
    
    -- Random time between 9 AM and 6 PM
    appointment_time := ('09:00:00'::TIME + (RANDOM() * INTERVAL '9 hours'));
    
    -- Random staff, customer, service, and chair
    staff_id := staff_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(staff_ids, 1))];
    customer_id := customer_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(customer_ids, 1))];
    service_id := service_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(service_ids, 1))];
    chair_id := chair_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(chair_ids, 1))];
    
    -- Determine status based on date
    IF appointment_date < CURRENT_DATE THEN
      -- Past appointments: 80% completed, 15% cancelled, 5% no-show
      IF RANDOM() < 0.80 THEN
        status := 'Completed';
      ELSIF RANDOM() < 0.95 THEN
        status := 'Cancelled';
      ELSE
        status := 'No Show';
      END IF;
    ELSIF appointment_date = CURRENT_DATE THEN
      -- Today's appointments: 50% completed, 30% in-progress, 20% scheduled
      IF RANDOM() < 0.50 THEN
        status := 'Completed';
      ELSIF RANDOM() < 0.80 THEN
        status := 'In Progress';
      ELSE
        status := 'Scheduled';
      END IF;
    ELSE
      -- Future appointments: 90% scheduled, 10% confirmed
      IF RANDOM() < 0.90 THEN
        status := 'Scheduled';
      ELSE
        status := 'Confirmed';
      END IF;
    END IF;
    
    -- Insert appointment
    INSERT INTO appointments (
      user_id, staff_id, service_id, chair_id,
      appointment_date, appointment_time, status, notes
    ) VALUES (
      customer_id, staff_id, service_id, chair_id,
      appointment_date, appointment_time, status,
      CASE 
        WHEN RANDOM() < 0.3 THEN 'Customer requested specific styling'
        WHEN RANDOM() < 0.6 THEN 'First time customer'
        ELSE NULL
      END
    ) RETURNING id INTO appointment_id;
    
    -- Create billing record for completed appointments
    IF status = 'Completed' THEN
      -- Get service price
      SELECT price INTO total_amount FROM services WHERE id = service_id;
      
      -- Random discount (30% chance of discount)
      IF RANDOM() < 0.30 THEN
        discount_amount := ROUND((total_amount * (5 + RANDOM() * 15) / 100)::NUMERIC, 2);
      ELSE
        discount_amount := 0;
      END IF;
      
      final_amount := total_amount - discount_amount;
      
      -- Random payment method
      CASE FLOOR(RANDOM() * 4)
        WHEN 0 THEN payment_method := 'Cash';
        WHEN 1 THEN payment_method := 'Card';
        WHEN 2 THEN payment_method := 'UPI';
        ELSE payment_method := 'Wallet';
      END CASE;
      
      -- 95% paid, 5% pending
      IF RANDOM() < 0.95 THEN
        payment_status := 'Paid';
      ELSE
        payment_status := 'Pending';
      END IF;
      
      -- Insert billing record
      INSERT INTO billing (
        appointment_id, user_id, total_amount, discount_amount,
        final_amount, payment_method, payment_status
      ) VALUES (
        appointment_id, customer_id, total_amount, discount_amount,
        final_amount, payment_method, payment_status
      );
    END IF;
  END LOOP;

  RAISE NOTICE 'Successfully seeded 150 appointments and billing records';
END $$;

-- Add more staff availability for the next 30 days
DO $$
DECLARE
  staff_record RECORD;
  current_date_var DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + INTERVAL '30 days';
  day_date DATE;
  day_of_week INTEGER;
BEGIN
  -- For each staff member
  FOR staff_record IN SELECT id, full_name FROM users WHERE role = 'Staff' LOOP
    -- Create availability for next 30 days
    day_date := current_date_var;
    
    WHILE day_date <= end_date LOOP
      day_of_week := EXTRACT(DOW FROM day_date); -- 0 = Sunday, 6 = Saturday
      
      -- Skip Sundays (assuming salon is closed on Sundays)
      IF day_of_week != 0 THEN
        -- Check if availability already exists
        IF NOT EXISTS (
          SELECT 1 FROM staff_availability 
          WHERE staff_id = staff_record.id 
          AND availability_date = day_date
        ) THEN
          -- Regular working hours: 9 AM - 6 PM
          -- Some staff might have different schedules
          IF RANDOM() < 0.90 THEN
            -- Regular shift
            INSERT INTO staff_availability (
              staff_id, availability_date, start_time, end_time, is_available
            ) VALUES (
              staff_record.id, day_date, '09:00:00', '18:00:00', true
            );
          ELSIF RANDOM() < 0.95 THEN
            -- Half day shift
            INSERT INTO staff_availability (
              staff_id, availability_date, start_time, end_time, is_available
            ) VALUES (
              staff_record.id, day_date, '09:00:00', '13:00:00', true
            );
          ELSE
            -- Day off
            INSERT INTO staff_availability (
              staff_id, availability_date, start_time, end_time, is_available
            ) VALUES (
              staff_record.id, day_date, '09:00:00', '18:00:00', false
            );
          END IF;
        END IF;
      END IF;
      
      day_date := day_date + INTERVAL '1 day';
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Successfully seeded staff availability for next 30 days';
END $$;

-- Update statistics
ANALYZE appointments;
ANALYZE billing;
ANALYZE staff_availability;
