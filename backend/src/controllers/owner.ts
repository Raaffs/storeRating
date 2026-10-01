import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OwnerModel } from '../models/owner';
import { StoreModel } from '../models/store';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const dashboard = await OwnerModel.getDashboard(ownerId);
    if (!dashboard) {
      res.status(404).json({ error: 'No store found for this owner.' });
      return;
    }

    res.status(200).json(dashboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const registerStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existing = await OwnerModel.getDashboard(ownerId);
    if (existing) {
      res.status(400).json({ error: 'You have already registered a store.' });
      return;
    }

    const { name, email, address } = req.body;
    if (!name || !email || !address) {
      res.status(400).json({ error: 'Name, email, and address are required.' });
      return;
    }

    let image_data = null;
    let image_mime_type = null;

    if (req.file) {
      image_data = req.file.buffer;
      image_mime_type = req.file.mimetype;
    }

    const newStore = await StoreModel.create({
      owner_id: ownerId,
      name,
      email,
      address,
      image_data,
      image_mime_type
    });

    res.status(201).json({ message: 'Store registered successfully', storeId: newStore.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
