import bcrypt from 'bcryptjs';
import database from '../config/database';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';

export class UserModel {
  static async create(userData: CreateUserRequest): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const query = `
      INSERT INTO users (username, email, password, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await database.query(query, [
      userData.username,
      userData.email,
      hashedPassword,
      userData.first_name,
      userData.last_name,
      userData.role || 'user'
    ]);

    const createdUser = await this.findById(result.insertId);
    if (!createdUser) {
      throw new Error('Failed to create user');
    }
    return createdUser;
  }

  static async findById(id: number): Promise<User | null> {
    const query = 'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE id = ?';
    const [rows] = await database.query(query, [id]);
    
    if (!rows || rows.length === 0) {
      return null;
    }
    
    return rows[0];
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE username = ?';
    const [rows] = await database.query(query, [username]);
    
    if (!rows || rows.length === 0) {
      return null;
    }
    
    return rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE email = ?';
    const [rows] = await database.query(query, [email]);
    
    if (!rows || rows.length === 0) {
      return null;
    }
    
    return rows[0];
  }

  static async findByUsernameWithPassword(username: string): Promise<(User & { password: string }) | null> {
    const query = 'SELECT * FROM users WHERE username = ? AND is_active = 1';
    const [rows] = await database.query(query, [username]);
    
    if (!rows || rows.length === 0) {
      return null;
    }
    
    return rows[0];
  }

  static async validatePassword(user: User & { password: string }, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  static async update(id: number, updates: UpdateUserRequest): Promise<User | null> {
    const setClause: string[] = [];
    const queryParams: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = ?`);
        queryParams.push(value);
      }
    });

    if (setClause.length === 0) {
      return await this.findById(id);
    }

    const query = `
      UPDATE users 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    queryParams.push(id);
    await database.query(query, queryParams);

    return await this.findById(id);
  }

  static async changePassword(id: number, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const query = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await database.query(query, [hashedPassword, id]);
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = ?';
    const result = await database.query(query, [id]);
    return result.affectedRows > 0;
  }

  static async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;
    
    const countQuery = 'SELECT COUNT(*) as total FROM users';
    const [countResult] = await database.query(countQuery);
    const total = countResult[0].total;

    const query = `
      SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await database.query(query, [limit, offset]);

    return { users: rows, total };
  }
}