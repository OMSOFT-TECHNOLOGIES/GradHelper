import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '../utils/api';

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [activated, setActivated] = useState(false);

  const handleActivate = async () => {
    if (!token) {
      toast.error('Activation token missing.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/activate/${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Account activated! Redirecting to login...', { duration: 2000 });
        setActivated(true);
        setTimeout(() => {
          window.location.href = '/?login';
        }, 2000);
      } else {
        toast.error(data.error?.message || data.message || 'Activation failed.');
      }
    } catch (error) {
      toast.error('Activation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '2rem 2.5rem', minWidth: '320px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.25rem' }}>Activate Your Account</h2>
        <button
          onClick={handleActivate}
          disabled={isLoading || activated}
          style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #22d3ee 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 0', fontWeight: 600, fontSize: '1rem', width: '100%', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s' }}
        >
          {isLoading ? 'Activating...' : activated ? 'Activated!' : 'Activate Account'}
        </button>
      </div>
    </div>
  );
}
