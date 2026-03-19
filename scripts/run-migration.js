const db = require('./src/config/database').default;
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const migrationSql = fs.readFileSync(path.join(__dirname, 'migrate.sql'), 'utf8');
    console.log('📖 Read migration file. Running statements...');
    
    // With multipleStatements: true, we can run the whole file at once
    await db.query(migrationSql);
    
    console.log('✅ Migration successful! All tables updated.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
