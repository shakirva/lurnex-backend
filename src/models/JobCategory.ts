import database from '../config/database';
import { JobCategory } from '../types';

export class JobCategoryModel {
  static async create(name: string, description?: string): Promise<JobCategory> {
    const query = 'INSERT INTO job_categories (name, description) VALUES (?, ?)';
    const result = await database.query(query, [name, description]);

    const createdCategory = await this.findById(result.insertId);
    if (!createdCategory) {
      throw new Error('Failed to create job category');
    }
    return createdCategory;
  }

  static async findById(id: number): Promise<JobCategory | null> {
    const query = 'SELECT * FROM job_categories WHERE id = ?';
    const [rows] = await database.query(query, [id]);
    
    if (!rows || rows.length === 0) {
      return null;
    }
    
    return rows[0];
  }

  static async findByName(name: string): Promise<JobCategory | null> {
    const query = 'SELECT * FROM job_categories WHERE name = ?';
    const [rows] = await database.query(query, [name]);
    
    if (!rows || rows.length === 0) {
      return null;
    }
    
    return rows[0];
  }

  static async findAll(): Promise<JobCategory[]> {
    const query = 'SELECT * FROM job_categories ORDER BY name';
    const [rows] = await database.query(query);
    return rows;
  }

  static async update(id: number, name: string, description?: string): Promise<JobCategory | null> {
    const query = 'UPDATE job_categories SET name = ?, description = ? WHERE id = ?';
    const result = await database.query(query, [name, description, id]);
    
    if (result.affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM job_categories WHERE id = ?';
    const result = await database.query(query, [id]);
    return result.affectedRows > 0;
  }

  static async getCategoriesWithJobCount(): Promise<any[]> {
    const query = `
      SELECT jc.*, COUNT(j.id) as job_count
      FROM job_categories jc
      LEFT JOIN jobs j ON jc.id = j.category_id AND j.is_active = 1
      GROUP BY jc.id, jc.name, jc.description, jc.created_at
      ORDER BY jc.name
    `;
    
    const [rows] = await database.query(query);
    return rows;
  }
}