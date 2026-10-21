import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Clapperboard,
  ExternalLink,
  Film,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tv,
  VideoOff,
} from "lucide-react";
import AnimeArtwork from "../components/AnimeArtwork.jsx";

function getPlayer(videoUrl) {
  if (typeof videoUrl !== "string" || !videoUrl.trim()) return null;

  let url;

  try {
    url = new URL(videoUrl.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    return null;
  }

  const host = url.hostname.toLowerCase();
  let videoId;

  if (host === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0];
  } else if (
    ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)
  ) {
    const parts = url.pathname.split("/").filter(Boolean);

    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else if (["embed", "shorts", "live"].includes(parts[0])) {
      videoId = parts[1];
    }
  }

  if (videoId && /^[\w-]{6,20}$/.test(videoId)) {
    return {
      type: "embed",
      src: `https://www.youtube-nocookie.com/embed/${videoId}`,
    };
  }

  if (
    ["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)
  ) {
    const match = url.pathname.match(/(?:video\/)?(\d{6,12})\/?$/);

    if (match) {
      return {
        type: "embed",
        src: `https://player.vimeo.com/video/${match[1]}`,
      };
    }
  }

  if (/\.(mp4|webm|ogv)$/i.test(url.pathname)) {
    return { type: "video", src: url.href };
  }

  return null;
}

