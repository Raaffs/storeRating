import bcrypt from 'bcryptjs';
import { query } from './db/index';

const resetAdmin = async () => {
  try {
    const hash = await bcrypt.hash('Admin@123', 10);
    await query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'admin@example.com']);
    console.log('Successfully updated the admin password in the database!');
  } catch (err) {
    console.error('Error updating admin password:', err);
  } finally {
    process.exit(0);
  }
};

resetAdmin();
