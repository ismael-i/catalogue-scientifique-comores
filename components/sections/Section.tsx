import { SectionProps } from "@/types";
import Link from "next/link";


// Map cols → classe Tailwind (évite les purges de classes dynamiques)
const colsMap: Record<NonNullable<SectionProps["cols"]>, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function Section({
  title,
  subtitle,
  viewAllLabel = "Voir tous →",
  link = "#",
  cols = 3,
  children,
}: SectionProps) {
  return (
    <section className="mb-14">
      {/* En-tête */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <Link href={link} className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors whitespace-nowrap">
          {viewAllLabel}
        </Link>
      </div>

      {/* Grille */}
      <div className={`grid gap-4 ${colsMap[cols]}`}>{children}</div>
    </section>
  );
}
