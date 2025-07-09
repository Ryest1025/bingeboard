import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Google OAuth route
router.get('/google', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${req.protocol}://${req.get('host')}/auth/callback`
      }
    });

    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect('/login?error=oauth_failed');
    }

    if (data?.url) {
      console.log('Redirecting to Google OAuth:', data.url);
      return res.redirect(data.url);
    } else {
      console.error('No OAuth URL received');
      return res.redirect('/login?error=no_oauth_url');
    }
  } catch (error) {
    console.error('Google OAuth exception:', error);
    return res.redirect('/login?error=oauth_exception');
  }
});

// Facebook OAuth route  
router.get('/facebook', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${req.protocol}://${req.get('host')}/auth/callback`
      }
    });

    if (error) {
      console.error('Facebook OAuth error:', error);
      return res.redirect('/login?error=oauth_failed');
    }

    if (data?.url) {
      console.log('Redirecting to Facebook OAuth:', data.url);
      return res.redirect(data.url);
    } else {
      console.error('No OAuth URL received');
      return res.redirect('/login?error=no_oauth_url');
    }
  } catch (error) {
    console.error('Facebook OAuth exception:', error);
    return res.redirect('/login?error=oauth_exception');
  }
});

export default router;