import { useMemo, useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../utils/supabase.js';

const INITIAL_FORM = {
  email: '',
  password: '',
};

const toFriendlyAuthError = (message = '') => {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Email atau password tidak sesuai.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Email belum diverifikasi. Silakan cek inbox atau kirim ulang email verifikasi.';
  }

  if (normalized.includes('user already registered')) {
    return 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.';
  }

  if (normalized.includes('password should be at least')) {
    return 'Password minimal 6 karakter.';
  }

  if (normalized.includes('failed to fetch')) {
    return 'Tidak bisa terhubung ke Supabase. Periksa koneksi internet dan env key.';
  }

  return message || 'Autentikasi gagal. Silakan coba lagi.';
};

export function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  const modeLabel = useMemo(
    () => (mode === 'login' ? 'Login to CEISA Doc Genie' : 'Create your account'),
    [mode]
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (signInError) {
          throw signInError;
        }

        setPendingVerificationEmail('');
        setMessage('Login berhasil. Mengalihkan...');
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });

        if (signUpError) {
          throw signUpError;
        }

        if (!data.session) {
          setPendingVerificationEmail(form.email);
          setMessage('Registrasi berhasil. Cek email Anda untuk verifikasi sebelum login.');
        } else {
          setPendingVerificationEmail('');
          setMessage('Registrasi berhasil. Anda sudah login.');
        }
      }
    } catch (submitError) {
      const rawMessage = submitError?.message || '';
      setError(toFriendlyAuthError(rawMessage));

      if (rawMessage.toLowerCase().includes('email not confirmed') && form.email) {
        setPendingVerificationEmail(form.email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return;

    setIsSubmitting(true);
    setError('');

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: pendingVerificationEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (resendError) {
      setError(toFriendlyAuthError(resendError.message));
    } else {
      setMessage('Email verifikasi berhasil dikirim ulang. Cek inbox dan folder spam.');
    }

    setIsSubmitting(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: 'linear-gradient(135deg, #f5f8fa 0%, #e9f3ff 45%, #f8fafc 100%)',
    }}>
      <div className="kt-card" style={{ width: '100%', maxWidth: 420 }}>
        <div className="kt-card-header" style={{ justifyContent: 'center' }}>
          <div className="kt-card-title">{modeLabel}</div>
        </div>
        <div className="kt-card-body">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <div className="kt-form-row">
              <label className="kt-label" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                className="kt-input"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                required
              />
            </div>

            <div className="kt-form-row">
              <label className="kt-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                className="kt-input"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="kt-notice kt-notice-danger" style={{ padding: 10, fontSize: 12 }}>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="kt-notice kt-notice-success" style={{ padding: 10, fontSize: 12 }}>
                <span>{message}</span>
              </div>
            )}

            <button className="kt-btn kt-btn-primary" type="submit" disabled={isSubmitting}>
              {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <button
              type="button"
              className="kt-btn kt-btn-light kt-btn-sm"
              onClick={() => {
                setMode((prev) => (prev === 'login' ? 'register' : 'login'));
                setError('');
                setMessage('');
              }}
            >
              {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </div>

          {!!pendingVerificationEmail && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button
                type="button"
                className="kt-btn kt-btn-light kt-btn-sm"
                onClick={handleResendVerification}
                disabled={isSubmitting}
              >
                Kirim Ulang Email Verifikasi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
