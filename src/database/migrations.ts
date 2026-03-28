import database from '../config/database';

export const createTables = async (): Promise<void> => {
  try {
    await database.createDatabase();
    await database.connect();

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        role ENUM('admin', 'user', 'employer') DEFAULT 'user',
        phone VARCHAR(20),
        company_name VARCHAR(100),
        experience_years INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    // Create job categories table
    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS job_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create jobs table
    const createJobsTable = `
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        company VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        type ENUM('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote') NOT NULL,
        salary VARCHAR(50),
        description TEXT NOT NULL,
        requirements JSON,
        logo VARCHAR(255),
        category_id INT,
        food_accommodation ENUM('Provided', 'Not Provided', 'Partial'),
        gender ENUM('Male', 'Female', 'Any') DEFAULT 'Any',
        is_active BOOLEAN DEFAULT TRUE,
        posted_by INT,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE SET NULL,
        FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_jobs_category (category_id),
        INDEX idx_jobs_location (location),
        INDEX idx_jobs_type (type),
        INDEX idx_jobs_active (is_active),
        INDEX idx_jobs_created (created_at)
      );
    `;

    // Create job applications table
    const createApplicationsTable = `
      CREATE TABLE IF NOT EXISTS job_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        applicant_name VARCHAR(100) NOT NULL,
        applicant_email VARCHAR(100) NOT NULL,
        applicant_phone VARCHAR(20),
  resume_path VARCHAR(255),
  payment_file VARCHAR(255),
  cover_letter TEXT,
  status ENUM('pending', 'reviewing', 'shortlisted', 'rejected', 'hired') DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        INDEX idx_applications_job (job_id),
        INDEX idx_applications_status (status),
        INDEX idx_applications_applied (applied_at)
      );
    `;

    // Create contact messages table
    const createContactTable = `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_contact_read (is_read),
        INDEX idx_contact_created (created_at)
      );
    `;

    // Create admin sessions table for better session management
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Create subscription plans table
    const createPlansTable = `
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        duration_months INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create user subscriptions table
    const createSubscriptionsTable = `
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        plan_id INT NOT NULL,
        payment_reference VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
        INDEX idx_sub_user (user_id),
        INDEX idx_sub_active (is_active),
        INDEX idx_sub_expires (expires_at)
      );
    `;

    // Execute all table creation queries
    await database.query(createUsersTable);
    await database.query(createCategoriesTable);
    await database.query(createJobsTable);
    await database.query(createApplicationsTable);
    await database.query(createContactTable);
    await database.query(createSessionsTable);
    await database.query(createPlansTable);
    await database.query(createSubscriptionsTable);

    // --- DATABASE PATCHING (Safe updates for existing tables) ---
    console.log('🩹 Running database patches...');

    // 1. Patch users table
    const userColumns: any[] = await database.query(`DESCRIBE users`);
    const userColNames = userColumns.map(c => c.Field);

    if (!userColNames.includes('phone')) {
      await database.query(`ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER last_name`);
      console.log('✅ Added phone column to users table');
    }
    if (!userColNames.includes('company_name')) {
      await database.query(`ALTER TABLE users ADD COLUMN company_name VARCHAR(100) AFTER phone`);
      console.log('✅ Added company_name column to users table');
    }
    if (!userColNames.includes('experience_years')) {
      await database.query(`ALTER TABLE users ADD COLUMN experience_years INT DEFAULT 0 AFTER company_name`);
      console.log('✅ Added experience_years column to users table');
    }
    if (!userColNames.includes('is_active')) {
      await database.query(`ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER experience_years`);
    }
    await database.query(`ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user', 'employer') DEFAULT 'user'`);

    // 2. Patch jobs table
    const jobColumns: any[] = await database.query(`DESCRIBE jobs`);
    const jobColNames = jobColumns.map(c => c.Field);

    // Handle legacy employer_id vs posted_by
    if (jobColNames.includes('employer_id') && !jobColNames.includes('posted_by')) {
      await database.query(`ALTER TABLE jobs CHANGE employer_id posted_by INT`);
      console.log('✅ Renamed employer_id to posted_by in jobs table');
    } else if (!jobColNames.includes('posted_by')) {
      await database.query(`ALTER TABLE jobs ADD COLUMN posted_by INT AFTER gender`);
      console.log('✅ Added posted_by column to jobs table');
    }

    if (!jobColNames.includes('is_active')) {
      await database.query(`ALTER TABLE jobs ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER gender`);
      console.log('✅ Added is_active column to jobs table');
    }
    if (!jobColNames.includes('expires_at')) {
      await database.query(`ALTER TABLE jobs ADD COLUMN expires_at TIMESTAMP NULL AFTER posted_by`);
    }
    if (!jobColNames.includes('requirements')) {
      await database.query(`ALTER TABLE jobs ADD COLUMN requirements JSON AFTER description`);
    }
    if (!jobColNames.includes('logo')) {
      await database.query(`ALTER TABLE jobs ADD COLUMN logo VARCHAR(255) AFTER requirements`);
    }
    if (!jobColNames.includes('food_accommodation')) {
      await database.query(`ALTER TABLE jobs ADD COLUMN food_accommodation ENUM('Provided', 'Not Provided', 'Partial') AFTER category_id`);
    }

    // 3. Patch job_applications table
    const appColumns: any[] = await database.query(`DESCRIBE job_applications`);
    const appColNames = appColumns.map(c => c.Field);

    if (!appColNames.includes('payment_file')) {
      await database.query(`ALTER TABLE job_applications ADD COLUMN payment_file VARCHAR(255) AFTER resume_path`);
    }
    if (!appColNames.includes('created_at')) {
      await database.query(`ALTER TABLE job_applications ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    }
    // Update status enum values to match frontend
    await database.query(`ALTER TABLE job_applications MODIFY COLUMN status ENUM('pending', 'reviewing', 'shortlisted', 'rejected', 'hired') DEFAULT 'pending'`);

    console.log('✅ All database tables created/updated successfully');
  } catch (error) {
    console.error('❌ Failed to create tables:', error);
    throw error;
  }
};

export const dropTables = async (): Promise<void> => {
  try {
    await database.connect();
    
    const tables = [
      'user_subscriptions',
      'subscription_plans',
      'admin_sessions',
      'job_applications', 
      'contact_messages',
      'jobs',
      'job_categories',
      'users'
    ];

    for (const table of tables) {
      await database.query(`DROP TABLE IF EXISTS ${table}`);
    }

    console.log('✅ All database tables dropped successfully');
  } catch (error) {
    console.error('❌ Failed to drop tables:', error);
    throw error;
  }
};