import { Router } from 'express';
import { isAuthenticated } from '../auth.js';
import { db } from '../db.js';
import { aiRecommendations, userPreferences } from '../../shared/schema.js';
import { and, eq, desc } from 'drizzle-orm';
import { BingeBoardRecommendationEngine } from '../services/recommendationEngine.js';

const router = Router();

// Helper: safe user id
const getUserId = (req: any) => req?.user?.id as string;

// Helper: log behavior (best-effort)
async function logUserBehavior(userId: string, actionType: string, metadata: any = {}) {
  try {
    // userBehavior is defined in shared schema within recommendations routes
    const { userBehavior } = await import('../../shared/schema.js');
    await db.insert(userBehavior).values({
      userId,
      actionType,
  targetType: 'recommendation',
      timestamp: new Date(),
      metadata: JSON.stringify(metadata)
    });
  } catch (err) {
    console.warn('logUserBehavior failed:', err);
  }
}

// GET /api/ai-recommendations
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Fetch latest AI recs with joined show data
    const recs = await db.query.aiRecommendations.findMany({
      where: eq(aiRecommendations.userId, userId),
      with: { show: true },
      orderBy: desc(aiRecommendations.createdAt),
      limit: 200,
    });

    // Fetch preference status for helpful UI hints
    const prefs = await db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, userId) });
    const hasPreferences = !!prefs;
    const onboardingCompleted = !!prefs?.onboardingCompleted;

    res.json({
      recommendations: recs,
      hasPreferences,
      onboardingCompleted,
      message: recs.length === 0 ? 'No AI recommendations yet. Generate new ones to get started.' : undefined,
    });
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

// POST /api/ai-recommendations/generate
router.post('/generate', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const sections = await BingeBoardRecommendationEngine.generateRecommendations(userId);

    await logUserBehavior(userId, 'ai_recommendations_generated', {
      sectionCount: sections.length,
      totalItems: sections.reduce((sum, s) => sum + s.items.length, 0),
    });

    res.json({ success: true, generated: true });
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations' });
  }
});

// POST /api/ai-recommendations/:id/viewed
router.post('/:id/viewed', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });

    await db.update(aiRecommendations)
      .set({ isViewed: true })
      .where(and(eq(aiRecommendations.id, id), eq(aiRecommendations.userId, userId)));

    await logUserBehavior(userId, 'ai_recommendation_viewed', { id });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking recommendation viewed:', error);
    res.status(500).json({ success: false, message: 'Failed to update recommendation' });
  }
});

// POST /api/ai-recommendations/:id/feedback
router.post('/:id/feedback', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });

    // Normalize feedback
    const raw = String(req.body?.feedback || '').toLowerCase();
    let feedback: string | null = null;
    if (raw === 'like' || raw === 'liked') feedback = 'liked';
    else if (raw === 'dislike' || raw === 'disliked') feedback = 'disliked';
    else if (raw === 'dismiss' || raw === 'dismissed' || raw === 'not_interested') feedback = 'not_interested';

    await db.update(aiRecommendations)
      .set({ feedback, isInteracted: true })
      .where(and(eq(aiRecommendations.id, id), eq(aiRecommendations.userId, userId)));

    await logUserBehavior(userId, 'recommendation_feedback', { id, feedback });

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to record feedback' });
  }
});

export default router;
