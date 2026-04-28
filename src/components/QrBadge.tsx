import { hashToMatrix } from "@/lib/utils";

type QrBadgeProps = {
  value: string;
  size?: number;
};

export default function QrBadge({ value, size = 120 }: QrBadgeProps) {
  const cells = hashToMatrix(value, 21);

  return (
    <div
      className="rounded-lg border border-slate-200 bg-white p-3"
      style={{ width: size, height: size }}
      aria-label={`QR ${value}`}
    >
      <div
        className="grid h-full w-full gap-[2px] rounded-sm bg-slate-100 p-[3px]"
        style={{ gridTemplateColumns: "repeat(21, minmax(0, 1fr))" }}
      >
        {cells.map((filled, index) => (
          <span
            key={`${value}-${index}`}
            className={filled ? "rounded-[1px] bg-slate-900" : "rounded-[1px] bg-transparent"}
          />
        ))}
      </div>
    </div>
  );
}
