import { createTables } from './migrations';
import { seedData } from './seed';

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    await createTables();
    console.log('✅ Migration completed successfully');
    
    console.log('🔄 Starting database seeding...');
    await seedData();
    console.log('✅ Seeding completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration/Seeding failed:', error);
    process.exit(1);
  }
}

migrate();