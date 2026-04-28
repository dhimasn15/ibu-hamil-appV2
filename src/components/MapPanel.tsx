import type { MotherProfile } from "@/lib/types";
import { formatCategoryLabel } from "@/lib/utils";

type MapPanelProps = {
  mothers: MotherProfile[];
};

export default function MapPanel({ mothers }: MapPanelProps) {
  const lats = mothers.map((item) => item.latitude);
  const lngs = mothers.map((item) => item.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="relative min-h-[360px] rounded-xl border border-slate-200 bg-white">
        {mothers.map((mother) => {
          const top =
            12 +
            ((maxLat - mother.latitude) / Math.max(maxLat - minLat, 0.001)) * 76;
          const left =
            10 +
            ((mother.longitude - minLng) / Math.max(maxLng - minLng, 0.001)) * 78;

          return (
            <div
              key={mother.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${top}%`, left: `${left}%` }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white bg-slate-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <div className="min-w-[150px] rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">{mother.fullName}</p>
                  <p>
                    {formatCategoryLabel(mother.category)} • RT {mother.rt}/RW{" "}
                    {mother.rw}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
