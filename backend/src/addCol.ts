import { query } from './db/index';

const addCol = async () => {
  try {
    await query('ALTER TABLE ratings ADD COLUMN IF NOT EXISTS review_text TEXT;');
    console.log('Added review_text column!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
addCol();
