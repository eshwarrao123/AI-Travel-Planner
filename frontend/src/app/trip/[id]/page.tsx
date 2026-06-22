'use client';
import { use, useState, useEffect } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PublicTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasToken] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/trips/public/${id}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setTrip(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
      Loading shared trip...
    </div>
  );

  if (notFound || !trip) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'Inter, sans-serif', gap: '16px' }}>
      <div style={{ fontSize: 48 }}>🗺️</div>
      <p>Trip not found</p>
      <a href="/login" style={{ color: '#6366f1', textDecoration: 'none' }}>Go to Trao</a>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', fontFamily: 'Inter, sans-serif', color: 'white' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#12122a', borderBottom: '1px solid #2d2d4e', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: 20 }}>✈️</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>Trao</span>
          <span style={{ backgroundColor: '#1e1e4a', color: '#6366f1', fontSize: 11, padding: '3px 10px', borderRadius: 20, marginLeft: 8 }}>
            Shared Itinerary
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {hasToken && (
            <a href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, padding: '8px 16px', border: '1px solid #2d2d4e', borderRadius: 8 }}>
              ← Dashboard
            </a>
          )}
          <a href="/login" style={{ backgroundColor: '#6366f1', color: 'white', textDecoration: 'none', fontSize: 14, padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}>
            Open Trao
          </a>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Trip Title */}
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>{trip.destination}</h1>
        <div style={{ display: 'flex', gap: '10px', marginBottom: 32 }}>
          <span style={{ backgroundColor: '#1e1e4a', color: '#6366f1', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>
            {trip.durationDays} days
          </span>
          <span style={{ backgroundColor: '#1e1e4a', color: '#6366f1', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>
            {trip.budgetTier} Budget
          </span>
        </div>

        {/* Budget */}
        <div style={{ backgroundColor: '#12122a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 20, marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>💰 Budget Estimate</h3>
          {[
            { label: 'Transport',      value: trip.estimatedBudget?.transport },
            { label: 'Accommodation',  value: trip.estimatedBudget?.accommodation },
            { label: 'Food',           value: trip.estimatedBudget?.food },
            { label: 'Activities',     value: trip.estimatedBudget?.activities },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1a35', fontSize: 14 }}>
              <span style={{ color: '#94a3b8' }}>{row.label}</span>
              <span>${row.value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontWeight: 700, color: '#6366f1' }}>
            <span>Total</span>
            <span>${trip.estimatedBudget?.total}</span>
          </div>
        </div>

        {/* Itinerary */}
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Itinerary</h2>
        {trip.itinerary?.map((day: any) => (
          <div key={day.dayNumber} style={{ backgroundColor: '#12122a', border: '1px solid #2d2d4e', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #2d2d4e' }}>
              Day {day.dayNumber}
            </h3>
            {day.activities?.map((act: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < day.activities.length - 1 ? '1px solid #1a1a35' : 'none' }}>
                <span style={{
                  backgroundColor: act.timeOfDay === 'Morning' ? '#1e3a5f' : act.timeOfDay === 'Afternoon' ? '#3d2800' : '#2d1b4e',
                  color: act.timeOfDay === 'Morning' ? '#60a5fa' : act.timeOfDay === 'Afternoon' ? '#fbbf24' : '#a78bfa',
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', height: 'fit-content'
                }}>
                  {act.timeOfDay}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{act.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{act.description}</div>
                </div>
                {act.estimatedCostUSD > 0 && (
                  <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>${act.estimatedCostUSD}</span>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Packing List */}
        {trip.packingList?.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>🎒 Packing List</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {trip.packingList.map((item: any, i: number) => (
                <div key={i} style={{ backgroundColor: '#12122a', border: '1px solid #2d2d4e', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #2d2d4e', flexShrink: 0 }} />
                  <span style={{ color: '#e2e8f0' }}>{item.item}</span>
                  <span style={{ marginLeft: 'auto', backgroundColor: '#1e1e4a', color: '#6366f1', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13, paddingBottom: 32 }}>
          Created with{' '}
          <a href="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
            Trao AI Travel Planner
          </a>
        </div>
      </div>
    </div>
  );
}
