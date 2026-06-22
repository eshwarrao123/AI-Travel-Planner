import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trao — AI Travel Planner',
  description: 'Your AI-powered travel companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{
        backgroundColor: '#0a0a1a',
        minHeight: '100vh'
      }}>
        {children}
      </body>
    </html>
  )
}
