import database from './src/config/database';
import bcrypt from 'bcryptjs';

async function testDatabase() {
  try {
    await database.connect();
    console.log('✅ Database connected');

    // Check if admin user exists
    const checkAdmin = 'SELECT * FROM users WHERE username = ?';
    const [users] = await database.query(checkAdmin, ['admin']);
    
    if (users && users.length > 0) {
      console.log('✅ Admin user found:', {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        role: users[0].role,
        is_active: users[0].is_active
      });
      
      // Test password
      const isValid = await bcrypt.compare('admin123', users[0].password);
      console.log('🔐 Password test:', isValid ? '✅ Valid' : '❌ Invalid');
    } else {
      console.log('❌ Admin user not found');
      
      // Create admin user
      console.log('🔄 Creating admin user...');
      const adminPassword = await bcrypt.hash('admin123', 12);
      const insertAdmin = `
        INSERT INTO users (username, email, password, first_name, last_name, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await database.query(insertAdmin, [
        'admin',
        'admin@lurnex.com',
        adminPassword,
        'Admin',
        'User',
        'admin',
        1
      ]);
      console.log('✅ Admin user created successfully');
    }

    // Check tables
    const tables = await database.query('SHOW TABLES');
    console.log('📋 Available tables:', tables[0].map(t => Object.values(t)[0]));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await database.disconnect();
    console.log('🔌 Database disconnected');
    process.exit(0);
  }
}

testDatabase();