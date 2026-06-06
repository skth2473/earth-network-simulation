interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  description?: string;
  icon?: React.ReactNode;
  status?: 'good' | 'warning' | 'critical';
}

export function KPICard({
  title,
  value,
  unit,
  change,
  description,
  icon,
  status = 'good',
}: KPICardProps) {
  const statusColors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">
              {typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 1 }) : value}
            </p>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {change !== undefined && (
        <div className="pt-2 border-t border-border">
          <p className={`text-sm font-medium ${change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
            {change > 0 ? '+' : ''}{change.toFixed(2)}% this month
          </p>
        </div>
      )}
    </div>
  );
}
