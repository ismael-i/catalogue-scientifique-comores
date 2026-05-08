import { LabCardProps } from "@/types";
import { LabIcon } from "../icons";


export function LabCard({
  acronym,
  name,
  description,
  researchers,
  institution,
  logo,
}: LabCardProps) {
  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-w-0">
      {/* Acronyme */}
      <div className="flex items-center gap-2 text-blue-500">
         {logo ? (
                    <img src={logo} alt={acronym} className="w-10 h-10 object-contain" />
                  ) : (
                    <LabIcon className="w-4 h-4 shrink-0" />
                  )}
        <span className="text-xs font-semibold tracking-wide uppercase">
          {acronym}
        </span>
      </div>

      {/* Titre */}
      <h3 className="text-sm font-semibold leading-snug transition-colors">
        {name}
      </h3>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-100">
        <span className="font-medium text-slate-600">{researchers} chercheurs</span>
        <span>•</span>
        <span>{institution}</span>
      </div>
    </div>
  );
}
