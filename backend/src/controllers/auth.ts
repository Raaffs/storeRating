import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password: string) => {
  return (
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, address, password, role } = req.body;

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

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'STORE_OWNER' ? 'STORE_OWNER' : 'USER';

    const newUser = await UserModel.create({
      role: assignedRole, 
      name,
      email,
      address,
      password_hash
    });

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!isValidPassword(newPassword)) {
      res.status(400).json({ error: 'Password must be 8-16 characters and contain at least one uppercase letter and one special character.' });
      return;
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(userId, password_hash);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
