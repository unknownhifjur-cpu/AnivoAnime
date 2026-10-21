const posterColors = {
  violet: "from-violet-300/50 via-purple-950 to-[#171521]",
  rose: "from-rose-300/50 via-rose-950 to-[#211923]",
  blue: "from-cyan-300/50 via-blue-950 to-[#151821]",
  amber: "from-amber-300/50 via-orange-950 to-[#1e1a1a]",
};

export default function AnimeArtwork({ anime, className = "" }) {
  const posterColor = posterColors[anime.accent] ?? posterColors.violet;
  const hasCover = Boolean(anime.coverImage);

  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br ${posterColor} ${className}`}>
      {!hasCover && (
        <>
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_74%_28%,rgba(224,185,255,.55),transparent_36%),radial-gradient(ellipse_at_25%_95%,rgba(117,34,255,.5),transparent_47%)]" />
          <div className="absolute -right-[8%] top-[2%] z-0 size-[72%] rounded-full border border-white/20 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,.7),rgba(179,132,255,.25)_15%,rgba(94,45,150,.15)_45%,transparent_68%)] shadow-[0_0_60px_rgba(164,92,255,.45)]" />
          <div className="absolute -bottom-[62%] left-[15%] z-0 h-[110%] w-[70%] -rotate-[19deg] rounded-[48%_48%_0_0] border border-white/10 bg-gradient-to-b from-[#20152d]/80 via-[#100d17] to-black" />
          <span className="absolute bottom-[11%] left-[7%] z-30 font-display text-6xl font-extrabold text-white/80 drop-shadow-[0_0_24px_rgba(172,116,255,.65)] sm:text-8xl">
            {anime.symbol ?? "✦"}
          </span>
        </>
      )}
      {hasCover && (
        <img
          alt=""
          className="absolute inset-0 z-10 size-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          src={anime.coverImage}
        />
      )}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#080711]/65 via-transparent to-[#080711]/10" />
    </div>
  );
}
