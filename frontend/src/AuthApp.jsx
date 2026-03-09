import { useEffect, useState } from 'react';
import App from './App.jsx';
import { AuthPage } from './components/AuthPage.jsx';
import { supabase } from './utils/supabase.js';

export function AuthApp() {
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setIsCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setIsCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isCheckingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span style={{ color: 'var(--kt-text-muted)', fontWeight: 600 }}>Checking session...</span>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <App onLogout={handleLogout} user={session.user} />;
}
