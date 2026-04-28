type DashboardChartsProps = {
  total: number;
  pregnantCount: number;
  breastfeedingCount: number;
  highRiskCount: number;
};

function ChartBar({
  label,
  value,
  total,
  colorClass,
}: {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}) {
  const width = total > 0 ? `${Math.max((value / total) * 100, value ? 8 : 0)}%` : "0%";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200/70">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width }} />
      </div>
    </div>
  );
}

export default function DashboardCharts({
  total,
  pregnantCount,
  breastfeedingCount,
  highRiskCount,
}: DashboardChartsProps) {
  const safeTotal = Math.max(total, 1);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (highRiskCount / safeTotal) * circumference;

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-5">
        <p className="chart-caption">Komposisi Risiko</p>
        <div className="mt-4 flex items-center justify-center">
          <div className="relative">
            <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                strokeWidth="14"
                className="chart-ring-track"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                strokeWidth="14"
                strokeLinecap="round"
                stroke="#2563eb"
                strokeDasharray={`${progress} ${circumference}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Risiko tinggi
              </span>
              <span className="font-heading text-4xl font-bold text-slate-900">
                {highRiskCount}
              </span>
              <span className="text-sm text-slate-500">dari {total} data</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-5">
        <p className="chart-caption">Distribusi Data</p>
        <div className="mt-5 space-y-5">
          <ChartBar
            label="Total ibu tampil"
            value={total}
            total={safeTotal}
            colorClass="bg-slate-800"
          />
          <ChartBar
            label="Ibu hamil"
            value={pregnantCount}
            total={safeTotal}
            colorClass="bg-blue-600"
          />
          <ChartBar
            label="Ibu menyusui"
            value={breastfeedingCount}
            total={safeTotal}
            colorClass="bg-teal-600"
          />
          <ChartBar
            label="Prioritas kunjungan"
            value={highRiskCount}
            total={safeTotal}
            colorClass="bg-rose-600"
          />
        </div>
      </div>
    </div>
  );
}
