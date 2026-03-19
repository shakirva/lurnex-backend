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

    // Insert sample jobs
    const sampleJobs = [
      {
        title: 'Senior Frontend Developer',
        company: 'TechCorp Solutions',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$80,000 - $120,000',
        description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user-facing web applications and ensuring great user experience.',
        requirements: JSON.stringify(['React', 'TypeScript', 'Next.js', 'Tailwind CSS', '3+ years experience']),
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop&crop=face',
        category_id: 1, // Development
        food_accommodation: 'Provided',
        gender: 'Any',
        posted_by: 1
      },
      {
        title: 'UX/UI Designer',
        company: 'Creative Studio',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$70,000 - $100,000',
        description: 'Join our design team to create beautiful and functional user interfaces. You will work closely with developers and product managers.',
        requirements: JSON.stringify(['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', '2+ years experience']),
        logo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
        category_id: 2, // Design
        food_accommodation: 'Not Provided',
        gender: 'Any',
        posted_by: 1
      },
      {
        title: 'Digital Marketing Manager',
        company: 'Growth Marketing Inc',
        location: 'Austin, TX',
        type: 'Full-time',
        salary: '$65,000 - $90,000',
        description: 'Lead our digital marketing efforts across multiple channels. Experience with SEO, SEM, and social media marketing required.',
        requirements: JSON.stringify(['SEO/SEM', 'Google Analytics', 'Social Media', 'Content Marketing', '3+ years experience']),
        logo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
        category_id: 3, // Marketing
        food_accommodation: 'Partial',
        gender: 'Any',
        posted_by: 1
      },
      {
        title: 'Backend Developer',
        company: 'DataFlow Systems',
        location: 'Seattle, WA',
        type: 'Full-time',
        salary: '$90,000 - $130,000',
        description: 'Build and maintain scalable backend systems. Work with microservices architecture and cloud technologies.',
        requirements: JSON.stringify(['Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', '4+ years experience']),
        logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
        category_id: 1, // Development
        food_accommodation: 'Provided',
        gender: 'Any',
        posted_by: 1
      },
      {
        title: 'Project Manager',
        company: 'Agile Solutions',
        location: 'Chicago, IL',
        type: 'Full-time',
        salary: '$75,000 - $105,000',
        description: 'Lead cross-functional teams to deliver projects on time and within budget. Agile/Scrum experience preferred.',
        requirements: JSON.stringify(['Project Management', 'Agile/Scrum', 'Leadership', 'Communication', '5+ years experience']),
        logo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
        category_id: 5, // Management
        food_accommodation: 'Not Provided',
        gender: 'Any',
        posted_by: 1
      }
    ];

    const insertJob = `
      INSERT INTO jobs (
        title, company, location, type, salary, description, requirements, 
        logo, category_id, food_accommodation, gender, posted_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const job of sampleJobs) {
      await database.query(insertJob, [
        job.title, job.company, job.location, job.type, job.salary,
        job.description, job.requirements, job.logo, job.category_id,
        job.food_accommodation, job.gender, job.posted_by
      ]);
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
};