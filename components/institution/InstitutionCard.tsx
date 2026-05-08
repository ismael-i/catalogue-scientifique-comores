import { InstitutionCardProps } from "@/types";
import { InstIcon } from "../icons";
import Link from "next/link";


export function InstitutionCard({
  acronym,
  name,
  description,
  logo,
  
}: InstitutionCardProps) {
   const slug = acronym.toLowerCase()
  return (
      <Link
      href={`/institutions/${slug}`}
    >
    <div className="group bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-w-0">
      {/* En-tête : logo + badge acronyme */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
          {logo ? (
            <img src={logo} alt={acronym} className="w-10 h-10 object-contain" />
          ) : (
            <InstIcon className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <span className="text-xs text-green-600 bg-gray-100 rounded-full letter-spacing px-2 py-0.5 tracking-tight uppercase">
          {acronym}
        </span>
      </div>

      {/* Titre */}
      <h3 className="text-sm font-semibold leading-snug">
        {name}
      </h3>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
        {description}
      </p>
    </div>
    </Link>
  );
}
