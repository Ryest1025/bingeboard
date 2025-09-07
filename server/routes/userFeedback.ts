import { Router } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const router = Router();
const db = new Database(path.join(process.cwd(), 'dev.db'));

// POST /api/user-feedback - Submit user feedback
router.post('/', (req, res) => {
  try {
    const {
      user_id,
      content_id,
      content_type,
      rating,
      feedback_type,
      comment,
      watch_status,
      tags
    } = req.body;

    // Validate required fields
    if (!user_id || !content_id || !content_type || rating === undefined || !feedback_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, content_id, content_type, rating, feedback_type' 
      });
    }

    // Insert feedback
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO user_feedback (
        user_id, content_id, content_type, rating, feedback_type, 
        comment, watch_status, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = insertStmt.run(
      user_id,
      content_id,
      content_type,
      rating,
      feedback_type,
      comment || null,
      watch_status || 'want_to_watch',
      tags ? JSON.stringify(tags) : null
    );

    // Log activity
    const logStmt = db.prepare(`
      INSERT INTO user_activity_log (
        user_id, activity_type, entity_type, entity_id, 
        metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    logStmt.run(
      user_id,
      'feedback_submitted',
      'content',
      content_id,
      JSON.stringify({ 
        content_type, 
        rating, 
        feedback_type, 
        watch_status 
      })
    );

    res.status(201).json({ 
      success: true, 
      feedback_id: result.lastInsertRowid,
      message: 'Feedback submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// GET /api/user-feedback - Get user feedback
router.get('/', (req, res) => {
  try {
    const { user_id, content_id, content_type } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    let query = `
      SELECT * FROM user_feedback 
      WHERE user_id = ? AND deleted_at IS NULL
    `;
    const params: any[] = [user_id];

    if (content_id) {
      query += ' AND content_id = ?';
      params.push(content_id);
    }

    if (content_type) {
      query += ' AND content_type = ?';
      params.push(content_type);
    }

    query += ' ORDER BY updated_at DESC';

    const feedback = db.prepare(query).all(...params) as any[];
    
    // Parse tags JSON
    const parsedFeedback = feedback.map((f: any) => ({
      ...f,
      tags: f.tags ? JSON.parse(f.tags) : []
    }));

    res.json({ feedback: parsedFeedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

export default router;
