'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    router.replace(token ? '/dashboard' : '/login');
  }, [router]);
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8'
    }}>
      Loading...
    </div>
  );
}
