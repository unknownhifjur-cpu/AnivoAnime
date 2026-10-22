import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Clapperboard,
  ExternalLink,
  Film,
  LoaderCircle,
  Maximize,
  Play,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tv,
  VideoOff,
} from "lucide-react";
import AnimeArtwork from "../components/AnimeArtwork.jsx";
import { resolveVideoSource } from "../../../shared/videoSource.js";

function formatStatus(status) {
  if (typeof status !== "string" || !status.trim()) return "Anime";

  return status
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* RelatedEpisodes                                                     */
/* ------------------------------------------------------------------ */

function RelatedEpisodes({ anime, recommendations, onWatch }) {
  const episodes = useMemo(() => {
    const items = Array.isArray(recommendations) ? recommendations : [];
    const currentId = anime?._id;
    const seen = new Set();

    const scored = items
      .filter(
        (item) =>
          item &&
          item.title &&
          String(item.title).trim() &&
          item._id !== currentId
      )
      .filter((item) => {
        const key = item._id ? String(item._id) : item.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((item) => {
        const sameSeries =
          anime?.seriesId && item.seriesId
            ? anime.seriesId === item.seriesId
            : false;
        const sameFranchise =
          anime?.franchise && item.franchise
            ? anime.franchise === item.franchise
            : false;
        return { item, score: sameSeries ? 2 : sameFranchise ? 1 : 0 };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);

    return scored.slice(0, 12);
  }, [recommendations, anime?._id, anime?.seriesId, anime?.franchise]);

  if (episodes.length === 0) return null;

  return (
    <section
      aria-labelledby="related-episodes-heading"
      className="mt-6 px-4 sm:mt-8 sm:px-0"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.2em] text-lilac">
            Keep watching
          </p>
          <h2
            id="related-episodes-heading"
            className="font-display text-lg font-bold sm:text-xl"
          >
            Related episodes
          </h2>
        </div>
        <span className="shrink-0 text-[11px] text-muted">
          {episodes.length} {episodes.length === 1 ? "title" : "titles"}
        </span>
      </div>

      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:pb-0 md:grid-cols-4 lg:grid-cols-5"
        role="list"
      >
        {episodes.map((item) => (
          <RelatedEpisodeCard
            key={item._id ?? item.title}
            item={item}
            onWatch={onWatch}
          />
        ))}
      </div>
    </section>
  );
}

function RelatedEpisodeCard({ item, onWatch }) {
  const [imageFailed, setImageFailed] = useState(false);

  const episodeLabel =
    Number.isFinite(Number(item.episodes)) && Number(item.episodes) > 0
      ? `${Number(item.episodes)} ${
          Number(item.episodes) === 1 ? "ep" : "eps"
        }`
      : null;

  return (
    <button
      type="button"
      role="listitem"
      onClick={() => onWatch?.(item)}
      aria-label={`Watch ${item.title}`}
      className="group w-[160px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12101a] text-left transition active:scale-[0.98] hover:border-lilac/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac sm:w-auto"
    >
      <div className="relative aspect-video overflow-hidden bg-white/[0.04]">
        {!imageFailed ? (
          <AnimeArtwork
            anime={item}
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-lilac">
            <Clapperboard size={22} />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <div className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="grid size-10 place-items-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-sm">
            <Play size={16} fill="currentColor" />
          </span>
        </div>

        {episodeLabel && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            {episodeLabel}
          </span>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="line-clamp-2 min-h-9 text-xs font-semibold leading-5 text-white">
          {item.title}
        </h3>
        <p className="mt-1 truncate text-[10px] text-muted">
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

/* ------------------------------------------------------------------ */
/* Seek feedback toast                                                 */
/* ------------------------------------------------------------------ */

function SeekToast({ message }) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-black/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-opacity duration-200 ${
        message ? "opacity-100" : "opacity-0"
      }`}
    >
      {message || "\u00A0"}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton for the video frame while metadata loads                   */
/* ------------------------------------------------------------------ */

function VideoSkeleton() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#08070b]">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,.12),transparent_70%)]" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-white/70">
          <LoaderCircle className="animate-spin" size={26} />
          <span className="text-[11px] font-medium tracking-wide">
            Preparing player…
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WatchPage                                                           */
/* ------------------------------------------------------------------ */

export default function WatchPage({
  anime,
  recommendations = [],
  onBack,
  onWatch,
}) {
  const [playbackError, setPlaybackError] = useState("");
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [seekToast, setSeekToast] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const videoRef = useRef(null);
  const toastTimer = useRef(null);

  const title =
    typeof anime?.title === "string" && anime.title.trim()
      ? anime.title.trim()
      : "Untitled anime";

  const videoUrl =
    anime?.videoUrl || anime?.embedUrl || anime?.video || anime?.video_url || "";
  const videoResult = resolveVideoSource(videoUrl, anime?.videoType || "auto", {
    requireHttps: import.meta.env.PROD,
  });
  const player = videoResult.source;

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
    setPlaybackError("");
    setBuffering(false);
    setPlaybackLoading(Boolean(player));

    const video = videoRef.current;
    if (!video || !player || player.type === "embed") return undefined;

    let cancelled = false;
    let hls;
    if (player.type === "hls") {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = player.url;
      } else {
        void import("hls.js")
          .then(({ default: Hls }) => {
            if (cancelled) return;
            if (!Hls.isSupported()) {
              setPlaybackError("This browser does not support HLS playback.");
              setPlaybackLoading(false);
              return;
            }
            hls = new Hls();
            hls.loadSource(player.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_event, data) => {
              if (!cancelled && data.fatal) {
                setPlaybackError(
                  "The HLS stream could not be loaded. Check the stream URL and try again."
                );
              }
            });
          })
          .catch(() => {
            if (!cancelled) {
              setPlaybackError("The HLS player could not be initialized.");
              setPlaybackLoading(false);
            }
          });
      }
    } else {
      video.src = player.url;
    }

    return () => {
      cancelled = true;
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [anime?._id, player?.url, player?.type, retryKey]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function retryPlayback() {
    setPlaybackError("");
    setPlaybackLoading(true);
    setRetryKey((key) => key + 1);
  }

  function showSeekToast(text) {
    setSeekToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setSeekToast(""), 900);
  }

  function seekBy(seconds) {
    const video = videoRef.current;
    if (!video) return;

    if (seconds < 0) {
      video.currentTime = Math.max(0, video.currentTime + seconds);
      showSeekToast("−10s");
    } else {
      video.currentTime = Math.min(
        Number.isFinite(video.duration) ? video.duration : Infinity,
        video.currentTime + seconds
      );
      showSeekToast("+10s");
    }
  }

  // Explicit fullscreen + landscape lock for Android. Must run from a
  // user gesture (button click) — the platform requires it.
  async function goFullscreenLandscape() {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.requestFullscreen) {
        await video.requestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        // iOS Safari fallback
        video.webkitEnterFullscreen();
        return;
      }
      if (screen.orientation?.lock) {
        await screen.orientation.lock("landscape").catch(() => {});
      }
    } catch {
      // Unsupported or rejected — native controls still work.
    }
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-canvas pb-8 text-white sm:pb-12">
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
            {/* Video player */}
            <div className="overflow-hidden bg-black sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl sm:shadow-black/30">
              <div className="group/video relative aspect-video w-full overflow-hidden bg-[#08070b]">
                {player && !playbackError && playbackLoading && (
                  <VideoSkeleton />
                )}

                {player && !playbackError ? (
                  player.type === "embed" ? (
                    <iframe
                      key={`${anime?._id}-${player.url}-${retryKey}`}
                      src={player.url}
                      title={`${title} video player`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="eager"
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="absolute inset-0 size-full border-0"
                      onLoad={() => setPlaybackLoading(false)}
                      onError={() =>
                        setPlaybackError(
                          "The provider player could not be loaded."
                        )
                      }
                    />
                  ) : (
                    <video
                      key={`${anime?._id}-${player.url}-${retryKey}`}
                      ref={videoRef}
                      className="absolute inset-0 size-full"
                      controls
                      playsInline
                      preload="metadata"
                      poster={anime?.coverImage || undefined}
                      onCanPlay={() => {
                        setPlaybackLoading(false);
                        setBuffering(false);
                      }}
                      onLoadedMetadata={() => setPlaybackLoading(false)}
                      onWaiting={() => setBuffering(true)}
                      onPlaying={() => setBuffering(false)}
                      onError={() =>
                        setPlaybackError(
                          "The video could not be played. Check the video URL or format."
                        )
                      }
                    >
                      Your browser does not support HTML video.
                    </video>
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,.15),transparent_70%)] px-5 py-6">
                    <div className="flex max-w-sm flex-col items-center text-center">
                      <div className="mb-4 grid size-14 place-items-center rounded-2xl border border-lilac/25 bg-lilac/10 text-lilac sm:size-16">
                        {playbackError || videoResult.error ? (
                          <VideoOff size={26} />
                        ) : (
                          <Play size={26} />
                        )}
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-[.22em] text-lilac">
                        {playbackError
                          ? "Playback error"
                          : videoResult.error
                            ? "Unsupported source"
                            : "Coming soon"}
                      </p>

                      <h2 className="mt-2 font-display text-lg font-bold sm:text-xl">
                        {playbackError
                          ? "Couldn't load this video"
                          : videoResult.error
                            ? "Unsupported video source"
                            : "Episode not available"}
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-[#aaa4b5] sm:text-sm">
                        {playbackError
                          ? playbackError
                          : videoResult.error ||
                            "A supported video source has not been added yet."}
                      </p>

                      {playbackError && (
                        <button
                          type="button"
                          onClick={retryPlayback}
                          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-lilac px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <Play size={15} />
                          Try again
                        </button>
                      )}

                      {!playbackError && !videoResult.error && (
                        <p className="mt-4 flex items-center gap-1.5 text-[10px] text-amber-200/80">
                          <ShieldAlert size={13} />
                          Use authorized video sources
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Seek overlay: constrained to a middle band, below native
                    controls (z-0) so it never blocks the fullscreen button. */}
                {player && !playbackError && player.type !== "embed" && (
                  <div className="pointer-events-none absolute inset-x-0 top-1/4 bottom-1/4 z-0 flex items-center justify-between px-2 sm:px-4">
                    <button
                      type="button"
                      onClick={() => seekBy(-10)}
                      aria-label="Rewind 10 seconds"
                      className="pointer-events-auto grid size-11 place-items-center rounded-full border border-white/20 bg-black/55 text-white opacity-90 backdrop-blur-sm transition hover:bg-black/75 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac sm:size-12 sm:opacity-0 sm:group-hover/video:opacity-100 sm:focus-visible:opacity-100"
                    >
                      <RotateCcw size={18} />
                      <span className="sr-only">Rewind 10 seconds</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => seekBy(10)}
                      aria-label="Forward 10 seconds"
                      className="pointer-events-auto grid size-11 place-items-center rounded-full border border-white/20 bg-black/55 text-white opacity-90 backdrop-blur-sm transition hover:bg-black/75 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac sm:size-12 sm:opacity-0 sm:group-hover/video:opacity-100 sm:focus-visible:opacity-100"
                    >
                      <RotateCw size={18} />
                      <span className="sr-only">Forward 10 seconds</span>
                    </button>
                  </div>
                )}

                <SeekToast message={seekToast} />

                {player &&
                  !playbackError &&
                  player.type !== "embed" &&
                  buffering && (
                    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
                      <div className="grid size-12 place-items-center rounded-full bg-black/60 backdrop-blur-sm">
                        <LoaderCircle
                          className="animate-spin text-white"
                          size={22}
                        />
                      </div>
                    </div>
                  )}

                {player &&
                  !playbackError &&
                  player.type === "embed" &&
                  playbackLoading && (
                    <div className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-xs text-white">
                      <LoaderCircle className="animate-spin" size={14} />
                      Loading player…
                    </div>
                  )}
              </div>
            </div>

            {/* Player toolbar: fullscreen-landscape for direct video + HLS.
                Embeds keep only the provider's own fullscreen button. */}
            {player && !playbackError && player.type !== "embed" && (
              <div className="mt-2 flex items-center justify-center gap-3 px-3 sm:justify-start sm:px-0">
                <button
                  type="button"
                  onClick={goFullscreenLandscape}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 text-xs font-semibold text-white transition hover:border-lilac/40 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac"
                >
                  <Maximize size={15} />
                  Landscape
                </button>
              </div>
            )}

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
                  <span className="break-words">{genres.join(" · ")}</span>
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
                    <ShieldCheck
                      size={15}
                      className="shrink-0 text-emerald-300"
                    />
                    Watch responsibly
                  </p>

                  <a
                    href={player.url}
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

            {/* Related episodes — directly below the video */}
            <RelatedEpisodes
              anime={anime}
              recommendations={recommendations}
              onWatch={onWatch}
            />

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