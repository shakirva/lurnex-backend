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
        role ENUM('admin', 'user') DEFAULT 'user',
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

    // Execute all table creation queries
    await database.query(createUsersTable);
    await database.query(createCategoriesTable);
    await database.query(createJobsTable);
    await database.query(createApplicationsTable);
    await database.query(createContactTable);
    await database.query(createSessionsTable);

    console.log('✅ All database tables created successfully');
  } catch (error) {
    console.error('❌ Failed to create tables:', error);
    throw error;
  }
};

export const dropTables = async (): Promise<void> => {
  try {
    await database.connect();
    
    const tables = [
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