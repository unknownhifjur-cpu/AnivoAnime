import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  CircleUserRound,
  Compass,
  Flame,
  Grid2X2,
  House,
  Menu,
  Play,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import AnimeCard from "../components/AnimeCard.jsx";
import AnimeArtwork from "../components/AnimeArtwork.jsx";
import AuthDialog from "../components/AuthDialog.jsx";
import NotificationCenter from "../components/NotificationCenter.jsx";
import MyAccountPage from "./MyAccountPage.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import WatchPage from "./WatchPage.jsx";

const previewAnime = [
  {
    _id: "preview-1",
    title: "The Last Starlight",
    description: "A quiet astronomer finds a message hidden among the stars.",
    genres: ["Adventure", "Fantasy"],
    episodes: 12,
    status: "ongoing",
    accent: "violet",
    symbol: "✦",
  },
  {
    _id: "preview-2",
    title: "Paper Moon Café",
    description: "A little café at the edge of a world between worlds.",
    genres: ["Slice of life", "Drama"],
    episodes: 10,
    status: "completed",
    accent: "rose",
    symbol: "月",
  },
  {
    _id: "preview-3",
    title: "Echoes of Aether",
    description: "Two rivals set out to restore the music of their city.",
    genres: ["Action", "Fantasy"],
    episodes: 24,
    status: "ongoing",
    accent: "blue",
    symbol: "響",
  },
  {
    _id: "preview-4",
    title: "Summer, Somewhere",
    description: "A last summer together changes everything.",
    genres: ["Romance", "Drama"],
    episodes: 13,
    status: "completed",
    accent: "amber",
    symbol: "夏",
  },
];

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Romance", "Sci-fi", "Supernatural"];
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export default function HomePage() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(
    () => JSON.parse(localStorage.getItem("anivo-read-notifications") || "[]")
  );
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState(
    () => JSON.parse(localStorage.getItem("anivo-dismissed-notifications") || "[]")
  );
  const [anime, setAnime] = useState(previewAnime);
  const [isPreview, setIsPreview] = useState(true);
  const [apiStatus, setApiStatus] = useState("checking");
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All titles");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState("home");
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authPending, setAuthPending] = useState(false);
  const [signOutPending, setSignOutPending] = useState(false);
  const [accountError, setAccountError] = useState("");
  useEffect(() => {
    let isCurrent = true;

    async function loadAnime() {
      try {
        const [healthResponse, animeResponse, authResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/health`),
          fetch(`${API_BASE_URL}/api/anime`),
          fetch(`${API_BASE_URL}/api/auth/user/me`, { credentials: "include" }),
        ]);

        if (!healthResponse.ok || !animeResponse.ok || !authResponse.ok) {
          throw new Error("The AnivoAnime API is unavailable.");
        }

        const health = await healthResponse.json();
        const catalog = await animeResponse.json();
        const auth = await authResponse.json();
        if (!isCurrent) return;

        setApiStatus(health.database === "connected" ? "connected" : "disconnected");
        setCurrentUser(auth.user);
        if (catalog.anime.length > 0) {
          setAnime(catalog.anime);
          setIsPreview(false);
        }
      } catch {
        if (isCurrent) setApiStatus("unavailable");
      }
    }

    loadAnime();
    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredAnime = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return anime.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.genres?.some((genre) => genre.toLowerCase().includes(normalizedQuery));
      const matchesGenre =
        activeGenre === "All titles" || item.genres?.includes(activeGenre);
      return matchesQuery && matchesGenre;
    });
  }, [activeGenre, anime, query]);

  const statusColor = {
    checking: "bg-amber-300",
    connected: "bg-emerald-300",
    disconnected: "bg-rose-300",
    unavailable: "bg-rose-300",
  }[apiStatus];
  const feature = filteredAnime[0] ?? anime[0];
  const notifications = [
    {
      id: `api-${apiStatus}`,
      title: apiStatus === "connected" ? "AnivoAnime is connected" : "API connection status",
      message: apiStatus === "connected"
        ? "The catalog service is online and ready."
        : apiStatus === "checking"
          ? "Checking the catalog service connection."
          : "The API is not currently reachable. Some account and catalog features may be unavailable.",
      tone: apiStatus === "connected" ? "bg-emerald-300" : apiStatus === "checking" ? "bg-amber-300" : "bg-rose-300",
    },
    {
      id: `catalog-${isPreview ? "preview" : anime.length}`,
      title: isPreview ? "Preview catalog is active" : "Catalog is ready",
      message: isPreview
        ? "You’re browsing sample titles. Catalog entries from MongoDB will appear here when available."
        : `${anime.length} ${anime.length === 1 ? "title is" : "titles are"} available to explore.`,
      tone: "bg-lilac",
    },
    {
      id: `account-${currentUser?.email ?? "visitor"}`,
      title: currentUser ? "You’re signed in" : "Your account",
      message: currentUser
        ? `Signed in as ${currentUser.email}.`
        : "Sign in or create an account to access your profile.",
      tone: currentUser ? "bg-emerald-300" : "bg-lilac",
    },
  ].filter((item) => !dismissedNotificationIds.includes(item.id));
  const unreadNotificationCount = notifications.filter(
    (item) => !readNotificationIds.includes(item.id)
  ).length;

  useEffect(() => {
    localStorage.setItem("anivo-read-notifications", JSON.stringify(readNotificationIds));
  }, [readNotificationIds]);

  useEffect(() => {
    localStorage.setItem("anivo-dismissed-notifications", JSON.stringify(dismissedNotificationIds));
  }, [dismissedNotificationIds]);

  const markNotificationsRead = () => {
    setReadNotificationIds((current) => [
      ...new Set([...current, ...notifications.map((item) => item.id)]),
    ]);
  };

  const dismissNotification = (id) => {
    setDismissedNotificationIds((current) => [...new Set([...current, id])]);
  };

  const scrollToCatalog = () => {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const openWatchPage = (item) => {
    setSelectedAnime(item);
    setActivePage("watch");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const getErrorMessage = async (response, fallback) => {
    const result = await response.json().catch(() => ({}));
    return result.error || fallback;
  };

  const openAuthForm = (mode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthPassword("");
    setAuthConfirmPassword("");
    setShowMobileMenu(false);
    setShowAuthForm(true);
  };

  const openAccountPage = () => {
    setActivePage("account");
    setAccountError("");
    setShowMobileMenu(false);
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthError("");

    if (authMode === "signup") {
      if (authPassword.length < 12) {
        setAuthError("Password must be at least 12 characters.");
        return;
      }
      if (new TextEncoder().encode(authPassword).length > 72) {
        setAuthError("Password must be no more than 72 UTF-8 bytes.");
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError("The passwords do not match.");
        return;
      }
    }

    setAuthPending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user/${authMode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail.trim(), password: authPassword }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Could not authenticate."));
      }

      const result = await response.json();
      setCurrentUser(result.user);
      setAccountError("");
      setShowAuthForm(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthConfirmPassword("");
    } catch (error) {
      setAuthError(
        error instanceof TypeError
          ? "Could not connect to AnivoAnime. Check that the API server is running and try again."
          : error.message || "Could not authenticate."
      );
    } finally {
      setAuthPending(false);
    }
  };

  const signOut = async () => {
    setSignOutPending(true);
    setAccountError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Could not sign out."));
      }
      setCurrentUser(null);
      setActivePage("home");
    } catch (error) {
      setAccountError(
        error instanceof TypeError
          ? "Could not connect to AnivoAnime. Check your connection and try again."
          : error.message || "Could not sign out."
      );
      setActivePage("account");
    } finally {
      setSignOutPending(false);
    }
  };

  if (activePage === "watch" && selectedAnime) {
    return (
      <WatchPage
        anime={selectedAnime}
        recommendations={anime}
        onBack={() => setActivePage("home")}
        onWatch={openWatchPage}
      />
    );
  }

  if (activePage === "account" && currentUser) {
    return (
      <MyAccountPage
        user={currentUser}
        onBack={() => setActivePage("home")}
        onSignOut={signOut}
        signOutPending={signOutPending}
        error={accountError}
      />
    );
  }

  const appLogo = (
    <a className="flex shrink-0 items-center gap-2 font-display text-base font-extrabold tracking-tight sm:text-lg" href="#home" aria-label="AnivoAnime home">
      <img className="h-8 w-10 object-contain sm:h-9 sm:w-11" src="/anivoanime-logo.png" alt="" />
      <span>anivo<span className="font-medium text-[#c6bdd5]">anime</span></span>
    </a>
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-canvas pb-20 text-white md:pb-0" id="home">
      <header className="sticky top-0 z-30 border-b border-white/[.06] bg-[#090811]/95 px-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex h-[58px] max-w-[1440px] items-center justify-between gap-5 sm:h-[68px]">
          <button
            className="grid size-8 place-items-center text-white md:hidden"
            type="button"
            aria-label="Open menu"
            aria-expanded={showMobileMenu}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:block">{appLogo}</div>
          <div className="md:hidden">{appLogo}</div>
          <div className="hidden flex-1 items-center justify-center gap-7 text-[11px] text-[#aaa4b5] md:flex lg:gap-9">
            <a className="rounded-md bg-white/[.08] px-3 py-1.5 text-white" href="#home">Home</a>
            <a className="transition hover:text-white" href="#catalog">Explore</a>
            <a className="hidden transition hover:text-white lg:block" href="#continue">Schedule</a>
            <a className="hidden transition hover:text-white sm:block" href="#popular">Watchlist</a>
          </div>
          <label className="hidden h-9 w-[min(27vw,290px)] items-center gap-2 rounded-md border border-white/10 bg-white/[.04] px-2.5 text-[#908a9c] lg:flex">
            <Search size={14} />
            <input
              aria-label="Search anime"
              className="min-w-0 flex-1 bg-transparent text-[9px] text-white outline-none placeholder:text-[#77717f]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search anime, genres, or studios..."
              value={query}
            />
            <span className="text-[9px]">⌘ K</span>
          </label>
          <div className="hidden items-center gap-3 text-[#aaa4b5] sm:flex">
            {currentUser ? (
              <>
                <button
                  className="max-w-32 truncate text-[10px] text-[#c9c3d1] transition hover:text-white"
                  onClick={openAccountPage}
                  title="Open my account"
                  type="button"
                >
                  {currentUser.email}
                </button>
                <button className="text-[10px] transition hover:text-white" onClick={signOut} type="button">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button className="text-[10px] transition hover:text-white" onClick={() => openAuthForm("login")} type="button">
                  Sign in
                </button>
                <button className="rounded-md bg-lilac px-2.5 py-1.5 text-[10px] font-semibold text-[#170e20] transition hover:bg-[#bd8bff]" onClick={() => openAuthForm("signup")} type="button">
                  Create account
                </button>
              </>
            )}
            <button
              className="relative"
              data-notification-trigger
              type="button"
              aria-label={`Notifications${unreadNotificationCount ? ` (${unreadNotificationCount} unread)` : ""}`}
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell size={15} />
              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 size-2 rounded-full bg-lilac" />
              )}
            </button>
            <span className={`size-2 rounded-full ${statusColor}`} title={`API status: ${apiStatus}`} />
            <button className="grid size-7 place-items-center rounded-full border border-lilac/50 text-lilac" onClick={() => currentUser ? openAccountPage() : openAuthForm("login")} type="button" aria-label={currentUser ? "My account" : "Sign in"}>
              {currentUser ? currentUser.email[0].toUpperCase() : <CircleUserRound size={19} />}
            </button>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <button
              className="text-[#bbb4c6]"
              type="button"
              aria-label="Search"
              aria-expanded={showMobileSearch}
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search size={18} />
            </button>
            <button
              className="relative text-[#bbb4c6]"
              data-notification-trigger
              type="button"
              aria-label={`Notifications${unreadNotificationCount ? ` (${unreadNotificationCount} unread)` : ""}`}
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell size={17} />
              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 size-2 rounded-full bg-lilac" />
              )}
            </button>
          </div>
        </div>
        {showMobileSearch && (
          <label className="flex h-10 items-center gap-2 border-t border-white/[.06] text-[#908a9c] md:hidden">
            <Search size={15} />
            <input
              autoFocus
              aria-label="Search anime"
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#77717f]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search anime or genres..."
              value={query}
            />
          </label>
        )}
        {showMobileMenu && (
          <nav className="flex gap-6 border-t border-white/[.06] py-3 text-xs text-[#aaa4b5] md:hidden" aria-label="Mobile menu">
            <a href="#home" onClick={() => setShowMobileMenu(false)}>Home</a>
            <a href="#catalog" onClick={() => setShowMobileMenu(false)}>Explore</a>
            <a href="#popular" onClick={() => setShowMobileMenu(false)}>Watchlist</a>
            {currentUser ? (
              <>
                <button className="text-lilac" onClick={openAccountPage} type="button">My account</button>
                <button onClick={signOut} type="button">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => openAuthForm("login")} type="button">Sign in</button>
                <button className="text-lilac" onClick={() => openAuthForm("signup")} type="button">Sign up</button>
              </>
            )}
          </nav>
        )}
      </header>

      <NotificationCenter
        open={notificationsOpen}
        notifications={notifications}
        readIds={readNotificationIds}
        onClose={() => setNotificationsOpen(false)}
        onMarkAllRead={markNotificationsRead}
        onDismiss={dismissNotification}
      />

      {showAuthForm && (
        <AuthDialog
          mode={authMode}
          onModeChange={(mode) => {
            setAuthMode(mode);
            setAuthError("");
            setAuthPassword("");
            setAuthConfirmPassword("");
          }}
          email={authEmail}
          onEmailChange={(email) => {
            setAuthEmail(email);
            setAuthError("");
          }}
          password={authPassword}
          onPasswordChange={(password) => {
            setAuthPassword(password);
            setAuthError("");
          }}
          confirmPassword={authConfirmPassword}
          onConfirmPasswordChange={(password) => {
            setAuthConfirmPassword(password);
            setAuthError("");
          }}
          error={authError}
          pending={authPending}
          onClose={() => setShowAuthForm(false)}
          onSubmit={submitAuth}
        />
      )}

      <div className="mx-auto max-w-[1440px] md:px-6 lg:px-10">
        <section className="relative" id="discover">
          <div className="relative h-[270px] overflow-hidden sm:h-[360px] md:h-[390px] lg:h-[430px]">
            <div className="absolute inset-0">
              <AnimeArtwork anime={feature} className="size-full" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#090811] via-[#090811]/45 to-transparent md:bg-gradient-to-r md:from-[#090811] md:via-[#090811]/85 md:to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#090811] to-transparent md:hidden" />
            <div className="absolute inset-x-5 bottom-4 md:inset-y-0 md:left-8 md:right-auto md:flex md:max-w-[45%] md:flex-col md:justify-center lg:left-10">
              <span className="mb-2 hidden w-fit rounded bg-lilac px-2 py-1 text-[9px] font-bold text-[#170e20] md:inline-flex">
                FEATURED FOR YOU
              </span>
              <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-[46px]">
                {feature?.title ?? "Discover a new world"}
              </h1>
              <div className="mt-1.5 flex items-center gap-2 text-[8px] text-white/75 sm:text-[9px]">
                <span>{feature?.genres?.slice(0, 3).join(" / ") || "Adventure / Fantasy"}</span>
                <span>·</span>
                <span>{new Date().getFullYear()}</span>
                <span>·</span>
                <span className="text-amber-300">★ 9.2</span>
              </div>
              <p className="mt-2 hidden max-w-md text-[11px] leading-[1.7] text-white/65 md:block lg:text-xs">
                {feature?.description || "Find your next favorite story and explore a world of unforgettable adventures."}
              </p>
              <p className="mt-2 line-clamp-2 max-w-md text-[9px] leading-4 text-white/65 md:hidden">
                {feature?.description || "Find your next favorite story and explore a world of unforgettable adventures."}
              </p>
              <div className="mt-3 flex items-center gap-2 sm:mt-4">
                <button className="inline-flex h-8 items-center gap-2 rounded-md bg-lilac px-3.5 text-[9px] font-semibold text-[#170e20] transition hover:bg-[#bd8bff] sm:h-9 sm:px-4" onClick={() => feature && openWatchPage(feature)} type="button">
                  <Play size={13} /> Watch now
                </button>
                <button className="grid size-8 place-items-center rounded-full border border-white/20 bg-black/30 text-white transition hover:border-lilac sm:hidden" type="button" aria-label={`Add ${feature?.title} to watchlist`}>
                  <Plus size={17} />
                </button>
                <button className="hidden h-9 items-center gap-2 rounded-md border border-white/15 bg-black/30 px-3 text-[9px] text-white transition hover:border-lilac md:inline-flex" type="button">
                  <Plus size={13} /> Add to Watchlist
                </button>
              </div>
            </div>
            <div className="absolute bottom-3 right-5 hidden items-center gap-1 md:flex">
              {[0, 1, 2, 3, 4].map((item) => (
                <span className={`h-1 rounded-full ${item === 0 ? "w-3 bg-lilac" : "w-1 bg-white/40"}`} key={item} />
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-7 px-4 py-5 sm:space-y-9 sm:px-6 sm:py-7 md:px-2 md:py-5">
          {isPreview && (
            <p className="flex items-center gap-1.5 text-[9px] text-[#91899c]">
              <Sparkles size={12} className="text-lilac" />
              Preview titles — your MongoDB catalog appears here when populated.
            </p>
          )}

          <section id="catalog">
            <SectionHeading icon={Flame} title="Trending This Week" onViewAll={scrollToCatalog} />
            {filteredAnime.length ? (
              <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6">
                {filteredAnime.map((item, index) => (
                  <AnimeCard anime={item} index={index} key={item._id ?? item.title ?? index} preview={isPreview} onWatch={openWatchPage} />
                ))}
              </div>
            ) : (
              <p className="py-6 text-xs text-muted">No anime matches your search. Try another title or genre.</p>
            )}
          </section>

          <section id="popular">
            <SectionHeading icon={Sparkles} title="Popular Anime" onViewAll={scrollToCatalog} />
            <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6">
              {filteredAnime.slice().reverse().map((item, index) => (
                <AnimeCard anime={item} index={index + 1} key={`popular-${item._id ?? item.title ?? index}`} preview={isPreview} onWatch={openWatchPage} />
              ))}
            </div>
          </section>

          <div className="hidden gap-7 md:grid md:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
            <section id="continue">
              <SectionHeading icon={Play} title="Continue Watching" onViewAll={scrollToCatalog} />
              <div className="grid grid-cols-4 gap-4">
                {filteredAnime.slice(0, 4).map((item, index) => (
                  <AnimeCard anime={item} compact index={index} key={`continue-${item._id ?? item.title ?? index}`} preview={isPreview} onWatch={openWatchPage} />
                ))}
              </div>
            </section>
            <section>
              <SectionHeading icon={Grid2X2} title="Browse by Genre" onViewAll={scrollToCatalog} />
              <div className="grid grid-cols-4 gap-2">
                {genres.map((genre, index) => {
                  const GenreIcon = [Flame, Compass, Sparkles, Grid2X2, Sparkles, Bookmark, Compass, Bell][index];
                  return (
                    <button
                      className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md border text-[8px] transition ${activeGenre === genre ? "border-lilac/50 bg-lilac/10 text-lilac" : "border-white/[.08] bg-white/[.025] text-[#aaa4b5] hover:border-lilac/40 hover:text-white"}`}
                      key={genre}
                      onClick={() => setActiveGenre(activeGenre === genre ? "All titles" : genre)}
                      type="button"
                    >
                      <GenreIcon size={12} />
                      {genre}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0c0a14]/95 px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {[
            { label: "Home", icon: House, href: "#home", active: true },
            { label: "Explore", icon: Compass, href: "#catalog" },
            { label: "Watchlist", icon: Bookmark, href: "#popular" },
          ].map(({ label, icon: Icon, href, active }) => (
            <a className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[9px] ${active ? "text-lilac" : "text-[#827c8d]"}`} href={href} key={label}>
              <Icon size={17} />
              {label}
            </a>
          ))}
          <button
            className="flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[9px] text-[#827c8d]"
            onClick={currentUser ? openAccountPage : () => openAuthForm("login")}
            type="button"
          >
            <CircleUserRound size={17} />
            {currentUser ? "My account" : "Sign in"}
          </button>
        </div>
      </nav>
    </main>
  );
}
