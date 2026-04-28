import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export default function Card({
  title,
  description,
  eyebrow,
  action,
  className,
  children,
}: CardProps) {
  return (
    <section className={cn("surface-card rounded-2xl p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
          <h2 className="mt-3 font-heading text-[1.65rem] font-semibold text-slate-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
