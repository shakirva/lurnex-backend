import bcrypt from 'bcryptjs';
import database from '../config/database';

export const seedData = async (): Promise<void> => {
  try {
    await database.connect();

    // Insert default admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const insertAdmin = `
      INSERT IGNORE INTO users (username, email, password, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await database.query(insertAdmin, [
      'admin',
      'admin@lurnex.com',
      adminPassword,
      'Admin',
      'User',
      'admin'
    ]);

    // Insert subscription plans (matching frontend slugs)
    const plans = [
      { name: 'Basic Plan', slug: 'basic', duration: 3, price: 399.00 },
      { name: 'Standard Plan', slug: 'standard', duration: 6, price: 599.00 },
      { name: 'Premium Plan', slug: 'premium', duration: 12, price: 999.00 },
      { name: 'Accountant Plan', slug: 'accountant', duration: 12, price: 3999.00 }
    ];

    const insertPlan = `
      INSERT IGNORE INTO subscription_plans (name, slug, duration_months, price)
      VALUES (?, ?, ?, ?)
    `;

    for (const plan of plans) {
      await database.query(insertPlan, [plan.name, plan.slug, plan.duration, plan.price]);
    }
    
    console.log('✅ Subscription plans seeded');

    // Insert job categories
    const categories = [
      { name: 'Development', description: 'Software development and programming jobs' },
      { name: 'Design', description: 'UI/UX design and graphic design positions' },
      { name: 'Marketing', description: 'Digital marketing and content creation roles' },
      { name: 'Sales', description: 'Sales and business development opportunities' },
      { name: 'Management', description: 'Leadership and management positions' },
      { name: 'Finance', description: 'Financial analysis and accounting roles' },
      { name: 'Customer Service', description: 'Customer support and service positions' },
      { name: 'Healthcare', description: 'Medical and healthcare professionals' },
      { name: 'Education', description: 'Teaching and educational roles' },
      { name: 'Engineering', description: 'Engineering and technical positions' }
    ];

    const insertCategory = `
      INSERT IGNORE INTO job_categories (name, description)
      VALUES (?, ?)
    `;

    for (const category of categories) {
      await database.query(insertCategory, [category.name, category.description]);
    }

    console.log('✅ Job categories seeded');
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
};