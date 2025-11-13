import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '../utils/api';

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !newPassword2) {
      toast.error('Please fill in both password fields.');
      return;
    }
    if (newPassword !== newPassword2) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/password-reset-confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: newPassword,
          new_password2: newPassword2,
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset successful! Redirecting to login...', {
          duration: 2000
        });
        setTimeout(() => {
          window.location.href = '/?login';
        }, 2000);
        setNewPassword('');
        setNewPassword2('');
      } else {
        toast.error(data.error?.message || data.message || 'Password reset failed.');
      }
    } catch (error) {
      toast.error('Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '2rem 2.5rem', minWidth: '320px', maxWidth: '400px', width: '100%' }}>
        <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.25rem', textAlign: 'center' }}>Reset Your Password</h2>
        <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={newPassword2}
            onChange={e => setNewPassword2(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
            required
          />
          <button
            type="submit"
            style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #22d3ee 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 0', fontWeight: 600, fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s' }}
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
