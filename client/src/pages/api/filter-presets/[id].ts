import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), '../../dev.db'));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { name, description, filters, is_public } = req.body;

      // Update filter preset
      const updateStmt = db.prepare(`
        UPDATE filter_presets 
        SET name = ?, description = ?, filters = ?, is_public = ?, updated_at = datetime('now')
        WHERE id = ? AND deleted_at IS NULL
      `);

      const result = updateStmt.run(
        name,
        description || null,
        JSON.stringify(filters),
        is_public || false,
        id
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Filter preset not found' });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Filter preset updated successfully' 
      });
    } catch (error) {
      console.error('Error updating filter preset:', error);
      res.status(500).json({ error: 'Failed to update filter preset' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Permanent delete
      const deleteStmt = db.prepare(`
        DELETE FROM filter_presets WHERE id = ?
      `);

      const result = deleteStmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Filter preset not found' });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Filter preset deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting filter preset:', error);
      res.status(500).json({ error: 'Failed to delete filter preset' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
