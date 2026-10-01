import { query } from '../db';

export const StorePhotoModel = {
  async addPhoto(storeId: number, userId: number, imageData: Buffer, mimeType: string) {
    const res = await query(
      `INSERT INTO store_photos (store_id, user_id, image_data, image_mime_type)
       VALUES ($1, $2, $3, $4) RETURNING id, store_id, user_id, created_at`,
      [storeId, userId, imageData, mimeType]
    );
    return res.rows[0];
  },

  async getPhotos(storeId: number) {
    const res = await query(
      `SELECT id, user_id, image_data, image_mime_type, created_at 
       FROM store_photos WHERE store_id = $1 ORDER BY created_at DESC`,
      [storeId]
    );
    return res.rows;
  }
};
