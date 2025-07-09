import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Server-side Google OAuth initiation
router.get('/google', async (req, res) => {
  try {
    console.log('Server-side Google OAuth initiation...');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${req.protocol}://${req.get('host')}/api/oauth/callback`
      }
    });

    if (error) {
      console.error('Server OAuth error:', error);
      return res.redirect('/login?error=oauth_failed');
    }

    if (data.url) {
      console.log('Redirecting to OAuth URL:', data.url);
      return res.redirect(data.url);
    }

    res.redirect('/login?error=no_oauth_url');
  } catch (error) {
    console.error('OAuth initiation error:', error);
    res.redirect('/login?error=server_error');
  }
});

// Server-side OAuth callback
router.get('/callback', async (req, res) => {
  try {
    console.log('Server-side OAuth callback processing...');
    console.log('Query params:', req.query);
    
    const { code, error } = req.query;
    
    if (error) {
      console.error('OAuth callback error:', error);
      return res.redirect('/login?error=' + error);
    }

    if (code) {
      console.log('Authorization code received:', typeof code === 'string' ? code.substring(0, 20) + '...' : code);
      
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code as string);
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return res.redirect('/login?error=code_exchange_failed');
      }
      
      if (data.session?.user) {
        console.log('Session created for user:', data.session.user.email);
        
        // Create/update user in database
        const user = data.session.user;
        const userPayload = {
          id: user.id,
          email: user.email,
          firstName: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || '',
          lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          authProvider: 'firebase'
        };

        try {
          const registerResponse = await fetch(`${req.protocol}://${req.get('host')}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
          });

          if (registerResponse.ok) {
            console.log('User registered successfully');
            // Set session in browser by redirecting with tokens
            const accessToken = data.session.access_token;
            const refreshToken = data.session.refresh_token;
            
            return res.redirect(`/auth/success?access_token=${accessToken}&refresh_token=${refreshToken}`);
          } else {
            console.error('User registration failed');
            return res.redirect('/login?error=registration_failed');
          }
        } catch (regError) {
          console.error('Registration request error:', regError);
          return res.redirect('/login?error=registration_error');
        }
      }
    }
    
    res.redirect('/login?error=invalid_callback');
  } catch (error) {
    console.error('OAuth callback processing error:', error);
    res.redirect('/login?error=callback_processing_failed');
  }
});

export default router;