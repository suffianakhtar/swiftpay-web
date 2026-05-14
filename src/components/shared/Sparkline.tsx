import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  fill?: string;
  height?: number;
}

/** Tiny recharts-based sparkline. Sized 100% width by parent, fixed height. */
export function Sparkline({ data, color = 'var(--c-accent)', fill, height = 32 }: SparklineProps) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.6}
            fill={fill ?? `color-mix(in oklab, ${color} 12%, transparent)`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
