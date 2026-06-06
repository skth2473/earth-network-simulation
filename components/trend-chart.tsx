'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoricalRecord } from '@/lib/types';

interface TrendChartProps {
  data: HistoricalRecord[];
  lines: Array<{ key: keyof HistoricalRecord; label: string; color: string }>;
  title: string;
}

export function TrendChart({ data, lines, title }: TrendChartProps) {
  const chartData = data.slice(-24).map((record) => {
    const obj: any = { name: `${record.month}/${record.year}` };
    lines.forEach((line) => {
      const value = record[line.key];
      obj[line.label] = typeof value === 'number' ? parseFloat(value.toFixed(2)) : value;
    });
    return obj;
  });

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
          <XAxis stroke="oklch(0.65 0 0)" style={{ fontSize: '12px' }} />
          <YAxis stroke="oklch(0.65 0 0)" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.155 0 0)',
              border: '1px solid oklch(0.25 0 0)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'oklch(0.95 0 0)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '16px' }} />
          {lines.map((line) => (
            <Line
              key={line.label}
              type="monotone"
              dataKey={line.label}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
