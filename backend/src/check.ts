import { query } from './db/index';

const check = async () => {
  try {
    const res = await query('SELECT s.id, s.name, s.email as store_email, s.owner_id, u.email as owner_email FROM stores s LEFT JOIN users u ON u.id = s.owner_id');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
check();
