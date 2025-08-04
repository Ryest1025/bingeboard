import { Request, Response } from 'express';
import Database from 'better-sqlite3';

const db = new Database('./dev.db');

// User Feedback API
export const createUserFeedback = (req: Request, res: Response) => {
  try {
    const { user_id, content_id, content_type, rating, feedback_text } = req.body;

    // Validate required fields
    if (!user_id || !content_id || !content_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate rating range
    if (rating !== undefined && (rating < 0 || rating > 10)) {
      return res.status(400).json({ error: 'Rating must be between 0 and 10' });
    }

    const stmt = db.prepare(`
      INSERT INTO user_feedback (user_id, content_id, content_type, rating, feedback_text)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, content_id, content_type) 
      DO UPDATE SET 
        rating = excluded.rating,
        feedback_text = excluded.feedback_text,
        updated_at = datetime('now')
    `);

    const result = stmt.run(user_id, content_id, content_type, rating, feedback_text);
    
    res.json({ 
      success: true, 
      id: result.lastInsertRowid,
      message: 'Feedback saved successfully' 
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
};

export const getUserFeedback = (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { content_id, content_type, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT * FROM user_feedback 
      WHERE user_id = ? AND is_deleted = 0
    `;
    const params: any[] = [user_id];

    if (content_id) {
      query += ` AND content_id = ?`;
      params.push(content_id);
    }

    if (content_type) {
      query += ` AND content_type = ?`;
      params.push(content_type);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const feedback = stmt.all(...params);

    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Filter Presets API
export const createFilterPreset = (req: Request, res: Response) => {
  try {
    const { user_id, name, description, filters, is_public = false } = req.body;

    if (!user_id || !name || !filters) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO filter_presets (user_id, name, description, filters, is_public)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      user_id, 
      name, 
      description, 
      JSON.stringify(filters), 
      is_public ? 1 : 0
    );

    res.json({ 
      success: true, 
      id: result.lastInsertRowid,
      message: 'Filter preset created successfully' 
    });
  } catch (error) {
    console.error('Error creating filter preset:', error);
    res.status(500).json({ error: 'Failed to create filter preset' });
  }
};

export const getUserFilterPresets = (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { include_public = false } = req.query;

    let query = `
      SELECT * FROM filter_presets 
      WHERE is_deleted = 0 AND (user_id = ?
    `;
    const params: any[] = [user_id];

    if (include_public === 'true') {
      query += ` OR is_public = 1`;
    }

    query += `) ORDER BY usage_count DESC, created_at DESC`;

    const stmt = db.prepare(query);
    const presets = stmt.all(...params);

    // Parse filters JSON
    const parsedPresets = presets.map((preset: any) => ({
      ...preset,
      filters: JSON.parse(preset.filters),
      is_public: Boolean(preset.is_public)
    }));

    res.json({ success: true, presets: parsedPresets });
  } catch (error) {
    console.error('Error fetching filter presets:', error);
    res.status(500).json({ error: 'Failed to fetch filter presets' });
  }
};

export const updateFilterPresetUsage = (req: Request, res: Response) => {
  try {
    const { preset_id } = req.params;

    const stmt = db.prepare(`
      UPDATE filter_presets 
      SET usage_count = usage_count + 1, updated_at = datetime('now')
      WHERE id = ? AND is_deleted = 0
    `);

    const result = stmt.run(preset_id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Filter preset not found' });
    }

    res.json({ success: true, message: 'Usage count updated' });
  } catch (error) {
    console.error('Error updating filter preset usage:', error);
    res.status(500).json({ error: 'Failed to update usage count' });
  }
};

// Enhanced User Preferences API
export const updateUserPreferences = (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const {
      genres,
      mood,
      content_rating,
      viewing_context,
      accessibility_needs,
      content_warnings,
      // Legacy fields
      preferred_genres,
      excluded_genres,
      preferred_languages,
      adult_content,
      notification_settings,
      privacy_settings
    } = req.body;

    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];

    const addUpdate = (field: string, value: any) => {
      if (value !== undefined) {
        updates.push(`${field} = ?`);
        params.push(typeof value === 'object' ? JSON.stringify(value) : value);
      }
    };

    // New structured fields
    addUpdate('genres', genres);
    addUpdate('mood', mood);
    addUpdate('content_rating', content_rating);
    addUpdate('viewing_context', viewing_context);
    addUpdate('accessibility_needs', accessibility_needs);
    addUpdate('content_warnings', content_warnings);

    // Legacy fields
    addUpdate('preferred_genres', preferred_genres);
    addUpdate('excluded_genres', excluded_genres);
    addUpdate('preferred_languages', preferred_languages);
    addUpdate('adult_content', adult_content);
    addUpdate('notification_settings', notification_settings);
    addUpdate('privacy_settings', privacy_settings);

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = datetime(\'now\')');
    params.push(user_id);

    const query = `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?`;
    const stmt = db.prepare(query);
    const result = stmt.run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User preferences not found' });
    }

    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

// Recommendation Feedback API
export const submitRecommendationFeedback = (req: Request, res: Response) => {
  try {
    const { user_id, recommendation_id, content_id, feedback_type, reason } = req.body;

    if (!user_id || !recommendation_id || !content_id || !feedback_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validFeedbackTypes = ['like', 'dislike', 'not_interested', 'inappropriate'];
    if (!validFeedbackTypes.includes(feedback_type)) {
      return res.status(400).json({ error: 'Invalid feedback type' });
    }

    const stmt = db.prepare(`
      INSERT INTO recommendation_feedback (user_id, recommendation_id, content_id, feedback_type, reason)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, recommendation_id) 
      DO UPDATE SET 
        feedback_type = excluded.feedback_type,
        reason = excluded.reason,
        created_at = datetime('now')
    `);

    const result = stmt.run(user_id, recommendation_id, content_id, feedback_type, reason);

    res.json({ 
      success: true, 
      id: result.lastInsertRowid,
      message: 'Recommendation feedback saved' 
    });
  } catch (error) {
    console.error('Error submitting recommendation feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Reference Data APIs
export const getMoods = (req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`SELECT * FROM moods ORDER BY sort_order, name`);
    const moods = stmt.all();

    res.json({ success: true, moods });
  } catch (error) {
    console.error('Error fetching moods:', error);
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
};

export const getStreamingServices = (req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM streaming_services 
      WHERE is_active = 1 
      ORDER BY display_priority, name
    `);
    const services = stmt.all();

    res.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching streaming services:', error);
    res.status(500).json({ error: 'Failed to fetch streaming services' });
  }
};

// Activity Logging
export const logUserActivity = (req: Request, res: Response) => {
  try {
    const { user_id, action_type, content_id, content_type, metadata } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');

    if (!user_id || !action_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO user_activity_log (user_id, action_type, content_id, content_type, metadata, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      user_id,
      action_type,
      content_id,
      content_type,
      metadata ? JSON.stringify(metadata) : null,
      ip_address,
      user_agent
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error logging user activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
};

// Collections with Soft Delete
export const softDeleteCollection = (req: Request, res: Response) => {
  try {
    const { collection_id } = req.params;
    const { user_id } = req.body; // Verify ownership

    const stmt = db.prepare(`
      UPDATE collections 
      SET deleted_at = datetime('now'), is_deleted = 1, updated_at = datetime('now')
      WHERE id = ? AND user_id = ? AND is_deleted = 0
    `);

    const result = stmt.run(collection_id, user_id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Collection not found or already deleted' });
    }

    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting collection:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
};

export const restoreCollection = (req: Request, res: Response) => {
  try {
    const { collection_id } = req.params;
    const { user_id } = req.body; // Verify ownership

    const stmt = db.prepare(`
      UPDATE collections 
      SET deleted_at = NULL, is_deleted = 0, updated_at = datetime('now')
      WHERE id = ? AND user_id = ? AND is_deleted = 1
    `);

    const result = stmt.run(collection_id, user_id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Collection not found or not deleted' });
    }

    res.json({ success: true, message: 'Collection restored successfully' });
  } catch (error) {
    console.error('Error restoring collection:', error);
    res.status(500).json({ error: 'Failed to restore collection' });
  }
};
