import bcrypt from 'bcryptjs';
import database from '../src/config/database';

async function setupDemoUsers() {
  try {
    await database.connect();
    console.log('✅ Database connected');

    const passwordHash = await bcrypt.hash('Demo@123', 12);

    // Setup Employer
    const employerEmail = 'employer@demo.com';
    const checkEmployer = 'SELECT * FROM users WHERE email = ?';
    const [employers] = await database.query(checkEmployer, [employerEmail]);
    
    if (employers && (employers as any[]).length > 0) {
      await database.query('UPDATE users SET password = ? WHERE email = ?', [passwordHash, employerEmail]);
      console.log('✅ Employer password updated');
    } else {
      const insertEmployer = `
        INSERT INTO users (username, email, password, first_name, last_name, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await database.query(insertEmployer, [
        'demo_employer',
        employerEmail,
        passwordHash,
        'Demo',
        'Employer',
        'employer',
        1
      ]);
      console.log('✅ Demo employer created');
    }

    // Setup Candidate (role: user)
    const candidateEmail = 'candidate@demo.com';
    const checkCandidate = 'SELECT * FROM users WHERE email = ?';
    const [candidates] = await database.query(checkCandidate, [candidateEmail]);
    
    if (candidates && (candidates as any[]).length > 0) {
      await database.query('UPDATE users SET password = ? WHERE email = ?', [passwordHash, candidateEmail]);
      console.log('✅ Candidate password updated');
    } else {
      const insertCandidate = `
        INSERT INTO users (username, email, password, first_name, last_name, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await database.query(insertCandidate, [
        'demo_candidate',
        candidateEmail,
        passwordHash,
        'Demo',
        'Candidate',
        'user',
        1
      ]);
      console.log('✅ Demo candidate created');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await database.disconnect();
    console.log('🔌 Database disconnected');
    process.exit(0);
  }
}

setupDemoUsers();
