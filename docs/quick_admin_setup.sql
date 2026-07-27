-- Quick admin user setup
USE ihrs_academy;

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  role ENUM('admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert admin user (password is 'Triagull@9048A' hashed with bcrypt)
INSERT INTO users (username, email, password, first_name, last_name, role) 
VALUES ('admin', 'admin@ihrs.com', '$2a$12$P2vO8.1ueoTI.Q.0MP9MAOoEMEoNPMY7n/Wocz8p.Dby2oPxFzQ8O', 'Admin', 'User', 'admin')
ON DUPLICATE KEY UPDATE password = '$2a$12$P2vO8.1ueoTI.Q.0MP9MAOoEMEoNPMY7n/Wocz8p.Dby2oPxFzQ8O';