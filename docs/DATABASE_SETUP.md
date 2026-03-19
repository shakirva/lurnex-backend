# MySQL Database Setup Commands

## Option 1: Manual MySQL Setup (Recommended for Production)

### 1. Connect to MySQL as root user
```bash
mysql -u root -p
```
*Enter your password when prompted (you mentioned it's "root")*

### 2. Create the database
```sql
CREATE DATABASE lurnex_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Create a dedicated user (Optional but recommended)
```sql
CREATE USER 'lurnex_user'@'localhost' IDENTIFIED BY 'lurnex_password123';
GRANT ALL PRIVILEGES ON lurnex_academy.* TO 'lurnex_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Verify database creation
```sql
SHOW DATABASES;
USE lurnex_academy;
SHOW TABLES;
EXIT;
```

### 5. If you created a new user, update your .env file:
```env
DB_USER=lurnex_user
DB_PASSWORD=lurnex_password123
```

## Option 2: Using Root User (Current Setup)

### 1. Connect to MySQL
```bash
mysql -u root -p
```

### 2. Create database only
```sql
CREATE DATABASE lurnex_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

## After Database Creation

### 1. Build the backend
```bash
cd backend
npm run build
```

### 2. Run migrations to create tables and seed data
```bash
npm run migrate
```

### 3. Start the development server
```bash
npm run dev
```

## Alternative: Auto-Setup (Easiest)

The server will now automatically create the database if it doesn't exist when you run:
```bash
cd backend
npm run dev
```

Then in another terminal, run:
```bash
cd backend
npm run build
npm run migrate
```

## Verification Commands

### Check if everything is working:
```bash
# Test API health
curl http://localhost:5000/api/health

# Test login (after migration)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## MySQL Best Practices Applied

1. **Character Set**: Using `utf8mb4` for full Unicode support
2. **Collation**: `utf8mb4_unicode_ci` for proper sorting
3. **Dedicated User**: Optional separate user with limited privileges
4. **Environment Variables**: Database credentials stored securely
5. **Connection Pooling**: Implemented in the backend
6. **Migration System**: Structured database schema management

## Troubleshooting

### If you get "Access denied" error:
```bash
# Reset MySQL root password if needed
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
FLUSH PRIVILEGES;
EXIT;
```

### If you get "Connection refused":
- Make sure MySQL service is running
- Windows: Check Services.msc for MySQL service
- Check if MySQL is running on port 3306