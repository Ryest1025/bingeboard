import { Router } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const router = Router();
const db = new Database(path.join(process.cwd(), 'dev.db'));

// POST /api/collections - Create collection
router.post('/', (req, res) => {
  try {
    const {
      user_id,
      name,
      description,
      is_public,
      tags
    } = req.body;

    // Validate required fields
    if (!user_id || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, name' 
      });
    }

    // Insert collection
    const insertStmt = db.prepare(`
      INSERT INTO user_collections (
        user_id, name, description, is_public, tags,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = insertStmt.run(
      user_id,
      name,
      description || null,
      is_public || false,
      tags ? JSON.stringify(tags) : null
    );

    res.status(201).json({ 
      success: true, 
      collection_id: result.lastInsertRowid,
      message: 'Collection created successfully' 
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// GET /api/collections - Get collections
router.get('/', (req, res) => {
  try {
    const { 
      user_id, 
      include_deleted, 
      search, 
      sort_by, 
      tags: tagFilter 
    } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    let query = `
      SELECT 
        uc.*,
        (SELECT COUNT(*) FROM collection_items ci 
         WHERE ci.collection_id = uc.id 
         AND ci.deleted_at IS NULL) as item_count
      FROM user_collections uc
      WHERE uc.user_id = ?
    `;
    
    const params: any[] = [user_id];

    // Handle soft delete filter
    if (include_deleted !== 'true') {
      query += ' AND uc.deleted_at IS NULL';
    }

    // Handle search
    if (search && typeof search === 'string') {
      query += ' AND (uc.name LIKE ? OR uc.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Handle tag filter
    if (tagFilter && typeof tagFilter === 'string') {
      const tags = tagFilter.split(',').filter(t => t.trim());
      if (tags.length > 0) {
        const tagConditions = tags.map(() => 'uc.tags LIKE ?').join(' AND ');
        query += ` AND (${tagConditions})`;
        tags.forEach(tag => params.push(`%"${tag.trim()}"%`));
      }
    }

    // Handle sorting
    const sortBy = sort_by as string;
    switch (sortBy) {
      case 'name':
        query += ' ORDER BY uc.name ASC';
        break;
      case 'created_at':
        query += ' ORDER BY uc.created_at DESC';
        break;
      case 'updated_at':
      default:
        query += ' ORDER BY uc.updated_at DESC';
        break;
    }

    const collections = db.prepare(query).all(...params) as any[];
    
    // Parse tags JSON
    const parsedCollections = collections.map((collection: any) => ({
      ...collection,
      tags: collection.tags ? JSON.parse(collection.tags) : [],
      is_public: Boolean(collection.is_public)
    }));

    res.json({ collections: parsedCollections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// PUT /api/collections/:id - Update collection
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
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

    res.json({ 
      success: true, 
      message: 'Collection updated successfully' 
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// POST /api/collections/:id/soft-delete - Soft delete collection
router.post('/:id/soft-delete', (req, res) => {
  try {
    const { id } = req.params;

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

    res.json({ 
      success: true, 
      message: 'Collection moved to trash' 
    });
  } catch (error) {
    console.error('Error soft deleting collection:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// POST /api/collections/:id/restore - Restore collection
router.post('/:id/restore', (req, res) => {
  try {
    const { id } = req.params;

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

    res.json({ 
      success: true, 
      message: 'Collection restored successfully' 
    });
  } catch (error) {
    console.error('Error restoring collection:', error);
    res.status(500).json({ error: 'Failed to restore collection' });
  }
});

// DELETE /api/collections/:id - Permanently delete collection
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

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

    res.json({ 
      success: true, 
      message: 'Collection permanently deleted' 
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// POST /api/collections/watchlist/add - Add to watchlist
router.post('/watchlist/add', (req, res) => {
  try {
    const { user_id, show_id, show_title, show_poster } = req.body;

    if (!user_id || !show_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, show_id' 
      });
    }

    // Create or get watchlist collection for user
    let watchlistStmt = db.prepare(`
      SELECT id FROM user_collections 
      WHERE user_id = ? AND name = 'Watchlist'
    `);
    
    let watchlist = watchlistStmt.get(user_id) as { id: number } | undefined;
    
    if (!watchlist) {
      // Create watchlist collection
      const createWatchlistStmt = db.prepare(`
        INSERT INTO user_collections (
          user_id, name, description, is_public, tags,
          created_at, updated_at
        ) VALUES (?, 'Watchlist', 'My shows to watch', 0, '[]', datetime('now'), datetime('now'))
      `);
      
      const result = createWatchlistStmt.run(user_id);
      watchlist = { id: Number(result.lastInsertRowid) };
    }

    // Add show to watchlist
    const addShowStmt = db.prepare(`
      INSERT OR REPLACE INTO collection_items (
        collection_id, show_id, show_title, show_poster, added_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    addShowStmt.run(watchlist.id, show_id, show_title || 'Unknown Title', show_poster || '');
    
    res.json({ success: true, message: 'Added to watchlist' });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// POST /api/collections/share - Share a show
router.post('/share', (req, res) => {
  try {
    const { show_id, show_title, platform } = req.body;
    
    // For now, just return success - real sharing would integrate with social platforms
    console.log(`Sharing ${show_title} (${show_id}) on ${platform}`);
    
    res.json({ 
      success: true, 
      message: `Shared "${show_title}" successfully`,
      share_url: `https://bingeboard.com/show/${show_id}`
    });
  } catch (error) {
    console.error('Error sharing show:', error);
    res.status(500).json({ error: 'Failed to share show' });
  }
});

export default router;
