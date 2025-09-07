import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), '../../dev.db'));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, action } = req.query;

  if (req.method === 'POST' && action === 'soft-delete') {
    try {
      // Soft delete collection
      const softDeleteStmt = db.prepare(`
        UPDATE user_collections 
        SET deleted_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ? AND deleted_at IS NULL
      `);

      const result = softDeleteStmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Collection not found or already deleted' });
      }

      // Also soft delete all items in the collection
      const softDeleteItemsStmt = db.prepare(`
        UPDATE collection_items 
        SET deleted_at = datetime('now'), updated_at = datetime('now')
        WHERE collection_id = ? AND deleted_at IS NULL
      `);

      softDeleteItemsStmt.run(id);

      res.status(200).json({ 
        success: true, 
        message: 'Collection moved to trash' 
      });
    } catch (error) {
      console.error('Error soft deleting collection:', error);
      res.status(500).json({ error: 'Failed to delete collection' });
    }
  } else if (req.method === 'POST' && action === 'restore') {
    try {
      // Restore collection
      const restoreStmt = db.prepare(`
        UPDATE user_collections 
        SET deleted_at = NULL, updated_at = datetime('now')
        WHERE id = ? AND deleted_at IS NOT NULL
      `);

      const result = restoreStmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Collection not found or not deleted' });
      }

      // Also restore all items in the collection
      const restoreItemsStmt = db.prepare(`
        UPDATE collection_items 
        SET deleted_at = NULL, updated_at = datetime('now')
        WHERE collection_id = ? AND deleted_at IS NOT NULL
      `);

      restoreItemsStmt.run(id);

      res.status(200).json({ 
        success: true, 
        message: 'Collection restored successfully' 
      });
    } catch (error) {
      console.error('Error restoring collection:', error);
      res.status(500).json({ error: 'Failed to restore collection' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, description, is_public, tags } = req.body;

      // Update collection
      const updateStmt = db.prepare(`
        UPDATE user_collections 
        SET name = ?, description = ?, is_public = ?, tags = ?, updated_at = datetime('now')
        WHERE id = ? AND deleted_at IS NULL
      `);

      const result = updateStmt.run(
        name,
        description || null,
        is_public || false,
        tags ? JSON.stringify(tags) : null,
        id
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Collection updated successfully' 
      });
    } catch (error) {
      console.error('Error updating collection:', error);
      res.status(500).json({ error: 'Failed to update collection' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Permanent delete - first delete all items
      const deleteItemsStmt = db.prepare(`
        DELETE FROM collection_items WHERE collection_id = ?
      `);
      deleteItemsStmt.run(id);

      // Then delete the collection
      const deleteStmt = db.prepare(`
        DELETE FROM user_collections WHERE id = ?
      `);

      const result = deleteStmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Collection permanently deleted' 
      });
    } catch (error) {
      console.error('Error deleting collection:', error);
      res.status(500).json({ error: 'Failed to delete collection' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
