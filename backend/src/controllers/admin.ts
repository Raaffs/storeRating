import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AdminModel } from '../models/admin';
import { UserModel } from '../models/user';
import { StoreModel } from '../models/store';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password: string) => {
  return (
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const stats = await AdminModel.getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsersList = async (req: Request, res: Response) => {
  try {
    const { name, email, address, role } = req.query;
    const users = await AdminModel.getUsers({
      name: name as string,
      email: email as string,
      address: address as string,
      role: role as string,
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id as string);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await AdminModel.getUserDetails(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || name.length < 20 || name.length > 60) {
      res.status(400).json({ error: 'Name must be between 20 and 60 characters.' });
      return;
    }
    if (!address || address.length > 400) {
      res.status(400).json({ error: 'Address must be less than 400 characters.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Invalid email format.' });
      return;
    }
    if (!isValidPassword(password)) {
      res.status(400).json({ error: 'Password must be 8-16 characters and contain at least one uppercase letter and one special character.' });
      return;
    }
    if (!['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
      res.status(400).json({ error: 'Invalid role.' });
      return;
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      role,
      name,
      email,
      address,
      password_hash
    });

    res.status(201).json({ message: 'User created successfully', userId: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStoresList = async (req: Request, res: Response) => {
  try {
    const { name, email, address } = req.query;
    const stores = await AdminModel.getStores({
      name: name as string,
      email: email as string,
      address: address as string,
    });
    res.status(200).json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { owner_email, name, email, address } = req.body;

    if (!owner_email || !name || !email || !address) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const ownerUser = await UserModel.findByEmail(owner_email);
    if (!ownerUser) {
      res.status(404).json({ error: 'Owner user not found with that email' });
      return;
    }
    
    if (ownerUser.role !== 'STORE_OWNER') {
      res.status(400).json({ error: 'The specified user is not a STORE_OWNER' });
      return;
    }

    let image_data = null;
    let image_mime_type = null;

    if (req.file) {
      image_data = req.file.buffer;
      image_mime_type = req.file.mimetype;
    }

    const newStore = await StoreModel.create({
      owner_id: ownerUser.id,
      name,
      email,
      address,
      image_data,
      image_mime_type
    });

    res.status(201).json({ message: 'Store created successfully', storeId: newStore.id });
  } catch (error: any) {
    console.error(error);
    if (error.code === '23505') { // Postgres unique violation
      res.status(400).json({ error: 'A store with this email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
