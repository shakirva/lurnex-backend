-- ============================================================
-- Lurnex Backend Migration: Employer & Subscription Support
-- Run this against your MySQL/MariaDB database
-- ============================================================

-- 1. Add employer-specific columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) DEFAULT NULL;

-- 2. Update role ENUM to include 'employer'
--    (If role is already ENUM, this alters it; adjust if your DB uses VARCHAR)
ALTER TABLE users
  MODIFY COLUMN role ENUM('admin', 'user', 'employer') NOT NULL DEFAULT 'user';

-- 3. Add employer_id to jobs table so employers can own their jobs
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS employer_id INT DEFAULT NULL,
  ADD FOREIGN KEY fk_employer (employer_id) REFERENCES users(id) ON DELETE SET NULL;

-- 4. Add status column to job_applications for employer review
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'Pending';

-- 5. Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  duration_months INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSON,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  payment_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- 7. Seed subscription plans (matching frontend)
INSERT INTO subscription_plans (name, slug, duration_months, price, features) VALUES
  ('Basic Plan',        'basic',       3,  399.00,  '["Access to full job details","View salary information","Company name visible","Employer contact number","Employer email ID","Apply for jobs","Basic job alerts"]'),
  ('Standard Plan',     'standard',    6,  599.00,  '["All Basic Plan features","Priority job alerts","Early access to new job postings","Resume visibility to employers","Email notifications for jobs"]'),
  ('Premium Plan',      'premium',     12, 999.00,  '["All Standard Plan features","Unlimited job applications","Direct employer contact access","Priority candidate profile","Free professional course access"]'),
  ('Accountant Plan',   'accountant',  12, 3999.00, '["Full job portal access","Accounting job opportunities","GST Registration & Filing Training","Income Tax Filing Training","TDS Filing Training","Practice via Government Mock Portal","Professional certificate after completion"]')
ON DUPLICATE KEY UPDATE price = VALUES(price), features = VALUES(features);

-- ============================================================
-- Done! Run: node -e "require('./src/config/database').default.query('SELECT 1')"
-- to verify your DB connection.
-- ============================================================
