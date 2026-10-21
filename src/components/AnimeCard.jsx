import { Bookmark, Play } from "lucide-react";
import AnimeArtwork from "./AnimeArtwork.jsx";

export default function AnimeCard({ anime, preview, compact = false, index = 0, onWatch }) {
  const genresText = anime.genres?.slice(0, 2).join(" · ") || "Anime";

  return (
    <article className="group min-w-0">
      <div className="relative">
        <AnimeArtwork
          anime={anime}
          className={`aspect-[.78] rounded-lg sm:rounded-xl ${compact ? "max-h-28 sm:max-h-36" : "max-h-52 sm:max-h-64"}`}
        />
        <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-1 text-[8px] font-semibold text-amber-200 backdrop-blur sm:left-2 sm:top-2 sm:text-[9px]">
          ★ {((9.2 - index * 0.3) || 8.8).toFixed(1)}
        </span>
        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-1 text-[7px] uppercase tracking-wide text-white/90 backdrop-blur sm:bottom-2 sm:left-2 sm:text-[8px]">
          {preview ? "Preview" : anime.status ?? "New"}
        </span>
        {!compact && (
          <button
            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/45 text-white opacity-100 backdrop-blur transition hover:bg-lilac hover:text-[#170e20] sm:opacity-0 sm:group-hover:opacity-100"
            type="button"
            aria-label={`Save ${anime.title}`}
          >
            <Bookmark size={15} />
          </button>
        )}
        {compact && (
          <button
            className="absolute inset-0 m-auto grid size-9 place-items-center rounded-full border border-white/50 bg-black/40 text-white backdrop-blur transition hover:scale-110"
            type="button"
            aria-label={`Continue watching ${anime.title}`}
            onClick={() => onWatch?.(anime)}
          >
            <Play size={14} fill="currentColor" />
          </button>
        )}
        {!compact && (
          <button
            className="absolute inset-0 m-auto grid size-10 place-items-center rounded-full border border-white/50 bg-black/45 text-white opacity-100 backdrop-blur transition hover:scale-110 hover:bg-lilac hover:text-[#170e20] sm:opacity-0 sm:group-hover:opacity-100"
            type="button"
            aria-label={`Watch ${anime.title}`}
            onClick={() => onWatch?.(anime)}
          >
            <Play size={15} fill="currentColor" />
          </button>
        )}
      </div>
      <div className="mt-2">
        <h3 className="truncate text-[10px] font-semibold text-white sm:text-xs">{anime.title}</h3>
        <p className="mt-1 truncate text-[8px] text-muted sm:text-[9px]">{genresText}</p>
        {compact && (
          <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-lilac" style={{ width: `${[42, 68, 31, 84][index % 4]}%` }} />
          </div>
        )}
      </div>
    </article>
  );
}
