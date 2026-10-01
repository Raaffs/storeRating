import { query } from '../db';

export interface User {
  id?: number;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
  name: string;
  email: string;
  password_hash: string;
  address: string;
  image_data?: Buffer | null;
  image_mime_type?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export const UserModel = {
  async findByEmail(email: string): Promise<User | null> {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0] || null;
  },

  async findById(id: number): Promise<User | null> {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async create(user: User): Promise<User> {
    const res = await query(
      `INSERT INTO users (role, name, email, password_hash, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.role, user.name, user.email, user.password_hash, user.address]
    );
    return res.rows[0];
  },

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      passwordHash,
      id,
    ]);
  }
};
