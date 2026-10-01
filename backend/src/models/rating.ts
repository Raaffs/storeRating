import { query } from '../db';

export const RatingModel = {
  async upsertRating(userId: number, storeId: number, rating: number, reviewText?: string) {
    const sql = `
      INSERT INTO ratings (user_id, store_id, rating, review_text, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, store_id) 
      DO UPDATE SET 
        rating = EXCLUDED.rating,
        review_text = EXCLUDED.review_text,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const res = await query(sql, [userId, storeId, rating, reviewText || null]);
    return res.rows[0];
  }
};
