import { Request, Response } from 'express';
import { StoreModel } from '../models/store';
import { RatingModel } from '../models/rating';
import { StorePhotoModel } from '../models/storePhoto';
import { AuthRequest } from '../middleware/auth';

export const listStores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { search } = req.query;
    
    // Gets stores with overall rating and the current user's submitted rating
    const stores = await StoreModel.getStoresWithUserRating(userId, {
      search: search as string
    });

    res.status(200).json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rateStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const storeId = parseInt(req.params.id as string);
    const { rating, review_text } = req.body;

    if (isNaN(storeId)) {
      res.status(400).json({ error: 'Invalid store ID' });
      return;
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
      return;
    }

    const upserted = await RatingModel.upsertRating(userId, storeId, Math.round(rating), review_text);

    res.status(200).json({ 
      message: 'Rating and review submitted successfully', 
      rating: upserted 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const storeId = parseInt(req.params.id as string);
    if (isNaN(storeId)) {
      res.status(400).json({ error: 'Invalid store ID' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }

    const photo = await StorePhotoModel.addPhoto(storeId, userId, req.file.buffer, req.file.mimetype);
    res.status(201).json({ message: 'Photo uploaded successfully', photo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStoreDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const storeId = parseInt(req.params.id as string);
    if (isNaN(storeId)) {
      res.status(400).json({ error: 'Invalid store ID' });
      return;
    }

    const { query } = await import('../db');
    
    // Fetch store basic details
    const storeRes = await query('SELECT id, owner_id, name, email, address, encode(image_data, \'base64\') as image_data, image_mime_type FROM stores WHERE id = $1', [storeId]);
    if (storeRes.rows.length === 0) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }
    const store = storeRes.rows[0];

    // Fetch store photos
    const photosRes = await query('SELECT id, encode(image_data, \'base64\') as image_data, image_mime_type FROM store_photos WHERE store_id = $1 ORDER BY created_at DESC', [storeId]);
    const photos = photosRes.rows;

    // Fetch store reviews/ratings
    const reviewsRes = await query(`
      SELECT r.id, r.rating, r.review_text, u.name as user_name, r.updated_at 
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = $1 
      ORDER BY r.updated_at DESC
    `, [storeId]);
    const reviews = reviewsRes.rows;

    res.status(200).json({
      store,
      photos,
      reviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
