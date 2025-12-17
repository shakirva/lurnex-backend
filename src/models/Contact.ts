import database from '../config/database';
import { ContactMessage, CreateContactRequest, PaginationParams } from '../types';

export class ContactModel {
  static async create(contactData: CreateContactRequest): Promise<ContactMessage> {
    try {
      const query = contactData.phone
        ? `INSERT INTO contact_messages (name, email, subject, message, phone) VALUES (?, ?, ?, ?, ?)`
        : `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`;
      let params: (string | null)[] = contactData.phone
        ? [contactData.name, contactData.email, contactData.subject, contactData.message, contactData.phone]
        : [contactData.name, contactData.email, contactData.subject, contactData.message];
      // Convert undefined to null for SQL compatibility
      params = params.map(v => v === undefined ? null : v);
      console.log('ContactModel.create query:', query);
      console.log('ContactModel.create params:', params);
      const result = await database.query(query, params);
      console.log('ContactModel.create insert result:', result);
      const createdMessage = await this.findById(result.insertId);
      if (!createdMessage) {
        throw new Error('Failed to create contact message');
      }
      return createdMessage;
    } catch (error) {
      console.error('ContactModel.create SQL Error:', error);
      throw error;
    }
  }

  static async findById(id: number): Promise<ContactMessage | null> {
    const query = 'SELECT * FROM contact_messages WHERE id = ?';
    const rows = await database.query(query, [id]);
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  }

  static async findAll(
    pagination: PaginationParams,
    unreadOnly?: boolean
  ): Promise<{ messages: ContactMessage[], total: number }> {
    let whereClause = '';
    let whereParams: any[] = [];

    if (unreadOnly) {
      whereClause = 'WHERE is_read = FALSE';
    }

    // Count total records (no LIMIT/OFFSET params)
    const countQuery = `SELECT COUNT(*) as total FROM contact_messages ${whereClause}`;
    const countResult = await database.query(countQuery, whereParams);
    const total = countResult[0]?.total || 0;

    // Ensure limit and offset are numbers and have defaults
    const limit = typeof pagination.limit === 'number' && !isNaN(pagination.limit) ? pagination.limit : 10;
    const offset = typeof pagination.offset === 'number' && !isNaN(pagination.offset) ? pagination.offset : 0;

    // Get paginated results (interpolate limit/offset directly)
    const query = `
      SELECT * FROM contact_messages 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    console.log('ContactModel.findAll query:', query);
    const rows = await database.query(query); // no params needed

    return { messages: rows, total };
  }

  static async markAsRead(id: number): Promise<ContactMessage | null> {
    const query = 'UPDATE contact_messages SET is_read = TRUE WHERE id = ?';
    const result = await database.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  static async markAsUnread(id: number): Promise<ContactMessage | null> {
    const query = 'UPDATE contact_messages SET is_read = FALSE WHERE id = ?';
    const result = await database.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM contact_messages WHERE id = ?';
    const result = await database.query(query, [id]);
    return result.affectedRows > 0;
  }

  static async getUnreadCount(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM contact_messages WHERE is_read = FALSE';
    const [rows] = await database.query(query);
    return rows[0].count;
  }
}