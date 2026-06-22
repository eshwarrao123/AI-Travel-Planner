import type { Hotel } from '@/types';

interface HotelCardProps {
  name: string;
  tier: string;
  estimatedCostNightUSD: number;
  rating: string;
}

export default function HotelCard({ name, tier, estimatedCostNightUSD, rating }: HotelCardProps) {
  const tierColors: Record<string, string> = {
    Budget:    'bg-green-900/40 text-green-400 border-green-800',
    Standard:  'bg-blue-900/40 text-blue-400 border-blue-800',
    Premium:   'bg-purple-900/40 text-purple-400 border-purple-800',
    Luxury:    'bg-amber-900/40 text-amber-400 border-amber-800',
  };
  const tierClass = tierColors[tier] ?? 'bg-slate-800 text-slate-400 border-slate-700';

  const stars = parseFloat(rating);
  const fullStars = Math.floor(stars);
  const hasHalf = stars % 1 >= 0.5;

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-2 transition hover:border-indigo-500/40"
      style={{ background: '#12122a', borderColor: '#2d2d4e' }}
    >
      {/* Name row */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-white text-sm leading-snug">{name}</span>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border shrink-0 ${tierClass}`}>
          {tier}
        </span>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={
              i < fullStars
                ? 'text-amber-400 text-xs'
                : i === fullStars && hasHalf
                ? 'text-amber-400/60 text-xs'
                : 'text-slate-700 text-xs'
            }
          >
            ★
          </span>
        ))}
        <span className="text-slate-500 text-xs ml-1">{rating}</span>
      </div>

      {/* Price */}
      <p className="text-indigo-400 font-bold text-sm">
        ${estimatedCostNightUSD}
        <span className="text-slate-500 font-normal text-xs"> / night</span>
      </p>
    </div>
  );
}
