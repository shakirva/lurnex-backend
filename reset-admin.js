import bcrypt from 'bcryptjs';
import database from './src/config/database';

async function resetAdminPassword() {
  try {
    await database.connect();
    console.log('✅ Database connected');

    // Hash the password properly
    const newPassword = await bcrypt.hash('admin123', 12);
    console.log('🔐 New password hash generated');

    // Update admin password
    const updateQuery = 'UPDATE users SET password = ? WHERE username = ? AND role = ?';
    const result = await database.query(updateQuery, [newPassword, 'admin', 'admin']);
    
    console.log('✅ Admin password updated successfully');
    console.log('📊 Affected rows:', result.affectedRows);

    // Verify the update
    const verifyQuery = 'SELECT id, username, email, role, is_active FROM users WHERE username = ?';
    const [users] = await database.query(verifyQuery, ['admin']);
    
    if (users && users.length > 0) {
      console.log('👤 Admin user details:', {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        role: users[0].role,
        is_active: users[0].is_active
      });

      // Test password
      const testQuery = 'SELECT password FROM users WHERE username = ?';
      const [passwordRows] = await database.query(testQuery, ['admin']);
      
      if (passwordRows && passwordRows.length > 0) {
        const isValid = await bcrypt.compare('admin123', passwordRows[0].password);
        console.log('🔐 Password verification test:', isValid ? '✅ PASSED' : '❌ FAILED');
      }
    }

    await database.disconnect();
    console.log('🔌 Database disconnected');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();