import { query } from '../db';

export const OwnerModel = {
  async getDashboard(ownerId: number) {
    const storeRes = await query(`
      SELECT 
        s.id, s.name, s.address,
        COALESCE(ROUND(AVG(r.rating), 2), 0) as average_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.owner_id = $1
      GROUP BY s.id
    `, [ownerId]);

    const store = storeRes.rows[0];
    if (!store) return null;

    const usersRes = await query(`
      SELECT 
        u.id, u.name, u.email, r.rating, r.review_text, r.updated_at as rated_at
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = $1
      ORDER BY r.updated_at DESC
    `, [store.id]);

    const photosRes = await query(`
      SELECT id, encode(image_data, 'base64') as image_data, image_mime_type 
      FROM store_photos 
      WHERE store_id = $1 
      ORDER BY created_at DESC
    `, [store.id]);

    return {
      store,
      ratings: usersRes.rows,
      photos: photosRes.rows
    };
  }
};
