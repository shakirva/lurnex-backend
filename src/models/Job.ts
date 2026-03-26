import database from '../config/database';
import { Job, CreateJobRequest, UpdateJobRequest, JobFilters, PaginationParams } from '../types';

export class JobModel {
  static async create(jobData: CreateJobRequest, postedBy: number): Promise<Job> {
    try {
      const query = `
        INSERT INTO jobs (
          title, company, location, type, salary, description, requirements,
          logo, category_id, food_accommodation, gender, posted_by, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const requirementsJson = JSON.stringify(jobData.requirements || []);
      
      console.log('💾 Creating job with cleaned data...');
      
      const result = await database.query(query, [
        jobData.title || null,
        jobData.company || null,
        jobData.location || null,
        jobData.type || 'Full-time',
        jobData.salary || null,
        jobData.description || null,
        requirementsJson,
        jobData.logo || null,
        jobData.category_id || 1,
        jobData.food_accommodation || 'Not Provided',
        jobData.gender || 'Any',
        postedBy,
        jobData.expires_at || null
      ]);

      console.log('✅ Job inserted, result:', result);
      
      // Return a simple job object without calling findById
      const newJob: Job = {
        id: result.insertId || result.affectedRows,
        title: jobData.title || '',
        company: jobData.company || '',
        location: jobData.location || '',
        type: jobData.type || 'Full-time',
        salary: jobData.salary,
        description: jobData.description || '',
        requirements: jobData.requirements || [],
        logo: jobData.logo,
        category_id: jobData.category_id || 1,
        category_name: 'General',
        food_accommodation: jobData.food_accommodation || 'Not Provided',
        gender: jobData.gender || 'Any',
        is_active: true,
        posted_by: postedBy,
        expires_at: jobData.expires_at,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        posted: 'Just now'
      };
      
      console.log('🎉 Job created successfully:', newJob);
      return newJob;
      
    } catch (error) {
      console.error('❌ Job creation error:', error);
      throw error;
    }
  }

  static async findById(id: number): Promise<Job | null> {
    try {
      const query = `
        SELECT j.*, jc.name as category_name,
               TIMESTAMPDIFF(DAY, j.created_at, NOW()) as days_ago
        FROM jobs j
        LEFT JOIN job_categories jc ON j.category_id = jc.id
        WHERE j.id = ?
      `;
      
      console.log('🔍 FindById Query:', query, 'ID:', id);
      
      const rows = await database.query(query, [id]);
      
      console.log('📊 FindById Result:', rows);
      
      // Handle different result formats
      let jobData;
      if (Array.isArray(rows) && rows.length > 0) {
        jobData = rows[0];
      } else if (rows && rows[0] && Array.isArray(rows[0]) && rows[0].length > 0) {
        jobData = rows[0][0];
      } else {
        console.log('❌ No job found with ID:', id);
        return null;
      }
      
      if (!jobData) {
        return null;
      }
      
      console.log('✅ Job found:', jobData);
      
      return {
        ...jobData,
        requirements: typeof jobData.requirements === 'string' 
          ? JSON.parse(jobData.requirements || '[]')
          : (jobData.requirements || []),
        posted: jobData.days_ago === 0 ? 'Today' : 
                jobData.days_ago === 1 ? '1 day ago' : 
                `${jobData.days_ago} days ago`
      };
    } catch (error) {
      console.error('❌ FindById error:', error);
      return null;
    }
  }

  static async findAll(): Promise<Job[]> {
    // Simple query without parameters
    const query = `
      SELECT j.*, jc.name as category_name,
             TIMESTAMPDIFF(DAY, j.created_at, NOW()) as days_ago
      FROM jobs j
      LEFT JOIN job_categories jc ON j.category_id = jc.id
      WHERE j.is_active = 1
      ORDER BY j.created_at DESC
    `;

    const result = await database.query(query);
    const rows = Array.isArray(result[0]) ? result[0] : result;

    const jobs = Array.isArray(rows) ? rows.map((job: any) => ({
      ...job,
      requirements: Array.isArray(job.requirements)
        ? job.requirements
        : typeof job.requirements === 'string'
          ? job.requirements.split(',').map((req: string) => req.trim())
          : [],
      posted: job.days_ago === 0 ? 'Today' : 
              job.days_ago === 1 ? '1 day ago' : 
              `${job.days_ago} days ago`
    })) : [];

    return jobs;
  }

  static async update(id: number, updates: UpdateJobRequest): Promise<Job | null> {
    const setClause: string[] = [];
    const queryParams: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'requirements') {
          setClause.push(`${key} = ?`);
          queryParams.push(JSON.stringify(value));
        } else {
          setClause.push(`${key} = ?`);
          queryParams.push(value);
        }
      }
    });

    if (setClause.length === 0) {
      return await this.findById(id);
    }

    const query = `
      UPDATE jobs 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    queryParams.push(id);
    await database.query(query, queryParams);

    return await this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    try {
      console.log('🗑️ Attempting to delete job with ID:', id);
      const query = 'DELETE FROM jobs WHERE id = ?';
      const result = await database.query(query, [id]);
      
      console.log('🗑️ Job deletion result:', result);
      
      // Handle both cases: result being the object directly or some libraries returning result[0]
      const affectedRows = result.affectedRows !== undefined ? result.affectedRows : 
                          (Array.isArray(result) && result[0] && result[0].affectedRows !== undefined ? result[0].affectedRows : 0);
      
      console.log('📉 Affected rows:', affectedRows);
      
      return affectedRows > 0;
    } catch (error) {
      console.error('❌ Database error during job deletion:', error);
      throw error;
    }
  }

  static async findByCategory(categoryName: string): Promise<Job[]> {
    const query = `
      SELECT j.*, jc.name as category_name,
             TIMESTAMPDIFF(DAY, j.created_at, NOW()) as days_ago
      FROM jobs j
      JOIN job_categories jc ON j.category_id = jc.id
      WHERE jc.name = ? AND j.is_active = 1
      ORDER BY j.created_at DESC
    `;

    const rows = await database.query(query, [categoryName]);

    return rows.map((job: any) => ({
      ...job,
      requirements: JSON.parse(job.requirements || '[]'),
      posted: job.days_ago === 0 ? 'Today' : 
              job.days_ago === 1 ? '1 day ago' : 
              `${job.days_ago} days ago`
    }));
  }

  static async getStats(): Promise<any> {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM jobs WHERE is_active = 1',
      byType: 'SELECT type, COUNT(*) as count FROM jobs WHERE is_active = 1 GROUP BY type',
      byCategory: `
        SELECT jc.name as category, COUNT(*) as count 
        FROM jobs j 
        JOIN job_categories jc ON j.category_id = jc.id 
        WHERE j.is_active = 1 
        GROUP BY jc.name
      `,
      recent: 'SELECT COUNT(*) as count FROM jobs WHERE is_active = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    };

    const totalResult = await database.query(queries.total);
    const byTypeResult = await database.query(queries.byType);
    const byCategoryResult = await database.query(queries.byCategory);
    const recentResult = await database.query(queries.recent);

    return {
      total: totalResult[0].count,
      byType: byTypeResult,
      byCategory: byCategoryResult,
      recentJobs: recentResult[0].count
    };
  }
}