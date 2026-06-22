'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) router.replace('/dashboard');
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true);
    setError('');
    const data = await api.post('/api/auth/login', { email, password });
    if (data?.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);
      router.replace('/dashboard');
    } else {
      setError(data?.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    const data = await api.post('/api/auth/register', { email, password });
    if (data?.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);
      router.replace('/dashboard');
    } else {
      setError(data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#1a1a35',
    border: '1px solid #2d2d4e',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '6px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#12122a',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #2d2d4e',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✈️</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
            Trao
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            Your AI-powered travel companion
          </p>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #2d2d4e', marginBottom: '24px' }}>
          {(['login', 'register'] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => { setMode(tab); setError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: mode === tab ? '#ffffff' : '#94a3b8',
                borderBottom: mode === tab ? '2px solid #6366f1' : '2px solid transparent',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {tab === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirm Password — register only */}
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
          )}

          {/* Remember me — login only */}
          {mode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#6366f1' }} />
                Remember me
              </label>
              <span style={{ fontSize: '13px', color: '#6366f1', cursor: 'pointer' }}>
                Forgot password?
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <p style={{ fontSize: '13px', color: '#ef4444', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="button"
            id={mode === 'login' ? 'btn-sign-in' : 'btn-sign-up'}
            onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: loading ? '#4f46e5' : '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
              transition: 'all 0.2s',
              marginTop: '4px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {loading
              ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
              : (mode === 'login' ? 'Sign In' : 'Sign Up')
            }
          </button>
        </div>
      </div>
    </div>
  );
}
