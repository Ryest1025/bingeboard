import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), '../../dev.db'));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const moods = db.prepare(`
        SELECT * FROM moods 
        WHERE deleted_at IS NULL 
        ORDER BY name ASC
      `).all();

      res.status(200).json({ moods });
    } catch (error) {
      console.error('Error fetching moods:', error);
      res.status(500).json({ error: 'Failed to fetch moods' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
