import { Router } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const router = Router();
const db = new Database(path.join(process.cwd(), 'dev.db'));

// GET /api/streaming-services - Get all streaming services
router.get('/', (req, res) => {
  try {
    const services = db.prepare(`
      SELECT * FROM streaming_services 
      WHERE deleted_at IS NULL 
      ORDER BY name ASC
    `).all();

    res.json({ services });
  } catch (error) {
    console.error('Error fetching streaming services:', error);
    res.status(500).json({ error: 'Failed to fetch streaming services' });
  }
});

export default router;