function formatStatus(status) {
  if (typeof status !== "string" || !status.trim()) return "Anime";

  return status
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function WatchPage({
  anime,
  recommendations = [],
  onBack,
  onWatch,
}) {
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const title =
    typeof anime?.title === "string" && anime.title.trim()
      ? anime.title.trim()
      : "Untitled anime";

  const player = getPlayer(anime?.videoUrl);

  const genres = Array.isArray(anime?.genres)
    ? anime.genres.filter(
        (genre) => typeof genre === "string" && genre.trim()
      )
    : [];

  const episodes = Number(anime?.episodes);

  const otherAnime = useMemo(() => {
    const items = Array.isArray(recommendations) ? recommendations : [];
    const seen = new Set();

    return items
      .filter(
        (item) =>
          item &&
          item.title &&
          String(item.title).trim() &&
          item._id !== anime?._id
      )
      .filter((item) => {
        const key = item._id ? String(item._id) : item.title;

        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }, [recommendations, anime?._id]);

  useEffect(() => {
    setPlaybackFailed(false);
    setRetryKey(0);
  }, [anime?._id, anime?.videoUrl]);

  function retryPlayback() {
    setPlaybackFailed(false);
    setRetryKey((key) => key + 1);
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-canvas pb-8 text-white sm:pb-12">
      {/* Compact mobile navigation */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0c0a12]/95 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
          <button
            onClick={onBack}
            type="button"
            aria-label="Back to AnivoAnime"
            className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-[#d4cedf] transition hover:border-lilac/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac sm:min-w-0"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to AnivoAnime</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] sm:px-6 sm:pt-6 lg:px-8">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            {/* Video player: edge-to-edge on phones */}
            <div className="overflow-hidden bg-black sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl sm:shadow-black/30">
              <div className="relative aspect-video w-full overflow-hidden bg-[#08070b]">
                {player && !playbackFailed ? (
                  player.type === "embed" ? (
                    <iframe
                      key={`${player.src}-${retryKey}`}
                      src={player.src}
                      title={`${title} video player`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="eager"
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="absolute inset-0 size-full border-0"
                    />
                  ) : (
                    <video
                      key={`${player.src}-${retryKey}`}
                      className="absolute inset-0 size-full"
                      controls
                      playsInline
                      preload="metadata"
                      poster={anime?.coverImage || undefined}
                      onError={() => setPlaybackFailed(true)}
                    >
                      <source src={player.src} />
                      Your browser does not support HTML video.
                    </video>
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,.15),transparent_70%)] px-5 py-6">
                    <div className="flex max-w-sm flex-col items-center text-center">
                      <div className="mb-4 grid size-14 place-items-center rounded-2xl border border-lilac/25 bg-lilac/10 text-lilac sm:size-16">
                        {playbackFailed ? (
                          <VideoOff size={26} />
                        ) : (
                          <Play size={26} />
                        )}
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-[.22em] text-lilac">
                        {playbackFailed ? "Playback error" : "Coming soon"}
                      </p>

                      <h2 className="mt-2 font-display text-lg font-bold sm:text-xl">
                        {playbackFailed
                          ? "Couldn't load this video"
                          : "Episode not available"}
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-[#aaa4b5] sm:text-sm">
                        {playbackFailed
                          ? "Check your connection and try again."
                          : "A supported video source has not been added yet."}
                      </p>

                      {playbackFailed && (
                        <button
                          type="button"
                          onClick={retryPlayback}
                          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-lilac px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <Play size={15} />
                          Try again
                        </button>
                      )}

                      {!playbackFailed && (
                        <p className="mt-4 flex items-center gap-1.5 text-[10px] text-amber-200/80">
                          <ShieldAlert size={13} />
                          Use authorized video sources
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Anime information */}
            <div className="px-4 pt-5 sm:px-0 sm:pt-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lilac/20 bg-lilac/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-lilac">
                  <Clapperboard size={12} />
                  Now watching
                </span>

                {anime?.status && (
                  <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] text-[#c8c1d3]">
                    {formatStatus(anime.status)}
                  </span>
                )}
              </div>

              <h1 className="mt-3 break-words font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {title}
              </h1>

              {/* Scrollable metadata avoids squeezing on small screens */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Film size={14} className="text-lilac" />
                  Anime
                </span>

                {Number.isFinite(episodes) && episodes > 0 && (
                  <span>
                    {episodes} {episodes === 1 ? "episode" : "episodes"}
                  </span>
                )}

                {genres.length > 0 && (
                  <span className="break-words">
                    {genres.join(" · ")}
                  </span>
                )}
              </div>

              {anime?.description && (
                <section className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:mt-6 sm:p-5">
                  <h2 className="flex items-center gap-2 text-sm font-bold">
                    <Sparkles size={15} className="text-lilac" />
                    About this anime
                  </h2>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#aaa4b5]">
                    {anime.description}
                  </p>
                </section>
              )}

              {player && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-5">
                  <p className="flex min-w-0 items-center gap-2 text-[11px] leading-5 text-muted">
                    <ShieldCheck size={15} className="shrink-0 text-emerald-300" />
                    Watch responsibly
                  </p>

                  <a
                    href={player.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-[#d4cedf] transition hover:border-lilac/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac"
                  >
                    Open player
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>

            {/* Mobile and tablet recommendations */}
            <section className="mt-8 lg:hidden">
              <div className="mb-4 flex items-end justify-between gap-3 px-4 sm:px-0">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[.2em] text-lilac">
                    Find your next favorite
                  </p>
                  <h2 className="font-display text-xl font-bold sm:text-2xl">
                    More to explore
                  </h2>
                </div>
                <span className="shrink-0 text-[11px] text-muted">
                  {otherAnime.length} titles
                </span>
              </div>

              {otherAnime.length > 0 ? (
                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 md:grid-cols-4">
                  {otherAnime.map((item) => (
                    <MobileAnimeCard
                      key={item._id ?? item.title}
                      item={item}
                      onWatch={onWatch}
                    />
                  ))}
                </div>
              ) : (
                <div className="mx-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-sm text-muted sm:mx-0">
                  <Clapperboard size={20} className="mb-2 text-lilac" />
                  More anime will appear here when available.
                </div>
              )}
            </section>
          </section>

          {/* Desktop sidebar */}
          <aside className="hidden min-w-0 lg:block">
            <div className="sticky top-6">
              <div className="mb-5">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[.2em] text-lilac">
                  Curated for you
                </p>
                <h2 className="font-display text-xl font-bold">
                  More to explore
                </h2>
              </div>

              <div className="space-y-3">
                {otherAnime.map((item, index) => (
                  <DesktopAnimeCard
                    key={item._id ?? item.title}
                    item={item}
                    index={index}
                    onWatch={onWatch}
                  />
                ))}
              </div>

              {otherAnime.length === 0 && (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-sm leading-6 text-muted">
                  No other anime titles available yet.
                </div>
              )}
            </div>
          </aside>
        </div>

        <footer className="mx-4 mt-10 border-t border-white/[0.07] pt-5 text-center text-[11px] text-muted sm:mx-0 sm:text-left">
          <p className="flex flex-wrap items-center justify-center gap-2 sm:justify-between">
            <span>© {new Date().getFullYear()} AnivoAnime</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-lilac" />
              Stream responsibly. Respect content rights.
            </span>
          </p>
        </footer>
      </div>
    </main>
  );
}

function MobileAnimeCard({ item, onWatch }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onWatch?.(item)}
      aria-label={`Watch ${item.title}`}
      className="group w-[142px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12101a] text-left transition active:scale-[0.98] hover:border-lilac/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac sm:w-auto"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-white/[0.04]">
        {!imageFailed ? (
          <AnimeArtwork
            anime={item}
            className="size-full transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-lilac">
            <Clapperboard size={24} />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute bottom-2 left-2 grid size-8 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm">
          <Play size={13} fill="currentColor" />
        </div>
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-white">
          {item.title}
        </h3>
        <p className="mt-1.5 truncate text-[10px] text-muted">
          {Array.isArray(item.genres)
            ? item.genres
                .filter((genre) => typeof genre === "string")
                .slice(0, 2)
                .join(" · ") || "Anime"
            : "Anime"}
        </p>
      </div>
    </button>
  );
}

function DesktopAnimeCard({ item, index, onWatch }) {
  return (
    <button
      type="button"
      onClick={() => onWatch?.(item)}
      aria-label={`Watch ${item.title}`}
      className="group flex w-full min-w-0 items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#12101a] p-2.5 text-left transition hover:border-lilac/35 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac"
    >
      <div className="relative aspect-[3/4] w-[68px] shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
        <AnimeArtwork
          anime={item}
          className="size-full transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-lilac">
          Pick {index + 1}
        </p>
        <h3 className="line-clamp-2 text-xs font-semibold leading-5 text-white group-hover:text-lilac">
          {item.title}
        </h3>
        <p className="mt-1.5 truncate text-[10px] text-muted">
          {Array.isArray(item.genres)
            ? item.genres
                .filter((genre) => typeof genre === "string")
                .slice(0, 2)
                .join(" · ") || "Anime"
            : "Anime"}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#aaa4b5]">
          Explore
          <ArrowUpRight size={12} />
        </span>
      </div>
    </button>
  );
}