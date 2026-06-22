'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

const INTERESTS = ['Food', 'Culture', 'Adventure', 'Shopping', 'Nature', 'History', 'Nightlife'];

const INTEREST_ICONS: Record<string, string> = {
  Food: '🍜', Culture: '🏛', Adventure: '🧗', Shopping: '🛍',
  Nature: '🌿', History: '📚', Nightlife: '🍸',
};

const BUDGET_OPTIONS = [
  { value: 'Low'    as const, label: 'Modest',   sub: 'Under $100',  icon: '🪙' },
  { value: 'Medium' as const, label: 'Balanced',  sub: '$100 - $300', icon: '💳' },
  { value: 'High'   as const, label: 'Luxury',    sub: '$300+',       icon: '💎' },
];

export default function CreateTripPage() {
  const router = useRouter();
  const [destination, setDestination]   = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetTier, setBudgetTier]     = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [interests, setInterests]       = useState<string[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) router.replace('/login');
  }, [router]);

  const toggleInterest = (v: string) => {
    setInterests((prev) =>
      prev.includes(v) ? prev.filter((i) => i !== v) : [...prev, v]
    );
  };

  const handleSubmit = async () => {
    if (!destination.trim()) { setError('Please enter a destination'); return; }
    if (interests.length === 0) { setError('Please select at least one interest'); return; }
    setError('');
    setLoading(true);
    const data = await api.post('/api/trips', {
      destination: destination.trim(),
      durationDays,
      budgetTier,
      interests,
    });
    if (data?._id) {
      router.replace('/dashboard');
    } else {
      setError(data?.message || 'Generation failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#12122a',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid #2d2d4e',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <button
            type="button"
            id="btn-close"
            onClick={() => router.replace('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '22px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px 8px',
            }}
          >
            ×
          </button>
          <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', color: '#94a3b8', textTransform: 'uppercase' }}>
            New Trip
          </span>
          <div style={{ width: '32px' }} />
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', marginBottom: '20px' }}>
          Where to next?
        </h1>

        {/* Destination */}
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g., Kyoto, Japan"
          style={{
            width: '100%',
            padding: '14px 18px',
            backgroundColor: '#1a1a35',
            border: '1px solid #2d2d4e',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '16px',
            outline: 'none',
            marginBottom: '20px',
            fontFamily: 'Inter, sans-serif',
          }}
        />

        {/* Duration card */}
        <div style={{
          backgroundColor: '#1a1a35',
          border: '1px solid #2d2d4e',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>Duration</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>How long is your escape?</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', lineHeight: 1 }}>{durationDays}</span>
              <span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '4px' }}>days</span>
            </div>
          </div>
          <input
            id="duration-slider"
            type="range"
            min={1}
            max={14}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            style={{ width: '100%', marginTop: '12px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>1 day</span>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>14 days</span>
          </div>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>Budget</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Estimated daily allowance</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {BUDGET_OPTIONS.map((opt) => {
              const active = budgetTier === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  id={`budget-${opt.value.toLowerCase()}`}
                  onClick={() => setBudgetTier(opt.value)}
                  style={{
                    padding: '14px 8px',
                    borderRadius: '12px',
                    border: active ? '1px solid #6366f1' : '1px solid #2d2d4e',
                    backgroundColor: active ? 'rgba(99,102,241,0.1)' : '#1a1a35',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    boxShadow: active ? '0 0 12px rgba(99,102,241,0.2)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{opt.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{opt.label}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{opt.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interests */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>Interests</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Select a few to help AI tailor your trip</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {INTERESTS.map((interest) => {
              const active = interests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  id={`interest-${interest.toLowerCase()}`}
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '100px',
                    border: active ? '1px solid #6366f1' : '1px solid #2d2d4e',
                    backgroundColor: active ? '#6366f1' : '#1a1a35',
                    color: active ? '#ffffff' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {INTEREST_ICONS[interest]} {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button
          type="button"
          id="btn-generate"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: loading ? '#4f46e5' : '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.85 : 1,
            transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {loading ? 'Crafting your perfect trip...' : 'Generate My Itinerary ✨'}
        </button>
        {loading && (
          <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '10px' }}>
            This usually takes 10–15 seconds
          </p>
        )}
      </div>
    </div>
  );
}
