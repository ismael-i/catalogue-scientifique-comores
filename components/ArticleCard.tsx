import { Newspaper } from "lucide-react";
import { ArticleCardProps } from "@/types/article";
import { ArticleData } from "@/lib/api/articles";
import { getFileUrl } from "@/lib/utils/fileUrl";

interface ArticleCardProp{
  article :ArticleData
}

export function ArticleCard({article}: ArticleCardProp) {
  const { imageUrl, imageAlt, date, title, description } = article
  return (
    <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col">
      {/* Image */}
      <div className="h-48 overflow-hidden bg-slate-100 flex items-center justify-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getFileUrl(imageUrl)}
            alt={imageAlt ?? ''}
            className="w-full h-full object-cover group-hover:blue-500 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-50 to-sky-100 flex items-center justify-center">
            <Newspaper className="w-10 h-10 text-sky-300" />
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        {/* Date */}
        <span className="text-xs text-slate-400">{date}</span>

        {/* Titre */}
        <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-500 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>
      </div>
    </div>
  );
}
