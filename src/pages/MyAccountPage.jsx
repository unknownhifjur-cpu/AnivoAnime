import {
  ArrowLeft,
  ArrowUpRight,
  CircleUserRound,
  Fingerprint,
  LogOut,
  Mail,
  UserRound,
  CheckCircle2,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

export default function MyAccountPage({
  user,
  onBack,
  onSignOut,
  signOutPending,
  error,
}) {
  const email = user?.email || "";
  const initials = email ? email.charAt(0).toUpperCase() : "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas px-4 py-6 text-white sm:px-8 sm:py-10">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-lilac/[0.08] blur-[100px]"
      />

      <div className="relative mx-auto max-w-4xl">
        {/* Navigation */}
        <button
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-[#aaa4b5] transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to AnivoAnime
        </button>

        {/* Page heading */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-lilac">
            <Sparkles size={15} />
            <p className="text-xs font-bold uppercase tracking-[0.24em]">
              Your personal space
            </p>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
            My Account<span className="text-lilac">.</span>
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-muted sm:text-base">
            Your account, your access, your anime journey — all in one place.
          </p>
        </header>

        {/* Profile card */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#12101a] shadow-2xl shadow-black/20">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-lilac/[0.10] to-transparent"
          />

          <div className="relative p-5 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="relative shrink-0 self-start">
                <div className="grid size-20 place-items-center rounded-2xl border border-lilac/30 bg-gradient-to-br from-lilac/20 to-purple-950/40 font-display text-3xl font-extrabold text-lilac shadow-lg shadow-purple-950/20 sm:size-24 sm:text-4xl">
                  {initials || <CircleUserRound size={36} />}
                </div>
                <span
                  className="absolute -bottom-2 -right-2 grid size-7 place-items-center rounded-full border-4 border-[#12101a] bg-emerald-400 text-[#071b12]"
                  title="Signed in"
                >
                  <CheckCircle2 size={15} />
                </span>
              </div>

              {/* Identity */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-emerald-300">
                    ACTIVE SESSION
                  </span>

                </div>

                <h2 className="break-all text-lg font-bold tracking-tight sm:text-2xl">
                  {email || "Your account"}
                </h2>

                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <UserRound size={15} />
                  AnivoAnime Member
                </p>
              </div>

              {/* Sign out */}
              <button
                className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-300/15 bg-rose-300/[0.04] px-4 text-sm font-medium text-rose-200 transition hover:border-rose-300/30 hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                disabled={signOutPending}
                onClick={onSignOut}
                type="button"
              >
                <LogOut size={16} />
                {signOutPending ? "Signing out..." : "Sign out"}
              </button>
            </div>

            {error && (
              <p
                className="mt-6 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] px-4 py-3 text-sm leading-6 text-rose-200"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          {/* Bottom accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-lilac/30 to-transparent" />
        </section>

        {/* Account details */}
        <section className="mt-5 rounded-3xl border border-white/[0.08] bg-[#12101a] p-5 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold sm:text-xl">
                Account details
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                Information associated with your account.
              </p>
            </div>

            <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-lilac">
              <Fingerprint size={21} />
            </div>
          </div>

          <div className="space-y-3">
            {/* Email */}
            <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-lilac/[0.09] text-lilac">
                <Mail size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted">
                  Email address
                </p>
                <p className="mt-1.5 break-all text-sm font-medium text-white">
                  {email || "Not available"}
                </p>
              </div>

              <CheckCircle2
                size={17}
                className="mt-1 shrink-0 text-emerald-300"
                aria-label="Email on account"
              />
            </div>

            <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-lilac/[0.09] text-lilac">
                <UserRound size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted">
                  Account type
                </p>
                <p className="mt-1.5 text-sm font-medium text-white">
                  AnivoAnime member
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Your personal AnivoAnime account.
                </p>
              </div>
            </div>

            {/* Password */}
            <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-lilac/[0.09] text-lilac">
                <LockKeyhole size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted">
                  Password & security
                </p>
                <p className="mt-1.5 text-sm font-medium text-white">
                  Password protected
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Your password is never displayed on this page.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <footer className="flex items-center justify-center gap-2 px-4 py-7 text-center text-xs text-muted">
          <LockKeyhole size={15} className="shrink-0 text-lilac" />
          <span>Your account details stay within your account experience.</span>
        </footer>
      </div>
    </main>
  );
}