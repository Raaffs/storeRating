import { query } from '../db';

export const AdminModel = {
  async getDashboardStats() {
    const res = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM stores) as total_stores,
        (SELECT COUNT(*) FROM ratings) as total_ratings
    `);
    return res.rows[0];
  },

  async getUsers(filters: { name?: string; email?: string; address?: string; role?: string }) {
    let sql = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.name) {
      sql += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${filters.name}%`);
      paramIndex++;
    }
    if (filters.email) {
      sql += ` AND email ILIKE $${paramIndex}`;
      params.push(`%${filters.email}%`);
      paramIndex++;
    }
    if (filters.address) {
      sql += ` AND address ILIKE $${paramIndex}`;
      params.push(`%${filters.address}%`);
      paramIndex++;
    }
    if (filters.role) {
      sql += ` AND role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';
    const res = await query(sql, params);
    return res.rows;
  },

  async getUserDetails(userId: number) {
    const sql = `
      SELECT 
        u.id, u.name, u.email, u.address, u.role,
        CASE WHEN u.role = 'STORE_OWNER' THEN (
          SELECT COALESCE(ROUND(AVG(r.rating), 2), 0)
          FROM stores s
          LEFT JOIN ratings r ON r.store_id = s.id
          WHERE s.owner_id = u.id
        ) ELSE NULL END as store_rating
      FROM users u
      WHERE u.id = $1
    `;
    const res = await query(sql, [userId]);
    return res.rows[0];
  },

  async getStores(filters: { name?: string; email?: string; address?: string }) {
    let sql = `
      SELECT 
        s.id, s.name, s.email, s.address, 
        COALESCE(ROUND(AVG(r.rating), 2), 0) as average_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.name) {
      sql += ` AND s.name ILIKE $${paramIndex}`;
      params.push(`%${filters.name}%`);
      paramIndex++;
    }
    if (filters.email) {
      sql += ` AND s.email ILIKE $${paramIndex}`;
      params.push(`%${filters.email}%`);
      paramIndex++;
    }
    if (filters.address) {
      sql += ` AND s.address ILIKE $${paramIndex}`;
      params.push(`%${filters.address}%`);
      paramIndex++;
    }

    sql += ' GROUP BY s.id ORDER BY s.created_at DESC';
    const res = await query(sql, params);
    return res.rows;
  }
};
