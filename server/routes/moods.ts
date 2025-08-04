import { Router } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const router = Router();

// GET /api/moods - Get all available moods
router.get('/', (req, res) => {
  try {
    console.log('🎭 Fetching moods from database...');
    const db = new Database(path.join(process.cwd(), 'dev.db'));
    
    const moods = db.prepare(`
      SELECT * FROM moods 
      WHERE deleted_at IS NULL 
      ORDER BY name ASC
    `).all();

    console.log('🎭 Found', moods.length, 'moods');
    db.close();

    res.json({ moods });
  } catch (error) {
    console.error('Error fetching moods:', error);
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

export default router;
