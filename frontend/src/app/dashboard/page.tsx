'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ─── TypeScript Interfaces ─────────────────────────────────────────────────────

interface Activity {
  _id?: string;
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: string;
}

interface ItineraryDay {
  dayNumber: number;
  activities: Activity[];
}

interface PackingItem {
  _id?: string;
  item: string;
  category: string;
  isPacked: boolean;
}

interface Hotel {
  name: string;
  tier: string;
  estimatedCostNightUSD: number;
  rating: string;
}

interface Trip {
  _id: string;
  destination: string;
  durationDays: number;
  budgetTier: string;
  itinerary: ItineraryDay[];
  packingList: PackingItem[];
  hotels?: Hotel[];
  estimatedBudget: {
    total: number;
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
  };
}

// ─── Dashboard Component ──────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newActivityName, setNewActivityName] = useState<string>('');
  const [targetDay, setTargetDay] = useState<number>(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUserTrips();
  }, [router]);

  const fetchUserTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/trips`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
        if (data.length > 0) setSelectedTrip(data[0]);
      }
    } catch (err) {
      console.error('Failed to query user records', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (dayNum: number) => {
    if (!newActivityName.trim() || !selectedTrip) return;
    const updatedItinerary = selectedTrip.itinerary.map(day => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          activities: [
            ...day.activities,
            { title: newActivityName, description: 'Added by traveler', estimatedCostUSD: 0, timeOfDay: 'Afternoon' }
          ]
        };
      }
      return day;
    });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/trips/${selectedTrip._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ itinerary: updatedItinerary })
      });
      if (res.ok) {
        const updatedData = await res.json();
        setSelectedTrip(updatedData);
        setNewActivityName('');
      }
    } catch (err) {
      console.error('Dynamic update failed', err);
    }
  };

  const togglePackingItem = async (itemId: string) => {
    if (!selectedTrip) return;
    const updatedPacking = selectedTrip.packingList.map(item => {
      if (item._id === itemId) return { ...item, isPacked: !item.isPacked };
      return item;
    });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/trips/${selectedTrip._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ packingList: updatedPacking })
      });
      if (res.ok) {
        const updatedData = await res.json();
        setSelectedTrip(updatedData);
      }
    } catch (err) {
      console.error('Checkbox updates failed', err);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '18px', fontFamily: 'Inter, sans-serif' }}>
        Loading your trips...
      </div>
    );
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';

  const catColors: Record<string, { bg: string; text: string }> = {
    Documents:   { bg: '#1e3a5f', text: '#60a5fa' },
    Clothing:    { bg: '#064e3b', text: '#34d399' },
    Gear:        { bg: '#3d2800', text: '#fbbf24' },
    Essentials:  { bg: '#3d2800', text: '#fbbf24' },
    Electronics: { bg: '#1e1e4a', text: '#818cf8' },
    Health:      { bg: '#064e3b', text: '#34d399' },
    Other:       { bg: '#1a1a35', text: '#94a3b8' },
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ backgroundColor: '#12122a', borderBottom: '1px solid #2d2d4e', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>

        {/* Left — brand + nav */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', marginRight: '8px' }}>✈️</span>
          <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>Trao</span>
          <div style={{ display: 'flex', gap: '24px', marginLeft: '32px' }}>
            <span onClick={() => router.push('/create')} style={{ color: '#94a3b8', fontSize: '14px', cursor: 'pointer', borderBottom: '2px solid transparent', paddingBottom: '2px' }}>Explore</span>
            <span onClick={() => router.push('/dashboard')} style={{ color: '#ffffff', fontSize: '14px', cursor: 'pointer', borderBottom: '2px solid #6366f1', paddingBottom: '2px' }}>My Trips</span>
            <span onClick={() => alert('Coming soon!')} style={{ color: '#94a3b8', fontSize: '14px', cursor: 'pointer', borderBottom: '2px solid transparent', paddingBottom: '2px' }}>Saved</span>
          </div>
        </div>

        {/* Right — email + sign out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>{userEmail}</span>
          <button
            id="btn-sign-out"
            onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
            style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: 'calc(100vh - 56px)' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ backgroundColor: '#0d0d1f', borderRight: '1px solid #2d2d4e', padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>

          <div style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>My Trips</div>

          {trips.length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>No trips yet. Create one!</p>
          )}

          {trips.map((trip) => (
            <button
              key={trip._id}
              id={`trip-btn-${trip._id}`}
              onClick={() => setSelectedTrip(trip)}
              style={{ width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: '10px', border: selectedTrip?._id === trip._id ? '1px solid #6366f1' : '1px solid #2d2d4e', backgroundColor: selectedTrip?._id === trip._id ? '#1e1e4a' : '#1a1a35', cursor: 'pointer', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}
            >
              <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{trip.destination}</div>
              <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>{trip.durationDays} days • {trip.budgetTier}</div>
            </button>
          ))}

          <button
            id="btn-new-trip"
            onClick={() => router.push('/create')}
            style={{ width: '100%', padding: '10px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '8px', fontFamily: 'Inter, sans-serif' }}
          >
            + New Trip
          </button>

          {/* Budget Card */}
          {selectedTrip && (
            <div style={{ backgroundColor: '#12122a', border: '1px solid #2d2d4e', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>Budget Estimate</span>
                <span style={{ backgroundColor: '#1e1e4a', color: '#6366f1', fontSize: '10px', padding: '2px 8px', borderRadius: '20px' }}>AI Suggested</span>
              </div>
              {[
                { icon: '✈️', label: 'Flights',    value: selectedTrip.estimatedBudget.transport },
                { icon: '🏨', label: 'Hotel',      value: selectedTrip.estimatedBudget.accommodation },
                { icon: '🍽️', label: 'Food',      value: selectedTrip.estimatedBudget.food },
                { icon: '🎯', label: 'Activities', value: selectedTrip.estimatedBudget.activities },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e1e3a', fontSize: '13px' }}>
                  <span style={{ color: '#94a3b8' }}>{icon} {label}</span>
                  <span style={{ color: 'white', fontWeight: 500 }}>${value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ color: 'white', fontWeight: '700' }}>Total</span>
                <span style={{ color: '#6366f1', fontWeight: '700', fontSize: '16px' }}>${selectedTrip.estimatedBudget.total}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT MAIN AREA ── */}
        <div style={{ overflowY: 'auto', padding: '24px 28px', backgroundColor: '#0a0a1a' }}>

          {!selectedTrip ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✈️</div>
              <p>Select an existing itinerary or create a new trip</p>
            </div>
          ) : (
            <>
              {/* Trip Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '800', margin: 0 }}>{selectedTrip.destination}</h2>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
                    📅 {selectedTrip.durationDays} days • {selectedTrip.budgetTier} Budget
                  </div>
                </div>
                <button
                  id="btn-share"
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/trip/${selectedTrip._id}`); alert('Share link copied to clipboard!'); }}
                  style={{ backgroundColor: 'transparent', border: '1px solid #2d2d4e', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif' }}
                >
                  🔗 Share
                </button>
              </div>

              {/* Itinerary */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Itinerary</h3>

                {selectedTrip.itinerary.map((day) => (
                  <div key={day.dayNumber} style={{ backgroundColor: '#12122a', border: '1px solid #2d2d4e', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>

                    <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #2d2d4e' }}>
                      Day {day.dayNumber}
                    </div>

                    {day.activities.map((act, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: i < day.activities.length - 1 ? '1px solid #1a1a35' : 'none' }}>
                        <span style={{
                          backgroundColor: act.timeOfDay === 'Morning' ? '#1e3a5f' : act.timeOfDay === 'Afternoon' ? '#3d2800' : '#2d1b4e',
                          color: act.timeOfDay === 'Morning' ? '#60a5fa' : act.timeOfDay === 'Afternoon' ? '#fbbf24' : '#a78bfa',
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0
                        }}>
                          {act.timeOfDay}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{act.title}</div>
                          <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{act.description}</div>
                        </div>
                        {act.estimatedCostUSD > 0 && (
                          <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>${act.estimatedCostUSD}</span>
                        )}
                      </div>
                    ))}

                    {/* Add Activity */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <input
                        id={`add-activity-day-${day.dayNumber}`}
                        type="text"
                        placeholder="Add activity..."
                        value={targetDay === day.dayNumber ? newActivityName : ''}
                        onChange={(e) => { setTargetDay(day.dayNumber); setNewActivityName(e.target.value); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddActivity(day.dayNumber); }}
                        style={{ flex: 1, backgroundColor: '#1a1a35', border: '1px solid #2d2d4e', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                      />
                      <button
                        id={`btn-add-activity-${day.dayNumber}`}
                        onClick={() => handleAddActivity(day.dayNumber)}
                        style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hotels */}
              {selectedTrip.hotels && selectedTrip.hotels.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏨 Recommended Hotels</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                    {selectedTrip.hotels.map((hotel, i) => (
                      <div key={i} style={{ backgroundColor: '#12122a', border: '1px solid #2d2d4e', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{hotel.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ backgroundColor: '#1e1e4a', color: '#6366f1', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>{hotel.tier}</span>
                          <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>${hotel.estimatedCostNightUSD}/night</span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>⭐ {hotel.rating}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Packing List */}
              <div>
                <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>🎒 AI Packing Assistant</h3>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>Smart packing based on destination and activities</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                  {selectedTrip.packingList?.map((item) => {
                    const colors = catColors[item.category] || catColors.Other;
                    return (
                      <div
                        key={item._id}
                        id={`packing-item-${item._id}`}
                        onClick={() => togglePackingItem(item._id!)}
                        style={{ backgroundColor: '#12122a', border: '1px solid #2d2d4e', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                      >
                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: item.isPacked ? 'none' : '2px solid #2d2d4e', backgroundColor: item.isPacked ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, color: 'white' }}>
                          {item.isPacked ? '✓' : ''}
                        </div>
                        <span style={{ fontSize: 13, color: item.isPacked ? '#4a5568' : '#e2e8f0', textDecoration: item.isPacked ? 'line-through' : 'none', flex: 1 }}>
                          {item.item}
                        </span>
                        <span style={{ backgroundColor: colors.bg, color: colors.text, fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, flexShrink: 0 }}>
                          {item.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
