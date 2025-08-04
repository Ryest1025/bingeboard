import { Router } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const router = Router();
const db = new Database(path.join(process.cwd(), 'dev.db'));

// POST /api/filter-presets - Create filter preset
router.post('/', (req, res) => {
  try {
    const {
      user_id,
      name,
      description,
      filters,
      is_public
    } = req.body;

    // Validate required fields
    if (!user_id || !name || !filters) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, name, filters' 
      });
    }

    // Insert filter preset
    const insertStmt = db.prepare(`
      INSERT INTO filter_presets (
        user_id, name, description, filters, is_public, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = insertStmt.run(
      user_id,
      name,
      description || null,
      JSON.stringify(filters),
      is_public || false
    );

    res.status(201).json({ 
      success: true, 
      preset_id: result.lastInsertRowid,
      message: 'Filter preset created successfully' 
    });
  } catch (error) {
    console.error('Error creating filter preset:', error);
    res.status(500).json({ error: 'Failed to create filter preset' });
  }
});

// GET /api/filter-presets - Get filter presets
router.get('/', (req, res) => {
  try {
    const { user_id, include_public } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    let query = `
      SELECT 
        fp.*,
        (SELECT COUNT(*) FROM user_activity_log 
         WHERE entity_type = 'filter_preset' 
         AND entity_id = fp.id 
         AND activity_type = 'preset_used') as usage_count
      FROM filter_presets fp
      WHERE fp.deleted_at IS NULL
      AND (fp.user_id = ? ${include_public === 'true' ? 'OR fp.is_public = 1' : ''})
      ORDER BY fp.updated_at DESC
    `;

    const presets = db.prepare(query).all(user_id) as any[];
    
    // Parse filters JSON
    const parsedPresets = presets.map((preset: any) => ({
      ...preset,
      filters: JSON.parse(preset.filters),
      is_public: Boolean(preset.is_public)
    }));

    res.json({ presets: parsedPresets });
  } catch (error) {
    console.error('Error fetching filter presets:', error);
    res.status(500).json({ error: 'Failed to fetch filter presets' });
  }
});

export default router;
