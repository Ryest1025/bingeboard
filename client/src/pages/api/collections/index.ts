import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), '../../dev.db'));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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
  } else if (req.method === 'GET') {
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

      res.status(200).json({ collections: parsedCollections });
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({ error: 'Failed to fetch collections' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
