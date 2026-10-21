import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, X } from "lucide-react";

export default function AuthDialog({
  mode,
  onModeChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  error,
  pending,
  onClose,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (!pending && event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="auth-form-title"
        aria-modal="true"
        className="w-full max-w-md rounded-t-2xl border border-white/10 bg-[#12101a] p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold" id="auth-form-title">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {mode === "signup"
                ? "Join AnivoAnime and build your watchlist."
                : "Sign in to continue to AnivoAnime."}
            </p>
          </div>
          <button
            className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 text-muted hover:text-white"
            onClick={onClose}
            disabled={pending}
            type="button"
            aria-label="Close sign-in form"
          >
            <X size={16} />
          </button>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1.5 text-xs text-[#c9c3d1]">
            Email
            <input
              autoFocus
              autoComplete="email"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-lilac"
              onChange={(event) => onEmailChange(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block space-y-1.5 text-xs text-[#c9c3d1]">
            Password
            <input
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-lilac"
              maxLength={72}
              minLength={mode === "signup" ? 12 : undefined}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
          </label>
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="inline-flex items-center gap-1.5 text-[10px] text-lilac hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPassword ? "Hide password" : "Show password"}
          </button>
          {mode === "signup" && (
            <>
              <p className="text-[10px] text-muted">Use at least 12 characters.</p>
              <label className="block space-y-1.5 text-xs text-[#c9c3d1]">
                Confirm password
                <input
                  autoComplete="new-password"
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-lilac"
                  maxLength={72}
                  minLength={12}
                  onChange={(event) => onConfirmPasswordChange(event.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                />
              </label>
            </>
          )}
          {error && <p className="text-xs text-rose-300" role="alert">{error}</p>}
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-lilac text-xs font-bold text-[#170e20] transition hover:bg-[#bd8bff] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending}
            type="submit"
          >
            {pending && <LoaderCircle className="animate-spin" size={15} />}
            {pending
              ? "Please wait..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted">
          {mode === "signup" ? "Already have an account?" : "New to AnivoAnime?"}{" "}
          <button
            className="font-semibold text-lilac hover:text-white"
            disabled={pending}
            onClick={() => {
              setShowPassword(false);
              onModeChange(mode === "signup" ? "login" : "signup");
            }}
            type="button"
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </div>
  );
}
