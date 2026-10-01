import { query } from '../db';

export interface Store {
  id?: number;
  owner_id: number;
  name: string;
  email: string;
  address: string;
  image_data?: Buffer | null;
  image_mime_type?: string | null;
}

export const StoreModel = {
  async create(store: Store): Promise<Store> {
    const res = await query(
      `INSERT INTO stores (owner_id, name, email, address, image_data, image_mime_type) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [store.owner_id, store.name, store.email, store.address, store.image_data, store.image_mime_type]
    );
    return res.rows[0];
  },

  async getStoresWithUserRating(userId: number, filters: { search?: string }) {
    let sql = `
      SELECT 
        s.id as store_id, 
        s.name as store_name, 
        s.address,
        COALESCE(ROUND(AVG(r_all.rating), 2), 0) as overall_rating,
        r_user.rating as user_submitted_rating
      FROM stores s
      LEFT JOIN ratings r_all ON r_all.store_id = s.id
      LEFT JOIN ratings r_user ON r_user.store_id = s.id AND r_user.user_id = $1
      WHERE 1=1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (filters.search) {
      sql += ` AND (s.name ILIKE $${paramIndex} OR s.address ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    sql += ' GROUP BY s.id, r_user.rating ORDER BY s.created_at DESC';
    const res = await query(sql, params);
    return res.rows;
  }
};
